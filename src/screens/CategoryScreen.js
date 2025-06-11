import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, BASE_URL } from '../config/api';
import ProductDetailModal from '../components/ProductDetailModal';

const CategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchCategoryProducts();
  }, [category]);

  const fetchCategoryProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products?category=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
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
      // You can customize this to use your preferred contact method
      // For now, we'll use a simple alert
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
              // Here you can implement your contact logic
              // For example, opening WhatsApp or email
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
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
    >
      <Image 
        source={{ uri: `${BASE_URL}${item.imageUrl}` }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FF4B81" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category}</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4B81" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found in this category</Text>
            </View>
          }
        />
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => {
          setModalVisible(false);
          setSelectedProduct(null);
        }}
        onContact={handleContact}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    flex: 1,
    textAlign: 'center',
    marginLeft: -32,
  },
  filterButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  productImage: {
    width: 120,
    height: 120,
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4B81',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CategoryScreen; 