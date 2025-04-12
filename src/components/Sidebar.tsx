'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import OpenAI from 'openai';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Initialize OpenAI client with error handling
  const getOpenAIClient = () => {
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('Deepseek API key is not configured');
      toast.error('API key is not configured. Please check your environment variables.');
      return null;
    }

    return new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  };

  const openai = getOpenAIClient();

  // Add debug logging for API key
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    console.log('API Key check:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 3) || 'No key'
    });
  }, []);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Check authentication first
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setShowLoginModal(true);
        return;
      }

      if (!openai) {
        toast.error('API client not initialized. Please check your API key configuration.');
        return;
      }

      setIsLoading(true);
      const userMessage = input.trim();
      setInput('');
      
      // Add user message to chat
      setMessages(prev => [
        ...prev,
        {
          text: userMessage,
          isUser: true,
          timestamp: new Date()
        }
      ]);

      try {
        // Call Deepseek API using OpenAI SDK
        const completion = await openai.chat.completions.create({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: userMessage }
          ],
          model: "deepseek-chat",
        });

        if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
          throw new Error('Invalid response format from AI');
        }

        const aiResponse = completion.choices[0].message.content || 'No response from AI';
        
        // Add AI response to chat
        setMessages(prev => [
          ...prev,
          {
            text: aiResponse,
            isUser: false,
            timestamp: new Date()
          }
        ]);
      } catch (error) {
        console.error('API Error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to get response from AI');
        // Restore the input if there's an error
        setInput(userMessage);
      }
    } catch (error) {
      console.error('Auth Error:', error);
      toast.error('Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Login error:', error);
      toast.error('Failed to initiate login');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        toast.error('Failed to logout. Please try again.');
        return;
      }

      console.log('Sign out successful');
      setIsLoggedIn(false);
      setMessages([]); // Clear chat messages on logout
      router.push('/');
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast.error('An unexpected error occurred during logout');
    }
  };

  return (
    <>
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to send messages in the chat.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 flex flex-col"
           style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Chat</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {!isLoggedIn && (
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">Please log in to send messages</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input and Auth Section */}
          <div className="mt-auto">
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLoggedIn ? "Type your message..." : "Please log in to send messages"}
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  disabled={isLoading || !isLoggedIn}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || !isLoggedIn}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Send
                </button>
              </div>
            </form>

            {/* Auth Button */}
            <div>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
} 