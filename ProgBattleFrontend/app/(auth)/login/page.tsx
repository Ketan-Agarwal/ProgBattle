'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, login } from '@/lib/api';
import Link from 'next/link';
import { useUser } from '@/Context/UserContext';
import { toast } from 'sonner';
export default function LoginPage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Simple email regex — good enough for most use cases
  const isValidEmail = (email: any) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\..[a-zA-Z]{2,}$/.test(email);
  };

  const handleLogin = async () => {
    setError(''); // Clear previous errors

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return; // Stop here, no network call
    }

    if (!password) {
      setError('Password cannot be empty.');
      return;
    }

    try {
      const data = await login(email, password);
      toast("Login successful!", {
        description: "Redirecting to profile page...",
      });
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      const profile = await getProfile(); // now fetch user data
      setUser(profile);
      // router.push('/profile');
    } catch (err: Object | any) {
        if (err.status === 401) {
      // setError('Unauthorized: Invalid email or password.');
    
    toast("Login failed", {
        description: err.response.data.detail || "Please check your details and try again.",
        action: {
          label: "Retry",
          onClick: () => handleLogin(),
        },
      });
    }
        else if (err.status === 500) {
            setError('Server error: Please try again later.');
        }
        else if (err.status === 403) {
          toast.error("Email Not Verified", {
            description: "Check your inbox or spam folder"
          })
        } else {
            setError('Login failed: ' + err.message);
        }
        }
  };
  useEffect(() => {
    if (user) {
      router.replace("/profile"); // or your desired route
    }
  }, [user, router]);


  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-10">ProgBattle</h1>
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-4 py-2 mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-4 py-2 mb-2"
      />
      <button onClick={handleLogin} className="bg-blue-600 text-white px-6 py-2 cursor-pointer rounded">
        Login
      </button>

      <div><p>Don't have an account? <Link className='text-blue-600 hover:underline' href="/register">Register</Link></p></div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}