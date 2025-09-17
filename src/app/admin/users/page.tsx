"use client";

export default function UsersPage() {
    const users = [
        {
            id: 1,
            name: "John Developer",
            email: "john@example.com",
            role: "Admin",
            status: "Active",
            last_seen: "2 hours ago",
            avatar: "https://ui-avatars.com/api/?name=John+Developer"
        },
        {
            id: 2,
            name: "Sarah Manager",
            email: "sarah@example.com",
            role: "Manager",
            status: "Active",
            last_seen: "5 hours ago",
            avatar: "https://ui-avatars.com/api/?name=Sarah+Manager"
        },
        {
            id: 3,
            name: "Mike Analyst",
            email: "mike@example.com",
            role: "User",
            status: "Inactive",
            last_seen: "3 days ago",
            avatar: "https://ui-avatars.com/api/?name=Mike+Analyst"
        }
    ];

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage users and their permissions
                    </p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                    Add User
                </button>
            </div>

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
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-10 w-10 rounded-full"
                                    />
                                    <div className="ml-4">
                                        <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "Active"
                                                ? "bg-emerald-100 text-emerald-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}>
                                            {user.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {user.role}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {user.last_seen}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="text-gray-400 hover:text-emerald-500">
                                            Edit
                                        </button>
                                        <button className="text-gray-400 hover:text-red-500">
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