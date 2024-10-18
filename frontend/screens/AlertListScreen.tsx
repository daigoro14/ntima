import Navigation from '@/components/Navigation';
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Text, View, Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import * as Device from 'expo-device';
import EmergencyIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import RiskIcon from 'react-native-vector-icons/AntDesign';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


type SocketType = Socket | null;

interface UserLocation {
    id: string;
    data: {
      deviceId: string;
      alert: string;
      alertDate: string;
      location: {
        latitude: number;
        longitude: number;
        speed?: number;
        heading?: number;
        accuracy?: number;
      };
    }
};

type AlertListScreenProps = {
  navigation: NativeStackNavigationProp<any, any>;
};

export default function AlertListScreen({ navigation }: AlertListScreenProps) {
    const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
    const socket = useRef<SocketType>(null);

    useEffect(() => {
        const serverUrl = Platform.OS === 'ios' && !Device.isDevice
            ? 'http://localhost:8080'
            : 'http://192.168.1.165:8080';

        if (!socket.current) {
            socket.current = io(serverUrl);

            socket.current.on('userLocations', (data) => {
                setUserLocations(data); 
            });
        }
      
        socket.current.on('userDisconnected', (userId) => {
            setUserLocations((prevLocations) => {
                return prevLocations.filter(user => user.id !== userId); 
            });
        });

        console.log('User locations updated:', userLocations);

        return () => {
            if (socket.current) {
                socket.current.off('userLocations');
                socket.current.disconnect();
            }
        };
    }, [])
  
    const navigateToAlert = (user: UserLocation) => {
      navigation.navigate('Map', { userId: user.id, location: user.data.location });
    };
  
  return (
  <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {userLocations.map((user) => (
          user.data.alert === 'Emergency' ? (
            <TouchableOpacity
              key={user.id}
              style={[styles.listItem, { backgroundColor: '#f05757' }]}
              onPress={() => navigateToAlert(user)}
            >
              <EmergencyIcon name="alarm-bell" style={[styles.listIcon, {color: 'white'}]}/>
              <Text style={styles.dateText}>Alerta de: {user.data.alertDate}</Text>
            </TouchableOpacity>
          ): (
            <TouchableOpacity 
              key={user.id} 
              style={[styles.listItem, {backgroundColor: '#ffea00'}]}
              onPress={() => navigateToAlert(user)}
            >
              <RiskIcon name="warning" style={[styles.listIcon]}/>
              <Text style={styles.dateText}> Alerta de: {user.data.alertDate}</Text>
            </TouchableOpacity>
          )
        ))}
      </ScrollView>
    <Navigation currentPage="alerts" navigation={navigation}/>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252424'
  },
  content: {
    flex: 1,
    height: 'auto',
  },
  listItem: {
    paddingHorizontal: 20,
    width: '100%',
    height: 100,
    alignItems: 'center',
    flexDirection: 'row',
  },
  listIcon: {
    color: '#000',
    fontSize: 45,
    fontWeight: 'bold',
    marginRight: 10,
  },
  dateText: {
    fontSize: 18,
  }
})