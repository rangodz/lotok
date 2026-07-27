-- =============================================================
-- Karto — migration initiale
-- Postgres 15 / Supabase
--
-- Prérequis : activer PostGIS depuis le dashboard Supabase
-- (Database > Extensions > postgis) avant de lancer ce fichier.
-- =============================================================

create extension if not exists pg_trgm;

-- -------------------------------------------------------------
-- Types
-- -------------------------------------------------------------

create type user_mode           as enum ('particulier', 'pro');
create type fuel_type           as enum ('essence', 'diesel', 'gpl', 'hybride', 'electrique');
create type ref_type            as enum ('oem', 'aftermarket');
create type fitment_confidence  as enum ('confirmed', 'likely', 'unverified');
create type scan_status         as enum ('pending', 'identified', 'failed');
create type search_source       as enum ('oem', 'scan', 'browse');

-- Texte multilingue : { "fr": "...", "ar": "...", "en": "..." }
-- Le français est obligatoire, les autres locales sont optionnelles
-- (fallback côté client via i18next).
create domain i18n_text as jsonb check (value ->> 'fr' is not null);

-- -------------------------------------------------------------
-- Helper : updated_at automatique
-- -------------------------------------------------------------

create function public.touch_updated_at()
returns trigger
language plpgsql
as $
begin
  new.updated_at := now();
  return new;
end;
$;

-- =============================================================
-- 1. Utilisateurs
-- =============================================================

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  phone        text not null,
  full_name    text,
  mode         user_mode not null default 'particulier',
  locale       text not null default 'fr' check (locale in ('fr', 'ar', 'en')),
  onboarded_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Création automatique du profil à l'inscription OTP.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $
begin
  insert into public.profiles (id, phone)
  values (new.id, coalesce(new.phone, ''))
  on conflict (id) do nothing;
  return new;
end;
$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- 2. Catalogue véhicules
-- =============================================================

create table public.brands (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  logo_url   text,
  sort_order int not null default 0
);

create table public.models (
  id         uuid primary key default gen_random_uuid(),
  brand_id   uuid not null references public.brands(id) on delete cascade,
  slug       text not null,
  name       text not null,
  year_start smallint,
  year_end   smallint,
  unique (brand_id, slug)
);

create index models_brand_idx on public.models (brand_id);

create table public.engines (
  id              uuid primary key default gen_random_uuid(),
  model_id        uuid not null references public.models(id) on delete cascade,
  code            text not null,          -- ex. "K9K 836"
  label           text not null,          -- ex. "1.5 dCi 90ch"
  fuel            fuel_type not null,
  displacement_cc int,
  power_hp        int,
  year_start      smallint,
  year_end        smallint,
  unique (model_id, code)
);

create index engines_model_idx on public.engines (model_id);

-- =============================================================
-- 3. Véhicules utilisateur
-- =============================================================

create table public.user_vehicles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  engine_id  uuid not null references public.engines(id),
  nickname   text,
  plate      text,
  year       smallint,
  mileage_km int check (mileage_km >= 0),
  is_active  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_vehicles_user_idx on public.user_vehicles (user_id);

-- Un seul véhicule actif par utilisateur, garanti en base.
create unique index user_vehicles_one_active
  on public.user_vehicles (user_id)
  where is_active;

create trigger user_vehicles_touch
  before update on public.user_vehicles
  for each row execute function public.touch_updated_at();

-- Bascule atomique du véhicule actif (évite le conflit d'index
-- si le client faisait deux updates séparés).
create function public.set_active_vehicle(p_vehicle_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $
begin
  update public.user_vehicles
     set is_active = false
   where user_id = auth.uid() and is_active;

  update public.user_vehicles
     set is_active = true
   where id = p_vehicle_id and user_id = auth.uid();
end;
$;

-- =============================================================
-- 4. Catalogue pièces
-- =============================================================

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid references public.categories(id) on delete cascade,
  slug       text not null unique,
  label      i18n_text not null,
  icon       text,
  sort_order int not null default 0
);

create index categories_parent_idx on public.categories (parent_id);

