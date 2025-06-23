# <p align="center">KindKart</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native"></a>
  <a href="#"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"></a>
</p>

KindKart is a mobile e-commerce platform built with React Native, providing a seamless experience for users to buy and sell products. The application features user authentication, product listings, cart management, and secure transactions. The backend is powered by Node.js with Express, ensuring scalability and robustness.

## Table of Contents

1.  [Key Features](#key-features)
2.  [Installation Guide](#installation-guide)
3.  [Usage](#usage)
4.  [Environment Variables](#environment-variables)
5.  [Project Structure](#project-structure)
6.  [Technologies Used](#technologies-used)
7.  [License](#license)

## Key Features

-   **User Authentication**: Secure signup and login functionality with password hashing.
-   **Product Listings**: Browse and search for products with detailed descriptions and images.
-   **Cart Management**: Add, remove, and manage items in a shopping cart.
-   **Account Management**: View user profile, purchase history, and manage listed products.
-   **Seller-Buyer Interaction**: Allows users to express interest in buying products.
-   **Image Uploads**: Allows users to upload product images when listing items for sale.
-   **Push Notifications**: (Future Implementation) Real-time updates for new listings and purchase requests.

## Installation Guide

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies for the React Native app:**

    ```bash
    cd <react_native_app_directory>
    npm install
    ```

3.  **Install dependencies for the Node.js backend:**

    ```bash
    cd <node_js_backend_directory>
    npm install
    ```

4.  **Configure environment variables:**

    -   Create a `.env` file in both the React Native and Node.js directories.
    -   Add the necessary environment variables (see [Environment Variables](#environment-variables)).

5.  **Run the React Native app:**

    ```bash
    npx expo start
    ```

6.  **Run the Node.js backend:**

    ```bash
    cd <node_js_backend_directory>
    npm start
    ```

## Usage

-   **Frontend (React Native):**
    -   Use the Expo Go app on your mobile device or an emulator to view the application.
    -   Navigate through the app using the bottom navigation bar or the drawer menu.
    -   Use the `HomeScreen` and `CategoryScreen` to browse available products.
    -   Use `LoginScreen` and `SignupScreen` to manage your account.
    -   `CartScreen` allows you to view and manage the products in your cart.
    -   `AccountDetailsScreen` shows your account details, listed products and buy interests.
    -   `SellProductScreen` allows you to post new items for sale.
    -   Tap on product images to view detailed information in the `ProductDetailModal`.

-   **Backend (Node.js):**
    -   The backend provides RESTful APIs for user authentication, product management, and cart operations.
    -   Refer to the API documentation (if available) for specific endpoints and request/response formats.

## Environment Variables

**React Native App (.env):**

-   `API_URL`: The base URL of the backend API (e.g., `http://localhost:3000/api`).

**Node.js Backend (.env):**

-   `PORT`: The port the server will listen on (e.g., `3000`).
-   `MONGODB_URI`: The connection string for the MongoDB database.
-   `JWT_SECRET`: A secret key used to sign JWT tokens.
-   `CLOUDINARY_CLOUD_NAME`: Cloudinary account cloud name.
-   `CLOUDINARY_API_KEY`: Cloudinary account API key.
-   `CLOUDINARY_API_SECRET`: Cloudinary account API secret.

## Project Structure

```
/
├── metro.config.js       # Metro bundler configuration
├── App.js                # Main application component
├── index.js              # Entry point for React Native
├── start.js              # Expo start script
├── babel.config.js       # Babel configuration
├── src/
│   ├── components/
│   │   ├── Logo.js         # Logo component
│   │   └── ProductDetailModal.js # Product detail modal component
│   ├── config/
│   │   └── api.js          # API configuration
│   ├── navigation/
│   │   └── AuthNavigator.js # Authentication navigator
│   ├── screens/
│   │   ├── HomeScreen.js         # Home screen
│   │   ├── SignupScreen.js       # Signup screen
│   │   ├── SplashScreen.js       # Splash screen
│   │   ├── AccountDetailsScreen.js # Account details screen
│   │   ├── CartScreen.js         # Cart screen
│   │   ├── LoginScreen.js        # Login screen
│   │   ├── SellProductScreen.js  # Sell product screen
│   │   └── CategoryScreen.js     # Category screen
├── backend/
│   ├── testConnection.js   # Database connection test
│   ├── server.js           # Main server file
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   ├── config/
│   │   ├── upload.js       # Multer configuration for uploads
│   │   └── cloudinary.js   # Cloudinary configuration
│   ├── routes/
│   │   ├── buyInterests.js # Buy interests routes
│   │   ├── auth.js         # Authentication routes
│   │   └── products.js     # Product routes
│   ├── models/
│   │   ├── Product.js      # Product model
│   │   ├── User.js         # User model
│   │   └── BuyInterest.js  # Buy interest model
```

## Technologies Used

<p align="left">
  <a href="#"><img src="https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native"></a>
  <a href="#"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"></a>
  <a href="#"><img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&color=red" alt="JWT"></a>
  <a href="#"><img src="https://img.shields.io/badge/Expo-4630EB?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"></a>
  <a href="#"><img src="https://img.shields.io/badge/Cloudinary-21293D?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary"></a>
</p>

-   **Frontend**: React Native
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Authentication**: JSON Web Tokens (JWT)
-   **Image Storage**: Cloudinary
-   **Framework**: Expo

## License

MIT License
<p align="left">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License"></a>
</p>
