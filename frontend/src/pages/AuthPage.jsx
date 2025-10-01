import { useState } from 'react';
import { supabase } from '../supabase/supabase';
import DriverMobileApp from './DriverMobileApp';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isLogin) {
                // 로그인
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                setMessage('로그인 성공!');
                console.log('로그인된 사용자:', data.user);

                // 로그인 성공 시 DriverMobileApp으로 이동
                setTimeout(() => {
                    setIsAuthenticated(true);
                }, 500);
            } else {
                // 회원가입
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) throw error;
                setMessage('회원가입 성공! 로그인해주세요.');
                setIsLogin(true);
            }
        } catch (error) {
            console.error('전체 에러:', error);
            setMessage(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    // 로그인 성공 시 DriverMobileApp 렌더링
    if (isAuthenticated) {
        return <DriverMobileApp />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {isLogin ? '로그인' : '회원가입'}
                </h2>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            이메일
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.includes('성공')
                            ? 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-800'
                            }`}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleAuth}
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '처리중...' : isLogin ? '로그인' : '회원가입'}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setMessage('');
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                    </button>
                </div>
            </div>
        </div>
    );
}