create table public.parts (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories(id),
  manufacturer text,                      -- Bosch, Valeo, Febi…
  label        i18n_text not null,
  description  i18n_text,
  image_url    text,
  specs        jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index parts_category_idx on public.parts (category_id);

-- Une pièce a N références (OEM constructeur + équivalents aftermarket).
-- `normalized` sert à la recherche : casse et séparateurs ignorés.
create table public.part_references (
  id           uuid primary key default gen_random_uuid(),
  part_id      uuid not null references public.parts(id) on delete cascade,
  ref_number   text not null,
  ref_type     ref_type not null default 'oem',
  manufacturer text,
  normalized   text generated always as (
                 upper(regexp_replace(ref_number, '[^a-zA-Z0-9]', '', 'g'))
               ) stored,
  unique (part_id, ref_number)
);

create index part_references_normalized_idx on public.part_references (normalized);
create index part_references_trgm_idx
  on public.part_references using gin (normalized gin_trgm_ops);

-- Compatibilité pièce <-> motorisation. C'est la table qui alimente
-- le verdict compatible / incompatible / suspect de scan-result.
create table public.part_fitments (
  part_id    uuid not null references public.parts(id) on delete cascade,
  engine_id  uuid not null references public.engines(id) on delete cascade,
  confidence fitment_confidence not null default 'confirmed',
  notes      text,
  primary key (part_id, engine_id)
);

create index part_fitments_engine_idx on public.part_fitments (engine_id);

-- =============================================================
-- 5. Magasins
-- =============================================================

-- Annuaire public en lecture seule. Pas de compte propriétaire,
-- pas de notation : les shops sont gérés par le service_role.
create table public.shops (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  wilaya      text not null,
  commune     text,
  address     text,
  location    geography(point, 4326),
  phone       text,
  whatsapp    text,
  hours       jsonb not null default '{}'::jsonb,
  is_verified boolean not null default false
);

create index shops_location_idx on public.shops using gist (location);
create index shops_wilaya_idx   on public.shops (wilaya);

-- Spécialités par marque (« spécialiste Renault / Dacia »).
create table public.shop_brands (
  shop_id  uuid not null references public.shops(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  primary key (shop_id, brand_id)
);

-- =============================================================
-- 6. Historique des scans
-- =============================================================

create table public.scans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.user_vehicles(id) on delete set null,
  image_path text not null,               -- clé dans le bucket storage `scans`
  status     scan_status not null default 'pending',
  part_id    uuid references public.parts(id) on delete set null,
  confidence real check (confidence between 0 and 1),
  raw_result jsonb,                       -- réponse brute du service IA
  created_at timestamptz not null default now()
);

create index scans_user_idx on public.scans (user_id, created_at desc);

-- =============================================================
-- 7. Événements de recherche (analytics)
-- =============================================================

-- Log de chaque tentative d'identification, authentifiée ou anonyme.
-- Alimente la vue unresolved_demand pour identifier les pièces manquantes
-- dans le catalogue par zone géographique.
create table public.search_events (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references public.profiles(id) on delete set null,
  source            search_source not null,
  raw_query         text,                  -- texte saisi ; null pour source = 'scan'
  normalized_query  text generated always as (
                      upper(regexp_replace(raw_query, '[^a-zA-Z0-9]', '', 'g'))
                    ) stored,              -- même normalisation que part_references
  engine_id         uuid        references public.engines(id) on delete set null,
  resolved_part_id  uuid        references public.parts(id) on delete set null,
  result_count      int,
  wilaya            text,                  -- géographie de la demande
  created_at        timestamptz not null default now()
);

-- Recherche de tendances sur les requêtes normalisées.
create index search_events_normalized_idx  on public.search_events (normalized_query);
-- Pagination chronologique et purge par date.
create index search_events_created_idx     on public.search_events (created_at desc);
-- Identification rapide des demandes sans résultat (pièces manquantes).
create index search_events_unresolved_idx  on public.search_events (normalized_query)
  where resolved_part_id is null;

-- =============================================================
-- 8. RPC
-- =============================================================

-- Recherche par référence OEM : match exact, puis préfixe.
create function public.search_parts_by_ref(q text)
returns setof public.parts
language sql
stable
security invoker
set search_path = public
as $
  with needle as (
    select upper(regexp_replace(q, '[^a-zA-Z0-9]', '', 'g')) as n
  )
  select distinct p.*
    from public.parts p
    join public.part_references r on r.part_id = p.id
   cross join needle
   where length(needle.n) >= 3
     and (r.normalized = needle.n or r.normalized like needle.n || '%')
   limit 50;
$;

-- Magasins à proximité, triés par distance. Pas de filtre par stock :
-- l'annuaire ne gère pas l'inventaire.
create function public.nearby_shops(
  lat       double precision,
  lng       double precision,
  radius_m  int default 15000
)
returns table (
  id         uuid,
  name       text,
  wilaya     text,
  commune    text,
  phone      text,
  whatsapp   text,
  distance_m double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $
  select s.id, s.name, s.wilaya, s.commune, s.phone, s.whatsapp,
         st_distance(s.location, st_makepoint(lng, lat)::geography) as distance_m
    from public.shops s
   where s.location is not null
     and st_dwithin(s.location, st_makepoint(lng, lat)::geography, radius_m)
   order by distance_m
   limit 50;
$;

-- Verdict de compatibilité utilisé par scan-result.
create function public.check_fitment(p_part_id uuid, p_engine_id uuid)
returns fitment_confidence
language sql
stable
security invoker
set search_path = public
as $
  select coalesce(
    (select confidence from public.part_fitments
      where part_id = p_part_id and engine_id = p_engine_id),
    'unverified'::fitment_confidence
  );
$;

-- =============================================================
-- 9. Row Level Security
-- =============================================================

alter table public.profiles        enable row level security;
alter table public.brands          enable row level security;
alter table public.models          enable row level security;
alter table public.engines         enable row level security;
alter table public.user_vehicles   enable row level security;
alter table public.categories      enable row level security;
alter table public.parts           enable row level security;
alter table public.part_references enable row level security;
alter table public.part_fitments   enable row level security;
alter table public.shops           enable row level security;
alter table public.shop_brands     enable row level security;
alter table public.scans           enable row level security;
alter table public.search_events   enable row level security;

-- --- Catalogue : lecture publique, écriture réservée au service_role ---
-- (le service_role bypasse la RLS, aucune policy d'écriture n'est requise)

create policy catalog_read on public.brands
  for select to anon, authenticated using (true);
create policy catalog_read on public.models
  for select to anon, authenticated using (true);
create policy catalog_read on public.engines
  for select to anon, authenticated using (true);
create policy catalog_read on public.categories
  for select to anon, authenticated using (true);
create policy catalog_read on public.parts
  for select to anon, authenticated using (true);
create policy catalog_read on public.part_references
  for select to anon, authenticated using (true);
create policy catalog_read on public.part_fitments
  for select to anon, authenticated using (true);
create policy catalog_read on public.shops
  for select to anon, authenticated using (true);
create policy catalog_read on public.shop_brands
  for select to anon, authenticated using (true);

-- --- Profils ---

create policy profiles_select_own on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- --- Véhicules utilisateur ---

create policy vehicles_own on public.user_vehicles
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --- Scans ---

create policy scans_own on public.scans
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --- Événements de recherche ---
-- Log en écriture pour tous (y compris les anonymes) ; lecture réservée
-- au service_role exclusivement (données analytiques, non consultables
-- par l'utilisateur).

create policy search_events_insert on public.search_events
  for insert to anon, authenticated with check (true);

-- Pas de policy select : seul le service_role (qui bypasse la RLS) peut lire.

-- =============================================================
-- 10. Vue analytique
-- =============================================================

-- Demandes sans résultat, agrégées par requête normalisée et par wilaya.
-- Permet d'identifier les pièces absentes du catalogue et leur
-- concentration géographique pour prioriser les imports.
-- Accessible au service_role uniquement.
create view public.unresolved_demand
  with (security_invoker = true)
as
  select
    normalized_query,
    wilaya,
    count(*)                            as search_count,
    max(created_at)                     as last_seen_at
  from public.search_events
  where resolved_part_id is null
    and normalized_query is not null
  group by normalized_query, wilaya
  order by search_count desc;

-- Révocation explicite : anon et authenticated ne peuvent pas lire cette vue.
revoke all on public.unresolved_demand from anon, authenticated;

-- =============================================================
-- 11. Storage
-- =============================================================
-- Bucket privé pour les photos de scan. Chaque utilisateur écrit et
-- lit uniquement sous son propre préfixe : scans/<user_id>/<uuid>.jpg

insert into storage.buckets (id, name, public)
values ('scans', 'scans', false)
on conflict (id) do nothing;

create policy scans_upload_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy scans_read_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'scans'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
