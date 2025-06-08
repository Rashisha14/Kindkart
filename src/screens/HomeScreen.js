import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import SVG icons
import ElectronicsIcon from '../../assets/icons/electronics.svg';
import ClothesIcon from '../../assets/icons/clothes.svg';
import DevicesIcon from '../../assets/icons/devices.svg';
import ToysIcon from '../../assets/icons/toys.svg';
import FurnitureIcon from '../../assets/icons/furniture.svg';
import ShoesIcon from '../../assets/icons/shoes.svg';

const categories = [
  { id: '1', Icon: ElectronicsIcon },
  { id: '2', Icon: ClothesIcon },
  { id: '3', Icon: DevicesIcon },
  { id: '4', Icon: ToysIcon },
  { id: '5', Icon: FurnitureIcon },
  { id: '6', Icon: ShoesIcon },
];

const items = [
  { id: '1', image: require('../../assets/blue-shirt.png')},
  { id: '2', image: require('../../assets/grey-shirt.png')},
  { id: '3', image: require('../../assets/converse.png') },
  { id: '4', image: require('../../assets/pink-hoodie.png') },
];

const HomeScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemCard}>
      <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryCard}>
      <item.Icon width={32} height={32} fill="#FF4B81" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF4B81" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
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
        {/* Items near you */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items near you</Text>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
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
        <TouchableOpacity style={styles.postButton}>
          <Text style={styles.postButtonText}>+ Post a Free Item</Text>
        </TouchableOpacity>

        {/* New arrivals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New arrivals</Text>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
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
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="cart" size={24} color="#666" />
        </TouchableOpacity>
      </View>
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
  },
  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  itemName: {
    marginTop: 8,
    fontSize: 14,
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
    height: 70,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
});

export default HomeScreen; 