import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, Modal, StatusBar, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../config/api';
import CameraIcon from '../../assets/icons/img.svg';
import BackIcon from '../../assets/icons/back.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categories = [
  { id: '1', name: 'Electronic Devices', icon: 'electronicdevices' },
  { id: '2', name: 'Clothes', icon: 'clothes' },
  { id: '3', name: 'Home Appliances', icon: 'homeaplliances' },
  { id: '4', name: 'Toys', icon: 'toys' },
  { id: '5', name: 'Furniture', icon: 'furniture' },
  { id: '6', name: 'Shoes', icon: 'shoes' }
];

const SellProductScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [upiId, setUpiId] = useState('');
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Sorry, we need camera roll permissions to upload images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        setErrors({ ...errors, image: null });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Image validation
    if (!image) {
      newErrors.image = 'Please select an image';
    }

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    // Price validation
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (!/^\d+$/.test(price)) {
      newErrors.price = 'Price must contain only digits';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Category validation
    if (!category) {
      newErrors.category = 'Please select a category';
    }

    // UPI ID validation
    if (!upiId) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!upiId.includes('@')) {
      newErrors.upiId = 'Please enter a valid UPI ID (must contain @)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Get the authentication token
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('Please login to post items');
        }

        console.log('Using token:', token.substring(0, 20) + '...');

        // First, upload the image
        const formData = new FormData();
        const imageUri = image;
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          type,
          name: filename
        });

        console.log('Uploading image...');
        console.log('Image details:', {
          uri: imageUri,
          type,
          name: filename
        });

        // Upload image
        const imageUploadResponse = await fetch(`${API_URL}/products/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: formData
        });

        console.log('Image upload response status:', imageUploadResponse.status);
        const imageResponseText = await imageUploadResponse.text();
        console.log('Image upload response:', imageResponseText);

        if (!imageUploadResponse.ok) {
          throw new Error(`Failed to upload image: ${imageResponseText}`);
        }

        let imageData;
        try {
          imageData = JSON.parse(imageResponseText);
        } catch (e) {
          console.error('Error parsing image upload response:', e);
          throw new Error('Invalid response from image upload');
        }

        if (!imageData.url) {
          throw new Error('No image URL received from server');
        }

        const imageUrl = imageData.url;
        console.log('Image uploaded successfully:', imageUrl);

        // Create the product with the same token
        const productData = {
          title,
          price: parseInt(price),
          description,
          category,
          upiId,
          imageUrl,
        };

        const productResponse = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });

        if (!productResponse.ok) {
          throw new Error('Failed to create product');
        }

        Alert.alert(
          'Success',
          'Product posted successfully!',
          [{ 
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );
      } catch (error) {
        console.error('Error posting product:', error);
        Alert.alert(
          'Error',
          error.message || 'Failed to post product. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FF4B81" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <BackIcon width={42} height={42} fill="#FFFFFF" />
        </TouchableOpacity>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Sell Product</Text>

        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={pickImage}
        >
          <View style={styles.imagePlaceholder}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <CameraIcon width={50} height={50} />
            )}
          </View>
          <Text style={styles.uploadText}>Tap to upload image</Text>
        </TouchableOpacity>
        {errors.image && <HelperText type="error">{errors.image}</HelperText>}

        <TextInput
          label="Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setErrors({ ...errors, title: null });
          }}
          mode="outlined"
          style={styles.input}
          error={!!errors.title}
        />
        {errors.title && <HelperText type="error">{errors.title}</HelperText>}

        <TextInput
          label="Price"
          value={price}
          onChangeText={(text) => {
            const numbersOnly = text.replace(/[^0-9]/g, '');
            setPrice(numbersOnly);
            setErrors({ ...errors, price: null });
          }}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.price}
        />
        {errors.price && <HelperText type="error">{errors.price}</HelperText>}

        <TextInput
          label="Description"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setErrors({ ...errors, description: null });
          }}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          error={!!errors.description}
        />
        {errors.description && <HelperText type="error">{errors.description}</HelperText>}

        <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
          <TextInput
            label="Category"
            value={category}
            mode="outlined"
            style={styles.input}
            editable={false}
            right={<TextInput.Icon icon="chevron-down" />}
            error={!!errors.category}
          />
        </TouchableOpacity>
        {errors.category && <HelperText type="error">{errors.category}</HelperText>}

        <Modal
          visible={showCategoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <ScrollView>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryItem}
                    onPress={() => {
                      setCategory(cat.name);
                      setErrors({ ...errors, category: null });
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={styles.categoryText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Button
                mode="outlined"
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalCloseButton}
              >
                Cancel
              </Button>
            </View>
          </View>
        </Modal>

        <TextInput
          label="Your UPI ID"
          value={upiId}
          onChangeText={(text) => {
            setUpiId(text);
            setErrors({ ...errors, upiId: null });
          }}
          mode="outlined"
          style={styles.input}
          error={!!errors.upiId}
        />
        {errors.upiId && <HelperText type="error">{errors.upiId}</HelperText>}

        <Button
          mode="contained"
          onPress={handlePost}
          style={styles.button}
          buttonColor="#FF4B81"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Post
        </Button>
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: StatusBar.currentHeight + 8,
    paddingBottom: 12,
    backgroundColor: '#FF4B81',
  },
  backButton: {
    width: 40,
    height: 40,
    marginRight: 12,
    backgroundColor: 'rgba(253, 85, 119, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 32,
    width: 130,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadText: {
    marginTop: 8,
    color: '#666',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 16,
  },
});

export default SellProductScreen; 