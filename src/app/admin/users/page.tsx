"use client";

import { User, UserService } from '@/services/userService';
import { useEffect, useState } from 'react';

const userService = new UserService();

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        plan: 'starter' as 'starter' | 'pro' | 'enterprise',
    });

    // Form errors
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const usersData = await userService.getAllUsers();
            setUsers(usersData);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle form submission for adding a new user
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Create a minimal user object with required fields
            const newUser = await userService.createUser({
                ...formData,
                password: 'tempPassword123!' // Temporary password, in a real app this would be handled differently
            });

            setUsers(prev => [...prev, newUser]);
            setShowAddUserForm(false);
            setFormData({
                name: '',
                email: '',
                company: '',
                plan: 'starter'
            });
            setSuccess('User created successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error creating user:', err);
            setError(err.message || 'Failed to create user. Please try again.');
        }
    };

    // Handle form submission for updating a user
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!editingUser) return;

        try {
            const updatedUser = await userService.updateUser(editingUser.id, {
                name: formData.name,
                company: formData.company,
                plan: formData.plan
            });
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                company: '',
                plan: 'starter'
            });
            setSuccess('User updated successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error updating user:', err);
            setError(err.message || 'Failed to update user. Please try again.');
        }
    };

    // Handle deleting a user
    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            await userService.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            setSuccess('User deleted successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Error deleting user:', err);
            setError(err.message || 'Failed to delete user. Please try again.');
        }
    };

    // Open edit form with user data
    const openEditForm = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            company: user.company || '',
            plan: user.plan
        });
        // Clear any previous errors
        setFormErrors({});
    };

    // Close forms
    const closeForms = () => {
        setShowAddUserForm(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            company: '',
            plan: 'starter'
        });
        // Clear any previous errors
        setFormErrors({});
    };

    // Clear success/error messages
    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage users and their permissions
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowAddUserForm(true);
                        clearMessages();
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                    Add User
                </button>
            </div>

            {/* Success message */}
            {success && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{success}</span>
                    <button
                        onClick={() => setSuccess(null)}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <title>Close</title>
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1.698z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    >
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <title>Close</title>
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 1.698z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Add User Form */}
            {showAddUserForm && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h2>
                    <form onSubmit={handleAddUser}>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full border ${formErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-50 focus:border-emerald-500 sm:text-sm`}
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    id="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-50 focus:border-emerald-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                                    Plan
                                </label>
                                <select
                                    id="plan"
                                    name="plan"
                                    value={formData.plan}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-50 focus:border-emerald-500 sm:text-sm"
                                >
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeForms}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                >
                                    Add User
                                </button>
                            </div>
                    </form>
                </div>
            )}

            {/* Edit User Form */}
            {editingUser && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h2>
                    <form onSubmit={handleUpdateUser}>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="edit-email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-50 focus:border-emerald-500 sm:text-sm bg-gray-100"
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-company" className="block text-sm font-medium text-gray-700">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    id="edit-company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-plan" className="block text-sm font-medium text-gray-700">
                                    Plan
                                </label>
                                <select
                                    id="edit-plan"
                                    name="plan"
                                    value={formData.plan}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-50 focus:border-emerald-500 sm:text-sm"
                                >
                                    <option value="starter">Starter</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeForms}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                            >
                                Update User
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {users.length} users found
                    </p>
                </div>
                <div className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <div key={user.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <span className="text-emerald-800 font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {user.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {user.company || "No company"}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                openEditForm(user);
                                                clearMessages();
                                            }}
                                            className="text-gray-400 hover:text-emerald-500"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDeleteUser(user.id);
                                                clearMessages();
                                            }}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}