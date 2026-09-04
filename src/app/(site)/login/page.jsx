"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageWrapper from '@/components/common/PageWrapper';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Local loading state for form
    const { login } = useAuth();
    const navigate = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true); // Set loading to true

        try {
            const success = await login(username, password); // Await the login call
            if (success) {
                router.push('/admin'); // Navigate to /admin on success
            } else {
                setError('Ungültige Anmeldedaten'); // Set error on login failure
                setPassword(''); // Clear password on failed login attempt
            }
        } catch (err) {
            setError('Ein Fehler ist aufgetreten'); // Generic error for network/server issues
            setPassword(''); // Clear password on any error
        } finally {
            setIsLoading(false); // Always set loading to false
        }
    };

    return (
        <PageWrapper title="Admin Login">
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Login Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-700 to-primary-800 rounded-full mb-4">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-heading font-bold text-primary-900 mb-2">
                                Mitarbeiter Login
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Melden Sie sich an, um den Admin-Bereich zu betreten
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username*/}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Benutzername
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Benutzername eingeben"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Passwort
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Passwort eingeben"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Anmelden
                            </button>
                        </form>

                        {/* Footer Note */}
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-500">
                                Nur für autorisierte Mitarbeiter
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Login;
