import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { medicineAPI, cartAPI } from '../services/apiCalls';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  // Fetch medicines from MongoDB on component mount
  const fetchMedicines = useCallback(async () => {
    try {
      setLoadingMedicines(true);
      const response = await medicineAPI.getAllMedicines();
      // Map MongoDB medicine data to frontend format
      const mappedMedicines = response.data.map((med) => ({
        id: med._id,
        medicineName: med.name,
        genericName: med.genericName || '',
        manufacturer: med.manufacturer || '',
        category: med.category || '',
        description: med.description || '',
        costPrice: med.costPrice || med.price || 0,
        sellingPrice: med.price || 0,
        price: med.price || 0,
        stock: med.stockQuantity || 0,
        stockQuantity: med.stockQuantity || 0,
        lowStock: 10,
        arrivedDate: med.dateArrivedInShop || '',
        expireDate: med.expiryDate || '',
        expiryDate: med.expiryDate || '',
        expireDateFormatted: med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : '',
        batchName: med.batchNumber || '',
        batchNumber: med.batchNumber || '',
        requirePrescription: med.requiresPrescription || false,
        imageUrl: med.imageUrl || '',
        imageFile: null,
      }));
      setProducts(mappedMedicines);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    } finally {
      setLoadingMedicines(false);
    }
  }, []);

  // Fetch medicines on mount
  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const fetchCart = useCallback(async () => {
    try {
      const response = await cartAPI.getCart();
      setCartItems(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!cartLoaded) return;

    const saveCart = async () => {
      try {
        await cartAPI.saveCart({ items: cartItems });
      } catch (error) {
        console.error('Failed to save cart:', error);
      }
    };

    saveCart();
  }, [cartItems, cartLoaded]);

  const addProduct = useCallback(async (product) => {
    try {
      // Convert frontend format to backend format
      const payload = {
        name: product.medicineName,
        genericName: product.genericName || '',
        manufacturer: product.manufacturer || '',
        category: product.category || '',
        description: product.description || '',
        price: parseFloat(product.sellingPrice || product.price || 0),
        stockQuantity: parseInt(product.stock || 0),
        expiryDate: product.expireDate || product.expiryDate || new Date(),
        dateArrivedInShop: product.arrivedDate || null,
        batchNumber: product.batchName || product.batchNumber || '',
        requiresPrescription: product.requirePrescription || false,
        imageUrl: product.imageUrl || '',
      };
      
      await medicineAPI.addMedicine(payload);
      // Refresh medicines list from database
      await fetchMedicines();
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  }, [fetchMedicines]);

  const updateProduct = useCallback(async (updatedProduct) => {
    try {
      // Convert frontend format to backend format
      const payload = {
        name: updatedProduct.medicineName,
        genericName: updatedProduct.genericName || '',
        manufacturer: updatedProduct.manufacturer || '',
        category: updatedProduct.category || '',
        description: updatedProduct.description || '',
        price: parseFloat(updatedProduct.sellingPrice || updatedProduct.price || 0),
        stockQuantity: parseInt(updatedProduct.stock || 0),
        expiryDate: updatedProduct.expireDate || updatedProduct.expiryDate || new Date(),
        dateArrivedInShop: updatedProduct.arrivedDate || null,
        batchNumber: updatedProduct.batchName || updatedProduct.batchNumber || '',
        requiresPrescription: updatedProduct.requirePrescription || false,
        imageUrl: updatedProduct.imageUrl || '',
      };
      
      await medicineAPI.updateMedicine(updatedProduct.id, payload);
      // Refresh medicines list from database
      await fetchMedicines();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  }, [fetchMedicines]);

  const deleteProduct = useCallback(async (id) => {
    try {
      await medicineAPI.deleteMedicine(id);
      // Remove from cart if product was in cart
      setCartItems((prev) => prev.filter((item) => item.productId !== id));
      // Refresh medicines list from database
      await fetchMedicines();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }, [fetchMedicines]);

  const addToCart = (productId) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.productId === productId);
      if (exists) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addOrderHistoryItem = (historyItem) => {
    setOrderHistory((prev) => [...prev, historyItem]);
  };

  const cartProducts = cartItems
    .map((item) => {
      const product = products.find((product) => product.id === item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean);

  return (
    <ProductContext.Provider value={{
      products,
      loadingMedicines,
      fetchMedicines,
      addProduct,
      updateProduct,
      deleteProduct,
      cartItems,
      cartProducts,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      orderHistory,
      addOrderHistoryItem,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
