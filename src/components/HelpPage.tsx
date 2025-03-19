import React from 'react';
import { 
  Diamond, 
  Brain, 
  TrendingUp, 
  MessageSquare, 
  Star, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  MinusCircle, 
  BarChart3, 
  Gem, 
  Globe2, 
  Clock, 
  ChevronRight, 
  Settings, 
  PenTool as Tool, 
  Factory, 
  Shield, 
  Sparkles, 
  ArrowLeft,
  ImageIcon,
  Palette,
  Wand2,
  Mail,
  User,
  Crown
} from 'lucide-react';

interface HelpPageProps {
  onClose?: () => void;
  isDarkMode?: boolean;
}

const HelpPage: React.FC<HelpPageProps> = ({ onClose, isDarkMode = true }) => {
  const themeClasses = {
    section: isDarkMode ? 'bg-white/5' : 'bg-black/5',
    border: isDarkMode ? 'border-purple-500/20' : 'border-purple-300/20',
    highlight: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-100',
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Diamond className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold">JewelChat</h1>
              <p className="text-lg text-purple-400">World's First Multi-Model AI for Jewelry Design & Investment</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Chat
            </button>
          )}
        </div>

        {/* Developer Info */}
        <section className={`${themeClasses.section} rounded-lg p-6 border ${themeClasses.border}`}>
          <div className="flex items-start gap-4">
            <User className="w-12 h-12 text-purple-400" />
            <div>
              <h2 className="text-2xl font-semibold mb-2">Developed by Sandeep Roy</h2>
              <p className="mb-3">
                A distinguished jewelry technocrat and AI engineer with extensive experience in jewelry manufacturing and artificial intelligence. Combining decades of jewelry expertise with cutting-edge AI technology to revolutionize the jewelry industry.
              </p>
              <div className="flex items-center gap-4 mb-4">
                <a 
                  href="mailto:roy@jewelchat.in"
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  roy@jewelchat.in
                </a>
              </div>
              <div className={`${themeClasses.highlight} p-4 rounded-lg inline-block`}>
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">JewelChat is completely free to use - No login required!</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className={`${themeClasses.section} rounded-lg p-6`}>
          <h2 className="text-2xl font-semibold mb-4">Welcome to JewelChat</h2>
          <p className="mb-4">
            Experience the future of jewelry with our revolutionary AI system that combines market analysis, design generation, and expert consultation in one powerful platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className={`${themeClasses.highlight} p-4 rounded-lg`}>
              <Brain className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-semibold mb-1">Advanced LLM Technology</h3>
              <p className="text-sm">Intelligent jewelry expertise and market insights</p>
            </div>
            <div className={`${themeClasses.highlight} p-4 rounded-lg`}>
              <ImageIcon className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-semibold mb-1">AI Image Generation</h3>
              <p className="text-sm">Create stunning jewelry designs instantly</p>
            </div>
            <div className={`${themeClasses.highlight} p-4 rounded-lg`}>
              <Settings className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-semibold mb-1">Product Development</h3>
              <p className="text-sm">Expert guidance on jewelry manufacturing</p>
            </div>
            <div className={`${themeClasses.highlight} p-4 rounded-lg`}>
              <Sparkles className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-semibold mb-1">Multi-Model Intelligence</h3>
              <p className="text-sm">4 specialized AI models working together</p>
            </div>
          </div>
        </section>

        {/* AI Models */}
        <section className={`${themeClasses.section} rounded-lg p-6`}>
          <h2 className="text-2xl font-semibold mb-4">Specialized AI Models</h2>
          <div className="space-y-4">
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Roy-4</h3>
              </div>
              <p className="text-sm mb-2">Most capable model for jewelry expertise and complex reasoning</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Advanced market analysis</li>
                <li>Detailed gemological insights</li>
                <li>Complex investment recommendations</li>
              </ul>
            </div>
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Roy-E (Image Generation)</h3>
              </div>
              <p className="text-sm mb-2">Create stunning jewelry designs with AI</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Generate photorealistic jewelry images</li>
                <li>Visualize custom designs instantly</li>
                <li>Explore design variations</li>
                <li>Perfect for concept visualization</li>
              </ul>
              <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  Try: "Create a modern diamond engagement ring with a halo setting"
                </p>
              </div>
            </div>
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Roy-3.5 Turbo</h3>
              </div>
              <p className="text-sm mb-2">Faster responses for general jewelry questions</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Quick market updates</li>
                <li>Basic gemstone information</li>
                <li>General jewelry advice</li>
              </ul>
            </div>
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Roy-R1</h3>
              </div>
              <p className="text-sm mb-2">Advanced reasoning and detailed analysis</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Deep market analysis</li>
                <li>Complex trend predictions</li>
                <li>Investment strategy planning</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Product Development */}
        <section className={`${themeClasses.section} rounded-lg p-6`}>
          <h2 className="text-2xl font-semibold mb-4">Product Development</h2>
          <p className="mb-4">Access expert guidance on jewelry manufacturing and design processes.</p>
          <div className="space-y-4">
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Tool className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">CAD/CAM Techniques</h3>
              </div>
              <p className="text-sm">Expert guidance on computer-aided design and manufacturing for jewelry</p>
              <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                <p className="text-sm font-medium">Ask about:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>3D modeling best practices</li>
                  <li>CAM software recommendations</li>
                  <li>Production optimization</li>
                </ul>
              </div>
            </div>
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Gem className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Casting & Stone Setting</h3>
              </div>
              <p className="text-sm">Professional insights on casting techniques and stone setting methods</p>
              <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                <p className="text-sm font-medium">Learn about:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>Lost wax casting process</li>
                  <li>Different setting styles</li>
                  <li>Quality control measures</li>
                </ul>
              </div>
            </div>
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Factory className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Manufacturing Workflow</h3>
              </div>
              <p className="text-sm">Optimize your production process with AI-driven recommendations</p>
              <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                <p className="text-sm font-medium">Explore:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  <li>Production planning</li>
                  <li>Quality assurance</li>
                  <li>Workflow optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Gemstone Library */}
        <section className={`${themeClasses.section} rounded-lg p-6`}>
          <h2 className="text-2xl font-semibold mb-4">Gemstone Library</h2>
          <p className="mb-4">Access comprehensive information about precious gemstones with AI-driven market insights.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <h3 className="font-semibold mb-2">Market Analysis</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>Real-time price trends</span>
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Historical data analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-purple-400" />
                  <span>Global market insights</span>
                </li>
              </ul>
            </div>
            <div className={`border ${themeClasses.border} rounded-lg p-4`}>
              <h3 className="font-semibold mb-2">Investment Signals</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                  <span>BUY - Strong market potential</span>
                </div>
                <div className="flex items-center gap-2">
                  <MinusCircle className="w-4 h-4 text-yellow-400" />
                  <span>HOLD - Stable market conditions</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span>SELL - Market decline expected</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className={`${themeClasses.section} rounded-lg p-6`}>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-400 text-white text-sm font-semibold">1</div>
              <div>
                <h3 className="font-semibold">Choose Your AI Model</h3>
                <p className="text-sm">Select from Roy-4, Roy-E, Roy-3.5 Turbo, or Roy-R1 based on your needs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-400 text-white text-sm font-semibold">2</div>
              <div>
                <h3 className="font-semibold">Ask Your Question or Request a Design</h3>
                <p className="text-sm">Type your query about jewelry, request an image, or ask for market analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-400 text-white text-sm font-semibold">3</div>
              <div>
                <h3 className="font-semibold">Explore Features</h3>
                <p className="text-sm">Use the sidebar to access the Gemstone Library, Product Development tools, and Market Trends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-400 text-white text-sm font-semibold">4</div>
              <div>
                <h3 className="font-semibold">Get AI-Powered Insights</h3>
                <p className="text-sm">Receive detailed analysis, design visualizations, and expert recommendations</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;