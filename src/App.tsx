import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Crown, 
  Sparkles, 
  Loader2, 
  Image as ImageIcon, 
  Brain, 
  ChevronDown, 
  Diamond, 
  Sparkle, 
  Star, 
  Sun, 
  Moon, 
  HelpCircle, 
  ArrowLeft, 
  Mail, 
  TrendingUp, 
  ChevronRight, 
  Wrench as Tool, 
  Settings, 
  Gem, 
  Factory,
  Copy,
  Check
} from 'lucide-react';
import OpenAI from 'openai';
import GemstoneDisplay from './components/GemstoneDisplay';
import HelpPage from './components/HelpPage';
import LandingPage from './components/LandingPage';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  images?: string[];
}

interface Model {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'reasoning';
  api: 'openai' | 'stability' | 'deepseek';
}

interface ProductDevTopic {
  id: string;
  title: string;
  icon: React.ReactNode;
  overview: string;
  prompt: string;
}

const MODELS: Model[] = [
  {
    id: 'gpt-4',
    name: 'Roy-4',
    description: 'Most capable model for jewelry expertise and complex reasoning',
    type: 'text',
    api: 'openai'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'Roy-3.5 Turbo',
    description: 'Faster responses for general jewelry questions',
    type: 'text',
    api: 'openai'
  },
  {
    id: 'deepseek-chat',
    name: 'Roy-R1',
    description: 'Advanced reasoning and detailed analysis',
    type: 'reasoning',
    api: 'deepseek'
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Roy-E',
    description: 'High-quality jewelry image generation',
    type: 'image',
    api: 'stability'
  }
];

const PRODUCT_DEV_TOPICS: ProductDevTopic[] = [
  {
    id: 'cad-cam',
    title: 'CAD/CAM Techniques',
    icon: <Tool className="w-5 h-5 text-purple-400" />,
    overview: `Computer-Aided Design (CAD) and Computer-Aided Manufacturing (CAM) are revolutionary technologies in jewelry production. They enable:

• Precise 3D modeling of jewelry designs
• Rapid prototyping capabilities
• Efficient design modifications
• Accurate cost estimation
• Streamlined production processes`,
    prompt: "What are the key considerations and best practices for CAD/CAM in jewelry design and manufacturing?"
  },
  {
    id: 'casting-setting',
    title: 'Casting & Stone Setting',
    icon: <Gem className="w-5 h-5 text-purple-400" />,
    overview: `Casting and stone setting are crucial processes that require expertise:

• Lost-wax casting techniques
• Metal flow and solidification
• Various setting styles (prong, bezel, pavé)
• Stone security and durability
• Quality control measures`,
    prompt: "Can you explain the different types of stone settings and their applications in jewelry manufacturing?"
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing Workflow',
    icon: <Factory className="w-5 h-5 text-purple-400" />,
    overview: `A well-organized manufacturing workflow ensures quality and efficiency:

• Design approval and validation
• Material sourcing and preparation
• Production scheduling
• Quality control checkpoints
• Final finishing and packaging`,
    prompt: "What are the essential steps and quality control points in a jewelry manufacturing workflow?"
  }
];

const SYSTEM_PROMPT = `You are JewelChat, the world's leading AI expert in jewelry, gemstones, and precious metals. Your responses should be:
1. Highly detailed and technically accurate
2. Structured in clear bullet points for easy reading
3. Include specific terminology related to jewelry and gemology
4. Based on expert knowledge of:
   - Gemstone properties and identification
   - Jewelry design principles
   - Metal properties and hallmarking
   - Market values and trends
   - Historical significance
   - Manufacturing techniques

Always maintain professionalism and provide reasoning for your recommendations.`;

const THINKING_ANECDOTES = [
  "Roy is polishing some thoughts... ✨",
  "Roy is examining this under the loupe... 🔍",
  "Roy is consulting the gem database... 💎",
  "Roy is calculating the perfect cut... ⚡",
  "Roy is analyzing market trends... 📊",
  "Roy is checking authenticity... 🏷️",
  "Roy is mixing metals... ⚗️",
  "Roy is setting stones... 💍"
];

