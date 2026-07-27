import React from 'react';
import { useRouter } from 'expo-router';
import VehicleWizard, { type NewVehicle } from '@/components/VehicleWizard';
import { useVehicleStore } from '@/stores/vehicleStore';
import { useSettingsStore } from '@/stores/settingsStore';

export default function AddVehicleScreen() {
  const router = useRouter();
  const { addVehicle } = useVehicleStore();
  const { setHasOnboarded, setVehicleConfigured } = useSettingsStore();

  const handleComplete = (vehicle: NewVehicle) => {
    addVehicle({ ...vehicle, mileage: 0 });
    setVehicleConfigured(true);
    setHasOnboarded(true);
    router.replace('/(tabs)');
  };

  const handleCancel = () => {
    // Allow skipping vehicle during onboarding — still mark as onboarded
    setHasOnboarded(true);
    router.replace('/(tabs)');
  };

  return <VehicleWizard onComplete={handleComplete} onCancel={handleCancel} />;
}
