'use client';
import { useState } from 'react';
import { useTheme } from './ThemeContext';
import { motion } from 'framer-motion';

// const fadeIn = {
//   initial: { opacity: 0, y: 20 },
//   animate: { opacity: 1, y: 0 },
//   transition: { duration: 0.5 }
// };

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Free Analysis",
    description: "Get unlimited free game reviews for your Chess.com games"
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Detailed Review",
    description: "Get complete move analysis without any Chess.com premium subscription"
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: "One Click",
    description: "Just paste your game URL and get instant free game review on Chess.com"
  }
];

export default function Home() {
  const [gameUrl, setGameUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse(null);
    setIsLoading(true);

    // Basic URL validation
    const chessComUrlPattern = /^https?:\/\/(www\.)?chess\.com\/game\/live\/[0-9]+$/;
    
    if (!chessComUrlPattern.test(gameUrl)) {
      setError('Please enter a valid Chess.com game URL');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis request failed');
      }

      
      setResponse(data.message);
      setShowSuccessPopup(true);
      // Clear the input field after success
      setGameUrl('');
      console.log('Frontend received response:', data);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to analyze game. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main 
      className={`min-h-screen relative ${
        isDarkMode ? 'bg-[#0F172A]' : 'bg-[#DCE1E8]'
      } transition-all duration-500`}
      style={{
        backgroundImage: `
          linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)),
          radial-gradient(${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'} 1px, 
          transparent 1px)
        `,
        backgroundSize: '100% 100%, 24px 24px',
        backgroundPosition: '0 0'
      }}
    >
      
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] blur-[120px] rounded-full 
          bg-gradient-to-r from-purple-500/5 to-pink-500/5 -top-48 -left-48 animate-blob" />
        <div className="absolute w-[400px] h-[400px] blur-[120px] rounded-full 
          bg-gradient-to-r from-blue-500/5 to-green-500/5 top-1/2 right-0 animate-blob animation-delay-2000" />
      </div>

      {/* Theme Toggle */}
      <motion.div 
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={toggleTheme}
          className={`p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 
            ${isDarkMode 
              ? 'bg-[#1E293B] hover:bg-[#334155] text-yellow-400' 
              : 'bg-[#FFFFFF] hover:bg-[#F0EFE9] text-gray-700'
            } hover:scale-110`}
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
              />
            </svg>
          )}
        </button>
      </motion.div>

      {/* Content Container */}
      <div className="relative">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center space-y-4 sm:space-y-8">
            <motion.h1 
              className={`text-3xl sm:text-5xl md:text-7xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } tracking-tight leading-tight`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Free Chess.com
              <span className="block sm:inline bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                {" "}Game Review{" "}
              </span>
              Tool
            </motion.h1>
            <motion.p 
              className={`text-lg sm:text-xl md:text-2xl ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              } max-w-3xl mx-auto px-4`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Get free detailed analysis for your Chess.com games without any premium subscription. Just paste your game URL below.
            </motion.p>
          </div>

          {/* Form Container - Better mobile layout */}
          <motion.div 
            className="mt-8 sm:mt-12 max-w-xl mx-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className={`rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-[#2D3747]/80 border border-gray-700' 
                : 'bg-white/30 border border-gray-300'
            }`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label 
                    htmlFor="gameUrl" 
                    className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Paste your Chess.com game URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="gameUrl"
                      value={gameUrl}
                      onChange={(e) => setGameUrl(e.target.value)}
                      placeholder="https://chess.com/game/live/..."
                      className={`w-full px-4 py-3 rounded-lg transition-all duration-300 pl-10 ${
                        isDarkMode 
                          ? 'bg-[#1E293B]/50 border-gray-700 text-white placeholder-gray-500' 
                          : 'bg-[#F3F4F6]/80 border-[#DDE1E6] text-[#353A40] placeholder-[#8D95A1]'
                      } border focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
                      disabled={isLoading}
                    />
                    <svg 
                      className={`absolute left-3 top-3.5 w-5 h-5 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Loading message right after input */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center ${
                      isDarkMode 
                        ? 'text-gray-300' 
                        : 'text-gray-600'
                    }`}
                  >
                    <p className="text-sm">
                      This process may take up to 30 seconds. We&apos;re reviewing your game...
                    </p>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 
                    ${isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    } text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Please wait, analyzing game...</span>
                    </div>
                  ) : 'Analyze Game'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid - Responsive grid layout */}
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`rounded-xl p-6 backdrop-blur-xl ${
                  isDarkMode 
                    ? 'bg-[#2D3747]/50 border border-gray-700' 
                    : 'bg-white/30 shadow-lg border border-gray-300'
                } hover:scale-105 transition-all duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`flex justify-center md:justify-start ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                } transition-colors duration-300`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 text-center md:text-left ${
                  isDarkMode ? 'text-white' : 'text-[#353A40]'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-base text-center md:text-left ${
                  isDarkMode ? 'text-gray-400' : 'text-[#5A6572]'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Add this after the form to show the response */}
        {response && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-green-800/50 text-green-100' 
                : 'bg-green-100 text-green-800'
            }`}
          >
            {response}
          </motion.div>
        )}
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
        >
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowSuccessPopup(false)} 
          />
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className={`relative rounded-xl p-8 shadow-2xl max-w-md w-full ${
              isDarkMode 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-gray-900'
            }`}
          >
            {/* Success Icon Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-100"
            >
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-12 h-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-center mb-2">Review Complete!</h3>
              <p className="text-center mb-6 text-sm opacity-90">
                Your game has been successfully analyzed. Please refresh your game page to see the analysis.
              </p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 
                  text-white font-medium hover:from-purple-700 hover:to-pink-700 
                  transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
