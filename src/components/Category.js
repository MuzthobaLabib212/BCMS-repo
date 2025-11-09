import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, push, update } from "firebase/database";
import { db } from "../firebaseconfig";
import './Category.css';

function Category() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", icon: "" });
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [notificationTimeout, setNotificationTimeout] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeCategoryName, setRemoveCategoryName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCategoryName, setConfirmCategoryName] = useState('');



  const hardCodedCategories = [
    {
      id: 'breakfast',
      name: 'Breakfast',
      description: 'Start your day with our delicious breakfast',
      icon: '🍳',
      items: ['Porota', 'Samosas', 'Singara', 'Alur Chop', 'Cold Drinks', 'Coffee Special']
    },
    {
      id: 'lunch',
      name: 'Lunch',
      description: 'Enjoy our hearty lunch specials',
      icon: '🍽️',
      items: ['Rice', 'Chicken Curry', 'Fish Curry', 'Vegetable Curry', 'Dal', 'Salad']
    },
    {
      id: 'dinner',
      name: 'Dinner',
      description: 'End your day with our savory dinner options',
      icon: '🌙',
      items: ['Biryani', 'Korma', 'Tandoori', 'Naan', 'Raita', 'Dessert']
    },
    {
      id: 'snacks',
      name: 'Snacks',
      description: 'Satisfy your cravings with our tasty snacks',
      icon: '🍿',
      items: ['Chips', 'Nuts', 'Cookies', 'Popcorn', 'Candy', 'Fruit']
    }
  ];

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.isAdmin) {
      setIsAdmin(true);
    }
    fetchDynamicCategories(); // Fetch dynamic categories for all users
  }, []);

  const fetchDynamicCategories = async () => {
    try {
      const categoriesRef = ref(db, 'categories');
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesList = await Promise.all(Object.entries(categoriesData).map(async ([id, category]) => {
          const itemsRef = ref(db, `categories/${id}/items`);
          const itemsSnapshot = await get(itemsRef);
          let items = [];
          if (itemsSnapshot.exists()) {
            const itemsData = itemsSnapshot.val();
            items = Object.values(itemsData).map(item => item.name || item).filter(item => item && item.trim());
          }
          return {
            id,
            ...category,
            items
          };
        }));
        // Filter out categories without a valid name
        const validCategories = categoriesList.filter(cat => cat.name && cat.name.trim());
        setDynamicCategories(validCategories);
      }
    } catch (error) {
      console.error("Error fetching dynamic categories:", error);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      const categoriesRef = ref(db, 'categories');
      await push(categoriesRef, {
        name: newCategory.name,
        description: newCategory.description,
        icon: newCategory.icon
      });
      if (notificationTimeout) clearTimeout(notificationTimeout);
      setNotification({ message: "Category added successfully!", visible: true });
      const timeout = setTimeout(() => setNotification({ message: '', visible: false }), 3000);
      setNotificationTimeout(timeout);
      setNewCategory({ name: "", description: "", icon: "" });
      setShowAddCategoryForm(false);
      fetchDynamicCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };





  const removeCategory = async (categoryName) => {
    try {
      // Find the category by name in dynamic categories
      const categoryToRemove = dynamicCategories.find(cat => cat.name === categoryName);
      if (categoryToRemove) {
        const categoryRef = ref(db, `categories/${categoryToRemove.id}`);
        await update(ref(db), { [`categories/${categoryToRemove.id}`]: null });
        if (notificationTimeout) clearTimeout(notificationTimeout);
        setNotification({ message: "Category removed successfully!", visible: true });
        const timeout = setTimeout(() => setNotification({ message: '', visible: false }), 3000);
        setNotificationTimeout(timeout);
        fetchDynamicCategories();
      } else {
        alert("Category not found or cannot remove hard-coded categories");
      }
    } catch (error) {
      console.error("Error removing category:", error);
      alert("Error removing category");
    }
  };

  const allCategories = [...hardCodedCategories, ...dynamicCategories];

  const handleRemoveSubmit = (e) => {
    e.preventDefault();
    if (removeCategoryName.trim()) {
      setConfirmCategoryName(removeCategoryName.trim());
      setShowConfirmModal(true);
      setShowRemoveModal(false);
      setRemoveCategoryName('');
    }
  };

  const handleConfirmRemove = () => {
    removeCategory(confirmCategoryName);
    setShowConfirmModal(false);
    setConfirmCategoryName('');
  };

  return (
    <div className="category-container">
      {notification.visible && (
        <div className="notification-popup">
          {notification.message}
        </div>
      )}

      {showRemoveModal && (
        <div className="remove-modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="remove-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Category</h3>
            <form onSubmit={handleRemoveSubmit}>
              <input
                type="text"
                placeholder="Enter category name to remove"
                value={removeCategoryName}
                onChange={(e) => setRemoveCategoryName(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Remove</button>
                <button type="button" onClick={() => setShowRemoveModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Removal</h3>
            <p>Are you sure you want to remove the category "{confirmCategoryName}"?</p>
            <div className="modal-buttons">
              <button type="button" onClick={handleConfirmRemove}>Yes, Remove</button>
              <button type="button" onClick={() => setShowConfirmModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="category-header">
        <h1>Food Categories</h1>
        <p>Explore our delicious menu options</p>
      </div>

      {isAdmin && (
        <div className="admin-controls">
          <div className="add-category-card" onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}>
            <div className="plus-icon">+</div>
            <p>Add New Category</p>
          </div>

          {showAddCategoryForm && (
            <div className="add-category-form">
              <form onSubmit={addCategory}>
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  required
                />

                <button type="submit">Add Category</button>
                <button type="button" onClick={() => setShowAddCategoryForm(false)}>Cancel</button>
              </form>
            </div>
          )}

          <div className="remove-category-card" onClick={() => setShowRemoveModal(true)}>
            <div className="minus-icon">-</div>
            <p>Remove Category</p>
          </div>
        </div>
      )}

      <div className="categories-grid">
        {allCategories.map((category) => (
          <div key={category.id || category.name} className="category-card">
            <div className="category-icon">
              <span className="icon-emoji">{category.icon}</span>
            </div>
            <div className="category-content">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="category-items">
                <h4>Popular Items:</h4>
                <ul>
                  {Array.isArray(category.items) && category.items.map((item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  ))}
                </ul>

              </div>
            </div>
            <div className="category-overlay">
              <button className="explore-btn" onClick={() => navigate(`/${category.id || category.name.toLowerCase().replace(/\s+/g, '-')}`)}>Explore {category.name}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Category;
