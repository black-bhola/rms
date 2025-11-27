import React, { useState, useEffect } from 'react';
// Import the Realtime Database instance from your firebase.js file.
// We import 'database' and rename it to 'db' for use within this component.
import { database as db } from '../firebase'; 
// Import the Realtime Database functions you will use.
// NEW: Imported the 'update' function to handle edits.
import { ref, onValue, push, remove, serverTimestamp, update } from 'firebase/database';


export default function EmployeeManagementPage() {
    const [employees, setEmployees] = useState([]);
    // NEW: State to manage the visibility of the edit modal.
    const [isEditing, setIsEditing] = useState(false);
    // NEW: State to hold the data of the employee currently being edited.
    const [currentEmployee, setCurrentEmployee] = useState(null);


    // This effect listens for real-time changes in the 'users' path of your Realtime Database.
    useEffect(() => {
        // We use the imported 'db' instance here.
        const usersRef = ref(db, 'users');
        
        // onValue listens for data changes at a specific location and triggers the callback.
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Realtime Database returns data as an object, so we convert it into an array.
                const employeesData = Object.keys(data).map(key => ({
                    id: key, // The unique key from Firebase becomes the employee's ID.
                    ...data[key]
                }));
                setEmployees(employeesData);
            } else {
                setEmployees([]); // Set to an empty array if there's no data.
            }
        });

        // Cleanup: remove the listener when the component is no longer on screen.
        return () => unsubscribe();
    }, []); // The empty dependency array ensures this effect runs only once on mount.

    // Handles adding a new employee to the database.
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const form = e.target;
        const newEmployee = {
            displayName: `${form.firstName.value} ${form.lastName.value}`,
            email: form.email.value,
            phoneNumber: form.phone.value,
            gender: form.gender.value,
            role: form.role.value,
            createdAt: serverTimestamp() // Adds a server-side timestamp.
        };

        try {
            // 'push' creates a new entry with a unique ID under the 'users' path.
            const usersRef = ref(db, 'users');
            await push(usersRef, newEmployee);
            form.reset(); // Clear the form after submission.
        } catch (error) {
            console.error("Error adding employee: ", error);
        }
    };

    // Handles deleting an employee from the database.
    const handleDeleteEmployee = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                // 'remove' deletes the data at the specified database reference.
                const employeeRef = ref(db, `users/${id}`);
                await remove(employeeRef);
            } catch (error) {
                console.error("Error deleting employee: ", error);
            }
        }
    };

    // NEW: Opens the edit modal and sets the current employee to be edited.
    const handleEditClick = (employee) => {
        setCurrentEmployee(employee);
        setIsEditing(true);
    };

    // NEW: Closes the edit modal and resets the state.
    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentEmployee(null);
    };

    // NEW: Updates the currentEmployee state as the user types in the modal form.
    const handleModalInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEmployee(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    // NEW: Saves the updated employee data to the Firebase database.
    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        if (!currentEmployee) return;

        const employeeRef = ref(db, `users/${currentEmployee.id}`);
        try {
            // Create a copy of the employee data, excluding the 'id' which should not be written to the database object itself.
            const { id, ...dataToUpdate } = currentEmployee;
            await update(employeeRef, dataToUpdate);
            handleCancelEdit(); // Close modal on successful update
        } catch (error) {
            console.error("Error updating employee: ", error);
        }
    };

    return (
        <div className="animate-slide-in-up space-y-12">
            <div>
                <h3 className="text-3xl font-bold mb-8 font-playfair text-white">Add New Employee</h3>
                <div className="bg-black/20 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                            <input name="firstName" type="text" placeholder="e.g., John" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                            <input name="lastName" type="text" placeholder="e.g., Doe" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">EmployeeID </label>
                            <input name="lastName" type="text" placeholder="" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">password</label>
                            <input name="password" type="password" placeholder="" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input name="email" type="email" placeholder="e.g., john.doe@example.com" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                            <input name="phone" type="tel" placeholder="e.g., +1 234 567 890" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                            <select name="gender" className="w-full px-4 py-3 bg-white/10 text-white border border--700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition">
                                <option className='text-gray-400'>Select Gender</option>
                                <option className='text-gray-400'>Male</option>
                                <option className='text-gray-400'>Female</option>
                                <option className='text-gray-400'>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                            <input name="role" type="text" placeholder="e.g., Head Chef" className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" required />
                        </div>
                        <div className="md:col-span-2 mt-4">
                            <button type="submit" className="w-full py-3 px-4 font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-400">
                                Add Employee
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div>
                 <h3 className="text-3xl font-bold mb-8 font-playfair text-white">Current Employees</h3>
                 <div className="bg-black/20 p-8 rounded-2xl shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id} className="border-b border-gray-800 hover:bg-white/5">
                                        <td className="p-4">{emp.displayName}</td>
                                        <td className="p-4 text-gray-400">{emp.email}</td>
                                        <td className="p-4">{emp.role}</td>
                                        <td className="p-4 flex space-x-2">
                                            {/* NEW: Added onClick handler to the Edit button */}
                                            <button onClick={() => handleEditClick(emp)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                            <button onClick={() => handleDeleteEmployee(emp.id)} className="text-red-500 hover:text-red-400">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>

            {/* NEW: Edit Employee Modal */}
            {isEditing && currentEmployee && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md animate-slide-in-up">
                        <h3 className="text-2xl font-bold mb-6 font-playfair text-white">Edit Employee</h3>
                        <form onSubmit={handleUpdateEmployee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <input 
                                    name="displayName" 
                                    type="text" 
                                    value={currentEmployee.displayName}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input 
                                    name="email" 
                                    type="email" 
                                    value={currentEmployee.email}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                    required 
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                                <input 
                                    name="role" 
                                    type="text" 
                                    value={currentEmployee.role}
                                    onChange={handleModalInputChange}
                                    className="w-full px-4 py-3 bg-white/10 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition" 
                                    required 
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
