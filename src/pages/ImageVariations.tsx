import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Palette, 
  Send, 
  Loader2, 
  Download, 
  Copy, 
  Check,
  RefreshCw,
  Trash2,
  Plus,
  Sparkles
} from 'lucide-react';

interface ImageVariation {
  id: string;
  imageUrl: string;
  prompt: string;
}

const ImageVariations: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [basePrompt, setBasePrompt] = useState('');
  const [variations, setVariations] = useState<string[]>(['', '', '']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedImages, setGeneratedImages] = useState<ImageVariation[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

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

  const handleVariationChange = (index: number, value: string) => {
    const newVariations = [...variations];
    newVariations[index] = value;
    setVariations(newVariations);
  };

  const addVariation = () => {
    setVariations([...variations, '']);
  };

  const removeVariation = (index: number) => {
    if (variations.length <= 1) return;
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };

  const generateImages = async () => {
    if (!basePrompt.trim()) {
      setError('Please enter a base prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImages([]);

    try {
      const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
      
      if (!apiKey || apiKey === 'your-stability-api-key-here') {
        throw new Error('Stability API key not configured. Please add your API key to the .env file.');
      }

      const results: ImageVariation[] = [];

      // Generate image for base prompt
      const basePromptWithPrefix = `Professional jewelry photography: ${basePrompt}, on white background, studio lighting, macro detail`;
      
      try {
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
                  text: basePromptWithPrefix,
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
          throw new Error(error.message || 'Failed to generate base image');
        }

        const data = await response.json();
        results.push({
          id: `base-${Date.now()}`,
          imageUrl: `data:image/png;base64,${data.artifacts[0].base64}`,
          prompt: basePrompt
        });
      } catch (error) {
        console.error('Error generating base image:', error);
        throw error;
      }

      // Generate images for variations
      for (let i = 0; i < variations.length; i++) {
        if (!variations[i].trim()) continue;
        
        const variationPrompt = `Professional jewelry photography: ${basePrompt} ${variations[i]}, on white background, studio lighting, macro detail`;
        
        try {
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
                    text: variationPrompt,
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
            console.error(`Failed to generate variation ${i+1}:`, error);
            continue; // Skip this variation but continue with others
          }

          const data = await response.json();
          results.push({
            id: `variation-${i}-${Date.now()}`,
            imageUrl: `data:image/png;base64,${data.artifacts[0].base64}`,
            prompt: `${basePrompt} ${variations[i]}`
          });
        } catch (error) {
          console.error(`Error generating variation ${i+1}:`, error);
          // Continue with other variations
        }
      }

      setGeneratedImages(results);
    } catch (err) {
      console.error('Error generating images:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating images');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `jewelry-${prompt.replace(/\s+/g, '-').substring(0, 20)}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Create multiple variations of a jewelry design by starting with a base concept and adding different modifiers.
          </p>
        </div>

        <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 mb-8`}>
          <div className="mb-6">
            <label htmlFor="basePrompt" className="block text-lg font-medium mb-2">
              Base Jewelry Concept
            </label>
            <textarea
              id="basePrompt"
              rows={2}
              className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400`}
              placeholder="E.g., gold pendant necklace with emerald center stone"
              value={basePrompt}
              onChange={(e) => setBasePrompt(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-lg font-medium">
                Variations
              </label>
              <button
                onClick={addVariation}
                className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
                title="Add variation"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {variations.map((variation, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    className={`flex-1 ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-2 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400`}
                    placeholder={`Variation ${index + 1} (e.g., with diamond accents)`}
                    value={variation}
                    onChange={(e) => handleVariationChange(index, e.target.value)}
                  />
                  <button
                    onClick={() => removeVariation(index)}
                    className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
                    title="Remove variation"
                    disabled={variations.length <= 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateImages}
            disabled={isGenerating || !basePrompt.trim()}
            className={`${themeClasses.button} text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Images...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Images
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}
        </div>

        {generatedImages.length > 0 && (
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 border ${themeClasses.border}`}>
            <h2 className="text-2xl font-bold mb-6">Generated Images</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((image) => (
                <div 
                  key={image.id} 
                  className={`${themeClasses.card} border ${themeClasses.border} rounded-lg overflow-hidden`}
                >
                  <img 
                    src={image.imageUrl} 
                    alt={image.prompt}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-4">
                    <p className={`${themeClasses.text} mb-3 text-sm`}>
                      {image.prompt}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyPrompt(image.id, image.prompt)}
                        className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors flex-1 flex items-center justify-center gap-1`}
                      >
                        {copied === image.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => downloadImage(image.imageUrl, image.prompt)}
                        className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors flex-1 flex items-center justify-center gap-1`}
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={generateImages}
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
                    Regenerate Images
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

export default ImageVariations;