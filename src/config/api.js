import { Platform } from 'react-native';

// Your development machine's IP address (where the backend is running)
const LOCAL_IP = '192.168.1.37'; // This should match your computer's IP address

// Development URLs with complete paths
const DEV_API_URL = Platform.select({
  android: __DEV__ 
    ? `http://${LOCAL_IP}:5000/api`  // Physical Android device or emulator
    : 'http://10.0.2.2:5000/api',    // Android emulator
  ios: __DEV__
    ? `http://${LOCAL_IP}:5000/api`  // Physical iOS device
    : 'http://localhost:5000/api',    // iOS simulator
  default: `http://${LOCAL_IP}:5000/api`,
});

// Production URL - Replace with your deployed backend URL
const PROD_API_URL = 'https://your-backend-url.com/api';

// Use DEV_API_URL for development and PROD_API_URL for production
export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Export the base URL for other purposes
export const BASE_URL = __DEV__ 
  ? Platform.select({
      android: `http://${LOCAL_IP}:5000`,
      ios: `http://${LOCAL_IP}:5000`,
      default: `http://${LOCAL_IP}:5000`,
    })
  : 'https://your-backend-url.com';

// For debugging
console.log('API Configuration:', {
  API_URL,
  BASE_URL,
  Platform: Platform.OS,
  isDev: __DEV__,
  LOCAL_IP
}); 