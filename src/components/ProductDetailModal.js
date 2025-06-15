import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ProductDetailModal = ({ visible, product, onClose, onContact }) => {
  const [showCart, setShowCart] = useState(false);

  if (!product) return null;

  const handleCartPress = () => {
    setShowCart(true);
  };

  const handleBackToDetails = () => {
    setShowCart(false);
  };

  const handleAddToCart = async () => {
    try {
      // Get current user
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert(
          'Login Required',
          'Please login to add items to your cart',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowCart(false);
                onClose();
              }
            }
          ]
        );
        return;
      }

      const user = JSON.parse(userData);
      const cartKey = `cart_${user._id}`;

      // Get existing cart items for the current user
      const existingCart = await AsyncStorage.getItem(cartKey);
      const cartItems = existingCart ? JSON.parse(existingCart) : [];
      
      // Check if item already exists in cart
      const itemExists = cartItems.some(item => item._id === product._id);
      
      if (itemExists) {
        Alert.alert('Item already in cart', 'This item is already in your cart.');
        return;
      }

      // Add new item to cart
      cartItems.push(product);
      await AsyncStorage.setItem(cartKey, JSON.stringify(cartItems));
      
      Alert.alert(
        'Success',
        'Item added to cart',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCart(false);
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          {!showCart ? (
            <>
              {/* Product Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: `${BASE_URL}${product.imageUrl}` }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>

              {/* Product Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
                <Text style={styles.productPrice}>₹{product.price}</Text>
              </View>

              {/* Contact Button */}
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => onContact(product)}
              >
                <Text style={styles.contactButtonText}>Contact</Text>
              </TouchableOpacity>

              {/* Cart Button */}
              <TouchableOpacity 
                style={styles.cartButton}
                onPress={handleCartPress}
              >
                <Ionicons name="cart-outline" size={24} color="#666" />
              </TouchableOpacity>
            </>
          ) : (
            <ScrollView style={styles.cartContainer}>
              {/* Back Button */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBackToDetails}
              >
                <Ionicons name="arrow-back" size={24} color="#666" />
                <Text style={styles.backButtonText}>Back to Details</Text>
              </TouchableOpacity>

              {/* Owner Details */}
              <View style={styles.ownerSection}>
                <Text style={styles.sectionTitle}>Owner Details</Text>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerLabel}>Name:</Text>
                  <Text style={styles.ownerValue}>{product.owner.name}</Text>
                </View>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerLabel}>Email:</Text>
                  <Text style={styles.ownerValue}>{product.owner.email}</Text>
                </View>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerLabel}>UPI ID:</Text>
                  <Text style={styles.ownerValue}>{product.upiId}</Text>
                </View>
              </View>

              {/* Add to Cart Button */}
              <TouchableOpacity 
                style={styles.addToCartButton}
                onPress={handleAddToCart}
              >
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    minHeight: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  productDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#FF4B81',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 12,
  },
  cartContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  ownerSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  ownerInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  ownerLabel: {
    width: 80,
    fontSize: 16,
    color: '#666',
  },
  ownerValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#FF4B81',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetailModal; 