import { useEffect, useState } from "react";

function Admin() {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const fetchOrders = () => {
    fetch("http://localhost:5000/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  };

  const fetchAnalytics = () => {
    fetch("http://localhost:5000/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
  }, []);

  const updateStatus = (id, newStatus) => {
    fetch(`http://localhost:5000/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchOrders();
        fetchAnalytics(); // refresh analytics also
      });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>📦 Admin Dashboard</h2>

      {/* 🔥 Analytics Section */}
      {analytics && (
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "30px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              background: "#e8f5e9",
              padding: "20px",
              borderRadius: "10px",
              flex: 1,
              textAlign: "center",
            }}
          >
            <h3>Total Orders</h3>
            <h2>{analytics.totalOrders}</h2>
          </div>

          <div
            style={{
              background: "#e3f2fd",
              padding: "20px",
              borderRadius: "10px",
              flex: 1,
              textAlign: "center",
            }}
          >
            <h3>Total Revenue</h3>
            <h2>₹ {analytics.totalRevenue}</h2>
          </div>

          <div
            style={{
              background: "#fff3e0",
              padding: "20px",
              borderRadius: "10px",
              flex: 1,
              textAlign: "center",
            }}
          >
            <h3>Products Sold</h3>
            <h2>{analytics.totalProductsSold}</h2>
          </div>
        </div>
      )}

      {/* 📦 Orders Section */}
      <h3>All Orders</h3>

      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map((order, index) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginTop: "15px",
            borderRadius: "10px",
          }}
        >
          <h4>Order #{index + 1}</h4>
          <p><strong>Total:</strong> ₹ {order.totalAmount}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: "#2e7d32" }}>
              {order.status || "Pending"}
            </span>
          </p>

          {order.items.map((item, i) => (
            <div key={i}>
              {item.name} × {item.quantity}
            </div>
          ))}

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => updateStatus(order._id, "Shipped")}>
              Mark Shipped
            </button>

            <button
              onClick={() => updateStatus(order._id, "Delivered")}
              style={{ marginLeft: "10px" }}
            >
              Mark Delivered
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Admin;