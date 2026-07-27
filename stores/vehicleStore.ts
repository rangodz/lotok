import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Market } from '@/lib/data/vehicles';

export interface UserVehicle {
  id: string;
  brandId: string;
  brand: string;
  modelId: string;
  model: string;
  year: string;
  engineId: string;
  engine: string;
  engineCode: string;
  market: Market;
  mileage: number;
  addedAt: string;
  clientName?: string; // Pro mode only
}

interface VehicleState {
  vehicles: UserVehicle[];
  activeVehicleId: string | null;
  addVehicle: (v: Omit<UserVehicle, 'id' | 'addedAt'>) => string;
  setActiveVehicle: (id: string) => void;
  removeVehicle: (id: string) => void;
  updateMileage: (id: string, mileage: number) => void;
  getActiveVehicle: () => UserVehicle | undefined;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      activeVehicleId: null,

      addVehicle: (v) => {
        const id = `v_${Date.now()}`;
        set((state) => ({
          vehicles: [
            ...state.vehicles,
            { ...v, id, addedAt: new Date().toISOString() },
          ],
          activeVehicleId: state.activeVehicleId ?? id,
        }));
        return id;
      },

      setActiveVehicle: (id) => set({ activeVehicleId: id }),

      removeVehicle: (id) =>
        set((state) => {
          const remaining = state.vehicles.filter((v) => v.id !== id);
          const newActive =
            state.activeVehicleId === id
              ? (remaining[0]?.id ?? null)
              : state.activeVehicleId;
          return { vehicles: remaining, activeVehicleId: newActive };
        }),

      updateMileage: (id, mileage) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, mileage } : v
          ),
        })),

      getActiveVehicle: () => {
        const { vehicles, activeVehicleId } = get();
        return vehicles.find((v) => v.id === activeVehicleId);
      },
    }),
    {
      name: 'lotok-vehicles',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