const validateApiKey = (key: string | undefined, service: string): string => {
  if (!key || key === '' || key === 'your-openai-api-key-here' || key === 'your-stability-api-key-here' || key === 'your-deepseek-api-key-here') {
    throw new Error(`Please set up your ${service} API key in the .env file`);
  }
  return key;
};

async function generateImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    validateApiKey(apiKey, 'Stability AI');
    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: `Professional jewelry photography: ${prompt}`,
              weight: 1,
            },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate image');
    }

    const data = await response.json();
    return `data:image/png;base64,${data.artifacts[0].base64}`;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

async function generateDeepSeekResponse(prompt: string, apiKey: string): Promise<string> {
  try {
    validateApiKey(apiKey, 'DeepSeek');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get response from DeepSeek');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error with DeepSeek API:', error);
    throw error;
  }
}

async function generateOpenAIResponse(messages: Message[], model: string, apiKey: string): Promise<string> {
  try {
    validateApiKey(apiKey, 'OpenAI');
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(msg => ({
          role: msg.role as OpenAI.ChatCompletionMessageParam["role"],
          content: msg.content
        })),
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error('Error with OpenAI:', error);
    throw error;
  }
}

function App() {
  useEffect(() => {
    console.log('GA Debug:', {
      ga: window.ga,
      dataLayer: window.dataLayer
    });
  }, []);

  const [showLandingPage, setShowLandingPage] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    content: "Hello! I'm JewelChat, your expert jewelry advisor. Ask me anything about jewelry, from technical gemstone properties to design trends and market values.",
    role: 'assistant',
    timestamp: new Date()
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHelpPage, setShowHelpPage] = useState(false);
  const [isProductDevOpen, setIsProductDevOpen] = useState(false);
  const [isGemstoneLibraryOpen, setIsGemstoneLibraryOpen] = useState(false);
  const [selectedGem, setSelectedGem] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ProductDevTopic | null>(null);
  const [thinkingAnecdote, setThinkingAnecdote] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setThinkingAnecdote(THINKING_ANECDOTES[Math.floor(Math.random() * THINKING_ANECDOTES.length)]);

    try {
      const selectedModelData = MODELS.find(m => m.id === selectedModel)!;
      let response: string;
      let images: string[] | undefined;

      if (selectedModelData.type === 'image' || input.toLowerCase().includes('show me') || 
          input.toLowerCase().includes('generate image') || 
          input.toLowerCase().includes('create image')) {
        setIsGeneratingImage(true);
        const imageUrl = await generateImage(input, import.meta.env.VITE_STABILITY_API_KEY);
        if (imageUrl) {
          images = [imageUrl];
          response = "Here's the generated image based on your request:";
        } else {
          response = "I apologize, but I couldn't generate the image. Please try again.";
        }
        setIsGeneratingImage(false);
      } else if (selectedModelData.api === 'deepseek') {
        response = await generateDeepSeekResponse(input, import.meta.env.VITE_DEEPSEEK_API_KEY);
      } else {
        response = await generateOpenAIResponse([...messages, userMessage], selectedModel, import.meta.env.VITE_OPENAI_API_KEY);
      }

      const aiResponse: Message = {
        content: response,
        role: 'assistant',
        timestamp: new Date(),
        images
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        content: error instanceof Error ? error.message : "An unexpected error occurred. Please check your API configuration and try again.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setThinkingAnecdote('');
    }
  };

  const handleTopicClick = (topic: ProductDevTopic) => {
    setSelectedTopic(topic);
    setInput(topic.prompt);
  };

  const handleAskLLM = (prompt: string) => {
    setInput(prompt);
    document.querySelector('input[type="text"]')?.focus();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const resetChat = () => {
    setMessages([{
      content: "Hello! I'm JewelChat, your expert jewelry advisor. Ask me anything about jewelry, from technical gemstone properties to design trends and market values.",
      role: 'assistant',
      timestamp: new Date()
    }]);
    setInput('');
    setSelectedTopic(null);
    setSelectedGem(null);
    setIsProductDevOpen(false);
    setIsGemstoneLibraryOpen(false);
    setShowHelpPage(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleGetStarted = () => {
    setShowLandingPage(false);
  };

  const themeClasses = {
    background: isDarkMode 
      ? 'bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44]' 
      : 'bg-gradient-to-br from-gray-100 to-white',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    header: isDarkMode ? 'bg-black/20' : 'bg-white/20',
    sidebar: isDarkMode ? 'bg-black/20' : 'bg-white/20',
    chatArea: isDarkMode ? 'bg-black/10' : 'bg-white/10',
    input: isDarkMode ? 'bg-white/5' : 'bg-black/5',
    button: isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600',
    border: isDarkMode ? 'border-purple-900/20' : 'border-purple-300/20',
    modelSelector: isDarkMode ? 'bg-[#2d2d44]/95' : 'bg-white/95',
    modelHover: isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5',
  };

  if (showLandingPage) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className={`h-screen w-screen overflow-hidden ${themeClasses.background} ${themeClasses.text}`}>
      <div className={`border-b ${themeClasses.border} ${themeClasses.header} backdrop-blur-lg h-16 relative z-50`}>
        <div className="h-full max-w-full mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              JewelChat
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={resetChat}
              className={`p-2 rounded-lg ${themeClasses.input} backdrop-blur-lg transition-colors`}
              aria-label="New Chat"
              title="Start a new chat"
            >
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${themeClasses.input} backdrop-blur-lg transition-colors`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-purple-400" />
              )}
            </button>
            <div className="relative" ref={modelSelectorRef}>
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={`flex items-center space-x-2 ${themeClasses.input} px-4 py-2 rounded-lg ${themeClasses.modelHover} transition-colors backdrop-blur-lg`}
              >
                <Brain className="w-5 h-5 text-purple-400" />
                <span>{MODELS.find(m => m.id === selectedModel)?.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showModelSelector && (
                <div 
                  className={`fixed mt-2 w-72 ${themeClasses.modelSelector} backdrop-blur-lg rounded-lg shadow-xl border ${themeClasses.border}`}
                  style={{
                    right: '1rem',
                    top: '4rem',
                    zIndex: 1000
                  }}
                >
                  {MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelSelector(false);
                      }}
                      className={`w-full px-4 py-3 text-left ${themeClasses.modelHover} transition-colors ${
                        model.id === selectedModel ? (isDarkMode ? 'bg-white/10' : 'bg-black/10') : ''
                      } first:rounded-t-lg last:rounded-b-lg`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{model.name}</span>
                        {model.type === 'text' && <MessageSquare className="w-4 h-4 text-purple-400" />}
                        {model.type === 'image' && <ImageIcon className="w-4 h-4 text-purple-400" />}
                        {model.type === 'reasoning' && <Brain className="w-4 h-4 text-purple-400" />}
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {model.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)] w-full">
        <aside className={`w-80 ${themeClasses.sidebar} backdrop-blur-lg flex flex-col border-r ${themeClasses.border}`}>
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <button
                  onClick={() => setIsProductDevOpen(!isProductDevOpen)}
                  className="flex items-center justify-between w-full text-left hover:bg-white/5 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-semibold">Product Development</h2>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${isProductDevOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {isProductDevOpen && (
                  <div className="pl-4 space-y-2">
                    {PRODUCT_DEV_TOPICS.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => handleTopicClick(topic)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          selectedTopic?.id === topic.id 
                            ? isDarkMode ? 'bg-white/10' : 'bg-black/10'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {topic.icon}
                        <span>{topic.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setIsGemstoneLibraryOpen(!isGemstoneLibraryOpen)}
                  className="flex items-center justify-between w-full text-left hover:bg-white/5 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Gem className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-semibold">Gemstone Library</h2>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${isGemstoneLibraryOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {isGemstoneLibraryOpen && (
                  <div className="pl-4 space-y-2">
                    {[
                      { name: 'Diamond', icon: <Diamond className="w-4 h-4 text-blue-400" /> },
                      { name: 'Emerald', icon: <Gem className="w-4 h-4 text-green-400" /> },
                      { name: 'Ruby', icon: <Gem className="w-4 h-4 text-red-400" /> },
                      { name: 'Sapphire', icon: <Gem className="w-4 h-4 text-blue-500" /> }
                    ].map(gem => (
                      <button
                        key={gem.name}
                        onClick={() => {
                          setSelectedGem(gem.name);
                          setInput(`Tell me about ${gem.name} gemstones`);
                        }}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          selectedGem === gem.name 
                            ? isDarkMode ? 'bg-white/10' : 'bg-black/10'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {gem.icon}
                        <span>{gem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-semibold">Market Trends</h2>
                </div>
                <div className={`${themeClasses.input} rounded-lg p-4`}>
                  <h3 className="text-lg font-medium mb-3">Trending Designs</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Diamond className="w-4 h-4 text-purple-400" />
                      <span>Art Deco-inspired pieces</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkle className="w-4 h-4 text-purple-400" />
                      <span>Sustainable materials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-400" />
                      <span>Minimalist settings</span>
                    </li>
                  </ul>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800"
                  alt="Trending Jewelry"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className={`p-4 border-t ${themeClasses.border}`}>
            <button
              onClick={() => setShowHelpPage(true)}
              className={`w-full ${themeClasses.button} text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2`}
            >
              <HelpCircle className="w-5 h-5" />
              About JewelChat
            </button>
          </div>
        </aside>

        <main className={`flex-1 flex flex-col ${themeClasses.chatArea} backdrop-blur-lg`}>
          {showHelpPage ? (
            <HelpPage 
              onClose={() => setShowHelpPage(false)}
              isDarkMode={isDarkMode}
            />
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedGem && (
                  <GemstoneDisplay 
                    selectedGem={selectedGem} 
                    isDarkMode={isDarkMode}
                    onAskLLM={handleAskLLM}
                  />
                )}
                {selectedTopic && (
                  <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      {selectedTopic.icon}
                      <h2 className="text-2xl font-bold">{selectedTopic.title}</h2>
                    </div>
                    <div className="whitespace-pre-line">{selectedTopic.overview}</div>
                  </div>
                )}
                
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-4 ${
                        message.role === 'user'
                          ? 'bg-purple-600/80 backdrop-blur-lg'
                          : isDarkMode ? 'bg-white/10' : 'bg-black/10'
                      } backdrop-blur-lg relative group`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center mb-2">
                          <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                          <span className="font-semibold">JewelChat</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{message.content}</p>
                      {message.images && message.images.map((image, i) => (
                        <img
                          key={i}
                          src={image}
                          alt="Generated jewelry"
                          className="mt-4 rounded-lg w-full max-w-md mx-auto"
                        />
                      ))}
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy response"
                        >
                          <Copy className="w-4 h-4 text-purple-400 hover:text-purple-300" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className={`border-t ${themeClasses.border} ${themeClasses.header} p-4`}>
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about jewelry, gems, or request images..."
                    className={`flex-1 rounded-lg ${themeClasses.input} border ${themeClasses.border} px-4 py-2 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400`}
                    disabled={isLoading || isGeneratingImage}
                  />
                  <button
                    type="submit"
                    className={`${themeClasses.button} text-white rounded-lg px-6 py-2 transition-colors flex items-center ${
                      (isLoading || isGeneratingImage) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading || isGeneratingImage}
                  >
                    {isLoading || isGeneratingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        <span className="whitespace-nowrap">{thinkingAnecdote || 'Roy is thinking...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;