import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { Stethoscope } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = () => {
    setUser({
      id: Math.random().toString(),
      name: 'Dr. Smith',
      role: 'doctor',
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Medical Conversation Platform</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full p-4 rounded-lg border-2 flex items-center gap-3 transition-colors border-blue-500 bg-blue-50 hover:bg-blue-100"
          >
            <Stethoscope className="w-6 h-6 text-blue-500" />
            <span className="font-medium">Continue as Doctor</span>
          </button>
        </div>
      </div>
    </div>
  );
}