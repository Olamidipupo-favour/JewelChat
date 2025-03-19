import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Settings, 
  Loader2, 
  Download, 
  Copy, 
  Check,
  RefreshCw,
  Sparkles,
  FileUp,
  X,
  Plus,
  Trash2,
  Brain,
  Diamond,
  Palette,
  Gem
} from 'lucide-react';
import OpenAI from 'openai';
import { generateAbsolutePrompt, validateAttributes } from '../utils/absolutePrompt';
import { analyzeDesignAttributes, generateVariationPrompts, validateVariationPrompts } from '../utils/advanceUtils';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
}

interface AttributeOption {
  id: string;
  label: string;
  value: string;
}

interface AttributeCategory {
  id: string;
  name: string;
  options: AttributeOption[];
}

const ATTRIBUTE_CATEGORIES: AttributeCategory[] = [
  {
    id: 'metal',
    name: 'Metal',
    options: [
      { id: 'gold', label: 'Yellow Gold', value: 'yellow gold' },
      { id: 'white-gold', label: 'White Gold', value: 'white gold' },
      { id: 'rose-gold', label: 'Rose Gold', value: 'rose gold' },
      { id: 'platinum', label: 'Platinum', value: 'platinum' },
      { id: 'silver', label: 'Sterling Silver', value: 'sterling silver' }
    ]
  },
  {
    id: 'stone',
    name: 'Stone',
    options: [
      { id: 'diamond', label: 'Diamond', value: 'diamond' },
      { id: 'emerald', label: 'Emerald', value: 'emerald' },
      { id: 'ruby', label: 'Ruby', value: 'ruby' },
      { id: 'sapphire', label: 'Sapphire', value: 'sapphire' },
      { id: 'pearl', label: 'Pearl', value: 'pearl' }
    ]
  },
  {
    id: 'setting',
    name: 'Setting',
    options: [
      { id: 'prong', label: 'Prong', value: 'prong setting' },
      { id: 'bezel', label: 'Bezel', value: 'bezel setting' },
      { id: 'channel', label: 'Channel', value: 'channel setting' },
      { id: 'tension', label: 'Tension', value: 'tension setting' },
      { id: 'pave', label: 'Pavé', value: 'pavé setting' }
    ]
  },
  {
    id: 'style',
    name: 'Style',
    options: [
      { id: 'modern', label: 'Modern', value: 'modern' },
      { id: 'vintage', label: 'Vintage', value: 'vintage-inspired' },
      { id: 'art-deco', label: 'Art Deco', value: 'art deco' },
      { id: 'minimalist', label: 'Minimalist', value: 'minimalist' },
      { id: 'nature', label: 'Nature-Inspired', value: 'nature-inspired' }
    ]
  }
];

