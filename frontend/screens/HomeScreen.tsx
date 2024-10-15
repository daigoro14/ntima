import Navigation from '@/components/Navigation'
import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Text, View } from 'react-native'
import EmergencyIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RiskIcon from 'react-native-vector-icons/AntDesign';
import * as Location from 'expo-location';
import io from 'socket.io-client';



export default function HomeScreen({ navigation }) {

  const [location, setLocation] = useState<any>(null);
  const [typeOfAlert, setTypeOfAlert] = useState('');
  const [errorMsg, setErrorMsg] = useState<String | null>(null);

  const socket = useRef(io('http://192.168.1.165:8080' || 'http://localhost:8080')).current;
  useEffect(() => {
    if (typeOfAlert) {
      socket.emit('locationUpdate', location);
    }
  }, [typeOfAlert]);

    useEffect(() => {
    const getLocationAsync = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          // console.log(newLocation.coords);
        }
      );

      return () => {
        locationSubscription.remove();
      };
    };

    getLocationAsync();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
          <View style={styles.content}>
              <TouchableOpacity onPress={() => setTypeOfAlert('Risk')} style={[styles.riskButton, styles.alertButton]}>
                <Text style={styles.buttonText}>Alertar risco</Text>
                <RiskIcon name="warning" style={[styles.buttonText]}/>              
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTypeOfAlert('Emergency')} style={[styles.emergencyButton, styles.alertButton]}>
                <Text style={[styles.buttonText, {color: 'white'}]}>
                  Alertar emergência
                </Text>
                <EmergencyIcon name="alarm-bell" style={[styles.buttonText, {color: 'white'}]}/>
              </TouchableOpacity>
          </View>
        <Navigation currentPage="home" navigation={navigation}/>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#252424'
      
  },
    contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 50,
  },
  content: {
      // paddingHorizontal: 80,
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
    backgroundColor: '#ff6f6f',
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
})