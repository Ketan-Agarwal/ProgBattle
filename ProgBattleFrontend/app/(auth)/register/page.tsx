'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';
import { toast } from "sonner";
import Link from 'next/link'; // ← Add this

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };

  const handleRegister = async () => {
    setError('');
  
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
  
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
  
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    try {
      const data = await register(email, password);
      toast.loading("Registering...");
      toast.success("Registration successful! Check your email to verify your account.");
      setRegistered(true);
    } catch (err: Object | any) {
      if (err.status === 500) {
        setError("Server error: Please try again later.");
      }
      toast.error("Registration failed: " + (err.response?.data?.detail || "Please check your details and try again."));
    }
  };
    return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-10">ProgBattle</h1>
      {registered ? (
  <div className="mt-6 text-center text-green-700">
    <p>Registration successful! Please check your inbox at <strong>{email}</strong> for a verification link.</p>
    <p>If you don’t see it, check your spam folder.</p>
    <Link href="/login" className="text-blue-600 underline mt-4 block">
      Go to Login
    </Link>
  </div>
) : (
  <>
          <h1 className="text-3xl font-bold mb-4">Register</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-4 py-2 mb-2 w-64"
      />
      <input
        type="password"
        placeholder="Password (min 6 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-4 py-2 mb-2 w-64"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border px-4 py-2 mb-4 w-64"
      />
      <button onClick={handleRegister} className="bg-green-600 cursor-pointer text-white px-6 py-2 rounded">
        Register
      </button>

      {/* 👇 Added login link */}
      <div className="mt-4 text-sm">
        <p>
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 underline">
            Login here
          </Link>
        </p>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

  </>
)}

    </div>
  );
}
