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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [boughtItems, setBoughtItems] = useState({}); // Stores {itemId: true} for bought items

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

        // Load bought items for the current user
        const boughtItemsKey = `bought_items_${user._id}`;
        const storedBoughtItems = await AsyncStorage.getItem(boughtItemsKey);
        if (storedBoughtItems) {
          setBoughtItems(JSON.parse(storedBoughtItems));
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
      // Also remove from bought items if it was there
      const newBoughtItems = { ...boughtItems };
      delete newBoughtItems[itemId];
      const boughtItemsKey = `bought_items_${currentUser._id}`;
      await AsyncStorage.setItem(boughtItemsKey, JSON.stringify(newBoughtItems));
      setBoughtItems(newBoughtItems);
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
    setSelectedPaymentMethod(null); // Reset payment method when opening new details
  };

  const handlePayment = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleBuyNow = async () => {
    if (!selectedItem || !selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method first.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to proceed with buying.');
      return;
    }

    try {
      // Record buy interest on the backend
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/buyinterests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedItem._id,
          paymentMethod: selectedPaymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record buy interest');
      }

      // Mark item as bought for the current user in local storage
      const newBoughtItems = { ...boughtItems, [selectedItem._id]: true };
      setBoughtItems(newBoughtItems);
      const boughtItemsKey = `bought_items_${currentUser._id}`;
      await AsyncStorage.setItem(boughtItemsKey, JSON.stringify(newBoughtItems));

      Alert.alert(
        'Success',
        'Your interest has been recorded! Seller details are now visible. Please contact the seller directly.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ]
      );
    } catch (error) {
      console.error('Error recording buy interest:', error);
      Alert.alert('Error', error.message || 'Failed to record your interest. Please try again.');
    }
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

  const renderDetailsModal = () => {
    const isAlreadyBought = boughtItems[selectedItem?._id];

    return (
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

              {/* Owner Details (always shown now) */}
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
                  <Text style={styles.ownerLabel}>Phone:</Text>
                  <Text style={styles.ownerValue}>{selectedItem?.owner.phone}</Text>
                </View>
                {selectedPaymentMethod === 'UPI' && (
                  <View style={styles.ownerInfo}>
                    <Text style={styles.ownerLabel}>UPI ID:</Text>
                    <Text style={styles.ownerValue}>{selectedItem?.upiId}</Text>
                  </View>
                )}
              </View>

              {/* Payment Options / Buy Section */}
              <View style={styles.detailSection}>
                {!isAlreadyBought ? (
                  <>
                    <Text style={styles.sectionTitle}>Select Payment Method</Text>
                    <TouchableOpacity 
                      style={[styles.paymentButton, selectedPaymentMethod === 'UPI' && styles.selectedPaymentButton]}
                      onPress={() => handlePayment('UPI')}
                    >
                      <Text style={[styles.paymentButtonText, selectedPaymentMethod === 'UPI' && styles.selectedPaymentButtonText]}>Pay with UPI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.paymentButton, selectedPaymentMethod === 'Cash on Delivery' && styles.selectedPaymentButton]}
                      onPress={() => handlePayment('Cash on Delivery')}
                    >
                      <Text style={[styles.paymentButtonText, selectedPaymentMethod === 'Cash on Delivery' && styles.selectedPaymentButtonText]}>Cash on Delivery</Text>
                    </TouchableOpacity>
                    
                    {selectedPaymentMethod && (
                      <TouchableOpacity 
                        style={styles.buyNowButton}
                        onPress={handleBuyNow}
                      >
                        <Text style={styles.buyNowButtonText}>Buy Now</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.sectionTitle}>Transaction Details</Text>
                    <Text style={styles.boughtMessage}>You have expressed interest in this item. Please contact the seller directly.</Text>
                    <View style={styles.ownerInfo}>
                      <Text style={styles.ownerLabel}>Selected Method:</Text>
                      <Text style={styles.ownerValue}>{selectedPaymentMethod}</Text>
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

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
          contentContainerStyle={styles.listContent}
        />
      )}

      {selectedItem && renderDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF4B81',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: StatusBar.currentHeight + 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 24,
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
    color: '#888',
    marginTop: 10,
  },
  continueShoppingButton: {
    backgroundColor: '#FF4B81',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#FF4B81',
    fontWeight: 'bold',
    marginTop: 5,
  },
  ownerInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  removeButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingTop: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 10,
  },
  detailsScroll: {
    paddingHorizontal: 20,
  },
  detailImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#eee',
  },
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  detailPrice: {
    fontSize: 18,
    color: '#FF4B81',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    color: '#555',
  },
  ownerValue: {
    color: '#666',
    fontSize: 15,
  },
  paymentButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedPaymentButton: {
    backgroundColor: '#FF4B81',
    borderColor: '#FF4B81',
  },
  selectedPaymentButtonText: {
    color: 'white',
  },
  buyNowButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyNowButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  boughtMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default CartScreen; 