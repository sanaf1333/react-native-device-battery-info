import {
  NativeEventEmitter,
  NativeModules,
  type EmitterSubscription,
  type NativeModule, // <-- Import NativeModule here
} from 'react-native';
import type { Spec } from './NativeDeviceBatteryInfo'; // Adjust path if necessary

// Combine the codegen Spec with NativeModule for full type safety in JS
interface CombinedSpec extends Spec, NativeModule {}

// Get the native module instance
const LINKING_ERROR =
  `The package 'react-native-device-battery-info' doesn't seem to be linked. Make sure: \n\n` +
  `- You have 'react-native-device-battery-info' installed in your 'node_modules' directory. \n` +
  `- You have run 'pod install' in your 'ios' directory (if on iOS). \n` +
  `- You are not using Expo Go. \n`;

const ReactNativeDeviceBatteryInfoModule =
  NativeModules.ReactNativeDeviceBatteryInfo as CombinedSpec;

// If the module is not found (meaning it's null), throw the linking error
if (!ReactNativeDeviceBatteryInfoModule) {
  throw new Error(LINKING_ERROR);
}

// Create an event emitter to listen to native events
const batteryEventEmitter = new NativeEventEmitter(
  ReactNativeDeviceBatteryInfoModule
);

// Define the event name constant
const BATTERY_STATUS_EVENT = 'onBatteryStatusChange';

interface BatteryStatus {
  level: number; // Battery level (0.0 to 1.0)
  isCharging: boolean; // True if charging, false otherwise
}

/**
 * Gets the current battery status of the device.
 * @returns A Promise that resolves with an object containing `level` (0.0-1.0) and `isCharging` (boolean).
 */
export function getBatteryStatus(): Promise<BatteryStatus> {
  return ReactNativeDeviceBatteryInfoModule.getBatteryStatus();
}

/**
 * Starts listening for battery status changes.
 * A listener can be added using `addBatteryStatusListener`.
 */
export function startBatteryStatusListener(): void {
  ReactNativeDeviceBatteryInfoModule.startBatteryStatusListener();
}

/**
 * Stops listening for battery status changes.
 * All previously added listeners will no longer receive updates.
 */
export function stopBatteryStatusListener(): void {
  ReactNativeDeviceBatteryInfoModule.stopBatteryStatusListener();
}

/**
 * Adds a listener for battery status changes.
 * @param callback The function to call when battery status changes. Receives an object with `level` and `isCharging`.
 * @returns An `EmitterSubscription` object that can be used to remove the listener later by calling `subscription.remove()`.
 */
export function addBatteryStatusListener(
  callback: (status: BatteryStatus) => void
): EmitterSubscription {
  return batteryEventEmitter.addListener(BATTERY_STATUS_EVENT, callback);
}

// Export the module as default for convenience, but named exports are preferred
export default {
  getBatteryStatus,
  startBatteryStatusListener,
  stopBatteryStatusListener,
  addBatteryStatusListener,
};
