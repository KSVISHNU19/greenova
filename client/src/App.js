import { useState, useEffect } from "react";
import "./App.css";
import Admin from "./Admin";
import Login from "./Login";

function App() {
  const [plants, setPlants] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("adminLoggedIn") === "true"
  );

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setPlants(data))
      .catch((err) => console.log(err));
  }, []);

  const addToCart = (plant) => {
    const existingItem = cart.find((item) => item._id === plant._id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item._id === plant._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...plant, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        totalAmount: totalPrice,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Order Placed Successfully 🌿");
        setCart([]);
      })
      .catch((err) => console.log(err));
  };

  // 🔐 ADMIN PROTECTION
  if (showAdmin && !isLoggedIn) {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem("adminLoggedIn", "true");
          setIsLoggedIn(true);
        }}
      />
    );
  }

  if (showAdmin && isLoggedIn) {
    return (
      <div>
        <div className="navbar">
          <h2>🌿 Greenova Admin</h2>
          <button
            onClick={() => {
              localStorage.removeItem("adminLoggedIn");
              setIsLoggedIn(false);
              setShowAdmin(false);
            }}
          >
            Logout
          </button>
        </div>
        <Admin />
      </div>
    );
  }

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <h2>🌿 Greenova</h2>
        <div>
          <button onClick={() => setShowAdmin(false)}>Shop</button>
          <button onClick={() => setShowAdmin(true)}>Admin</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="hero">
        <h1>Grow Life with Greenova 🌱</h1>
        <p>Fresh indoor & outdoor plants delivered to your home.</p>
      </div>

      {/* PRODUCTS */}
      <div className="products">
        <h2 style={{ textAlign: "center" }}>Our Plants</h2>

        <div className="product-grid">
          {plants.map((plant) => (
            <div key={plant._id} className="card">
              <h3>{plant.name}</h3>
              <p>₹ {plant.price}</p>
              <button onClick={() => addToCart(plant)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CART */}
      {cart.length > 0 && (
        <div className="cart-box">
          <h2>Cart Summary</h2>

          {cart.map((item) => (
            <div key={item._id} style={{ marginBottom: "10px" }}>
              {item.name} × {item.quantity} = ₹{" "}
              {item.price * item.quantity}
              <button
                onClick={() => removeFromCart(item._id)}
                style={{ marginLeft: "10px", background: "red", color: "white" }}
              >
                Remove
              </button>
            </div>
          ))}

          <h3>Total Price: ₹ {totalPrice}</h3>

          <button onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;