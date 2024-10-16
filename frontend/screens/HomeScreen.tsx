import Navigation from '@/components/Navigation'
import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Text, View, Easing, Animated, Platform} from 'react-native'
import EmergencyIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RiskIcon from 'react-native-vector-icons/AntDesign';
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


type SocketType = Socket | null;

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [location, setLocation] = useState<any>(null);
  const [alert, setAlert] = useState('');
  const [alertDate, setAlertDate] = useState<string|null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const socket = useRef<SocketType>(null); // Ref for socket connection
  const locationSubscription = useRef<any>(null); // Ref for location subscription
  const pulseAnimation = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    if (alert) {
      startPulsing();
    } else {
      pulseAnimation.setValue(0); // Reset animation when alert is cleared
    }
  }, [alert]);

  const startPulsing = () => {
    pulseAnimation.setValue(0); // Reset to the start of the animation
    Animated.loop(
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      })
    ).start();
  };

  const scale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const opacity = pulseAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.4, 0],
  });

  const getDeviceId = async () => {
    let id = await SecureStore.getItemAsync('deviceId');
    if (!id) {
      id = generateUniqueId(); // Generate new ID
      await SecureStore.setItemAsync('deviceId', id);
    }
    return id;
  };

  // Function to generate a unique ID
  const generateUniqueId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  useEffect(() => {
    (async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    })();
  }, []);

  useEffect(() => {
    if (alert) {
      if (!socket.current) {
        const serverUrl = Platform.OS === 'ios' && !Device.isDevice
          ? 'http://localhost:8080' // Use localhost for iOS Simulator
          : 'http://192.168.1.165:8080'; // Use local IP for physical devices or Android

        socket.current = io(serverUrl);

        socket.current.on('connect', () => {
          socket.current?.emit('connect_user', deviceId);
          console.log(`Connected with device ID: ${deviceId}`);
        });
      }

      const watchLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => {
            setLocation(newLocation.coords);
            socket.current?.emit('locationUpdate', { deviceId, alert, alertDate, location: newLocation.coords });
          }
        );
      };

      watchLocation();

      return () => {
        if (socket.current) {
          socket.current.disconnect();
          console.log('Disconnected from socket');
          socket.current = null;
        }
        if (locationSubscription.current) {
          locationSubscription.current.remove();
          locationSubscription.current = null;
        }
      };
    }
  }, [alert]);

  
  // Function to handle alert state
  const handleAlert = (type: string) => {
    if (alert === type) {
      // If the same alert type is clicked, clear it
      return
    } else {
      // Otherwise, set the alert type
      setAlert(type);
      setAlertDate(new Date().toLocaleString());
    }
  };


  return (
    <SafeAreaView style={styles.container}>
          <View style={styles.content}>
              {alert && (
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 'auto', position: 'absolute', top: 50, borderWidth: 1, padding: 20, borderRadius: 50, borderColor: '#878686'}}>
                  <Text style={{ color: 'white', fontSize: 30, marginRight: 20 }}>
                    Alerta activado
                  </Text>
                  
                  <TouchableOpacity onPress={() => setAlert('')} style={styles.closeButton}>
                    <Animated.View
                      style={{
                        ...styles.pulseEffect,
                        transform: [{ scale }],
                        opacity,
                      }}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity 
                onPress={() => handleAlert('Risk')} 
                style={[
                  styles.riskButton, 
                  styles.alertButton,
                  alert === 'Risk' ? { borderWidth: 5, borderColor: '#d00d0d', height: 100, width: 340 } : {}
                ]}
              >
                <Text style={styles.buttonText}>
                  Alertar risco
                </Text>
                <RiskIcon name="warning" style={[styles.buttonText]}/>              
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleAlert('Emergency')} 
                style={[
                  styles.emergencyButton, 
                  styles.alertButton, 
                  alert === 'Emergency' ? { borderWidth: 5, borderColor: '#d00d0d', height: 100, width: 340 } : {}
                ]}
              >
                <Text style={[styles.buttonText, {color: 'white'}]}>
                  Alertar emergência
                </Text>
                <EmergencyIcon name="alarm-bell" style={[styles.buttonText, {color: 'white'}]}/>
              </TouchableOpacity>
          </View>
      <Text>{ deviceId }</Text>
        <Navigation currentPage="home" navigation={navigation}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#252424',
      position: 'relative',
      
  },
    contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 50,
  },
  content: {
    // paddingHorizontal: 80,
    position: 'relative',
    flex: 1,
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',

  },
  riskButton: {
    backgroundColor: '#ffea00',
  },
  emergencyButton: {
    marginTop: 80,
    backgroundColor: '#f05757',
  },
  buttonText: {
    color: '#000',
    fontSize: 23,
    fontWeight: 'bold',
    marginRight: 10,
  },
  alertButton: {
    padding: 10,
    borderRadius: 50,
    height: 90,
    width: 300,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    borderColor: 'red',
    borderWidth: 5,
    borderRadius: 8,
    height: 30,
    width: 30,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center', 
  },
  pulseEffect: {
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 0, 0, 0.5)', 
    marginLeft: -30,
    marginTop: -30,
  },
})