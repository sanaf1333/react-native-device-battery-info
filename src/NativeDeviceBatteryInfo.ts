import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

// This interface is specifically for the native module's API and codegen.
// It MUST only extend TurboModule.
export interface Spec extends TurboModule {
  // Method to get current battery status
  getBatteryStatus(): Promise<{ level: number; isCharging: boolean }>;
  // Method to start listening for battery status changes
  startBatteryStatusListener(): void;
  // Method to stop listening for battery status changes
  stopBatteryStatusListener(): void;
}

// Register the module using its native name
export default TurboModuleRegistry.get<Spec>(
  'ReactNativeDeviceBatteryInfo'
) as Spec | null;
