-- =============================================================
-- Lotok — migration 0002
-- Expose lat/lng depuis la colonne geography pour l'API REST,
-- et enrichit nearby_shops avec les coordonnées + champs complets.
-- =============================================================

set search_path to public, extensions;

-- -------------------------------------------------------------
-- Vue shops_geo : lat/lng comme colonnes scalaires
-- La colonne geography n'est pas sérialisable via l'API REST ;
-- cette vue expose les coordonnées comme doubles ordinaires.
-- security_invoker = true : la RLS de shops s'applique automatiquement.
-- -------------------------------------------------------------

create view public.shops_geo
  with (security_invoker = true)
as
  select
    id,
    name,
    slug,
    wilaya,
    commune,
    address,
    phone,
    whatsapp,
    hours,
    is_verified,
    ST_Y(location::geometry)::double precision as lat,
    ST_X(location::geometry)::double precision as lng
  from public.shops;

-- Lecture publique (même politique que shops).
grant select on public.shops_geo to anon, authenticated;

-- -------------------------------------------------------------
-- Remplacement de nearby_shops
-- Ajoute : result_lat, result_lng, slug, address, hours, is_verified.
-- Les paramètres conservent les noms lat/lng ; les colonnes de sortie
-- utilisent result_lat/result_lng pour éviter toute ambiguïté.
-- -------------------------------------------------------------

drop function if exists public.nearby_shops(double precision, double precision, int);

create function public.nearby_shops(
  lat       double precision,
  lng       double precision,
  radius_m  int default 15000
)
returns table (
  id          uuid,
  name        text,
  slug        text,
  wilaya      text,
  commune     text,
  address     text,
  phone       text,
  whatsapp    text,
  hours       jsonb,
  is_verified boolean,
  result_lat  double precision,
  result_lng  double precision,
  distance_m  double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    s.id,
    s.name,
    s.slug,
    s.wilaya,
    s.commune,
    s.address,
    s.phone,
    s.whatsapp,
    s.hours,
    s.is_verified,
    ST_Y(s.location::geometry)::double precision,
    ST_X(s.location::geometry)::double precision,
    ST_Distance(s.location, ST_MakePoint(lng, lat)::geography)
  from public.shops s
  where s.location is not null
    and ST_DWithin(s.location, ST_MakePoint(lng, lat)::geography, radius_m)
  order by ST_Distance(s.location, ST_MakePoint(lng, lat)::geography)
  limit 50;
$$;
