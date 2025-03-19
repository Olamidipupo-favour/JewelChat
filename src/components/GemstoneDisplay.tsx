import React, { useState, useEffect } from 'react';
import { 
  Diamond, 
  Gem, 
  MessageSquare, 
  TrendingUp, 
  Scale, 
  Star, 
  Globe2, 
  Banknote,
  ShieldCheck,
  Ruler,
  Palette,
  Eye,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  MinusCircle,
  BarChart3
} from 'lucide-react';
import OpenAI from 'openai';

interface MarketData {
  priceRange: string;
  marketTrend: string;
  rarity: string;
  investmentPotential: string;
  marketDemand: string;
  priceFactors: string[];
}

export interface Gemstone {
  name: string;
  description: string;
  properties: {
    hardness: string;
    color: string;
    clarity: string;
    origin: string[];
  };
  market: MarketData;
  treatments: string[];
  prompt: string;
}

export const GEMSTONES: Record<string, Gemstone> = {
  Diamond: {
    name: 'Diamond',
    description: 'The hardest natural substance on Earth, diamonds are formed deep within the Earth under extreme heat and pressure.',
    properties: {
      hardness: '10 on Mohs scale',
      color: 'Colorless to yellow, also available in fancy colors',
      clarity: 'Flawless to Included',
      origin: ['South Africa', 'Russia', 'Botswana', 'Canada']
    },
    market: {
      priceRange: 'High ($3,000 - $50,000+ per carat)',
      marketTrend: 'Stable with steady growth',
      rarity: 'Common for commercial quality, Rare for investment grade',
      investmentPotential: 'Excellent for rare fancy colors and high-quality stones',
      marketDemand: 'Consistently high, especially in bridal market',
      priceFactors: [
        'Cut quality significantly impacts value',
        'Color and clarity grades crucial',
        'Size follows exponential price increase',
        'Certification from reputable labs essential'
      ]
    },
    treatments: [
      'HPHT color enhancement',
      'Laser drilling for clarity',
      'Fracture filling'
    ],
    prompt: 'Tell me more about Diamond market trends and investment potential.'
  },
  Emerald: {
    name: 'Emerald',
    description: 'Known for its rich green color, emerald is one of the most valuable gemstones and a member of the beryl family.',
    properties: {
      hardness: '7.5-8 on Mohs scale',
      color: 'Deep green to light green',
      clarity: 'Usually included',
      origin: ['Colombia', 'Brazil', 'Zambia', 'Zimbabwe']
    },
    market: {
      priceRange: 'High ($500 - $20,000+ per carat)',
      marketTrend: 'Increasing, especially for Colombian stones',
      rarity: 'Rare in fine qualities',
      investmentPotential: 'Strong for top-quality stones',
      marketDemand: 'Growing in luxury market',
      priceFactors: [
        'Origin heavily influences price',
        'Color intensity is primary value factor',
        'Clarity less critical than in diamonds',
        'Treatment disclosure important'
      ]
    },
    treatments: [
      'Oil treatment common',
      'Resin filling',
      'Minor heating'
    ],
    prompt: 'Explain the market dynamics and value factors for Emeralds.'
  },
  Ruby: {
    name: 'Ruby',
    description: 'The king of precious stones, ruby is the red variety of the mineral corundum.',
    properties: {
      hardness: '9 on Mohs scale',
      color: 'Red to pinkish red',
      clarity: 'Transparent to opaque',
      origin: ['Myanmar', 'Thailand', 'Sri Lanka', 'Madagascar']
    },
    market: {
      priceRange: 'Very High ($1,000 - $100,000+ per carat)',
      marketTrend: 'Strong appreciation for fine qualities',
      rarity: 'Very rare in fine qualities',
      investmentPotential: 'Excellent for top-grade stones',
      marketDemand: 'High in luxury and investment markets',
      priceFactors: [
        'Origin crucial for value',
        'Color saturation primary factor',
        'Size rarity affects price exponentially',
        'Treatment status important'
      ]
    },
    treatments: [
      'Heat treatment common',
      'Lead glass filling for low grades',
      'Flux healing'
    ],
    prompt: 'What drives Ruby prices in today\'s market?'
  },
  Sapphire: {
    name: 'Sapphire',
    description: 'Part of the corundum family, sapphires come in every color except red.',
    properties: {
      hardness: '9 on Mohs scale',
      color: 'Blue to multi-color',
      clarity: 'Transparent to translucent',
      origin: ['Sri Lanka', 'Madagascar', 'Australia', 'Thailand']
    },
    market: {
      priceRange: 'Moderate to High ($500 - $50,000+ per carat)',
      marketTrend: 'Steady growth, especially for rare colors',
      rarity: 'Common in commercial grades, Rare in fine qualities',
      investmentPotential: 'Good for rare colors and origins',
      marketDemand: 'Strong in both jewelry and investment sectors',
      priceFactors: [
        'Color variety affects price significantly',
        'Origin important for certain colors',
        'Treatment status affects value',
        'Size/quality ratio crucial'
      ]
    },
    treatments: [
      'Heat treatment very common',
      'Diffusion treatment',
      'Beryllium treatment'
    ],
    prompt: 'Tell me about Sapphire market trends and investment value.'
  }
};

