import React from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../config/api';

const { width } = Dimensions.get('window');

const ProductDetailModal = ({ visible, product, onClose, onContact }) => {
  if (!product) return null;

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
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color="#666" />
          </TouchableOpacity>
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
});

export default ProductDetailModal; 