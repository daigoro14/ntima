import React from 'react'
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native'
// ICONS FROM:
// https://oblador.github.io/react-native-vector-icons/
import Map from 'react-native-vector-icons/FontAwesome';
import Warning from 'react-native-vector-icons/Entypo';
import List from 'react-native-vector-icons/Foundation';

export default function Navigation({ currentPage, navigation }) {
    const activeColor = '#6fe5ff';
    const inactiveColor = '#c1c1c1';

  return (
    <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <Map 
                name="map-o" 
                color={currentPage === 'map' ? activeColor : inactiveColor} 
                style={styles.navIcon}
            />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Warning 
                name="warning" 
                color={currentPage === 'home' ? activeColor : inactiveColor} 
                style={styles.navIcon}
            />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
            <List 
                name="list-bullet" 
                color={currentPage === 'alerts' ? activeColor : inactiveColor} 
                style={[styles.navIcon, { transform: [{ scaleX: -1 }] }]}
            />
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    nav: {
        borderTopWidth: 0.2, // Set the border width
        borderTopColor: '#c1c1c1', // Set the border color
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 50,
        paddingVertical: 25,
        flexDirection: 'row'
    },
    navIcon: {
        fontSize: 40 ,
    }
    })
