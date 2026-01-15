import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const [error, setError] = useState(null);

    const handleSuccess = (credentialResponse) => {
        const result = login(credentialResponse);
        if (!result.success) {
            setError(result.error);
        }
    };

    const handleError = () => {
        setError('Login failed. Please try again.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="w-full max-w-md">
                {/* Logo/Brand Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Release Planning Tracker
                    </h1>
                    <p className="text-gray-600">
                        Sign in with your authorized Google account
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Access Denied</p>
                                    <p className="text-sm text-red-600 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Google Login Button */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={handleError}
                                useOneTap={false}
                                theme="outline"
                                size="large"
                                text="signin_with"
                                shape="rectangular"
                            />
                        </div>

                        {/* Info Section */}
                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Secure Access</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Only authorized team members can access this application.
                                        Contact your administrator if you need access.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        Powered by Google OAuth 2.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
