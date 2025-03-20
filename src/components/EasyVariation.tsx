import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  FileUp, 
  Loader2, 
  Download, 
  Copy, 
  Check,
  RefreshCw,
  Sparkles,
  ImageIcon,
  X,
  Trash2,
  Brain
} from 'lucide-react';
import OpenAI from 'openai';
import { refinePrompt, analyzeImage } from '../utils/PromptRefiner';
import { fileToBase64, generateStabilityAIPrompt } from '../utils/imageUtils';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
}

const EasyVariation: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numVariations, setNumVariations] = useState<2 | 4 | 6 | 8 | 10>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAttributes, setImageAttributes] = useState<{
    metal?: string;
    stone?: string;
    setting?: string;
    style?: string;
  } | null>(null);
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
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setQuery(''); // Clear text query when file is selected
        setIsAnalyzing(true);

        // Analyze the image immediately
        try {
          const base64 = await fileToBase64(file);
          const analysis = await analyzeImage(base64);
          setImagePrompt(analysis.description);
          setImageAttributes(analysis.attributes);
        } catch (error) {
          console.error('Error analyzing image:', error);
          setError('Failed to analyze image. Please try again.');
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setError('Please select an image file');
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setQuery(''); // Clear text query when file is selected
      setIsAnalyzing(true);

      // Analyze the dropped image
      try {
        const base64 = await fileToBase64(file);
        const analysis = await analyzeImage(base64);
        setImagePrompt(analysis.description);
        setImageAttributes(analysis.attributes);
      } catch (error) {
        console.error('Error analyzing image:', error);
        setError('Failed to analyze image. Please try again.');
      } finally {
        setIsAnalyzing(false);
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
    setImagePrompt('');
    setImageAttributes(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateVariations = async () => {
    if (!query.trim() && !imagePrompt) {
      setError('Please enter a description or upload an image');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImages([]);

    try {
      // Use the appropriate prompt source
      const basePrompt = imagePrompt || query;

      // Refine the prompt to maintain core design elements
      const refinedPrompt = await refinePrompt(basePrompt, {
        preserveElements: {
          metal: true,
          stone: true,
          setting: true,
          style: true
        },
        allowedChanges: {
          finish: true,
          texture: true,
          detailing: true,
          stoneShape: true
        }
      });

      // Generate the final prompt with attributes
      const finalPrompt = generateStabilityAIPrompt(refinedPrompt, imageAttributes);

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
                text: finalPrompt,
                weight: 1,
              },
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: numVariations,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate variations');
      }

      const data = await response.json();
      
      const variations = data.artifacts.map((artifact: any) => ({
        id: `variation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageUrl: `data:image/png;base64,${artifact.base64}`,
        prompt: refinedPrompt
      }));
      
      setGeneratedImages(variations);
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
    setQuery('');
    removeFile();
    setGeneratedImages([]);
    setError('');
    setImagePrompt('');
    setImageAttributes(null);
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
            <FileUp className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Easy Variation</h1>
          </div>
          <p className={`text-xl ${themeClasses.subtext} max-w-2xl mx-auto`}>
            Upload an image or enter text, then choose how many variations to generate
          </p>
        </div>

        <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-lg font-medium mb-2">
                Enter Description
              </label>
              <textarea
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  removeFile();
                }}
                placeholder="Describe the jewelry piece..."
                rows={4}
                disabled={!!selectedFile}
                className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-2 ${selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                Or Upload Image
              </label>
              <div
                className={`h-[160px] ${themeClasses.input} border-2 border-dashed ${themeClasses.border} rounded-lg flex flex-col items-center justify-center cursor-pointer ${query ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => !query && fileInputRef.current?.click()}
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
                  disabled={!!query}
                />
              </div>
            </div>
          </div>

          {selectedFile && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                {isAnalyzing ? 'Analyzing Image...' : 'Detected Attributes'}
              </h3>
              
              {isAnalyzing ? (
                <div className={`${themeClasses.card} p-6 rounded-lg flex items-center gap-4`}>
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  <div>
                    <p className="font-medium mb-1">Hold on! Roy is analyzing your image</p>
                    <p className={themeClasses.subtext}>
                      Detecting metals, stones, and design elements...
                    </p>
                  </div>
                </div>
              ) : imageAttributes ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(imageAttributes).map(([key, value]) => value && (
                    <div key={key} className={`${themeClasses.input} p-3 rounded-lg`}>
                      <div className="font-medium capitalize mb-1">{key}</div>
                      <div className={themeClasses.subtext}>{value}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Number of Variations
            </label>
            <div className="flex flex-wrap gap-4">
              {[2, 4, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumVariations(num as 2 | 4 | 6 | 8 | 10)}
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
            disabled={isGenerating || (!query && !selectedFile)}
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

        {imagePrompt && (
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 mb-8`}>
            <h2 className="text-xl font-semibold mb-2">Generated Prompt</h2>
            <p className={themeClasses.subtext}>{imagePrompt}</p>
          </div>
        )}

        {generatedImages.length > 0 && (
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 border ${themeClasses.border}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Generated Variations</h2>
              {selectedFile && previewUrl && (
                <div className="flex items-center gap-4">
                  <span className={themeClasses.subtext}>Original:</span>
                  <img 
                    src={previewUrl}
                    alt="Original jewelry"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            
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

export default EasyVariation;