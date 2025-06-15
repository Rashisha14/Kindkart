import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, BASE_URL } from '../config/api';
import ProductDetailModal from '../components/ProductDetailModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import SVG icons
import ElectronicsIcon from '../../assets/icons/electronicdevices.svg';
import ClothesIcon from '../../assets/icons/clothes.svg';
import homeaplliancesIcon from '../../assets/icons/homeaplliances.svg';
import ToysIcon from '../../assets/icons/toys.svg';
import FurnitureIcon from '../../assets/icons/furniture.svg';
import ShoesIcon from '../../assets/icons/shoes.svg';

const categories = [
  { id: '1', name: 'Electronic Devices', Icon: ElectronicsIcon },
  { id: '2', name: 'Clothes', Icon: ClothesIcon },
  { id: '3', name: 'Home Appliances', Icon: homeaplliancesIcon },
  { id: '4', name: 'Toys', Icon: ToysIcon },
  { id: '5', name: 'Furniture', Icon: FurnitureIcon },
  { id: '6', name: 'Shoes', Icon: ShoesIcon },
];

const HomeScreen = ({ navigation }) => {
  const [nearbyItems, setNearbyItems] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const cartKey = `cart_${user._id}`;
        const cart = await AsyncStorage.getItem(cartKey);
        if (cart) {
          const cartItems = JSON.parse(cart);
          setCartCount(cartItems.length);
        } else {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const products = await response.json();
      
      // Sort products by creation date for new arrivals
      const sortedByDate = [...products].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // Get the 10 most recent items for new arrivals
      setNewArrivals(sortedByDate.slice(0, 10));
      
      // For now, use the same products for nearby items
      // In a real app, you would filter based on location
      setNearbyItems(products.slice(0, 10));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleContact = async (product) => {
    try {
      Alert.alert(
        'Contact Seller',
        `Would you like to contact the seller about "${product.title}"?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Contact',
            onPress: () => {
              Alert.alert('Contact', `Contact the seller at: ${product.owner.email}`);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error contacting seller:', error);
      Alert.alert('Error', 'Could not contact the seller. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={() => handleProductPress(item)}
    >
      <Image 
        source={{ uri: `${BASE_URL}${item.imageUrl}` }} 
        style={styles.itemImage} 
        resizeMode="cover" 
      />
      <Text style={styles.itemName}>{item.title}</Text>
      <Text style={styles.itemPrice}>₹{item.price}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Category', { category: item.name })}
    >
      <item.Icon width={32} height={32} fill="#FF4B81" />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF4B81" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('AccountDetails')}>
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* New arrivals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New arrivals</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FF4B81" />
          ) : (
            <FlatList
              data={nearbyItems}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        {/* Shop by category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryWrapper}>
                {renderCategory({ item: category })}
              </View>
            ))}
          </View>
        </View>

        {/* Post Item Button */}
        <TouchableOpacity 
          style={styles.postButton}
          onPress={() => navigation.navigate('SellProduct')}
        >
          <Text style={styles.postButtonText}>+ Post a Free Item</Text>
        </TouchableOpacity>

        {/* Items near you */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items near you</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FF4B81" />
          ) : (
            <FlatList
              data={newArrivals}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        {/* Donate Food Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Donate Food</Text>
          <TouchableOpacity style={styles.donateCard}>
            <Image 
              source={require('../../assets/donate-food.png')} 
              style={styles.donateImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.donateButton}>
              <Text style={styles.donateButtonText}>Donate</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Register Sections */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Register For Food</Text>
          <TouchableOpacity style={styles.registerCard}>
            <Image 
              source={require('../../assets/register-food.png')} 
              style={styles.registerImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Register For Delivery Agent</Text>
          <TouchableOpacity style={styles.registerCard}>
            <Image 
              source={require('../../assets/delivery-agent.png')} 
              style={styles.registerImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#FF4B81" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Cart')}
        >
          <View>
            <Ionicons name="cart" size={24} color="#666" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => {
          setModalVisible(false);
          setSelectedProduct(null);
          loadCartCount(); // Reload cart count when modal is closed
        }}
        onContact={handleContact}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FF4B81',
  },
  logo: {
    height: 30,
    width: 120,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemCard: {
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 150,
  },
  itemImage: {
    width: 134,
    height: 134,
    borderRadius: 8,
  },
  itemName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 14,
    color: '#FF4B81',
    fontWeight: 'bold',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryWrapper: {
    width: '33%',
    padding: 8,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    height: 90,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  postButton: {
    backgroundColor: '#FF4B81',
    borderRadius: 25,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  donateCard: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  donateImage: {
    width: '100%',
    height: 150,
  },
  donateButton: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#FF4B81',
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerCard: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerImage: {
    width: '100%',
    height: 150,
  },
  registerButton: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#FF4B81',
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4B81',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 