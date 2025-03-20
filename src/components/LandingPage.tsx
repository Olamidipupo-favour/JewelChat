import React from 'react';
import { Diamond, Brain, ImageIcon, Settings, Sparkles, ArrowRight, Gem, TrendingUp, MessageSquare, Crown, Palette, PenTool as Tool, Factory, Globe2, Star, BookOpen, Search, Lightbulb, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] text-white relative">
      {!loading && (
        <div className="fixed top-4 right-4 z-50">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </Link>
          )}
        </div>
      )}
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Diamond className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              JewelChat
            </h1>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            World's First Multi-Model AI for Jewelry Design & Investment
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the future of jewelry with our revolutionary AI system that combines market analysis, 
            design generation, and expert consultation in one powerful platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors"
            >
              Start Creating with AI
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/deep-research"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors backdrop-blur-lg"
            >
              <Search className="w-5 h-5" />
              Deep Research
            </Link>
            <Link
              to="/develop-concepts"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors backdrop-blur-lg"
            >
              <Lightbulb className="w-5 h-5" />
              Develop Concepts
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
            <Brain className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Advanced LLM Technology</h3>
            <p className="text-gray-300">
              Powered by state-of-the-art language models for expert jewelry knowledge and market insights.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
            <ImageIcon className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Image Generation</h3>
            <p className="text-gray-300">
              Create stunning jewelry designs instantly with our advanced image generation model.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
            <Settings className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Product Development</h3>
            <p className="text-gray-300">
              Expert guidance on CAD/CAM, casting, and manufacturing processes.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
            <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
            <p className="text-gray-300">
              Real-time market insights and investment recommendations for gemstones.
            </p>
          </div>
        </div>
      </div>

      {/* AI Models Section */}
      <div className="bg-white/5 backdrop-blur-lg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Powered by 4 Specialized AI Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border border-purple-500/20 rounded-lg p-6">
              <Crown className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Roy-4</h3>
              <p className="text-gray-300">
                Our most advanced model for complex jewelry expertise and detailed analysis.
              </p>
            </div>
            <div className="border border-purple-500/20 rounded-lg p-6">
              <Palette className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Roy-E</h3>
              <p className="text-gray-300">
                Specialized in generating photorealistic jewelry designs and concepts.
              </p>
            </div>
            <div className="border border-purple-500/20 rounded-lg p-6">
              <MessageSquare className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Roy-3.5 Turbo</h3>
              <p className="text-gray-300">
                Fast responses for general jewelry queries and basic market information.
              </p>
            </div>
            <div className="border border-purple-500/20 rounded-lg p-6">
              <Brain className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Roy-R1</h3>
              <p className="text-gray-300">
                Deep reasoning for complex market analysis and investment strategies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
            <Tool className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Product Development</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <Factory className="w-5 h-5 text-purple-400" />
                CAD/CAM Expertise
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                Casting Techniques
              </li>
              <li className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Manufacturing Workflow
              </li>
            </ul>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
            <Gem className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Gemstone Library</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-purple-400" />
                Global Market Data
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Price Trends
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                Investment Insights
              </li>
            </ul>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
            <ImageIcon className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Design Generation</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                Custom Designs
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-400" />
                Style Variations
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Instant Visualization
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white/5 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Your Jewelry Journey with AI</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the future of jewelry design and investment. No login required - it's completely free!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors"
            >
              Launch JewelChat
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              to="/deep-research"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors backdrop-blur-lg"
            >
              <Search className="w-5 h-5" />
              Try Deep Research
            </Link>
            <Link
              to="/develop-concepts"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors backdrop-blur-lg"
            >
              <Lightbulb className="w-5 h-5" />
              Develop Concepts
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <Link
                to="/blog"
                className="bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                style={{ width: '250px', height: '54px', padding: '0 20px', justifyContent: 'center' }}
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-lg">Read Our Blog</span>
              </Link>
              <a 
                href="https://www.producthunt.com/posts/jewelchat?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jewelchat" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=875619&theme=light&t=1739429619708" 
                  alt="JewelChat - AI‑Powered Jewelry Design & Market Insights – Free to Use!" 
                  style={{ width: '250px', height: '54px' }} 
                  width="250" 
                  height="54" 
                />
              </a>
            </div>
            <div className="text-gray-400 text-center">
              <p>Developed by Sandeep Roy - Jewelry Technocrat & AI Engineer</p>
              <p className="mt-2">Contact: roy@jewelchat.in</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;