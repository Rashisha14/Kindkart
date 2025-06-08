import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, Switch, HelperText } from 'react-native-paper';
import Logo from '../components/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    console.log('Starting login process...');
    console.log('API URL:', API_URL);
    
    if (validateForm()) {
      try {
        const apiUrl = `${API_URL}/auth/login`;
        console.log('Making request to:', apiUrl);
        
        const requestBody = {
          email,
          password,
        };
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        
        let data;
        try {
          data = JSON.parse(textResponse);
          console.log('Parsed response data:', data);
        } catch (e) {
          console.error('Error parsing response:', e);
          Alert.alert(
            'Error',
            'Invalid response from server. Please try again.',
            [{ text: 'OK' }]
          );
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || 'Failed to login');
        }

        if (rememberMe) {
          console.log('Storing token and user data...');
          await AsyncStorage.setItem('token', data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }

        console.log('Login successful, navigating to Home screen...');
        navigation.replace('Home');
      } catch (error) {
        console.error('Login error:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        Alert.alert(
          'Error',
          error.message || 'Failed to login. Please check your network connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } else {
      console.log('Form validation failed. Errors:', errors);
    }
    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Logo />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <Surface style={styles.surface} elevation={2}>
            <Text style={styles.title}>Welcome Back to KindKart</Text>
            <TextInput
              label="Email or Username"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: null });
              }}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              outlineColor={errors.email ? '#FF0000' : '#ddd'}
              activeOutlineColor="#FF4B81"
              error={!!errors.email}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: null });
              }}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              outlineColor={errors.password ? '#FF0000' : '#ddd'}
              activeOutlineColor="#FF4B81"
              error={!!errors.password}
            />
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>

            <View style={styles.rememberContainer}>
              <View style={styles.rememberMe}>
                <Switch
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  color="#FF4B81"
                />
                <Text>Remember me</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forget Password ?</Text>
              </TouchableOpacity>
            </View>
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              buttonColor="#FF4B81"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Login
            </Button>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.link}>SignUp</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    height: 45,
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPassword: {
    color: '#FF4B81',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
    borderRadius: 25,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#FF4B81',
    fontWeight: '500',
  },
});

export default LoginScreen; 