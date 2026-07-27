import React from 'react';
import { useRouter } from 'expo-router';
import VehicleWizard, { type NewVehicle } from '@/components/VehicleWizard';
import { useVehicleStore } from '@/stores/vehicleStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function GarageAddScreen() {
  const router = useRouter();
  const { addVehicle } = useVehicleStore();
  const { setVehicleConfigured } = useSettingsStore();

  const handleComplete = (vehicle: NewVehicle) => {
    addVehicle({ ...vehicle, mileage: 0 });
    setVehicleConfigured(true);
    router.back();
  };

  return <VehicleWizard onComplete={handleComplete} onCancel={() => router.back()} />;
}
