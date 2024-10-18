import React, { useEffect, useState, useRef } from 'react';
import MapView, {Marker} from 'react-native-maps';
import { StyleSheet, View, Text, Easing, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navigation from '@/components/Navigation';
import * as Location from 'expo-location';
import Warning from 'react-native-vector-icons/Entypo';
import io from 'socket.io-client';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';


type RootStackParamList = {
  MapScreen: { userId: string, location: { latitude: number, longitude: number } };
};

type MapScreenProps = {
  navigation: NativeStackNavigationProp<any, any>;
  route: RouteProp<RootStackParamList, 'MapScreen'>;
};

export default function MapScreen({ navigation, route }: MapScreenProps) {
  
  const [myLocation, setMyLocation] = useState<any>(null);
  const [alertLocation, setAlertLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<String | null>(null);
  const pulseAnimation = useRef(new Animated.Value(0)).current;

  const socket = useRef(io('http://192.168.1.165:8080' || 'http://localhost:8080')).current;

  const { userId } = route.params;


  useEffect(() => {
    socket.emit('subscribeToUser', userId); 

    socket.on('userLocationUpdate', (locationData) => {
      if (locationData.userId === userId) {
        setAlertLocation(locationData.location);
        console.log('Alert location:', alertLocation.location.latitude);
      }
    });

    return () => {
      socket.off('userLocationUpdate');
    };
  }, [userId]);


  useEffect(() => {
    const pulse = () => {
      pulseAnimation.setValue(0);
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => pulse()); 
    };
    pulse();
  }, [pulseAnimation]);

  const scale = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 2],
  });

  const opacity = pulseAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.4, 0],
  });

  const backgroundColor = pulseAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 0, 0, 0.5)', 'rgba(255, 0, 0, 0)'],
  });


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
          setMyLocation(newLocation.coords);
          // console.log(newLocation.coords);
        }
      );

      return () => {
        locationSubscription.remove();
      };
    };

    getLocationAsync();
  }, []);

  // console.log('My location:', alertLocation);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        {myLocation ?
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: myLocation.latitude,
              longitude: myLocation.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
          { alertLocation &&
            <Marker
              coordinate={{
                latitude: alertLocation.location.latitude,
                longitude: alertLocation.location.longitude
              }}
            >
              <Animated.View
                style={[
                  styles.pulse,
                  {
                    transform: [{ scale }],
                    opacity,
                    backgroundColor,
                  },
                ]}
              />
              <Warning
                name="warning"
                style={styles.alertedUserLocation}
              />
            </Marker>
          }
            <Marker
              // coordinate={{ latitude: 37.33182081, longitude: -122.03038642 }}
              // coordinate={{ latitude: 59.47577767320275, longitude: 17.89949405665813 }}
              coordinate={{
                latitude: myLocation.latitude,
                longitude: myLocation.longitude
              }}
              description={"This is a marker in React Natve"}
            >
              <View style={styles.yourLocation} />
            </Marker>
          </MapView>
          :
          <Text>Carregando...</Text>
        }
        {/* <Text>{ location.latitude.toString() }</Text> */}
      </View>
      <Navigation currentPage="map" navigation={navigation}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252424',
  },
  mapContainer: {
    flex: 1,
    },
  map: {
    width: '100%',
    height: '100%',
  },
  yourLocation: {
    width: 20,
    height: 20,
    backgroundColor: '#519bfb',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 20,
  },
  alertedUserLocation: {
    fontSize: 30,
    color: '#f30000',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -17,
    marginTop: -20,
  },
  pulse: {
    width: 200,
    height: 200,
    borderRadius: 100, 
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -100,
    marginTop: -100,
  },
});
