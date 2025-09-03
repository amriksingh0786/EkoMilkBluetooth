import React, {useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export default function App(): React.JSX.Element {
  const [devices, setDevices] = useState<any[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [milkData, setMilkData] = useState<any>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const requestBluetoothPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'Bluetooth permissions are required to connect to EkoMilk device. Please grant permissions in Settings.',
          );
          return false;
        }
        return true;
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    } else if (Platform.OS === 'android') {
      // For Android < 12, request location permission
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'Bluetooth requires location permission to scan for devices',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Permission request error:', error);
        return false;
      }
    }
    return true;
  };

  const scanForDevices = async () => {
    try {
      setRefreshing(true);
      const bondedDevices = await RNBluetoothClassic.getBondedDevices();
      setDevices(bondedDevices);
    } catch (error: any) {
      console.error('Error scanning devices:', error);
      Alert.alert('Scan Error', 'Failed to scan for devices: ' + error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const initializeBluetooth = useCallback(async () => {
    try {
      // Request permissions first
      const hasPermissions = await requestBluetoothPermissions();
      if (!hasPermissions) {
        return;
      }

      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        Alert.alert(
          'Bluetooth Disabled',
          'Please enable Bluetooth to connect to EkoMilk device',
        );
        return;
      }

      await scanForDevices();
    } catch (error: any) {
      console.error('Error initializing Bluetooth:', error);
      Alert.alert(
        'Bluetooth Error',
        'Failed to initialize Bluetooth: ' + error.message,
      );
    }
  }, []);

  useEffect(() => {
    initializeBluetooth();
  }, [initializeBluetooth]);

  const connectToDevice = async (device: any) => {
    try {
      setIsConnecting(true);

      if (connectedDevice) {
        await disconnectDevice();
      }

      // Fix: Pass empty options object to prevent NullPointerException
      const connected = await device.connect({});
      if (connected) {
        setConnectedDevice(device);
        Alert.alert('Connected', `Successfully connected to ${device.name}`);

        // Set up data listener
        device.onDataReceived((event: any) => {
          const receivedData = event.data;
          console.log('🔵 HC-05 Data Received Event:', {
            timestamp: new Date().toISOString(),
            event,
            data: receivedData,
            dataType: typeof receivedData,
            dataLength: receivedData?.length
          });
          setMessages(prev => [...prev.slice(-50), receivedData]); // Keep last 50 messages
          parseEkoMilkData(receivedData);
        });
      } else {
        Alert.alert('Connection Failed', `Failed to connect to ${device.name}`);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert('Connection Error', 'Failed to connect: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const testDataParsing = () => {
    const sampleData = "FAT=3.5% SNF=8.2% DENSITY=1.028 PROTEIN=3.1% LACTOSE=4.8% WATER=87.5% TEMP=25°C";
    console.log('🧪 Test Data Parsing initiated with sample data:', sampleData);
    console.log('🧪 Current milkData state before test:', milkData);
    parseEkoMilkData(sampleData);
    setMessages(prev => [...prev.slice(-50), `[TEST] ${sampleData}`]);
    console.log('🧪 Test data added to messages, parsing should complete shortly');
  };

  const disconnectDevice = async () => {
    try {
      if (connectedDevice) {
        await connectedDevice.disconnect();
        setConnectedDevice(null);
        setMessages([]);
        setMilkData({});
        Alert.alert('Disconnected', 'Device disconnected successfully');
      }
    } catch (error: any) {
      console.error('Disconnect error:', error);
      Alert.alert('Disconnect Error', 'Failed to disconnect: ' + error.message);
    }
  };

  const parseEkoMilkData = (data: string) => {
    try {
      // Parse EkoMilk data format (e.g., "FAT=3.5% SNF=8.2% DENSITY=1.028")
      const parsedData: any = {};
      const dataString = data.toString().trim();
      console.log('🟡 parseEkoMilkData called with:', {
        timestamp: new Date().toISOString(),
        rawData: data,
        dataType: typeof data,
        dataLength: data?.length,
        trimmedString: dataString
      });

      // Extract common milk parameters
      const patterns = {
        fat: /FAT[=:]\s*([0-9.]+)%?/i,
        snf: /SNF[=:]\s*([0-9.]+)%?/i,
        density: /DENSITY[=:]\s*([0-9.]+)/i,
        protein: /PROTEIN[=:]\s*([0-9.]+)%?/i,
        lactose: /LACTOSE[=:]\s*([0-9.]+)%?/i,
        water: /WATER[=:]\s*([0-9.]+)%?/i,
        temperature: /TEMP[=:]\s*([0-9.]+)°?C?/i,
      };

      console.log('🔍 Testing patterns against data:', dataString);
      Object.keys(patterns).forEach(key => {
        const pattern = patterns[key as keyof typeof patterns];
        const match = dataString.match(pattern);
        console.log(`🔍 Pattern ${key}:`, {
          pattern: pattern.toString(),
          match: match ? match[1] : null,
          fullMatch: match
        });
        if (match) {
          parsedData[key] = parseFloat(match[1]);
        }
      });

      console.log('✅ Final parsed data:', parsedData);
      if (Object.keys(parsedData).length > 0) {
        console.log('✅ Setting milk data to state:', parsedData);
        setMilkData((prev: any) => ({
          ...prev,
          ...parsedData,
          lastUpdated: new Date().toLocaleTimeString(),
        }));
      } else {
        console.log('❌ No data matched parsing patterns for string:', dataString);
      }
    } catch (error) {
      console.error('Error parsing milk data:', error);
    }
  };

  const renderDevice = ({item}: {item: any}) => (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        connectedDevice?.address === item.address && styles.connectedDevice,
      ]}
      onPress={() => connectToDevice(item)}
      disabled={isConnecting}>
      <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
      <Text style={styles.deviceAddress}>{item.address}</Text>
      {connectedDevice?.address === item.address && (
        <Text style={styles.connectedText}>Connected</Text>
      )}
    </TouchableOpacity>
  );

  const renderMilkParameter = (label: string, value: number, unit = '') => (
    <View style={styles.parameterRow}>
      <Text style={styles.parameterLabel}>{label}:</Text>
      <Text style={styles.parameterValue}>
        {value !== undefined ? `${value}${unit}` : 'N/A'}
      </Text>
    </View>
  );

  const getStatusColor = () => (connectedDevice ? '#4CAF50' : '#f44336');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#2196F3" />

      <View style={styles.header}>
        <Text style={styles.title}>EkoMilk Bluetooth Reader</Text>
        {connectedDevice && (
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={disconnectDevice}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Device List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paired Bluetooth Devices</Text>
          <FlatList
            data={devices}
            keyExtractor={item => item.address}
            renderItem={renderDevice}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={scanForDevices}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No paired devices found. Please pair with HC-05 first.
              </Text>
            }
          />
          {/* Test Button */}
          {connectedDevice && (
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={testDataParsing}
            >
              <Text style={styles.testButtonText}>Test Data Parsing</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Milk Data Display */}
        {Object.keys(milkData).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milk Analysis Results</Text>
            <View style={styles.dataContainer}>
              {renderMilkParameter('Fat', milkData.fat, '%')}
              {renderMilkParameter('SNF (Solids Non-Fat)', milkData.snf, '%')}
              {renderMilkParameter('Protein', milkData.protein, '%')}
              {renderMilkParameter('Lactose', milkData.lactose, '%')}
              {renderMilkParameter('Water', milkData.water, '%')}
              {renderMilkParameter('Density', milkData.density)}
              {renderMilkParameter('Temperature', milkData.temperature, '°C')}
              {milkData.lastUpdated && (
                <Text style={styles.lastUpdated}>
                  Last updated: {milkData.lastUpdated}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Raw Data Messages */}
        {messages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Raw Data Stream</Text>
            <ScrollView style={styles.messagesContainer}>
              {messages.map((message, index) => (
                <Text key={index} style={styles.messageText}>
                  {message}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          <Text style={[styles.statusText, {color: getStatusColor()}]}>
            {connectedDevice
              ? `Connected to ${connectedDevice.name}`
              : 'Not connected'}
          </Text>
          {isConnecting && (
            <Text style={styles.connectingText}>Connecting...</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  deviceItem: {
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  connectedDevice: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  connectedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  dataContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  parameterLabel: {
    fontSize: 14,
    color: '#555',
    flex: 2,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    flex: 1,
    textAlign: 'right',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  messagesContainer: {
    maxHeight: 200,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
  },
  messageText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  connectingText: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});