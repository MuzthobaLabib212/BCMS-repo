import React, { useState, useEffect, useCallback } from 'react';
import { getDatabase, ref, push, get, remove } from "firebase/database";
import { useNavigate, useParams } from 'react-router-dom';
import './CategoryItem.css';

const defaultItems = {
  lunch: [
    { name: 'Rice', description: 'Delicious Rice', price: 10, image: '/images/default.png' },
    { name: 'Chicken Curry', description: 'Delicious Chicken Curry', price: 10, image: '/images/default.png' },
    { name: 'Fish Curry', description: 'Delicious Fish Curry', price: 10, image: '/images/default.png' },
    { name: 'Vegetable Curry', description: 'Delicious Vegetable Curry', price: 10, image: '/images/default.png' },
    { name: 'Dal', description: 'Delicious Dal', price: 10, image: '/images/default.png' },
    { name: 'Salad', description: 'Delicious Salad', price: 10, image: '/images/default.png' }
  ],
  dinner: [
    { name: 'Biryani', description: 'Delicious Biryani', price: 10, image: '/images/default.png' },
    { name: 'Korma', description: 'Delicious Korma', price: 10, image: '/images/default.png' },
    { name: 'Tandoori', description: 'Delicious Tandoori', price: 10, image: '/images/default.png' },
    { name: 'Naan', description: 'Delicious Naan', price: 10, image: '/images/default.png' },
    { name: 'Raita', description: 'Delicious Raita', price: 10, image: '/images/default.png' },
    { name: 'Dessert', description: 'Delicious Dessert', price: 10, image: '/images/default.png' }
  ],
  snacks: [
    { name: 'Chips', description: 'Delicious Chips', price: 10, image: '/images/default.png' },
    { name: 'Nuts', description: 'Delicious Nuts', price: 10, image: '/images/default.png' },
    { name: 'Cookies', description: 'Delicious Cookies', price: 10, image: '/images/default.png' },
    { name: 'Popcorn', description: 'Delicious Popcorn', price: 10, image: '/images/default.png' },
    { name: 'Candy', description: 'Delicious Candy', price: 10, image: '/images/default.png' },
    { name: 'Fruit', description: 'Delicious Fruit', price: 10, image: '/images/default.png' }
  ]
};

function CategoryPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categoryItems, setCategoryItems] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image: null });
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [showConfirmAddModal, setShowConfirmAddModal] = useState(false);
  const [confirmAddItem, setConfirmAddItem] = useState(null);
  const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
  const [confirmRemoveItemName, setConfirmRemoveItemName] = useState('');
  const [showRemoveItemModal, setShowRemoveItemModal] = useState(false);
  const [removeItemInput, setRemoveItemInput] = useState('');

  const fetchCategoryData = useCallback(async () => {
    try {
      const db = getDatabase();
      const categoryRef = ref(db, `categories/${categoryId}`);
      const snapshot = await get(categoryRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setCategoryData(data);
        // For new categories, start clean; no initial items
      } else {
        // If category not found, perhaps redirect or show error
        console.error("Category not found");
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  }, [categoryId]);

  const fetchCategoryItems = useCallback(async () => {
    try {
      const db = getDatabase();
      const itemsRef = ref(db, `categories/${categoryId}/items`);
      const snapshot = await get(itemsRef);
      if (snapshot.exists()) {
        const items = snapshot.val();
        const firebaseItems = Object.entries(items).map(([id, item]) => ({ id, ...item }));
        setCategoryItems(firebaseItems);
      } else {
        // For hard-coded categories (lunch, dinner, snacks), initialize with default items in Firebase
        if (defaultItems[categoryId]) {
          const defaultFirebaseItems = [];
          for (const item of defaultItems[categoryId]) {
            const newItemRef = await push(itemsRef, item);
            defaultFirebaseItems.push({ id: newItemRef.key, ...item });
          }
          setCategoryItems(defaultFirebaseItems);
        } else {
          setCategoryItems([]);
        }
      }
    } catch (error) {
      console.error("Error fetching category items:", error);
    }
  }, [categoryId]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.isAdmin) {
      setIsAdmin(true);
    }
    fetchCategoryData();
    fetchCategoryItems();
  }, [categoryId, fetchCategoryData, fetchCategoryItems]);

  const addToCart = (item, quantity) => {
    const cartItem = { item, quantity };
    const updatedCart = [...cart, cartItem];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    // Show notification instead of alert
    setNotification({ message: `${item.name} added to cart!`, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 1000);
  };

  const handleBackToCategories = () => {
    navigate("/category");
  };

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.image) {
      alert("Please fill all fields");
      return;
    }
    const price = parseInt(newItem.price);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }
    setConfirmAddItem({ ...newItem, price });
    setShowConfirmAddModal(true);
    setShowAddItemForm(false);
  };

  const handleConfirmAdd = async () => {
    try {
      let imageData = confirmAddItem.image;
      if (confirmAddItem.image instanceof File) {
        // Convert image to base64 and store in database
        const reader = new FileReader();
        reader.onload = async (event) => {
          imageData = event.target.result;
          const db = getDatabase();
          const itemsRef = ref(db, `categories/${categoryId}/items`);
          await push(itemsRef, {
            name: confirmAddItem.name,
            description: confirmAddItem.description,
            price: confirmAddItem.price,
            image: imageData, // Store base64 string in database
          });
          setNotification({ message: "Item added successfully!", visible: true });
          setTimeout(() => setNotification({ message: '', visible: false }), 3000);
          setNewItem({ name: '', description: '', price: '', image: null });
          setConfirmAddItem(null);
          setShowConfirmAddModal(false);
          fetchCategoryItems();
        };
        reader.readAsDataURL(confirmAddItem.image);
      } else {
        const db = getDatabase();
        const itemsRef = ref(db, `categories/${categoryId}/items`);
        await push(itemsRef, {
          name: confirmAddItem.name,
          description: confirmAddItem.description,
          price: confirmAddItem.price,
          image: imageData,
        });
        setNotification({ message: "Item added successfully!", visible: true });
        setTimeout(() => setNotification({ message: '', visible: false }), 3000);
        setNewItem({ name: '', description: '', price: '', image: null });
        setConfirmAddItem(null);
        setShowConfirmAddModal(false);
        fetchCategoryItems();
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item: " + error.message);
    }
  };

  const handleRemoveItemSubmit = (itemName) => {
    setConfirmRemoveItemName(itemName);
    setShowConfirmRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    try {
      // Find the item by name in categoryItems
      const itemToRemove = categoryItems.find(item => item.name === confirmRemoveItemName);
      if (itemToRemove) {
        const db = getDatabase();
        const itemRef = ref(db, `categories/${categoryId}/items/${itemToRemove.id}`);
        await remove(itemRef);
        setNotification({ message: "Item removed successfully!", visible: true });
        setTimeout(() => setNotification({ message: '', visible: false }), 3000);
        fetchCategoryItems();
      } else {
        alert("Item not found");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error removing item");
    }
    setShowConfirmRemoveModal(false);
    setConfirmRemoveItemName('');
  };

  if (!categoryData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="breakfast-container">
      <div className="breakfast-header">
        <button onClick={handleBackToCategories} className="back-button">
          ← Back to Categories
        </button>
        <button onClick={() => navigate('/cart')} className="view-cart-button">View Cart</button>
        <h1>{categoryData.name} Menu</h1>
        <p>{categoryData.description}</p>
      </div>

      {isAdmin && (
        <div className="admin-controls">
          <div className="add-item-card" onClick={() => setShowAddItemForm(!showAddItemForm)}>
            <div className="plus-icon">+</div>
            <p>Add New Item</p>
          </div>

          {showAddItemForm && (
            <div className="add-item-form">
              <form onSubmit={handleAddItemSubmit}>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })}
                  required
                />
                <button type="submit">Add Item</button>
                <button type="button" onClick={() => setShowAddItemForm(false)}>Cancel</button>
              </form>
            </div>
          )}

          <div className="remove-item-card" onClick={() => setShowRemoveItemModal(true)}>
            <div className="minus-icon">-</div>
            <p>Remove Item</p>
          </div>
        </div>
      )}

      <div className="breakfast-grid">
        {categoryItems.map((item) => (
          <div key={item.id} className="category-item-card">
            <div className="category-item-image">
              <span className="category-item-icon">{item.icon}</span>
              <img src={item.image} alt={item.name} />
            </div>
            <div className="category-item-content">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            <div className="category-item-footer">
              <span className="category-item-price">৳{item.price * (quantities[item.id] || 1)}</span>
              <div className="category-item-quantity">
                <label>Qty: </label>
                <input
                  type="number"
                  min="1"
                  value={quantities[item.id] || 1}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 1;
                    setQuantities(prev => ({ ...prev, [item.id]: qty }));
                  }}
                />
              </div>
              <button
                onClick={() => addToCart(item, quantities[item.id] || 1)}
                className="category-item-button"
              >
                Add to Cart
              </button>

            </div>
            </div>
          </div>
        ))}
      </div>

      {notification.visible && (
        <div className="notification-popup">
          {notification.message}
        </div>
      )}

      {showConfirmAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Add Item</h2>
            <p>Are you sure you want to add this item?</p>
            <div className="modal-buttons">
              <button onClick={handleConfirmAdd} className="confirm-button">Yes</button>
              <button onClick={() => setShowConfirmAddModal(false)} className="cancel-button">No</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Remove Item</h2>
            <p>Are you sure you want to remove "{confirmRemoveItemName}"?</p>
            <div className="modal-buttons">
              <button onClick={handleConfirmRemove} className="confirm-button">Yes</button>
              <button onClick={() => setShowConfirmRemoveModal(false)} className="cancel-button">No</button>
            </div>
          </div>
        </div>
      )}

      {showRemoveItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Remove Item</h2>
            <p>Enter the name of the item to remove:</p>
            <input
              type="text"
              placeholder="Item name"
              value={removeItemInput}
              onChange={(e) => setRemoveItemInput(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
            />
            <div className="modal-buttons">
              <button onClick={() => {
                if (removeItemInput.trim()) {
                  handleRemoveItemSubmit(removeItemInput.trim());
                  setShowRemoveItemModal(false);
                  setRemoveItemInput('');
                }
              }} className="confirm-button">Remove</button>
              <button onClick={() => {
                setShowRemoveItemModal(false);
                setRemoveItemInput('');
              }} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="breakfast-footer">
        <p>Enjoy your meal! Your orders will be displayed in the dashboard.</p>
      </div>
    </div>
  );
}

export default CategoryPage;
