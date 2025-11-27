import React, { useState, useRef } from 'react';

// Import pages from the components directory
import EmployeeManagementPage from './components/EmployeeManagementPage';
import RestaurantMenuPage from './components/RestaurantMenuPage';
import LiveInventoryPage from './components/LiveInventoryPage';
import TableManagementPage from './components/TableManagementPage';
import BillingPage from './components/BillingPage';
import PlaceholderPage from './components/PlaceholderPage';
import QRCodeGenerator from './components/QRCodeGenerator';
// Import icons from the Icons component
import {
    ArrowRightIcon,
    LogoutIcon,
    EditIcon,
    CameraIcon,
    MenuIcon,
    InventoryIcon,
    TableIcon,
    BillingIcon
} from './components/Icons';

// Icon for opening the menu
const DotsVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    </svg>
);

// Icon for closing the menu
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    </svg>
);


export default function OwnerDashboard({ onLogout }) {
    const [activePage, setActivePage] = useState('employees_management');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility
    const [managerName, setManagerName] = useState('Saul Goodmate');
    const [tempManagerName, setTempManagerName] = useState('Saul Goodmate');
    const [managerImage, setManagerImage] = useState('https://i.pravatar.cc/150?u=saulgoodman');
    const [isEditingName, setIsEditingName] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const newImage = URL.createObjectURL(e.target.files[0]);
            setManagerImage(newImage);
        }
    };

    const handleNameSave = () => {
        setManagerName(tempManagerName);
        setIsEditingName(false);
    };

    const handleMenuItemClick = (pageId) => {
        setActivePage(pageId);
        setIsSidebarOpen(false); // Close sidebar on menu item click
    };

    const renderContent = () => {
        switch (activePage) {
            case 'employees_management':
                return <EmployeeManagementPage />;
            case 'restaurant_menu':
                return <RestaurantMenuPage />;
            case 'live_inventory':
                return <LiveInventoryPage />;
            case 'table_management':
                return <TableManagementPage />;
            case 'qr_code_generator':
                return <QRCodeGenerator />;
            case 'billing_&_analytics':
                return <BillingPage />;
            case 'personal_information':
                return <PlaceholderPage title="Personal Information" />;
            case 'opening_hours':
                return <PlaceholderPage title="Opening Hours" />;
            case 'login_&_password':
                return <PlaceholderPage title="Login & Password" />;
            default:
                return <EmployeeManagementPage />;
        }
    };

    const sidebarItems = [
        { id: 'personal_information', label: 'Personal Information', icon: <MenuIcon /> },
        { id: 'employees_management', label: 'Employees Management', icon: <MenuIcon /> },
        { id: 'restaurant_menu', label: 'Restaurant Menu', icon: <MenuIcon /> },
        { id: 'table_management', label: 'Table Management', icon: <TableIcon /> },
        { id: 'qr_code_generator', label: 'QR Code Generator', icon: <TableIcon /> },
        { id: 'live_inventory', label: 'Live Inventory', icon: <InventoryIcon /> },
        { id: 'opening_hours', label: 'Opening Hours', icon: <MenuIcon /> },
        { id: 'login_&_password', label: 'Login & Password', icon: <MenuIcon /> },
        { id: 'billing_&_analytics', label: 'Billing & Analytics', icon: <BillingIcon /> },
    ];

    return (
        <div className="w-full min-h-screen flex text-white font-roboto bg-gray-900 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop')"}}>
            <div className="w-full min-h-screen flex bg-black/60">
                {/* Sidebar */}
                <aside className={`bg-black/30 backdrop-blur-xl flex flex-col shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'w-80 p-6' : 'w-0 p-0'}`}>
                    {/* Wrapper to prevent content collapsing during animation */}
                    <div className="min-w-[17rem] h-full flex flex-col">
                        <div className="flex justify-between items-start">
                             <h2 className="font-playfair text-3xl font-bold mb-12">Settings</h2>
                             <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <CloseIcon />
                             </button>
                        </div>
                        <div className="text-center mb-12">
                            <div className="relative w-28 h-28 mx-auto mb-4 group">
                                <img src={managerImage} alt="Manager" className="w-full h-full rounded-full object-cover border-4 border-orange-500/50 shadow-lg" />
                                <div
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <CameraIcon />
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                            </div>

                            {isEditingName ? (
                                <div className="flex flex-col items-center">
                                    <input
                                        type="text"
                                        value={tempManagerName}
                                        onChange={(e) => setTempManagerName(e.target.value)}
                                        className="bg-white/10 text-white text-center text-xl font-semibold border border-gray-700 rounded-lg w-40"
                                    />
                                    <button onClick={handleNameSave} className="mt-2 text-xs bg-green-500 text-white px-2 py-1 rounded">Save</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <h3 className="font-semibold text-xl">{managerName}</h3>
                                    <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-white transition"><EditIcon /></button>
                                </div>
                            )}
                            <p className="text-sm text-gray-400">Manager</p>
                        </div>
                        <nav className="flex-grow space-y-3">
                            {sidebarItems.map((item) => (
                                <a href="#" key={item.id} onClick={() => handleMenuItemClick(item.id)} className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 group ${activePage === item.id ? 'bg-orange-500 text-white shadow-lg' : 'hover:bg-white/10'}`}>
                                    {item.icon}
                                    <span className="flex-grow ml-3">{item.label}</span>
                                    <span className={`transition-transform duration-300 ${activePage === item.id ? 'translate-x-0' : '-translate-x-2 group-hover:translate-x-0'}`}><ArrowRightIcon /></span>
                                </a>
                            ))}
                        </nav>
                        <button onClick={onLogout} className="w-full flex items-center justify-center mt-8 py-3 px-4 font-semibold text-white bg-red-600/50 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500">
                            <LogoutIcon /> Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-12 overflow-y-auto relative">
                    {/* Button to open the menu */}
                    {!isSidebarOpen && (
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="absolute top-6 left-6 text-white z-20 p-2 bg-black/30 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Open menu"
                        >
                            <DotsVerticalIcon />
                        </button>
                    )}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
