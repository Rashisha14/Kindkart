import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, BASE_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const AccountDetailsScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [listedProducts, setListedProducts] = useState([]);
  const [buyInterests, setBuyInterests] = useState({}); // Stores buy interests grouped by product ID
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null); // State to track expanded product
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const fetchUserDataAndProducts = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('token');

      if (!storedUserData || !token) {
        Alert.alert('Login Required', 'Please login to view your account details.', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const user = JSON.parse(storedUserData);
      setUserData(user);

      // Fetch user's listed products
      const productsResponse = await fetch(`${API_URL}/products/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!productsResponse.ok) {
        const errorData = await productsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch listed products');
      }

      const products = await productsResponse.json();
      setListedProducts(products);

      // Fetch buy interests for seller's products
      const buyInterestsResponse = await fetch(`${API_URL}/buy-interests/seller-products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!buyInterestsResponse.ok) {
        const errorData = await buyInterestsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch buy interests');
      }

      const interests = await buyInterestsResponse.json();
      
      // Group buy interests by product ID
      const groupedInterests = interests.reduce((acc, interest) => {
        const productId = interest.product._id;
        if (!acc[productId]) {
          acc[productId] = [];
        }
        acc[productId].push(interest);
        return acc;
      }, {});
      setBuyInterests(groupedInterests);

      // Load purchase history
      const boughtItemsKey = `bought_items_${user._id}`;
      const boughtItemsStr = await AsyncStorage.getItem(boughtItemsKey);
      if (boughtItemsStr) {
        const boughtItems = JSON.parse(boughtItemsStr);
        const boughtItemIds = Object.keys(boughtItems);
        
        // Fetch all products to find purchased items
        const allProductsResponse = await fetch(`${API_URL}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!allProductsResponse.ok) {
          throw new Error('Failed to fetch products for purchase history');
        }

        const allProducts = await allProductsResponse.json();
        
        // Filter products that are marked as sold and in user's purchase history
        const purchasedProducts = allProducts.filter(product => 
          product.isSold && boughtItemIds.includes(product._id)
        );
        
        setPurchaseHistory(purchasedProducts);
      }

    } catch (error) {
      console.error('Error fetching account details or products:', error);
      Alert.alert('Error', error.message || 'Failed to load account details or products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchUserDataAndProducts();
    }, [fetchUserDataAndProducts])
  );

  const onRefresh = useCallback(() => {
    fetchUserDataAndProducts();
  }, [fetchUserDataAndProducts]);

  const toggleProductExpansion = (productId) => {
    setExpandedProduct(prevId => (prevId === productId ? null : productId));
  };

  const handleMarkAsSold = async (productId) => {
    const productInterests = buyInterests[productId] || [];
    
    if (productInterests.length === 0) {
      Alert.alert('No Buyers', 'There are no interested buyers for this item.');
      return;
    }

    if (productInterests.length === 1) {
      // If only one buyer, proceed with confirmation
      Alert.alert(
        'Mark as Sold',
        `Are you sure you want to mark this item as SOLD to ${productInterests[0].buyer.name}?\nThis action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Mark Sold',
            onPress: () => markAsSoldToBuyer(productId, productInterests[0].buyer._id),
          },
        ]
      );
    } else {
      // If multiple buyers, show selection dialog
      Alert.alert(
        'Select Buyer',
        'Choose the buyer to sell this item to:',
        [
          ...productInterests.map((interest) => ({
            text: `${interest.buyer.name} (${interest.buyer.email})`,
            onPress: () => {
              Alert.alert(
                'Confirm Sale',
                `Are you sure you want to mark this item as SOLD to ${interest.buyer.name}?\nThis action cannot be undone.`,
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Mark Sold',
                    onPress: () => markAsSoldToBuyer(productId, interest.buyer._id),
                  },
                ]
              );
            },
          })),
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const markAsSoldToBuyer = async (productId, buyerId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please login again.');
        return;
      }

      const response = await fetch(`${API_URL}/products/${productId}/mark-sold`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buyerId }), // Send the selected buyer's ID
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark product as sold');
      }

      // Update the buyer's purchase history
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const boughtItemsKey = `bought_items_${buyerId}`;
        const boughtItems = await AsyncStorage.getItem(boughtItemsKey);
        const updatedBoughtItems = boughtItems ? JSON.parse(boughtItems) : {};
        updatedBoughtItems[productId] = true;
        await AsyncStorage.setItem(boughtItemsKey, JSON.stringify(updatedBoughtItems));
      }

      Alert.alert('Success', 'Product successfully marked as sold!');
      // Refresh data after marking as sold
      fetchUserDataAndProducts();
    } catch (error) {
      console.error('Error marking product as sold:', error);
      Alert.alert('Error', error.message || 'Failed to mark product as sold. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4B81" />
          <Text style={styles.loadingText}>Loading account details...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4B81']} />
          }
        >
          {userData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color="#FF4B81" style={styles.infoIcon} />
                <Text style={styles.infoText}>Name: {userData.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#FF4B81" style={styles.infoIcon} />
                <Text style={styles.infoText}>Email: {userData.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#FF4B81" style={styles.infoIcon} />
                <Text style={styles.infoText}>Phone: {userData.phone}</Text>
              </View>
            </View>
          )}

          {/* Purchase History Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purchase History</Text>
            {purchaseHistory.length > 0 ? (
              purchaseHistory.map((product) => (
                <View key={product._id} style={styles.purchaseHistoryCard}>
                  <Image
                    source={{ uri: `${BASE_URL}${product.imageUrl}` }}
                    style={styles.purchaseHistoryImage}
                  />
                  <View style={styles.purchaseHistoryInfo}>
                    <Text style={styles.purchaseHistoryTitle}>{product.title}</Text>
                    <Text style={styles.purchaseHistoryPrice}>₹{product.price}</Text>
                    <Text style={styles.purchaseHistoryStatus}>Status: Sold</Text>
                    <View style={styles.sellerInfo}>
                      <Text style={styles.sellerInfoTitle}>Seller Details:</Text>
                      <Text style={styles.sellerInfoText}>Name: {product.owner.name}</Text>
                      <Text style={styles.sellerInfoText}>Email: {product.owner.email}</Text>
                      <Text style={styles.sellerInfoText}>Phone: {product.owner.phone}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.contactSellerButton}
                      onPress={() => handleContact(product)}
                    >
                      <Text style={styles.contactSellerButtonText}>Contact Seller</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noItemsText}>No purchase history yet.</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listed Products</Text>
            {listedProducts.length > 0 ? (
              listedProducts.map((product) => {
                const productInterests = buyInterests[product._id] || [];
                const hasInterests = productInterests.length > 0;
                const isExpanded = expandedProduct === product._id;

                return (
                  <View key={product._id} style={[
                    styles.productCard,
                    product.isSold && styles.soldProductCard
                  ]}>
                    <Image
                      source={{ uri: `${BASE_URL}${product.imageUrl}` }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle}>{product.title}</Text>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                      <Text style={[styles.productStatus, product.isSold && styles.soldStatus]}>
                        Status: {product.isSold ? 'Sold' : 'Active'} {hasInterests && !product.isSold && '(Has Interest)'}
                      </Text>

                      {product.isSold && productInterests.length > 0 && (
                        <View style={styles.sellerInfo}>
                          <Text style={styles.sellerInfoTitle}>Sold to:</Text>
                          <Text style={styles.sellerInfoText}>Name: {productInterests[0].buyer.name}</Text>
                          <Text style={styles.sellerInfoText}>Email: {productInterests[0].buyer.email}</Text>
                          <Text style={styles.sellerInfoText}>Phone: {productInterests[0].buyer.phone}</Text>
                        </View>
                      )}

                      {hasInterests && !product.isSold && (
                        <TouchableOpacity 
                          style={styles.expandButton}
                          onPress={() => toggleProductExpansion(product._id)}
                        >
                          <Text style={styles.expandButtonText}>
                            {isExpanded ? 'Hide Interests' : 'Show Interests'}
                          </Text>
                          <Ionicons 
                            name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"} 
                            size={20} 
                            color="#FF4B81" 
                          />
                        </TouchableOpacity>
                      )}

                      {isExpanded && hasInterests && !product.isSold && (
                        <View style={styles.buyerInterestSection}>
                          <Text style={styles.buyerInterestTitle}>Interested Buyers:</Text>
                          {productInterests.map((interest) => (
                            <View key={interest._id} style={styles.buyerInfoRow}>
                              <View style={styles.sellerInfo}>
                                <Text style={styles.sellerInfoText}>Name: {interest.buyer.name}</Text>
                                <Text style={styles.sellerInfoText}>Email: {interest.buyer.email}</Text>
                                <Text style={styles.sellerInfoText}>Phone: {interest.buyer.phone}</Text>
                                <Text style={styles.sellerInfoText}>Payment: {interest.paymentMethod}</Text>
                              </View>
                              <TouchableOpacity 
                                style={styles.markSoldButton}
                                onPress={() => handleMarkAsSold(product._id)}
                              >
                                <Text style={styles.markSoldButtonText}>Mark as Sold</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noItemsText}>You haven't listed any items yet.</Text>
            )}
          </View>
        </ScrollView>
      )}
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
  },
  soldProductCard: {
    backgroundColor: '#FFF5F5', // Light red background for sold items
    borderColor: '#FFE0E0', // Lighter red border
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#FF4B81',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productStatus: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  soldStatus: {
    color: '#DC3545',
    fontWeight: 'bold',
  },
  noItemsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    paddingVertical: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandButtonText: {
    color: '#FF4B81',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  buyerInterestSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  buyerInterestTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  buyerInfoRow: {
    marginBottom: 12,
  },
  markSoldButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  markSoldButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sellerInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  sellerInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sellerInfoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  contactSellerButton: {
    backgroundColor: '#FF4B81',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  contactSellerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Purchase History Styles
  purchaseHistoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
  },
  purchaseHistoryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  purchaseHistoryInfo: {
    flex: 1,
  },
  purchaseHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  purchaseHistoryPrice: {
    fontSize: 14,
    color: '#FF4B81',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  purchaseHistoryStatus: {
    fontSize: 13,
    color: '#DC3545',
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default AccountDetailsScreen; 