import React from 'react';
import { View, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

const Logo = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FF4B81" barStyle="light-content" />
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FF4B81',
    paddingTop: StatusBar.currentHeight + 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoContainer: {
    width: width * 0.6, // 60% of screen width
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default Logo; 