import React, { useState, useEffect } from 'react';
// Import the Realtime Database instance from your firebase.js file.
import { database as db } from '../firebase'; 
// Import the Realtime Database functions you will use.
import { ref, onValue, push, remove, serverTimestamp, update } from 'firebase/database';


export default function LiveInventoryPage() {
    const [inventoryItems, setInventoryItems] = useState([]);
    // State to manage the visibility of the edit modal.
    const [isEditing, setIsEditing] = useState(false);
    // State to hold the data of the item currently being edited.
    const [currentItem, setCurrentItem] = useState(null);


    // This effect listens for real-time changes in the 'inventory' path of your Realtime Database.
    useEffect(() => {
        const inventoryRef = ref(db, 'inventory');
        
        // onValue listens for data changes at a specific location and triggers the callback.
        const unsubscribe = onValue(inventoryRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Realtime Database returns data as an object, so we convert it into an array.
                const inventoryData = Object.keys(data).map(key => ({
                    id: key, // The unique key from Firebase becomes the item's ID.
                    ...data[key]
                }));
                setInventoryItems(inventoryData);
            } else {
                setInventoryItems([]); // Set to an empty array if there's no data.
            }
        });

        // Cleanup: remove the listener when the component is no longer on screen.
        return () => unsubscribe();
    }, []); // The empty dependency array ensures this effect runs only once on mount.

    // Handles adding a new item to the database.
    const handleAddItem = async (e) => {
        e.preventDefault();
        const form = e.target;
        const newItem = {
            itemName: form.itemName.value,
            category: form.category.value,
            quantity: form.quantity.value,
            unit: form.unit.value,
            supplier: form.supplier.value,
            createdAt: serverTimestamp() // Adds a server-side timestamp.
        };

        try {
            // 'push' creates a new entry with a unique ID under the 'inventory' path.
            const inventoryRef = ref(db, 'inventory');
            await push(inventoryRef, newItem);
            form.reset(); // Clear the form after submission.
        } catch (error) {
            console.error("Error adding item: ", error);
        }
    };

    // Handles deleting an item from the database.
    const handleDeleteItem = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                // 'remove' deletes the data at the specified database reference.
                const itemRef = ref(db, `inventory/${id}`);
                await remove(itemRef);
            } catch (error) {
                console.error("Error deleting item: ", error);
            }
        }
    };

    // Opens the edit modal and sets the current item to be edited.
    const handleEditClick = (item) => {
        setCurrentItem(item);
        setIsEditing(true);
    };

    // Closes the edit modal and resets the state.
    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentItem(null);
    };

    // Updates the currentItem state as the user types in the modal form.
    const handleModalInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    // Saves the updated item data to the Firebase database.
    const handleUpdateItem = async (e) => {
        e.preventDefault();
        if (!currentItem) return;

        const itemRef = ref(db, `inventory/${currentItem.id}`);
        try {
            // Create a copy of the item data, excluding the 'id' which should not be written to the database object itself.
            const { id, ...dataToUpdate } = currentItem;
            await update(itemRef, dataToUpdate);
            handleCancelEdit(); // Close modal on successful update
        } catch (error) {
            console.error("Error updating item: ", error);
        }
    };

    return (
        <div className="animate-slide-in-up space-y-12">
            <div>
                <h3 className="text-3xl font-bold mb-8 font-playfair text-white">Add New Inventory Item</h3>
                <div className="bg-black/20 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
                            <input name="itemName" type="text" placeholder="e.g., Tomatoes" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                            <select name="category" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required>
                                <option>Select Category</option>
                                <option>Produce</option>
                                <option>Dairy</option>
                                <option>Meat</option>
                                <option>Pantry</option>
                                <option>Beverages</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                            <input name="quantity" type="number" placeholder="e.g., 25" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
                            <input name="unit" type="text" placeholder="e.g., kg, lbs, items" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Supplier</label>
                            <input name="supplier" type="text" placeholder="e.g., Local Farms Co." className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" />
                        </div>
                        <div className="md:col-span-2 mt-4">
                            <button type="submit" className="w-full py-3 px-4 font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-400">
                                Add Item to Inventory
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div>
                 <h3 className="text-3xl font-bold mb-8 font-playfair text-white">Current Inventory</h3>
                 <div className="bg-black/20 p-8 rounded-2xl shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-4">Item Name</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Quantity</th>
                                    <th className="p-4">Unit</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryItems.map(item => (
                                    <tr key={item.id} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="p-4">{item.itemName}</td>
                                        <td className="p-4 text-gray-400">{item.category}</td>
                                        <td className="p-4">{item.quantity}</td>
                                        <td className="p-4">{item.unit}</td>
                                        <td className="p-4 flex space-x-2">
                                            <button onClick={() => handleEditClick(item)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-400">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            {/* Edit Item Modal */}
            {isEditing && currentItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slide-in-up">
                        <h3 className="text-2xl font-bold mb-6 font-playfair text-white">Edit Inventory Item</h3>
                        <form onSubmit={handleUpdateItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
                                <input 
                                    name="itemName" 
                                    type="text" 
                                    value={currentItem.itemName}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                                 <select name="category" value={currentItem.category} onChange={handleModalInputChange} className="w-full px-4 py-3  border-black-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required>
                                    <option >Select Category</option>
                                    <option >Produce</option>
                                    <option >Dairy</option>
                                    <option >Meat</option>
                                    <option >Pantry</option>
                                    <option >Beverages</option>
                                    <option >Other</option>
                                
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                                <input 
                                    name="quantity" 
                                    type="number" 
                                    value={currentItem.quantity}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Unit</label>
                                <input 
                                    name="unit" 
                                    type="text" 
                                    value={currentItem.unit}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                />
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={handleCancelEdit} className="py-2 px-5 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-300">
                                    Cancel
                                </button>
                                <button type="submit" className="py-2 px-5 font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
