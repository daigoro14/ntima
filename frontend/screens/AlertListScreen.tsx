import Navigation from '@/components/Navigation'
import React, { useState, useEffect, useRef } from 'react'
import { TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Text, View } from 'react-native'
import io from 'socket.io-client';

export default function AlertListScreen({ navigation }) {

  const [userLocations, setUserLocations] = useState([]);
  const socket = useRef(io('http://192.168.1.165:8080' || 'http://localhost:8080')).current;


  useEffect(() => {
    socket.on('userLocations', (data) => {
      console.log('Received location from server:', data);
      // Update state with new locations
      // setUserLocations((prevLocations) => [...prevLocations, data]);
    });

    return () => {
      socket.off('userLocations');
    };
  }, [socket]);
  return (
    <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text>Alertas</Text>
          </View>
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
      // paddingHorizontal: 80,
    flex: 1,
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',

  },
})