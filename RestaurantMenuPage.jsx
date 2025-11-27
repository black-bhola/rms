// Updated RestaurantMenuPage.jsx with full CRUD operations

import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, push, update, remove, serverTimestamp } from 'firebase/database';

export default function RestaurantMenuPage() {
    const [menuItems, setMenuItems] = useState({});
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        const menuItemsRef = ref(database, 'menuItems');

        const unsubscribe = onValue(menuItemsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const itemsData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                const grouped = itemsData.reduce((acc, item) => {
                    (acc[item.category] = acc[item.category] || []).push(item);
                    return acc;
                }, {});
                setMenuItems(grouped);
            } else {
                setMenuItems({});
            }
        });

        return () => unsubscribe();
    }, []);

    const handleAddDish = async (e) => {
        e.preventDefault();
        const form = e.target;

        const newDish = {
            name: form.dishName.value,
            price: parseFloat(form.price.value),
            category: form.category.value,
            description: form.description.value,
            isAvailable: true,
            createdAt: serverTimestamp()
        };

        await push(ref(database, 'menuItems'), newDish);
        form.reset();
    };

    const handleEditDish = (item) => {
        setEditingItem(item);
    };

    const handleUpdateDish = async (e) => {
        e.preventDefault();
        const form = e.target;

        const updatedData = {
            name: form.dishName.value,
            price: parseFloat(form.price.value),
            category: form.category.value,
            description: form.description.value,
        };

        await update(ref(database, `menuItems/${editingItem.id}`), updatedData);
        setEditingItem(null);
    };

    const handleDeleteDish = async (id) => {
        await remove(ref(database, `menuItems/${id}`));
    };

    return (
        <div className="animate-slide-in-up">
            <h3 className="text-3xl font-bold mb-8 font-playfair text-white">Restaurant Menu </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {Object.entries(menuItems).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-2xl font-semibold font-playfair text-orange-300 mb-4 capitalize">{category.replace('_', ' ')}</h4>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="bg-black/20 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">{item.name}</p>
                                            <p className="text-sm text-gray-400">{item.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-semibold text-lg text-orange-400">${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</p>
                                            <button className="text-blue-400" onClick={() => handleEditDish(item)}>Edit</button>
                                            <button className="text-red-400" onClick={() => handleDeleteDish(item.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-black/20 p-8 rounded-2xl shadow-2xl">
                    <h4 className="text-2xl font-semibold font-playfair text-white mb-6">
                        {editingItem ? 'Edit Dish' : 'Add New Dish'}
                    </h4>

                    <form onSubmit={editingItem ? handleUpdateDish : handleAddDish} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Dish Name</label>
                            <input name="dishName" defaultValue={editingItem?.name || ''} className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                            <input name="price" type="number" step="0.01" defaultValue={editingItem?.price || ''} className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                            <select name="category" defaultValue={editingItem?.category || ''} className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg" required>
                                <option value="appetizers">Appetizer</option>
                                <option value="main_courses">Main Course</option>
                                <option value="sides">Side Dish</option>
                                <option value="desserts">Dessert</option>
                                <option value="drinks">Drink</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea name="description" defaultValue={editingItem?.description || ''} className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg" />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button type="submit" className="w-full py-3 px-4 font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all">
                                {editingItem ? 'Update Dish' : 'Add to Menu'}
                            </button>

                            {editingItem && (
                                <button type="button" onClick={() => setEditingItem(null)} className="w-full py-3 px-4 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-all">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
