import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserAndCart();
  }, []);

  const loadUserAndCart = async () => {
    try {
      // Get current user from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        // Get cart items for the current user
        const cartKey = `cart_${user._id}`;
        const cart = await AsyncStorage.getItem(cartKey);
        if (cart) {
          setCartItems(JSON.parse(cart));
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (!currentUser) return;

      const updatedItems = cartItems.filter(item => item._id !== itemId);
      const cartKey = `cart_${currentUser._id}`;
      await AsyncStorage.setItem(cartKey, JSON.stringify(updatedItems));
      setCartItems(updatedItems);
      setShowDetails(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error removing item from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const handleRemoveItem = (item) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => removeFromCart(item._id),
          style: 'destructive',
        },
      ]
    );
  };

  const handleItemPress = (item) => {
    // Check if the current user is the owner of the item
    if (item.owner._id === currentUser._id) {
      Alert.alert(
        'Cannot View Details',
        'You cannot view details of your own items in the cart.'
      );
      return;
    }
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handlePayment = (method) => {
    Alert.alert(
      'Payment Method',
      `You selected ${method} payment. Proceed with payment?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Proceed',
          onPress: () => {
            // Here you would implement the actual payment logic
            Alert.alert('Success', 'Payment processed successfully!');
            setShowDetails(false);
            setSelectedItem(null);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.cartItem}
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={{ uri: `${BASE_URL}${item.imageUrl}` }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <Text style={styles.ownerInfo}>Seller: {item.owner.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item)}
      >
        <Ionicons name="trash-outline" size={24} color="#FF4B81" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDetails(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowDetails(false)}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <ScrollView style={styles.detailsScroll}>
            {/* Product Image */}
            <Image
              source={{ uri: `${BASE_URL}${selectedItem?.imageUrl}` }}
              style={styles.detailImage}
              resizeMode="contain"
            />

            {/* Product Details */}
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>{selectedItem?.title}</Text>
              <Text style={styles.detailPrice}>₹{selectedItem?.price}</Text>
              <Text style={styles.detailDescription}>{selectedItem?.description}</Text>
            </View>

            {/* Owner Details */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Owner Details</Text>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerLabel}>Name:</Text>
                <Text style={styles.ownerValue}>{selectedItem?.owner.name}</Text>
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerLabel}>Email:</Text>
                <Text style={styles.ownerValue}>{selectedItem?.owner.email}</Text>
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerLabel}>UPI ID:</Text>
                <Text style={styles.ownerValue}>{selectedItem?.upiId}</Text>
              </View>
            </View>

            {/* Payment Options */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Payment Options</Text>
              <TouchableOpacity 
                style={styles.paymentButton}
                onPress={() => handlePayment('UPI')}
              >
                <Text style={styles.paymentButtonText}>Pay with UPI</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.paymentButton}
                onPress={() => handlePayment('Cash on Delivery')}
              >
                <Text style={styles.paymentButtonText}>Cash on Delivery</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF4B81" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading cart items...</Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.cartList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF4B81',
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: '#FF4B81',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    color: '#FF4B81',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ownerInfo: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  detailsScroll: {
    flex: 1,
    padding: 20,
  },
  detailImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  detailPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF4B81',
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
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
  paymentButton: {
    backgroundColor: '#FF4B81',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen; 