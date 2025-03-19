import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to JewelChat</h1>
          <p className="text-xl mb-8">Your expert AI assistant for all things jewelry</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/chat')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Chatting
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Expert Knowledge</h3>
            <p className="text-gray-300">
              Get detailed insights about gemstones, jewelry design, and manufacturing techniques from our AI expert.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Image Generation</h3>
            <p className="text-gray-300">
              Visualize jewelry designs and concepts with our advanced AI image generation capabilities.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Market Analysis</h3>
            <p className="text-gray-300">
              Stay informed about market trends, pricing, and industry developments in the jewelry sector.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 