import React, { useState, useEffect } from 'react';
import { ref, get, update } from "firebase/database";
import { db } from "../../firebaseconfig";
import { useNavigate } from 'react-router-dom';
import './Admin.css';

function Admin() {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [orders, setOrders] = useState([]);
  const [currentView, setCurrentView] = useState('current'); // 'current' or 'past'
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
      return;
    }
    setAdminName(currentUser.name);
    setAdminRole(currentUser.role);
    fetchOrders();

    // Check for auto-completion every second
    const interval = setInterval(() => {
      checkAndCompleteOrders();
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const ordersRef = ref(db, 'orders');
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersList = Object.entries(ordersData).map(([id, order]) => ({ id, ...order }));
        setOrders(ordersList);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate("/");
  };



  const checkAndCompleteOrders = async () => {
    try {
      const ordersRef = ref(db, 'orders');
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const now = Date.now();
        const updates = {};

        Object.entries(ordersData).forEach(([orderId, order]) => {
          if (order.status === 'Accepted' && order.acceptedAt && (now - order.acceptedAt) >= 10000) {
            updates[`orders/${orderId}/status`] = 'Completed';
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(ref(db), updates);
          fetchOrders();
        }
      }
    } catch (error) {
      console.error("Error checking and completing orders:", error);
    }
  };



  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Admin Dashboard</h2>
        {notification && <div className="notification">{notification}</div>}
        <div className="admin-info">
          <p><strong>Name:</strong> {adminName}</p>
          <p><strong>Post:</strong> {adminRole}</p>
        </div>

        <div className="orders-section">
          <div className="order-buttons">
            <button onClick={() => setCurrentView('current')} className={currentView === 'current' ? 'active' : ''}>Current Orders</button>
            <button onClick={() => setCurrentView('past')} className={currentView === 'past' ? 'active' : ''}>Past Orders</button>
          </div>
          <h3>{currentView === 'current' ? 'Current Orders' : 'Past Orders'}</h3>
          {(() => {
            const filteredOrders = orders.filter((order) => {
              const status = order.status || 'Pending';
              if (currentView === 'current') {
                return status === 'Pending' || status === 'Accepted';
              } else {
                return status === 'Completed' || status === 'Cancelled';
              }
            });
            return filteredOrders.length === 0 ? (
              <p>No {currentView === 'current' ? 'current' : 'past'} orders</p>
            ) : (
              <ul className="order-list">
                {filteredOrders.map((order) => (
                  <li key={order.id} className="order-item">
                    <div className="order-header">
                      <p><strong>Order ID:</strong> {order.orderSerial || order.id}</p>
                      <p><strong>Time:</strong> {order.orderTime}</p>
                    </div>
                    <div className="order-details">
                      <p><strong>Item:</strong> {order.itemName}</p>
                      <p><strong>Price:</strong> ৳{order.price}</p>
                      <p><strong>Quantity:</strong> {order.quantity}</p>
                      <p><strong>Category:</strong> {order.category}</p>
                      <p><strong>Status:</strong> {order.status || 'Pending'}</p>
                      {order.status !== "Accepted" && order.status !== "Completed" && order.status !== "Cancelled" && (
                        <button onClick={() => {
                          const orderRef = ref(db, `orders/${order.id}`);
                          update(orderRef, { status: "Accepted", acceptedAt: Date.now() });
                          setNotification("Order accepted");
                          setTimeout(() => setNotification(""), 3000);
                          fetchOrders();
                        }} className="accept-button">Accept Order</button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>

        <div className="dashboard-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin;
