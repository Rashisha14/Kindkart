import { Platform } from 'react-native';

// Your computer's IP address (where the backend is running)
const LOCAL_IP = '192.168.159.91';

// Development URLs with complete paths
const DEV_API_URL = Platform.OS === 'android'
  ? `http://${LOCAL_IP}:5000/api`  // Android (both emulator and physical device)
  : `http://${LOCAL_IP}:5000/api`; // iOS (both simulator and physical device)

// Production URL - Replace with your deployed backend URL
const PROD_API_URL = 'https://your-backend-url.com/api';

// Use DEV_API_URL for development and PROD_API_URL for production
export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Export the base URL for other purposes
export const BASE_URL = __DEV__ 
  ? `http://${LOCAL_IP}:5000`
  : 'https://your-backend-url.com';

// For debugging
console.log('API Configuration:', {
  API_URL,
  BASE_URL,
  Platform: Platform.OS,
  isDev: __DEV__
}); 