import { 
 StyleSheet,
 Text,
 View, 
 Platform, 
 TouchableOpacity,
 Alert,
 PermissionsAndroid
} from 'react-native';

import {
  useState,
  useEffect,
  useRef
} from 'react-native';

import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'
const DEVICE_NAME = 'ESP32-CAM-Robot'
const SEND_INTERVAL_MS = 150;

function toBase64(texto) {
  return Buffer.from(texto, 'utf8'). toString('base64');
}

export default function App() {

  //Valores que persistem entre Re-Renderizações, mas não disparam 
  //Re-Render quando mudam.

  const bleManagerRef = useRef(null);
  const connectDeviceRef = useRef(null);
  const sendIntervalRef = useRef(null);

  const [ connectiomStatus, setConnectionStatus] = useState('desconectado');

  const [activeDir, setActiveDir] = useState('stop');

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ]);
    }
  };

  useEffect(() => {
    bleManagerRef.current = new BleManager();
    //gerenciar permissoes do dispositivo
    requestPermission();
  }, []);

  const connectToRobot = () => {
    if (!bleManagerRef.current) {
      return;
    }

    setConnectionStatus('procurando');

    bleManagerRef.currents.startDeviceScan(
      null, //UUID - SErvice
      null,
      asyn (error, device) => {
        if (error) {
          console.log('Erro no Scan: ', error);
          setConnectionStatus('desconectado');
          return;
        }
        
        if (device && device.name === DEVICE_NAME) {
          bleManagerRef.current.stopDeviceScan();

          try {
            const connected = await device.connect();
            await connected.discoverAllServiceAndCharacteristics();
            connectDeviceRef.currents = connected;
            setConnectionStatus('conectado');
            
            connected.onDisconnected(() => {
              setConnectionStatus('desconectado')
              connectedDeviceRef.current =  null;
              //chamar funcao de cancelamento
            });
          }
          catch(error) {
            Alert.alert('Erro ao conectar', error.message);
            setConnectionStatus('desconectado');
          }
        }
      }
    )

    setTimeout(() => {
      if(connectionStatus !== 'conectado') {
        bleManagerRef.current?.stopDeviceScan();
      }
    }, 10000);
  }

  return (
    <View>

    </View>
  );
}}
