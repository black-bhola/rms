import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function GenerateBillModal({ isOpen, onClose }) {
    const [tables, setTables] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedTable, setSelectedTable] = useState('');
    const [currentOrderItems, setCurrentOrderItems] = useState([]);
    
    useEffect(() => {
        if (!isOpen) return;

        const unsubTables = onSnapshot(collection(db, 'billing'), (snapshot) => {
            setTables(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubMenu = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
            setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubTables();
            unsubMenu();
        };
    }, [isOpen]);

    const handleAddItemToOrder = (item) => {
        setCurrentOrderItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
                return prevItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };
    
    const calculateTotal = () => {
        return currentOrderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleFinalizeBill = async () => {
        if (!selectedTable || currentOrderItems.length === 0) {
            alert("Please select a table and add items to the order.");
            return;
        }

        const totalAmount = calculateTotal();
        const newOrder = {
            tableId: selectedTable,
            tableNumber: tables.find(t => t.id === selectedTable)?.tableNumber,
            orderTime: serverTimestamp(),
            status: "Pending",
            totalAmount,
            createdAt: serverTimestamp(),
            items: currentOrderItems
        };

        try {
            await addDoc(collection(db, 'orders'), newOrder);
            const tableRef = doc(db, 'tables', selectedTable);
            await updateDoc(tableRef, { status: "Occupied" });

            setCurrentOrderItems([]);
            setSelectedTable('');
            onClose();
        } catch (error) {
            console.error("Error finalizing bill: ", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-5/6 flex flex-col p-8 text-white animate-fade-up">
                <h3 className="text-3xl font-bold mb-6 font-playfair text-orange-300">Generate New Bill</h3>
                <div className="grid grid-cols-2 gap-8 flex-grow overflow-hidden">
                    <div className="flex flex-col">
                        <h4 className="text-xl font-semibold mb-4">Menu</h4>
                        <div className="bg-black/20 p-4 rounded-lg overflow-y-auto">
                            {menuItems.map(item => (
                                <div key={item.id} onClick={() => handleAddItemToOrder(item)} className="p-3 mb-2 flex justify-between items-center bg-gray-700/50 rounded-lg cursor-pointer hover:bg-orange-500/20 transition">
                                    <span>{item.name}</span>
                                    <span>${item.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-xl font-semibold mb-4">Current Order</h4>
                        <div className="bg-black/20 p-4 rounded-lg flex-grow flex flex-col">
                            <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} className="w-full p-3 bg-white/10 text-white border border-gray-700 rounded-lg mb-4">
                                <option value="">Select an Available Table</option>
                                {tables.filter(t => t.status === 'Available').map(table => (
                                    <option key={billing.id} value={billing.id}>Table {billing.tableNumber} (Capacity: {table.capacity})</option>
                                ))}
                            </select>
                            <div className="flex-grow overflow-y-auto mb-4">
                                {currentOrderItems.length === 0 ? (
                                    <p className="text-gray-400 text-center mt-8">No items added yet.</p>
                                ) : (
                                    currentOrderItems.map(item => (
                                        <div key={item.id} className="p-3 mb-2 flex justify-between items-center bg-gray-700/50 rounded-lg">
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                             <div className="border-t border-gray-700 pt-4 mt-auto">
                                <div className="flex justify-between text-2xl font-bold">
                                    <span>Total:</span>
                                    <span>${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="py-2 px-6 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Cancel</button>
                    <button onClick={handleFinalizeBill} className="py-2 px-6 bg-green-600 rounded-lg hover:bg-green-500 transition font-semibold">Finalize Bill</button>
                </div>
            </div>
        </div>
    );
}

