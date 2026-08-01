import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [foods, setFoods] = useState([]);
    const [cart, setCart] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Your EC2 public IP
    // Nginx forwards /api requests to backend Docker container
    const API_URL = process.env.REACT_APP_API_URL;

    // Load food from backend
    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/api/foods`
            );

            setFoods(response.data);

        } catch (error) {
            console.error(
                "Error loading foods:",
                error
            );

            setError(
                "Unable to load food menu. Please check the backend."
            );

        } finally {
            setLoading(false);
        }
    };


    // Add food to cart
    const addToCart = (food) => {

        const existingItem =
            cart.find(
                (item) =>
                    item.id === food.id
            );

        if (existingItem) {

            setCart(
                cart.map(
                    (item) =>
                        item.id === food.id
                            ? {
                                ...item,
                                quantity:
                                    item.quantity + 1
                            }
                            : item
                )
            );

        } else {

            setCart([
                ...cart,
                {
                    ...food,
                    quantity: 1
                }
            ]);

        }
    };


    // Increase quantity
    const increaseQuantity = (id) => {

        setCart(
            cart.map(
                (item) =>
                    item.id === id
                        ? {
                            ...item,
                            quantity:
                                item.quantity + 1
                        }
                        : item
            )
        );
    };


    // Decrease quantity
    const decreaseQuantity = (id) => {

        setCart(
            cart
                .map(
                    (item) =>
                        item.id === id
                            ? {
                                ...item,
                                quantity:
                                    item.quantity - 1
                            }
                            : item
                )
                .filter(
                    (item) =>
                        item.quantity > 0
                )
        );
    };


    // Remove item
    const removeFromCart = (id) => {

        setCart(
            cart.filter(
                (item) =>
                    item.id !== id
            )
        );
    };


    // Calculate total
    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price) *
            item.quantity,
        0
    );


    // Calculate total items
    const totalItems = cart.reduce(
        (sum, item) =>
            sum + item.quantity,
        0
    );


    // Place order
    const placeOrder = async () => {

        if (!name.trim()) {

            alert(
                "Please enter your name."
            );

            return;
        }

        if (!email.trim()) {

            alert(
                "Please enter your email."
            );

            return;
        }

        if (cart.length === 0) {

            alert(
                "Please add at least one food item to your cart."
            );

            return;
        }


        const items =
            cart.map(
                (item) => ({
                    food_id: item.id,
                    quantity: item.quantity
                })
            );


        try {

            const response =
                await axios.post(
                    `${API_URL}/api/orders`,
                    {
                        customer_name:
                            name,

                        customer_email:
                            email,

                        items:
                            items
                    }
                );


            alert(
                `🎉 Order placed successfully!\n\nOrder ID: ${response.data.order_id}\nTotal: ₹${response.data.total_amount}`
            );


            // Clear cart
            setCart([]);

            // Clear form
            setName("");
            setEmail("");


        } catch (error) {

            console.error(
                "Order error:",
                error
            );

            alert(
                "❌ Order failed. Please try again."
            );

        }
    };


    return (

        <div className="app">


            {/* ================= HEADER ================= */}

            <header className="header">

                <div className="logo">
                    🍔 Foodie
                </div>


                <nav className="nav">

                    <a href="#home">
                        Home
                    </a>

                    <a href="#menu">
                        Menu
                    </a>

                    <a href="#cart">
                        Cart
                        {totalItems > 0 && (
                            <span className="cart-badge">
                                {totalItems}
                            </span>
                        )}
                    </a>

                </nav>

            </header>



            {/* ================= HERO ================= */}

            <section
                className="hero"
                id="home"
            >

                <div className="hero-content">

                    <div className="hero-tag">
                        🔥 Fresh & Delicious
                    </div>


                    <h1>
                        Delicious Food
                        <br />
                        <span>
                            Delivered To You
                        </span>
                    </h1>


                    <p>
                        Discover delicious meals,
                        order your favorites,
                        and enjoy fresh food
                        delivered straight to you.
                    </p>


                    <a
                        href="#menu"
                        className="hero-button"
                    >
                        Explore Menu 🍽️
                    </a>

                </div>


                <div className="hero-food">

                    <div className="hero-circle">
                        🍕
                    </div>

                    <div className="floating-food food-one">
                        🍔
                    </div>

                    <div className="floating-food food-two">
                        🍟
                    </div>

                    <div className="floating-food food-three">
                        🥤
                    </div>

                </div>

            </section>



            {/* ================= MENU ================= */}

            <section
                className="menu-section"
                id="menu"
            >

                <div className="section-heading">

                    <span>
                        OUR MENU
                    </span>

                    <h2>
                        Explore Our Delicious Food
                    </h2>

                    <p>
                        Choose from our selection
                        of tasty meals.
                    </p>

                </div>


                {/* Loading */}

                {loading && (

                    <div className="message-box">

                        <div className="loader"></div>

                        <p>
                            Loading delicious food...
                        </p>

                    </div>

                )}


                {/* Error */}

                {!loading &&
                    error && (

                        <div className="message-box error">

                            <div className="error-icon">
                                ⚠️
                            </div>

                            <p>
                                {error}
                            </p>

                            <button
                                onClick={
                                    fetchFoods
                                }
                            >
                                Try Again
                            </button>

                        </div>

                    )}


                {/* Empty menu */}

                {!loading &&
                    !error &&
                    foods.length === 0 && (

                        <div className="message-box">

                            <div className="empty-icon">
                                🍽️
                            </div>

                            <h3>
                                No food available
                            </h3>

                            <p>
                                Please add food items
                                to your database.
                            </p>

                        </div>

                    )}


                {/* Food Cards */}

                {!loading &&
                    !error &&
                    foods.length > 0 && (

                        <div className="food-grid">

                            {foods.map(
                                (food) => (

                                    <div
                                        className="food-card"
                                        key={
                                            food.id
                                        }
                                    >


                                        <div
                                            className={
                                                "food-image " +
                                                (
                                                    food.category ||
                                                    ""
                                                ).toLowerCase()
                                            }
                                        >

                                            <span>

                                                {food.category ===
                                                "Pizza"
                                                    ? "🍕"
                                                    : food.category ===
                                                      "Burger"
                                                    ? "🍔"
                                                    : food.category ===
                                                      "Biryani"
                                                    ? "🍛"
                                                    : food.category ===
                                                      "Sides"
                                                    ? "🍟"
                                                    : "🍽️"
                                                }

                                            </span>

                                        </div>



                                        <div className="food-content">

                                            <div className="food-category">

                                                {food.category}

                                            </div>


                                            <h3>
                                                {food.name}
                                            </h3>


                                            <p>
                                                {
                                                    food.description
                                                }
                                            </p>


                                            <div className="food-footer">

                                                <div className="price">

                                                    ₹
                                                    {
                                                        food.price
                                                    }

                                                </div>


                                                <button
                                                    className="add-button"
                                                    onClick={() =>
                                                        addToCart(
                                                            food
                                                        )
                                                    }
                                                >
                                                    + Add
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

            </section>



            {/* ================= CART ================= */}

            <section
                className="cart-section"
                id="cart"
            >

                <div className="cart-wrapper">


                    <div className="section-heading">

                        <span>
                            YOUR ORDER
                        </span>

                        <h2>
                            Shopping Cart 🛒
                        </h2>

                    </div>



                    <div className="cart-layout">


                        {/* CART ITEMS */}

                        <div className="cart-items">


                            {cart.length === 0 ? (

                                <div className="empty-cart">

                                    <div className="empty-cart-icon">
                                        🛒
                                    </div>

                                    <h3>
                                        Your cart is empty
                                    </h3>

                                    <p>
                                        Add delicious
                                        food from
                                        our menu.
                                    </p>

                                    <a
                                        href="#menu"
                                        className="shop-button"
                                    >
                                        Browse Menu
                                    </a>

                                </div>

                            ) : (

                                cart.map(
                                    (item) => (

                                        <div
                                            className="cart-item"
                                            key={
                                                item.id
                                            }
                                        >


                                            <div className="cart-item-icon">

                                                {item.category ===
                                                "Pizza"
                                                    ? "🍕"
                                                    : item.category ===
                                                      "Burger"
                                                    ? "🍔"
                                                    : item.category ===
                                                      "Biryani"
                                                    ? "🍛"
                                                    : "🍟"
                                                }

                                            </div>



                                            <div className="cart-item-info">

                                                <h3>
                                                    {
                                                        item.name
                                                    }
                                                </h3>

                                                <p>
                                                    ₹
                                                    {
                                                        item.price
                                                    }
                                                </p>

                                            </div>



                                            <div className="quantity-control">

                                                <button
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    -
                                                </button>

                                                <span>
                                                    {
                                                        item.quantity
                                                    }
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>



                                            <div className="item-total">

                                                ₹
                                                {
                                                    (
                                                        Number(
                                                            item.price
                                                        ) *
                                                        item.quantity
                                                    ).toFixed(
                                                        2
                                                    )
                                                }

                                            </div>



                                            <button
                                                className="remove-button"
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.id
                                                    )
                                                }
                                            >
                                                ×
                                            </button>


                                        </div>

                                    )
                                )

                            )}

                        </div>



                        {/* ORDER FORM */}

                        <div className="order-box">

                            <h3>
                                Order Details
                            </h3>


                            <label>
                                Your Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={
                                    name
                                }
                                onChange={
                                    (e) =>
                                        setName(
                                            e.target.value
                                        )
                                }
                            />


                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={
                                    email
                                }
                                onChange={
                                    (e) =>
                                        setEmail(
                                            e.target.value
                                        )
                                }
                            />


                            <div className="order-summary">

                                <div>

                                    <span>
                                        Items
                                    </span>

                                    <span>
                                        {
                                            totalItems
                                        }
                                    </span>

                                </div>


                                <div className="total-row">

                                    <strong>
                                        Total
                                    </strong>

                                    <strong>
                                        ₹
                                        {
                                            total.toFixed(
                                                2
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>


                            <button
                                className="place-order-button"
                                onClick={
                                    placeOrder
                                }
                            >
                                🛍️ Place Order
                            </button>

                        </div>

                    </div>

                </div>

            </section>



            {/* ================= FOOTER ================= */}

            <footer className="footer">

                <div className="footer-logo">
                    🍔 Foodie
                </div>

                <p>
                    Delicious food.
                    Happy customers.
                </p>

                <div className="footer-line"></div>

                <p className="copyright">
                    © 2026 Foodie.
                    All Rights Reserved.
                </p>

            </footer>


        </div>

    );
}

export default App;

