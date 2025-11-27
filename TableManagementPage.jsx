import React, { useState, useEffect } from 'react';
// Import the Realtime Database instance from your firebase.js file.
// We import 'database' and rename it to 'db' for use within this component.
import { database as db } from '../firebase'; 
// Import the Realtime Database functions you will use.
import { ref, onValue, push, remove, serverTimestamp, update } from 'firebase/database';


export default function TableManagementPage() {
    const [tables, setTables] = useState([]);
    // State to manage the visibility of the edit modal.
    const [isEditing, setIsEditing] = useState(false);
    // State to hold the data of the table currently being edited.
    const [currentTable, setCurrentTable] = useState(null);


    // This effect listens for real-time changes in the 'tables' path of your Realtime Database.
    useEffect(() => {
        const tablesRef = ref(db, 'tables');
        
        // onValue listens for data changes at a specific location and triggers the callback.
        const unsubscribe = onValue(tablesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Realtime Database returns data as an object, so we convert it into an array.
                const tablesData = Object.keys(data).map(key => ({
                    id: key, // The unique key from Firebase becomes the table's ID.
                    ...data[key]
                }));
                setTables(tablesData);
            } else {
                setTables([]); // Set to an empty array if there's no data.
            }
        });

        // Cleanup: remove the listener when the component is no longer on screen.
        return () => unsubscribe();
    }, []); // The empty dependency array ensures this effect runs only once on mount.

    // Handles adding a new table to the database.
    const handleAddTable = async (e) => {
        e.preventDefault();
        const form = e.target;
        const newTable = {
            tableNumber: form.tableNumber.value,
            capacity: parseInt(form.capacity.value),
            status: 'Available', // Default status for a new table
            createdAt: serverTimestamp() // Adds a server-side timestamp.
        };

        try {
            // 'push' creates a new entry with a unique ID under the 'tables' path.
            const tablesRef = ref(db, 'tables');
            await push(tablesRef, newTable);
            form.reset(); // Clear the form after submission.
        } catch (error) {
            console.error("Error adding table: ", error);
        }
    };

    // Handles deleting a table from the database.
    const handleDeleteTable = async (id) => {
        if (window.confirm("Are you sure you want to delete this table?")) {
            try {
                // 'remove' deletes the data at the specified database reference.
                const tableRef = ref(db, `tables/${id}`);
                await remove(tableRef);
            } catch (error) {
                console.error("Error deleting table: ", error);
            }
        }
    };

    // Opens the edit modal and sets the current table to be edited.
    const handleEditClick = (table) => {
        setCurrentTable(table);
        setIsEditing(true);
    };

    // Closes the edit modal and resets the state.
    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentTable(null);
    };

    // Updates the currentTable state as the user types in the modal form.
    const handleModalInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentTable(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    // Saves the updated table data to the Firebase database.
    const handleUpdateTable = async (e) => {
        e.preventDefault();
        if (!currentTable) return;

        const tableRef = ref(db, `tables/${currentTable.id}`);
        try {
            // Create a copy of the table data, excluding the 'id'
            const { id, ...dataToUpdate } = currentTable;
            await update(tableRef, dataToUpdate);
            handleCancelEdit(); // Close modal on successful update
        } catch (error) {
            console.error("Error updating table: ", error);
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-500';
            case 'Occupied': return 'bg-red-500';
            case 'Reserved': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="animate-slide-in-up space-y-12">
            <div>
                <h3 className="text-3xl font-bold mb-8 font-playfair text-white">Add New Table</h3>
                <div className="bg-black/20 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleAddTable} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Table Number</label>
                            <input name="tableNumber" type="text" placeholder="e.g., A5" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                            <input name="capacity" type="number" placeholder="e.g., 4" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div className="md:col-span-2 mt-4">
                            <button type="submit" className="w-full py-3 px-4 font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-400">
                                Add Table
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div>
                 <h3 className="text-3xl font-bold mb-8 font-playfair text-white">Current Tables</h3>
                 <div className="bg-black/20 p-8 rounded-2xl shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-4">Table Number</th>
                                    <th className="p-4">Capacity</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tables.map(table => (
                                    <tr key={table.id} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="p-4">{table.tableNumber}</td>
                                        <td className="p-4 text-gray-400">{table.capacity}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(table.status)}`}>
                                                {table.status}
                                            </span>
                                        </td>
                                        <td className="p-4 flex space-x-2">
                                            <button onClick={() => handleEditClick(table)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                            <button onClick={() => handleDeleteTable(table.id)} className="text-red-500 hover:text-red-400">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            {/* Edit Table Modal */}
            {isEditing && currentTable && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slide-in-up">
                        <h3 className="text-2xl font-bold mb-6 font-playfair text-white">Edit Table</h3>
                        <form onSubmit={handleUpdateTable} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Table Number</label>
                                <input 
                                    name="tableNumber" 
                                    type="text" 
                                    value={currentTable.tableNumber}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Capacity</label>
                                <input 
                                    name="capacity" 
                                    type="number" 
                                    value={currentTable.capacity}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                    required 
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                <select 
                                    name="status" 
                                    value={currentTable.status}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                    required 
                                >
                                    <option value="Available">Available</option>
                                    <option value="Occupied">Occupied</option>
                                    <option value="Reserved">Reserved</option>
                                </select>
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
