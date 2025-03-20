import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Lightbulb, 
  Palette, 
  Images, 
  Diamond, 
  Sparkles, 
  Gem 
} from 'lucide-react';

const DevelopConceptsPage: React.FC = () => {
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
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 ${themeClasses.link} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to JewelChat
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
            <Diamond className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Develop Jewelry Concepts</h1>
          </div>
          <p className={`text-xl ${themeClasses.subtext} max-w-2xl mx-auto`}>
            Refine your jewelry design ideas with AI-powered brainstorming, concept visualization, and image generation. Click a tool below to start.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 border ${themeClasses.border} flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-105`}
            onClick={() => navigate('/concept-generator')}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-600/20 mb-4">
              <Lightbulb className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Jewelry Concept Generator</h2>
            <p className={`${themeClasses.subtext} mb-4`}>
              Generate detailed jewelry design concepts with AI assistance. Perfect for brainstorming new ideas.
            </p>
            <button 
              className={`${themeClasses.button} text-white px-6 py-2 rounded-lg mt-auto`}
              onClick={() => navigate('/concept-generator')}
            >
              Start Creating
            </button>
          </div>

          <div 
            className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 border ${themeClasses.border} flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-105`}
            onClick={() => navigate('/variations')}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-600/20 mb-4">
              <Palette className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Make Images with Variations</h2>
            <p className={`${themeClasses.subtext} mb-4`}>
              Create multiple variations of a jewelry design to explore different styles and details.
            </p>
            <button 
              className={`${themeClasses.button} text-white px-6 py-2 rounded-lg mt-auto`}
              onClick={() => navigate('/variations')}
            >
              Create Variations
            </button>
          </div>

          <div 
            className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 border ${themeClasses.border} flex flex-col items-center text-center cursor-pointer transition-transform hover:scale-105`}
            onClick={() => navigate('/image-collection')}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-600/20 mb-4">
              <Images className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Make Collection of Images</h2>
            <p className={`${themeClasses.subtext} mb-4`}>
              Generate a cohesive collection of jewelry designs around a central theme or concept.
            </p>
            <button 
              className={`${themeClasses.button} text-white px-6 py-2 rounded-lg mt-auto`}
              onClick={() => navigate('/image-collection')}
            >
              Create Collection
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Design</h3>
            <p className={themeClasses.subtext}>
              Leverage advanced AI models to generate unique jewelry concepts tailored to your specifications.
            </p>
          </div>
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <Gem className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Detailed Visualization</h3>
            <p className={themeClasses.subtext}>
              See your ideas come to life with high-quality visualizations that capture every detail of your design.
            </p>
          </div>
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <Diamond className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Collection Creation</h3>
            <p className={themeClasses.subtext}>
              Develop cohesive jewelry collections with consistent themes and complementary designs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopConceptsPage;