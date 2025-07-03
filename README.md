# react-native-device-battery-info

A lightweight and easy-to-use React Native module to access the device's battery information. Retrieve current battery percentage, charging state, and subscribe to live updates as the battery level or charging status changes. Works seamlessly on iOS and Android.

## Features

- 🔋 Get current battery level (percentage)
- ⚡ Check charging status
- 📱 Real-time battery status updates
- ⚙️ Native implementation for optimal performance
- 📦 Lightweight with zero dependencies
- 🔄 Automatic cleanup of event listeners

## Installation

```sh
npm install react-native-device-battery-info
```

or if you use yarn:

```sh
yarn add react-native-device-battery-info
```

### iOS Setup

This package requires CocoaPods to be installed in your React Native project. After installing the package, navigate to the iOS directory and install the pod:

```sh
cd ios && pod install
```

Make sure to run `pod install` whenever you install or update the package.

### Android Setup

No additional setup required for Android. The module works out of the box.

## Usage

### Get Current Battery Status

```typescript
import { getBatteryStatus } from 'react-native-device-battery-info';

try {
  const batteryInfo = await getBatteryStatus();
  console.log('Battery Level:', batteryInfo.level); // 0-100
  console.log('Is Charging:', batteryInfo.isCharging); // true/false
} catch (error) {
  console.error('Failed to get battery status:', error);
}
```

### Listen to Battery Status Changes

```typescript
import { addBatteryStatusListener } from 'react-native-device-battery-info';

// Add listener
const subscription = addBatteryStatusListener((batteryInfo) => {
  console.log('Battery status changed:', batteryInfo);
  // batteryInfo: { level: number, isCharging: boolean }
});

// Remove listener when component unmounts
subscription.remove();
```

### Example with React Hooks

```typescript
import React, { useEffect, useState } from 'react';
import { getBatteryStatus, addBatteryStatusListener } from 'react-native-device-battery-info';

function BatteryStatus() {
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    // Get initial battery status
    getBatteryStatus().then((status) => {
      setBatteryLevel(status.level);
      setIsCharging(status.isCharging);
    });

    // Subscribe to battery status changes
    const subscription = addBatteryStatusListener((status) => {
      setBatteryLevel(status.level);
      setIsCharging(status.isCharging);
    });

    // Cleanup subscription
    return () => subscription.remove();
  }, []);

  return (
    <View>
      <Text>Battery Level: {batteryLevel}%</Text>
      <Text>Charging: {isCharging ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

## API Reference

### getBatteryStatus(): Promise<BatteryStatus>

Returns a promise that resolves to an object containing the current battery status:
- `level`: number (0-100) - Current battery level percentage
- `isCharging`: boolean - Whether the device is currently charging

### addBatteryStatusListener(callback: (status: BatteryStatus) => void): Subscription

Registers a listener for battery status changes:
- `callback`: Function called when battery status changes
- Returns a subscription object with a `remove()` method

### Types

```typescript
interface BatteryStatus {
  level: number;      // 0-100
  isCharging: boolean; // true/false
}

interface Subscription {
  remove: () => void;
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
