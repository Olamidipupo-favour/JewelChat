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
  Settings as SettingsIcon, 
  Gem, 
  Factory,
  Copy,
  Check
} from 'lucide-react';
import OpenAI from 'openai';
import GemstoneDisplay from './components/GemstoneDisplay';
import HelpPage from './components/HelpPage';
import LandingPage from './components/LandingPage';
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import DashboardLayout from './components/admin/DashboardLayout'
import Overview from './components/admin/Overview'
import Users from './components/admin/Users'
import Payments from './components/admin/Payments'
import Settings from './components/admin/Settings'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import ForgotPassword from './components/auth/ForgotPassword'
import { Toaster } from 'react-hot-toast';

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
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" />
        <div className={`h-screen w-screen overflow-hidden ${themeClasses.background} ${themeClasses.text}`}>
          {/* ... rest of your existing JSX ... */}
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;