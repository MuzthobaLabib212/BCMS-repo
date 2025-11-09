import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, get, set, remove } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from 'react-router-dom';
import { storage } from "../firebaseconfig";
import './Breakfast.css';

function Breakfast() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [breakfastItems, setBreakfastItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image: null });
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [notification, setNotification] = useState({ message: '', visible: false, type: 'success' });
  const [isFading, setIsFading] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemNameToRemove, setItemNameToRemove] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.isAdmin) {
      setIsAdmin(true);
      fetchBreakfastItems();
    } else {
      // For non-admins, use static items
      setBreakfastItems([
        {
          id: 1,
          name: 'Porota',
          description: 'Fluffy and soft porota fried with oildr',
          price: 10,
          image: '/images/porota.png',
        },
        {
          id: 2,
          name: 'Samosas',
          description: 'A tasty snack made with different fillings and spices',
          price: 10,
          image: '/images/img1.png',
        },
        {
          id: 3,
          name: 'Singara',
          description: 'A tasty snack made with different fillings and spices',
          price: 10,
          image: '/images/img3.png',
        },
        {
          id: 4,
          name: 'Alur Chop',
          description: 'A tasty cutlet made with mashed potato filling',
          price: 10,
          image: '/images/img2.png',
        },
        {
          id: 5,
          name: 'Cold Drinks',
          description: 'A refreshing beverage for customers',
          price: 25,
          image: '/images/img5.png',
        },
        {
          id: 6,
          name: 'Coffee Special',
          description: 'Freshly brewed coffee with your choice of milk',
          price: 20,
          image: '/images/coffee.png',
        }
      ]);
    }
  }, []);

  const fetchBreakfastItems = async () => {
    try {
      const db = getDatabase();
      const breakfastRef = ref(db, 'categories/Breakfast/items');
      const snapshot = await get(breakfastRef);
      const staticItems = [
        {
          id: 1,
          name: 'Porota',
          description: 'Fluffy and soft porota fried with oildr',
          price: 10,
          image: '/images/porota.png',
        },
        {
          id: 2,
          name: 'Samosas',
          description: 'A tasty snack made with different fillings and spices',
          price: 10,
          image: '/images/img1.png',
        },
        {
          id: 3,
          name: 'Singara',
          description: 'A tasty snack made with different fillings and spices',
          price: 10,
          image: '/images/img3.png',
        },
        {
          id: 4,
          name: 'Alur Chop',
          description: 'A tasty cutlet made with mashed potato filling',
          price: 10,
          image: '/images/img2.png',
        },
        {
          id: 5,
          name: 'Cold Drinks',
          description: 'A refreshing beverage for customers',
          price: 25,
          image: '/images/img5.png',
        },
        {
          id: 6,
          name: 'Coffee Special',
          description: 'Freshly brewed coffee with your choice of milk',
          price: 20,
          image: '/images/coffee.png',
        }
      ];
      if (snapshot.exists()) {
        const items = snapshot.val();
        const firebaseItems = Object.entries(items).map(([id, item]) => ({ id, ...item }));
        // For admins, combine static items with Firebase items
        setBreakfastItems([...staticItems, ...firebaseItems]);
      } else {
        // For admins, show static items if no Firebase items
        setBreakfastItems(staticItems);
      }
    } catch (error) {
      console.error("Error fetching breakfast items:", error);
    }
  };

  const addToCart = (item, quantity) => {
    const cartItem = { item, quantity };
    const updatedCart = [...cart, cartItem];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    // Show notification instead of alert
    setNotification({ message: `${item.name} added to cart!`, visible: true, type: 'success' });
    setIsFading(false);
    setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setNotification({ message: '', visible: false });
      }, 300);
    }, 700);
  };

  const handleBackToCategories = () => {
    navigate("/category");
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.image) {
      setNotification({ message: 'Please fill all fields', visible: true });
      setTimeout(() => {
        setNotification({ message: '', visible: false });
      }, 1000);
      return;
    }
    try {
      let imageData = newItem.image;
      if (newItem.image instanceof File) {
        // Convert image to base64 and store in database
        const reader = new FileReader();
        reader.onload = async (event) => {
          imageData = event.target.result;
          const db = getDatabase();
          const breakfastRef = ref(db, 'categories/Breakfast/items');
          await push(breakfastRef, {
            name: newItem.name,
            description: newItem.description,
            price: parseInt(newItem.price),
            image: imageData, // Store base64 string in database
          });
          setNotification({ message: 'Item added successfully', visible: true, type: 'success' });
          setTimeout(() => {
            setNotification({ message: '', visible: false });
          }, 1000);
          setNewItem({ name: '', description: '', price: '', image: null });
          setShowAddItemForm(false);
          fetchBreakfastItems();
        };
        reader.readAsDataURL(newItem.image);
      } else {
        const db = getDatabase();
        const breakfastRef = ref(db, 'categories/Breakfast/items');
        await push(breakfastRef, {
          name: newItem.name,
          description: newItem.description,
          price: parseInt(newItem.price),
          image: imageData,
        });
        setNotification({ message: 'Item added successfully', visible: true, type: 'success' });
        setTimeout(() => {
          setNotification({ message: '', visible: false });
        }, 1000);
        setNewItem({ name: '', description: '', price: '', image: null });
        setShowAddItemForm(false);
        fetchBreakfastItems();
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item: " + error.message);
    }
  };



  const removeItemByName = async (itemName) => {
    try {
      // Find the item by name in breakfastItems
      const itemToRemove = breakfastItems.find(item => item.name === itemName);
      if (itemToRemove) {
        // Only allow removal of Firebase items, not static items
        if (typeof itemToRemove.id === 'number') {
          alert("Cannot remove static items");
          return;
        }
        const db = getDatabase();
        const itemRef = ref(db, `categories/Breakfast/items/${itemToRemove.id}`);
        await remove(itemRef);
        setNotification({ message: 'Item removed successfully', visible: true, type: 'success' });
        setTimeout(() => {
          setNotification({ message: '', visible: false });
        }, 1000);
        fetchBreakfastItems();
      } else {
        alert("Item not found");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error removing item");
    }
  };

  return (
    <div className="breakfast-container">
      <div className="breakfast-header">
        <button onClick={handleBackToCategories} className="back-button">
          ← Back to Categories
        </button>
        <button onClick={() => navigate('/cart')} className="view-cart-button">View Cart</button>
        <h1>Breakfast Menu</h1>
        <p>Start your day with our delicious breakfast</p>
      </div>

      {isAdmin && (
        <div className="admin-controls">
          <div className="add-item-card" onClick={() => setShowAddItemForm(!showAddItemForm)}>
            <div className="plus-icon">+</div>
            <p>Add New Item</p>
          </div>

          {showAddItemForm && (
            <div className="add-item-form">
              <form onSubmit={addItem}>
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

          <div className="remove-item-card" onClick={() => setShowRemoveModal(true)}>
            <div className="minus-icon">-</div>
            <p>Remove Item</p>
          </div>
        </div>
      )}

      <div className="breakfast-grid">
        {breakfastItems.map((item) => (
          <div key={item.id} className="breakfast-card">
            <div className="breakfast-image">
              <span className="item-icon">{item.icon}</span>
              <img src={item.image} alt={item.name} />
            </div>
            <div className="breakfast-content">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="breakfast-footer">
                <span className="price">৳{item.price * (quantities[item.id] || 1)}</span>
                <div className="quantity-input">
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
                  className="order-button"
                >
                  Add to Cart
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

      {notification.visible && (
        <div className={`notification-popup ${isFading ? 'fade-out' : ''}`}>
          {notification.message}
        </div>
      )}

      <div className="breakfast-footer">
        <p>Enjoy your meal! Your orders will be displayed in the dashboard.</p>
      </div>

      {showRemoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Remove Item</h2>
            <p>Enter item name to remove:</p>
            <input
              type="text"
              placeholder="Item Name"
              value={itemNameToRemove}
              onChange={(e) => setItemNameToRemove(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            />
            <div className="modal-buttons">
              <button
                className="confirm-button"
                onClick={() => {
                  if (itemNameToRemove.trim()) {
                    setShowRemoveModal(false);
                    setShowConfirmModal(true);
                  }
                }}
              >
                Remove
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowRemoveModal(false);
                  setItemNameToRemove('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Removal</h2>
            <p>Are you sure you want to remove this item?</p>
            <div className="modal-buttons">
              <button
                className="confirm-button"
                onClick={() => {
                  removeItemByName(itemNameToRemove);
                  setShowConfirmModal(false);
                  setItemNameToRemove('');
                }}
              >
                Yes
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setItemNameToRemove('');
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Breakfast;
