import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Palette, 
  FileUp, 
  Settings,
  Diamond,
  Sparkles,
  Gem
} from 'lucide-react';

const VariationsLanding: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const themeClasses = {
    background: isDarkMode 
      ? 'bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] text-white' 
      : 'bg-gradient-to-br from-gray-100 to-white text-gray-900',
    card: isDarkMode ? 'bg-white/5' : 'bg-black/5',
    input: isDarkMode ? 'bg-white/10' : 'bg-black/10',
    border: isDarkMode ? 'border-purple-500/20' : 'border-purple-300/20',
    button: isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    link: isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500',
  };

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/develop-concepts')}
            className={`flex items-center gap-2 ${themeClasses.link} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Concept Tools
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${themeClasses.input} transition-colors`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-purple-400" />
            )}
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Palette className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Make Images with Variations</h1>
          </div>
          <p className={`text-xl ${themeClasses.subtext} max-w-2xl mx-auto`}>
            Choose your preferred method for creating jewelry design variations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button
            onClick={() => navigate('/image-variations')}
            className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-8 border ${themeClasses.border} flex flex-col items-center text-center transition-transform hover:scale-105`}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-600/20 mb-4">
              <Diamond className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Base Variation</h2>
            <p className={themeClasses.subtext}>
              Simple text-based variations with quick modifiers. Perfect for exploring basic design changes.
            </p>
          </button>

          <button
            onClick={() => navigate('/easy-variation')}
            className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-8 border ${themeClasses.border} flex flex-col items-center text-center transition-transform hover:scale-105`}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-600/20 mb-4">
              <FileUp className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Easy Variation</h2>
            <p className={themeClasses.subtext}>
              Upload an image or enter text, then choose how many variations to generate. AI analyzes and creates matching designs.
            </p>
          </button>

          <button
            onClick={() => navigate('/advanced-variation')}
            className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-8 border ${themeClasses.border} flex flex-col items-center text-center transition-transform hover:scale-105`}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-600/20 mb-4">
              <Settings className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Advanced Variation</h2>
            <p className={themeClasses.subtext}>
              Full control over attributes like metals, stones, and styles. Perfect for detailed design exploration.
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className={themeClasses.subtext}>
              Our AI analyzes designs to create meaningful variations that maintain the original concept's essence.
            </p>
          </div>
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <Gem className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Detailed Control</h3>
            <p className={themeClasses.subtext}>
              Choose the level of control you need, from simple modifications to precise attribute selection.
            </p>
          </div>
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <Diamond className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
            <p className={themeClasses.subtext}>
              Generate high-quality variations that maintain professional jewelry design standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariationsLanding;