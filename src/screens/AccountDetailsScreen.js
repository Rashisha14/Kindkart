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
  const [productBuyInterests, setProductBuyInterests] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      const buyInterestsResponse = await fetch(`${API_URL}/buyinterests/seller-products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!buyInterestsResponse.ok) {
        const errorData = await buyInterestsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch buy interests');
      }

      const interests = await buyInterestsResponse.json();
      // Organize interests by product ID for easy lookup
      const interestsMap = interests.reduce((acc, interest) => {
        if (!acc[interest.product._id]) {
          acc[interest.product._id] = [];
        }
        acc[interest.product._id].push(interest);
        return acc;
      }, {});
      setProductBuyInterests(interestsMap);

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Listed Items</Text>
            {listedProducts.length > 0 ? (
              listedProducts.map((product) => (
                <View key={product._id} style={styles.productCardContainer}>
                  <View style={styles.productCard}>
                    <Image
                      source={{ uri: `${BASE_URL}${product.imageUrl}` }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle}>{product.title}</Text>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                      <Text style={styles.productStatus}>Status: Active</Text>
                    </View>
                  </View>

                  {productBuyInterests[product._id] && productBuyInterests[product._id].length > 0 && (
                    <View style={styles.buyInterestSection}>
                      <Text style={styles.buyInterestTitle}>Interests:</Text>
                      {productBuyInterests[product._id].map((interest, index) => (
                        <View key={index} style={styles.buyInterestItem}>
                          <Text style={styles.buyInterestText}><Ionicons name="person-outline" size={14} /> Buyer: {interest.buyer.name}</Text>
                          <Text style={styles.buyInterestText}><Ionicons name="mail-outline" size={14} /> Email: {interest.buyer.email}</Text>
                          <Text style={styles.buyInterestText}><Ionicons name="call-outline" size={14} /> Phone: {interest.buyer.phone}</Text>
                          <Text style={styles.buyInterestText}><Ionicons name="card-outline" size={14} /> Method: {interest.paymentMethod}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
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
  productCardContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    overflow: 'hidden',
  },
  productCard: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    paddingVertical: 5,
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
  },
  noItemsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Styles for Buy Interest Section
  buyInterestSection: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: '#fefefe',
  },
  buyInterestTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  buyInterestItem: {
    marginBottom: 8,
  },
  buyInterestText: {
    fontSize: 14,
    color: '#555',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AccountDetailsScreen; 