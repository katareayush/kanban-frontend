"use client";
import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface LoginData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

  const apiUrl = environment === 'local' 
  ? `http://localhost:5000/api/auth` 
  : process.env.NEXT_PUBLIC_AUTH_URL ;


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${apiUrl}/login`, formData);
      const token = response.data.token;

      if (token) {
        localStorage.setItem('token', token);
        router.push('/boards');
      } else {
        setError('Failed to get token.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen font-mono">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-300 w-[400px] m-4">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75d22e] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75d22e] focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-8 py-3 bg-[#75d22e] text-white font-bold rounded-full 
              hover:bg-[#64b524] transition-all 
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

            <div className="mt-4">
                <a href="/forgot-password" className="text-[#75d22e] hover:underline ">
                   Forgot Password?
                </a>
            </div>

          <div className='space-y-4'>
            <p className="text-sm  text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="text-[#75d22e] hover:underline">
                    Register
                </a>
            </p>

          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;