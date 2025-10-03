import AdminHeader from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import React from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors">
            <Sidebar />

            <div className="md:pl-64 flex flex-col flex-1">
                <AdminHeader />

                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}