const AdvancedVariation: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [numVariations, setNumVariations] = useState<2 | 4 | 6>(4);
  const [basePrompt, setBasePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    secondaryButton: isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    link: isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500',
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsAnalyzing(true);

      // Convert file to base64
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Analyze image with GPT-4 Turbo
      const attributes = await analyzeDesignAttributes(base64Data, null);
      
      // Update selected attributes based on analysis
      const newAttributes: Record<string, string[]> = {};
      Object.entries(attributes).forEach(([key, value]) => {
        if (key !== 'details') {
          newAttributes[key] = [value];
        }
      });
      setSelectedAttributes(newAttributes);
      
      // Set base prompt from analysis
      setBasePrompt(attributes.details.join(', '));

    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        await handleFileChange({ target: input } as any);
      }
    } else {
      setError('Please drop an image file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setBasePrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleAttribute = (categoryId: string, value: string) => {
    setSelectedAttributes(prev => {
      const currentValues = prev[categoryId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [categoryId]: newValues
      };
    });
  };

  const generateVariations = async () => {
    if (!basePrompt && !selectedFile) {
      setError('Please enter a description or upload an image');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImages([]);

    try {
      // Prepare attributes for variation generation
      const attributes = {
        metal: selectedAttributes.metal?.[0] || '',
        stone: selectedAttributes.stone?.[0] || '',
        setting: selectedAttributes.setting?.[0] || '',
        style: selectedAttributes.style?.[0] || '',
        details: [basePrompt]
      };

      // Generate variations using the updated utility
      const variations = await generateVariationPrompts(attributes, numVariations);
      
      // Validate and format the prompts
      const validatedPrompts = validateVariationPrompts(variations);

      // Generate images for each prompt
      const results: GeneratedImage[] = [];

      for (const promptText of validatedPrompts) {
        const response = await fetch(
          'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
            },
            body: JSON.stringify({
              text_prompts: [
                {
                  text: promptText,
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
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate image');
        }

        const data = await response.json();
        results.push({
          id: `variation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imageUrl: `data:image/png;base64,${data.artifacts[0].base64}`,
          prompt: promptText
        });
      }

      setGeneratedImages(results);
    } catch (err) {
      console.error('Error generating variations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate variations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `jewelry-variation-${index + 1}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    removeFile();
    setGeneratedImages([]);
    setError('');
    setSelectedAttributes({});
    setBasePrompt('');
  };

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/variations')}
            className={`flex items-center gap-2 ${themeClasses.link} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Variations
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={clearAll}
              className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
              title="Clear all"
            >
              <X className="w-5 h-5" />
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
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Settings className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Advanced Variation</h1>
          </div>
          <p className={`text-xl ${themeClasses.subtext} max-w-2xl mx-auto`}>
            Full control over attributes like metals, stones, and styles
          </p>
        </div>

        <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 mb-8`}>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Upload Reference Image
            </label>
            <div
              className={`h-[200px] ${themeClasses.input} border-2 border-dashed ${themeClasses.border} rounded-lg flex flex-col items-center justify-center cursor-pointer`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile && previewUrl ? (
                <div className="relative w-full h-full p-2">
                  <img 
                    src={previewUrl}
                    alt="Selected jewelry"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <FileUp className="w-8 h-8 text-purple-400 mb-2" />
                  <p className={`text-sm ${themeClasses.subtext}`}>
                    Drag & drop or click to upload
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {isAnalyzing ? (
            <div className={`${themeClasses.card} p-6 rounded-lg flex items-center gap-4 mb-6`}>
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              <div>
                <p className="font-medium mb-1">Analyzing your image</p>
                <p className={themeClasses.subtext}>
                  Detecting design elements and attributes...
                </p>
              </div>
            </div>
          ) : basePrompt && (
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">
                Base Description
              </label>
              <textarea
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                rows={3}
                className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-2`}
              />
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Attributes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ATTRIBUTE_CATEGORIES.map(category => (
                <div key={category.id}>
                  <h3 className="font-medium mb-2">{category.name}</h3>
                  <div className="space-y-2">
                    {category.options.map(option => (
                      <button
                        key={option.id}
                        onClick={() => toggleAttribute(category.id, option.value)}
                        className={`w-full px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedAttributes[category.id]?.includes(option.value)
                            ? themeClasses.button + ' text-white'
                            : themeClasses.secondaryButton
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Number of Variations
            </label>
            <div className="flex flex-wrap gap-4">
              {[2, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumVariations(num as 2 | 4 | 6)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    numVariations === num
                      ? themeClasses.button + ' text-white'
                      : themeClasses.secondaryButton
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={generateVariations}
            disabled={isGenerating || (!basePrompt && !selectedFile)}
            className={`${themeClasses.button} text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating {numVariations} Variations...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate {numVariations} Variations
              </>
            )}
          </button>
        </div>

        {generatedImages.length > 0 && (
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 border ${themeClasses.border}`}>
            <h2 className="text-2xl font-bold mb-6">Generated Variations</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((image, index) => (
                <div 
                  key={image.id} 
                  className={`${themeClasses.card} border ${themeClasses.border} rounded-lg overflow-hidden`}
                >
                  <div className="relative group">
                    <img 
                      src={image.imageUrl} 
                      alt={`Variation ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => downloadImage(image.imageUrl, index)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium mb-2">Variation {index + 1}</h3>
                    <button
                      onClick={() => handleCopyPrompt(image.id, image.prompt)}
                      className={`${themeClasses.secondaryButton} w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2`}
                    >
                      {copied === image.id ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={generateVariations}
                disabled={isGenerating}
                className={`${themeClasses.button} text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Regenerate Variations
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedVariation;