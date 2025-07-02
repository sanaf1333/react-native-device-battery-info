import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, Alert } from 'react-native';
import {
  getBatteryStatus,
  startBatteryStatusListener,
  stopBatteryStatusListener,
  addBatteryStatusListener,
} from 'react-native-device-battery-info'; // Import your module

export default function App() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [listenerActive, setListenerActive] = useState(false);

  // Function to fetch and display current battery status
  const fetchBatteryStatus = async () => {
    try {
      const status = await getBatteryStatus();
      setBatteryLevel(status.level);
      setIsCharging(status.isCharging);
      Alert.alert(
        'Current Battery Status',
        `Level: ${status.level.toFixed(0)}%\nCharging: ${status.isCharging ? 'Yes' : 'No'}`
      );
    } catch (e: any) {
      Alert.alert('Error', `Failed to get battery status: ${e.message}`);
      console.error(e);
    }
  };

  // Effect to manage the battery status listener
  useEffect(() => {
    let subscription: any;

    if (listenerActive) {
      startBatteryStatusListener();
      subscription = addBatteryStatusListener((status) => {
        console.log('Battery status changed:', status);
        setBatteryLevel(status.level);
        setIsCharging(status.isCharging);
      });
    } else {
      stopBatteryStatusListener();
      if (subscription) {
        subscription.remove();
      }
    }

    // Cleanup function
    return () => {
      stopBatteryStatusListener();
      if (subscription) {
        subscription.remove();
      }
    };
  }, [listenerActive]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>React Native Device Battery Info</Text>

      <Text style={styles.statusText}>
        Battery Level:{' '}
        {batteryLevel !== null ? `${batteryLevel.toFixed(0)}%` : 'N/A'}
      </Text>
      <Text style={styles.statusText}>
        Is Charging: {isCharging !== null ? (isCharging ? 'Yes' : 'No') : 'N/A'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button title="Get Current Status" onPress={fetchBatteryStatus} />
        <View style={styles.spacer} />
        <Button
          title={listenerActive ? 'Stop Listener' : 'Start Listener'}
          onPress={() => setListenerActive(!listenerActive)}
        />
      </View>

      {listenerActive && (
        <Text style={styles.listeningText}>
          Listening for battery changes...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  spacer: {
    width: 10, // Space between buttons
  },
  listeningText: {
    marginTop: 20,
    fontSize: 16,
    color: '#007bff',
    fontStyle: 'italic',
  },
});