interface PriceTrend {
  quarterly: number;
  annual: number;
  fiveYear: number;
}

interface MarketAnalysis {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string;
  confidence: number;
  priceTrends: PriceTrend;
  alerts: {
    type: 'warning' | 'opportunity' | 'info';
    message: string;
  }[];
  keyFactors: string[];
}

interface GemstoneDisplayProps {
  selectedGem: string | null;
  isDarkMode: boolean;
  onAskLLM?: (prompt: string) => void;
}

export const GemstoneDisplay: React.FC<GemstoneDisplayProps> = ({ 
  selectedGem, 
  isDarkMode,
  onAskLLM 
}) => {
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<MarketAnalysis[]>([]);

  const getMarketAnalysis = async (gemName: string) => {
    try {
      setIsLoadingAnalysis(true);
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const currentDate = new Date().toISOString().split('T')[0];
      const prompt = `As a jewelry market analyst, provide a detailed market analysis for ${gemName} as of ${currentDate}. 
Consider current global economic conditions, supply chain status, and recent market events.

Format your response exactly like this example, but with appropriate values and ENSURE each analysis is unique and reflects current conditions:
{
  "recommendation": "BUY" | "SELL" | "HOLD",
  "confidence": <number between 60 and 95>,
  "reasoning": "<detailed market reasoning with specific current factors>",
  "priceTrends": {
    "quarterly": <number between -15 and 15>,
    "annual": <number between -30 and 30>,
    "fiveYear": <number between -50 and 100>
  },
  "alerts": [
    {
      "type": "opportunity" | "warning" | "info",
      "message": "<current market condition alert>"
    }
  ],
  "keyFactors": [
    "<specific current market factor>",
    "<specific current market factor>",
    "<specific current market factor>"
  ]
}

IMPORTANT: 
- Provide unique analysis each time
- Include current market conditions
- Vary confidence levels based on market clarity
- Generate different price trends within realistic ranges
- Create relevant alerts based on current conditions`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are a jewelry market expert AI. Provide accurate, data-driven market analysis in JSON format. Each analysis must be unique and reflect current market conditions. Never return the same values twice." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.9
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      
      setAnalysisHistory(prev => [...prev, analysis]);
      
      console.log('Previous analyses:', analysisHistory);
      console.log('New analysis:', analysis);

      setMarketAnalysis(analysis);
    } catch (error) {
      console.error('Error getting market analysis:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    if (selectedGem) {
      getMarketAnalysis(selectedGem);
      const interval = setInterval(() => {
        getMarketAnalysis(selectedGem);
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [selectedGem]);

  if (!selectedGem || !GEMSTONES[selectedGem]) {
    return null;
  }

  const gem = GEMSTONES[selectedGem];
  const bgClass = isDarkMode ? 'bg-white/5' : 'bg-black/5';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const headingClass = isDarkMode ? 'text-white' : 'text-gray-900';

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'HOLD': return 'text-yellow-400';
      default: return textClass;
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'BUY': return <ArrowUpRight className="w-5 h-5 text-green-400" />;
      case 'SELL': return <ArrowDownRight className="w-5 h-5 text-red-400" />;
      case 'HOLD': return <MinusCircle className="w-5 h-5 text-yellow-400" />;
      default: return null;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'opportunity': return <Star className="w-5 h-5 text-green-400" />;
      case 'info': return <MessageSquare className="w-5 h-5 text-blue-400" />;
      default: return null;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return isDarkMode 
          ? 'bg-red-400/10 border-red-400/20' 
          : 'bg-red-50 border-red-200';
      case 'opportunity':
        return isDarkMode 
          ? 'bg-green-400/10 border-green-400/20' 
          : 'bg-green-50 border-green-200';
      case 'info':
        return isDarkMode 
          ? 'bg-blue-400/10 border-blue-400/20' 
          : 'bg-blue-50 border-blue-200';
      default:
        return '';
    }
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return textClass;
  };

  return (
    <div className={`p-6 rounded-lg ${bgClass}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {selectedGem === 'Diamond' ? (
            <Diamond className="w-8 h-8 text-blue-400" />
          ) : (
            <Gem className="w-8 h-8 text-purple-400" />
          )}
          <h2 className={`text-3xl font-bold ${headingClass}`}>{gem.name}</h2>
        </div>
        <button
          onClick={() => onAskLLM?.(gem.prompt)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          Ask About Market
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${headingClass}`}>
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Market Overview
            </h3>
            <dl className="grid gap-3">
              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-green-400 mt-1" />
                <div>
                  <dt className="font-medium">Price Range</dt>
                  <dd className={textClass}>{gem.market.priceRange}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-blue-400 mt-1" />
                <div>
                  <dt className="font-medium">Market Trend</dt>
                  <dd className={textClass}>{gem.market.marketTrend}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-1" />
                <div>
                  <dt className="font-medium">Rarity</dt>
                  <dd className={textClass}>{gem.market.rarity}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div>
            <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${headingClass}`}>
              <ShieldCheck className="w-5 h-5 text-purple-400" />
              Technical Properties
            </h3>
            <dl className="grid gap-3">
              <div className="flex items-start gap-2">
                <Ruler className="w-4 h-4 text-purple-400 mt-1" />
                <div>
                  <dt className="font-medium">Hardness</dt>
                  <dd className={textClass}>{gem.properties.hardness}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Palette className="w-4 h-4 text-purple-400 mt-1" />
                <div>
                  <dt className="font-medium">Color</dt>
                  <dd className={textClass}>{gem.properties.color}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="w-4 h-4 text-purple-400 mt-1" />
                <div>
                  <dt className="font-medium">Clarity</dt>
                  <dd className={textClass}>{gem.properties.clarity}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${headingClass}`}>
              <BarChart3 className="w-5 h-5 text-purple-400" />
              AI Market Analysis
            </h3>
            {isLoadingAnalysis ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-700/20 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700/20 rounded w-1/2"></div>
              </div>
            ) : marketAnalysis ? (
              <div className="space-y-4">
                {marketAnalysis.alerts.map((alert, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border flex items-start gap-2 ${getAlertStyle(alert.type)}`}
                  >
                    {getAlertIcon(alert.type)}
                    <p className={`${textClass} text-sm`}>{alert.message}</p>
                  </div>
                ))}

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {getRecommendationIcon(marketAnalysis.recommendation)}
                    <span className={`font-bold ${getRecommendationColor(marketAnalysis.recommendation)}`}>
                      {marketAnalysis.recommendation}
                    </span>
                    <span className={`text-sm ${textClass}`}>
                      ({marketAnalysis.confidence}% confidence)
                    </span>
                  </div>
                  <p className={textClass}>{marketAnalysis.reasoning}</p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <h4 className="font-medium mb-3">Price Trends</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Quarterly</span>
                      <span className={getTrendColor(marketAnalysis.priceTrends.quarterly)}>
                        {marketAnalysis.priceTrends.quarterly > 0 ? '+' : ''}
                        {marketAnalysis.priceTrends.quarterly}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Annual</span>
                      <span className={getTrendColor(marketAnalysis.priceTrends.annual)}>
                        {marketAnalysis.priceTrends.annual > 0 ? '+' : ''}
                        {marketAnalysis.priceTrends.annual}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>5-Year</span>
                      <span className={getTrendColor(marketAnalysis.priceTrends.fiveYear)}>
                        {marketAnalysis.priceTrends.fiveYear > 0 ? '+' : ''}
                        {marketAnalysis.priceTrends.fiveYear}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Market Factors</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {marketAnalysis.keyFactors.map((factor, index) => (
                      <li key={index} className={textClass}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${headingClass}`}>
              <Globe2 className="w-5 h-5 text-purple-400" />
              Investment Insights
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Investment Potential</h4>
                <p className={textClass}>{gem.market.investmentPotential}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Market Demand</h4>
                <p className={textClass}>{gem.market.marketDemand}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Price Factors</h4>
                <ul className="list-disc list-inside space-y-1">
                  {gem.market.priceFactors.map((factor, index) => (
                    <li key={index} className={textClass}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemstoneDisplay;