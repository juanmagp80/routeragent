'use client'

import { Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        500
                    </h1>
                    <p className="mt-4 text-xl text-gray-500">
                        Something went wrong
                    </p>
                    <p className="mt-2 text-base text-gray-500">
                        We're sorry, but something went wrong on our end. Please try again later.
                    </p>
                </div>

                <div className="mt-10 flex justify-center">
                    <div className="rounded-md shadow">
                        <button
                            onClick={() => reset()}
                            className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                        >
                            <RefreshCw className="h-5 w-5 mr-2" />
                            Try again
                        </button>
                    </div>
                    <div className="ml-3 rounded-md shadow">
                        <Link
                            href="/"
                            className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-gray-50"
                        >
                            <Home className="h-5 w-5 mr-2" />
                            Go back home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}