import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.3);

  useEffect(() => {
    // Start animations immediately
    const animations = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);

    // Start fade-out animation after delay
    const fadeOut = Animated.timing(logoOpacity, {
      toValue: 0,
      duration: 500,
      delay: 1500, // Start fade out after 1.5s
      useNativeDriver: true,
    });

    // Run animations in sequence
    Animated.sequence([
      animations,
      fadeOut
    ]).start(() => {
      // Navigate to Login screen after animations complete
      navigation.replace('Login');
    });

  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.Image
        source={require('../../assets/LOGOMAIN.png')}
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF4B81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7,
    height: width * 0.7,
  },
});

export default SplashScreen; 