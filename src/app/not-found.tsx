import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        404
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Page not found
                    </p>
                    <p className="mt-2 text-base text-gray-500">
                        Sorry, we couldn't find the page you're looking for.
                    </p>
                </div>

                <div className="mt-10 flex justify-center">
                    <div className="rounded-md shadow">
                        <Link
                            href="/"
                            className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Home className="h-5 w-5 mr-2" />
                            Go back home
                        </Link>
                    </div>
                    <div className="ml-3 rounded-md shadow">
                        <Link
                            href="/admin"
                            className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Admin Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}