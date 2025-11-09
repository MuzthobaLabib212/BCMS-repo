import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, get, set } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import app from "../firebaseconfig";
import './Cart.css';

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState("");
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const placeOrder = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      navigate("/");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const db = getDatabase(app);

      // Generate global incrementing order serial number
      const globalOrderCounterRef = ref(db, 'globalOrderCounter');
      const counterSnapshot = await get(globalOrderCounterRef);
      let orderSerial = 1;
      if (counterSnapshot.exists()) {
        orderSerial = counterSnapshot.val() + 1;
      }
      await set(globalOrderCounterRef, orderSerial);

      const orderSerialStr = orderSerial.toString().padStart(2, '0');

      // Place orders for each cart item
      for (const cartItem of cartItems) {
        const orderData = {
          itemName: cartItem.item.name,
          price: cartItem.item.price * cartItem.quantity,
          quantity: cartItem.quantity,
          orderTime: new Date().toLocaleString(),
          userId: currentUser.uid,
          category: 'Breakfast', // Assuming all from breakfast for now
          orderSerial: orderSerialStr
        };

        const orderRef = ref(db, `orders/${orderSerialStr}_${cartItem.item.id}`);
        await set(orderRef, orderData);
      }

      setNotification(`Orders placed successfully!\nTotal Items: ${cartItems.length}\nOrder Serial: ${orderSerialStr}`);
      setIsFading(false);
      setIsVisible(true);
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setNotification("");
          setIsVisible(false);
        }, 500);
      }, 4500);

      // Clear cart
      setCartItems([]);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error("Error placing orders:", error);
      alert("Error placing orders. Please try again.");
    }
  };

  const handleBackToCategories = () => {
    navigate("/category");
  };

  const totalPrice = cartItems.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0);

  return (
    <div className="cart-container">
      <div className="cart-header">
        <button onClick={handleBackToCategories} className="back-button">
          ← Back to Categories
        </button>
        <h1>Your Cart</h1>
        <p>Review your items before placing the order</p>
        {isVisible && <div className={`notification ${isFading ? 'fade-out' : ''}`}>{notification}</div>}
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((cartItem, index) => (
              <div key={index} className="cart-item">
                <div className="cart-item-image">
                  <img src={cartItem.item.image} alt={cartItem.item.name} />
                </div>
                <div className="cart-item-details">
                  <h3>{cartItem.item.name}</h3>
                  <p>{cartItem.item.description}</p>
                  <p>Quantity: {cartItem.quantity}</p>
                  <p>Price: ৳{cartItem.item.price * cartItem.quantity}</p>
                </div>
                <button onClick={() => removeItem(index)} className="remove-button">Remove</button>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <h3>Total: ৳{totalPrice}</h3>
            <button onClick={placeOrder} className="place-order-button">Place Order</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
