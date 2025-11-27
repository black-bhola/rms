import React, { useState, useEffect } from 'react';
// Import Firebase services and functions
import { db, database, auth } from './firebase.js'; // Assuming auth is needed for profile/logout
import { ref, onValue } from 'firebase/database'; // For Menu (RTDB)
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'; // For Orders (Firestore)
import { signOut } from 'firebase/auth'; // For Logout
import { useNavigate } from 'react-router-dom'; // To handle logout navigation

// --- SVG ICONS (Added/Updated) ---
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
const OrderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;

// --- MOCK CUSTOMER SESSION ---
// In a real app, you'd get this from props or context after login
const MOCK_TABLE_NUMBER = 5;
const MOCK_CUSTOMER_PHONE = "+911234567890";
const MOCK_CUSTOMER_NAME = "Tirth Patel";
// ---

// --- DASHBOARD PAGES ---

// Menu Page Component
const MenuPage = ({ cart, onAddToCart }) => {
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const menuItemsRef = ref(database, 'menuItems');
        const unsubscribe = onValue(menuItemsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const itemsData = Object.keys(data)
                    .map(key => ({ id: key, ...data[key] }))
                    .filter(item => item.isAvailable); // Only show available items

                const grouped = itemsData.reduce((acc, item) => {
                    (acc[item.category] = acc[item.category] || []).push(item);
                    return acc;
                }, {});
                setMenu(grouped);
            } else {
                setMenu({});
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-500">Loading Menu...</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Menu</h2>
            {Object.entries(menu).map(([category, items]) => (
                <div key={category} className="mb-8">
                    <h3 className="text-2xl font-semibold text-orange-600 mb-4 capitalize">{category.replace('_', ' ')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-lg text-gray-700">{item.name}</h4>
                                        <p className="font-semibold text-orange-500">${item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                </div>
                                <button 
                                    onClick={() => onAddToCart(item)}
                                    className="mt-4 w-full sm:w-auto self-end py-2 px-4 font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <PlusIcon /> Add to Order
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Current Order Page Component
const CurrentOrderPage = ({ cart, onUpdateCart, onPlaceOrder, activeOrder }) => {
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // If there's an active order, show its status
    if (activeOrder) {
        const orderTotal = activeOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        const getStatusColor = () => {
            switch (activeOrder.status) {
                case 'Pending': return 'bg-red-200 text-red-800';
                case 'Preparing': return 'bg-yellow-200 text-yellow-800';
                case 'Ready': return 'bg-green-200 text-green-800';
                default: return 'bg-gray-200 text-gray-800';
            }
        };

        return (
             <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Order Status</h2>
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <h3 className="text-xl font-semibold text-gray-700">Order for Table {activeOrder.tableNumber}</h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor()}`}>
                            {activeOrder.status}
                        </span>
                    </div>
                    <div className="space-y-3 mb-4">
                        {activeOrder.items.map(item => (
                            <div key={item.name} className="flex justify-between text-gray-600">
                                <span>{item.name} <span className="text-sm">x{item.quantity}</span></span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t text-xl font-bold text-gray-800">
                        <span>Total</span>
                        <span>${orderTotal.toFixed(2)}</span>
                    </div>
                    {activeOrder.status === 'Ready' && (
                        <p className="mt-4 text-center text-green-600 font-semibold">Your order is ready to be picked up!</p>
                    )}
                </div>
            </div>
        );
    }

    // If no active order, show the cart
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                {cart.length === 0 ? (
                    <p className="text-center text-gray-500">Your cart is empty. Add some items from the menu!</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <p className="font-bold text-gray-700">{item.name}</p>
                                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 border rounded-lg p-1">
                                            <button onClick={() => onUpdateCart(item, item.quantity - 1)} className="text-red-500 font-bold">-</button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button onClick={() => onUpdateCart(item, item.quantity + 1)} className="text-green-500 font-bold">+</button>
                                        </div>
                                        <button onClick={() => onUpdateCart(item, 0)} className="text-red-500 hover:text-red-700">
                                            <XCircleIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between items-center mt-6 pt-4 border-t text-xl font-bold text-gray-800">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={onPlaceOrder}
                            className="mt-6 w-full py-3 px-4 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 duration-300"
                        >
                            Place Order
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Order History Page Component
const OrderHistoryPage = ({ customerPhone }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customerPhone) return;

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, 
            where("customerPhone", "==", customerPhone),
            where("status", "==", "Done"), // Show only completed orders
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const historyData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt.toDate().toLocaleDateString(),
                total: doc.data().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            }));
            setHistory(historyData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [customerPhone]);

    if (loading) {
        return <div className="text-center text-gray-500">Loading Order History...</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Order History</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 && (
                            <tr><td colSpan="4" className="p-3 text-center text-gray-500">No completed orders found.</td></tr>
                        )}
                        {history.map(order => (
                             <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium text-gray-700">{order.id.substring(0, 8)}...</td>
                                <td className="p-3 text-gray-500">{order.date}</td>
                                <td className="p-3 text-gray-600">${order.total.toFixed(2)}</td>
                                <td className="p-3">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">{order.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Profile Page Component (Commented out as in original, but with Firebase notes)
// const ProfilePage = () => {
//     // To implement this, you would:
//     // 1. Get customer ID (from auth or session)
//     // 2. useEffect to fetch doc(db, 'customers', customerId)
//     // 3. useState to hold profile data
//     // 4. onSubmit handler to call updateDoc(docRef, { ...profileData })
// };


// --- MAIN CUSTOMER DASHBOARD COMPONENT ---
export default function CustomerDashboard() {
    const [activePage, setActivePage] = useState('menu');
    const [cart, setCart] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const navigate = useNavigate();

    // Mock session data (replace with props or context)
    const tableNumber = MOCK_TABLE_NUMBER;
    const customerPhone = MOCK_CUSTOMER_PHONE;
    const customerName = MOCK_CUSTOMER_NAME;
    
    // Listen for an active order for this table
    useEffect(() => {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, 
            where("tableNumber", "==", tableNumber),
            where("status", "in", ["Pending", "Preparing", "Ready"])
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.docs.length > 0) {
                // Found an active order
                const activeOrderData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                setActiveOrder(activeOrderData);
                setCart([]); // Clear cart as an order is active
                setActivePage('current_order'); // Switch to order status page
            } else {
                setActiveOrder(null);
            }
        });

        return () => unsubscribe();
    }, [tableNumber]);

    const handleAddToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                // Increase quantity
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            } else {
                // Add new item
                return [...prevCart, { ...item, quantity: 1 }];
            }
        });
    };

    const handleUpdateCart = (item, quantity) => {
        if (quantity <= 0) {
            // Remove item
            setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== item.id));
        } else {
            // Update quantity
            setCart(prevCart => prevCart.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: quantity } : cartItem
            ));
        }
    };
    
    const handlePlaceOrder = async () => {
        if (cart.length === 0) return;
        
        const orderData = {
            tableNumber: tableNumber,
            customerName: customerName,
            customerPhone: customerPhone,
            items: cart,
            status: 'Pending',
            createdAt: serverTimestamp()
        };
        
        try {
            const ordersRef = collection(db, 'orders');
            await addDoc(ordersRef, orderData);
            // Success! The useEffect will automatically pick up the new order.
        } catch (error) {
            console.error("Error placing order: ", error);
            alert("Error placing order. Please try again.");
        }
    };

    const handleLogout = () => {
        // Since customer login isn't full Firebase Auth, we just navigate
        // If it *was* auth, you'd call signOut(auth)
        navigate('/');
    };

    const renderContent = () => {
        switch (activePage) {
            case 'menu': 
                return <MenuPage cart={cart} onAddToCart={handleAddToCart} />;
            case 'current_order': 
                return <CurrentOrderPage cart={cart} onUpdateCart={handleUpdateCart} onPlaceOrder={handlePlaceOrder} activeOrder={activeOrder} />;
            case 'order_history': 
                return <OrderHistoryPage customerPhone={customerPhone} />;
            // case 'profile': return <ProfilePage />;
            default: 
                return <MenuPage cart={cart} onAddToCart={handleAddToCart} />;
        }
    };
    
    const sidebarItems = [
        { id: 'menu', label: 'Menu', icon: <MenuIcon /> },
        { id: 'current_order', label: 'Cart & Order', icon: <ShoppingCartIcon /> },
        { id: 'order_history', label: 'Order History', icon: <HistoryIcon /> },
        // { id: 'profile', label: 'My Profile', icon: <ProfileIcon /> },
    ];
    
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <div className="w-full min-h-screen flex font-sans bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                <div className="text-center py-6 border-b">
                     <h1 className="text-2xl font-bold text-orange-500">Allrounder</h1>
                     <p className="text-sm text-gray-500">Welcome, {customerName}!</p>
                     <p className="text-sm text-gray-500">Table {tableNumber}</p>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    {sidebarItems.map((item) => (
                        <a 
                            href="#" 
                            key={item.id} 
                            onClick={(e) => { e.preventDefault(); setActivePage(item.id); }}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-orange-100 hover:text-orange-600 ${activePage === item.id ? 'bg-orange-500 text-white shadow-md' : ''}`}
                        >
                            <div className="flex items-center">
                                {item.icon}
                                <span className="ml-4 font-semibold">{item.label}</span>
                            </div>
                            {item.id === 'current_order' && cartItemCount > 0 && !activeOrder && (
                                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </a>
                    ))}
                </nav>
                <div className="p-4 border-t">
                     <a 
                        href="#" 
                        onClick={(e) => { e.preventDefault(); handleLogout(); }}
                        className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600"
                    >
                        <LogoutIcon />
                        <span className="ml-4 font-semibold">Logout</span>
                     </a>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}