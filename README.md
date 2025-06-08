# KindKart App

A React Native application with Node.js/Express backend and MongoDB database.

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the backend directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kindkart
JWT_SECRET=your_jwt_secret_key_here
```

4. Make sure MongoDB is installed and running on your system

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Install the new dependencies:
```bash
npm install @react-native-async-storage/async-storage
```

2. Start the React Native app:
```bash
npm start
```

## API Endpoints

### Authentication

- POST /api/auth/signup
  - Register a new user
  - Body: { email, password, name }

- POST /api/auth/login
  - Login user
  - Body: { email, password }

## Notes

- For Android emulator, the API URL is configured to use 10.0.2.2 (localhost equivalent)
- For iOS simulator, use localhost
- Make sure MongoDB is running before starting the backend server 