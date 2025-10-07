'use client';

import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-gray-900">AuthFlow</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700 font-medium">Welcome, {user.name}!</span>
                  </div>
                  <button
                    onClick={logout}
                    className="btn-outline text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    href="/login"
                    className="btn-outline text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {user ? (
          /* Authenticated User Dashboard */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {user.name}!
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                You&apos;re successfully authenticated and ready to explore all features.
              </p>
            </div>

            <div className="card-elevated p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Information</h2>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg text-gray-900">{user.email}</p>
                    </div>
                  </div>
                </div>
                <p className="text-green-600 font-medium">
                   Your account is secure and verified
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Landing Page for Non-authenticated Users */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center py-20 animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Secure Authentication
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Made Simple
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience the future of authentication with our modern, secure, and user-friendly platform. 
                Built with cutting-edge technology to keep your data safe.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center"
                >
                  Get Started Free
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="btn-outline text-lg px-8 py-4"
                >
                  Login In
                </Link>
              </div>
            </div>

          </div>
        )}
      </main>

    </div>
  );
}
