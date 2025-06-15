import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, Checkbox, HelperText } from 'react-native-paper';
import Logo from '../components/Logo';
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    setIsSubmitting(true);
    console.log('Starting signup process...');
    
    if (validateForm()) {
      try {
        const apiUrl = `${API_URL}/auth/signup`;
        console.log('Making request to:', apiUrl);
        
        const requestBody = {
          name,
          email,
          password,
          phone
        };
        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
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
          throw new Error(`Invalid response from server: ${textResponse}`);
        }

        if (!response.ok) {
          throw new Error(data.message || 'Failed to sign up');
        }

        // Store user data with correct ID field
        const userData = {
          ...data.user,
          _id: data.user.id // Map id to _id for consistency
        };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await AsyncStorage.setItem('token', data.token);

        Alert.alert(
          'Success',
          'Account created successfully! Please login.',
          [{ 
            text: 'OK', 
            onPress: () => {
              console.log('Navigating to Login screen...');
              navigation.replace('Login');
            }
          }]
        );
      } catch (error) {
        console.error('Signup error:', {
          message: error.message,
          stack: error.stack
        });
        
        Alert.alert(
          'Error',
          error.message || 'Failed to sign up. Please try again.',
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
            <Text style={styles.title}>Create a KindKart Account</Text>
            
            <TextInput
              label="Name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors({ ...errors, name: null });
              }}
              style={styles.input}
              mode="outlined"
              outlineColor={errors.name ? '#FF0000' : '#ddd'}
              activeOutlineColor="#FF4B81"
              error={!!errors.name}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            <TextInput
              label="Email"
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
              label="Phone Number"
              value={phone}
              onChangeText={(text) => {
                const formatted = text.replace(/[^0-9]/g, '').slice(0, 10);
                setPhone(formatted);
                setErrors({ ...errors, phone: null });
              }}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
              outlineColor={errors.phone ? '#FF0000' : '#ddd'}
              activeOutlineColor="#FF4B81"
              error={!!errors.phone}
            />
            <HelperText type="error" visible={!!errors.phone}>
              {errors.phone}
            </HelperText>

            <View style={styles.passwordContainer}>
              <TextInput
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: null });
                }}
                style={[styles.input, styles.passwordInput]}
                mode="outlined"
                secureTextEntry
                outlineColor={errors.password ? '#FF0000' : '#ddd'}
                activeOutlineColor="#FF4B81"
                error={!!errors.password}
              />
              <TextInput
                label="Confirm"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: null });
                }}
                style={[styles.input, styles.passwordInput]}
                mode="outlined"
                secureTextEntry
                outlineColor={errors.confirmPassword ? '#FF0000' : '#ddd'}
                activeOutlineColor="#FF4B81"
                error={!!errors.confirmPassword}
              />
            </View>
            <HelperText type="error" visible={!!errors.password}>
              {errors.password}
            </HelperText>
            <HelperText type="error" visible={!!errors.confirmPassword}>
              {errors.confirmPassword}
            </HelperText>

            <View style={styles.termsContainer}>
              <Checkbox.Android
                status={agreeToTerms ? 'checked' : 'unchecked'}
                onPress={() => {
                  setAgreeToTerms(!agreeToTerms);
                  setErrors({ ...errors, terms: null });
                }}
                color="#FF4B81"
              />
              <Text style={styles.termsText}>I agree to the Terms and Condition</Text>
            </View>
            <HelperText type="error" visible={!!errors.terms}>
              {errors.terms}
            </HelperText>

            <Button
              mode="contained"
              onPress={handleSignup}
              style={styles.button}
              buttonColor="#FF4B81"
              loading={isSubmitting}
              disabled={isSubmitting || !agreeToTerms}
            >
              Signup
            </Button>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Login</Text>
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
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#f5f5f5',
    height: 45,
  },
  passwordContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  passwordInput: {
    flex: 0.485,
    marginBottom: 0,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  termsText: {
    color: '#666',
    marginLeft: 8,
    fontSize: 13,
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
  checkboxContainer: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF4B81',
    borderRadius: 4,
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF4B81',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#FF4B81',
  },
});

export default SignupScreen; 