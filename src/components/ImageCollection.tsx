import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Images, 
  Loader2, 
  Download, 
  Copy, 
  Check,
  RefreshCw,
  Sparkles,
  Save
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CollectionImage {
  id: string;
  imageUrl: string;
  title: string;
}

interface CollectionSettings {
  theme: string;
  style: string;
  pieces: string[];
  materials: string[];
  details: string;
}

const ImageCollection: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [settings, setSettings] = useState<CollectionSettings>({
    theme: '',
    style: '',
    pieces: ['Necklace', 'Earrings', 'Bracelet', 'Ring'],
    materials: ['Gold', 'Silver', 'Diamonds'],
    details: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedImages, setGeneratedImages] = useState<CollectionImage[]>([]);
  const [collectionName, setCollectionName] = useState('');
  const [copied, setCopied] = useState(false);
  const collectionRef = useRef<HTMLDivElement>(null);

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

  const handlePieceChange = (index: number, value: string) => {
    const newPieces = [...settings.pieces];
    newPieces[index] = value;
    setSettings({ ...settings, pieces: newPieces });
  };

  const handleMaterialChange = (index: number, value: string) => {
    const newMaterials = [...settings.materials];
    newMaterials[index] = value;
    setSettings({ ...settings, materials: newMaterials });
  };

  const addPiece = () => {
    setSettings({ ...settings, pieces: [...settings.pieces, ''] });
  };

  const removePiece = (index: number) => {
    if (settings.pieces.length <= 1) return;
    const newPieces = settings.pieces.filter((_, i) => i !== index);
    setSettings({ ...settings, pieces: newPieces });
  };

  const addMaterial = () => {
    setSettings({ ...settings, materials: [...settings.materials, ''] });
  };

  const removeMaterial = (index: number) => {
    if (settings.materials.length <= 1) return;
    const newMaterials = settings.materials.filter((_, i) => i !== index);
    setSettings({ ...settings, materials: newMaterials });
  };

  const generateCollection = async () => {
    if (!settings.theme.trim()) {
      setError('Please enter a collection theme');
      return;
    }

    if (!settings.style.trim()) {
      setError('Please enter a design style');
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

      // Generate collection name if not provided
      if (!collectionName) {
        setCollectionName(`${settings.theme.split(' ')[0]} ${settings.style.split(' ')[0]} Collection`);
      }

      const results: CollectionImage[] = [];

      // Generate images for each piece
      for (let i = 0; i < settings.pieces.length; i++) {
        if (!settings.pieces[i].trim()) continue;
        
        const materials = settings.materials.filter(m => m.trim()).join(' and ');
        const prompt = `Professional jewelry photography: ${settings.pieces[i]} in ${settings.style} style, made with ${materials}, ${settings.theme} themed, ${settings.details}, on white background, studio lighting, macro detail`;
        
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
                    text: prompt,
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
            console.error(`Failed to generate image for ${settings.pieces[i]}:`, error);
            continue; // Skip this piece but continue with others
          }

          const data = await response.json();
          results.push({
            id: `piece-${i}-${Date.now()}`,
            imageUrl: `data:image/png;base64,${data.artifacts[0].base64}`,
            title: settings.pieces[i]
          });
        } catch (error) {
          console.error(`Error generating image for ${settings.pieces[i]}:`, error);
          // Continue with other pieces
        }
      }

      setGeneratedImages(results);
    } catch (err) {
      console.error('Error generating collection:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the collection');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCollection = () => {
    if (generatedImages.length === 0) return;
    
    const collectionText = `
# ${collectionName || 'Jewelry Collection'}

## Theme
${settings.theme}

## Style
${settings.style}

## Pieces
${settings.pieces.map(piece => `- ${piece}`).join('\n')}

## Materials
${settings.materials.map(material => `- ${material}`).join('\n')}

## Additional Details
${settings.details}
    `;
    
    navigator.clipboard.writeText(collectionText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCollectionPDF = async () => {
    if (!collectionRef.current || generatedImages.length === 0) return;
    
    try {
      setIsGenerating(true);
      
      const canvas = await html2canvas(collectionRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${collectionName.replace(/\s+/g, '_').toLowerCase()}_collection.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${collectionName.replace(/\s+/g, '-')}-${title.replace(/\s+/g, '-')}-${Date.now()}.png`;
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
            <Images className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Make Collection of Images</h1>
          </div>
          <p className={`text-xl ${themeClasses.subtext} max-w-2xl mx-auto`}>
            Create a cohesive collection of jewelry pieces with consistent theme, style, and materials.
          </p>
        </div>

        <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 mb-8`}>
          <div className="mb-6">
            <label htmlFor="collectionName" className="block text-lg font-medium mb-2">
              Collection Name (Optional)
            </label>
            <input
              type="text"
              id="collectionName"
              className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400`}
              placeholder="E.g., Celestial Dreams Collection"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="theme" className="block text-lg font-medium mb-2">
                Collection Theme
              </label>
              <input
                type="text"
                id="theme"
                className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400`}
                placeholder="E.g., ocean-inspired, floral, geometric"
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="style" className="block text-lg font-medium mb-2">
                Design Style
              </label>
              <input
                type="text"
                id="style"
                className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400`}
                placeholder="E.g., minimalist, art deco, vintage"
                value={settings.style}
                onChange={(e) => setSettings({ ...settings, style: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-medium">
                  Pieces in Collection
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={addPiece}
                    className={`${themeClasses.secondaryButton} p-1 rounded-lg transition-colors text-sm`}
                  >
                    + Add
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {settings.pieces.map((piece, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 ${themeClasses.input} border ${themeClasses.border} rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400 text-sm`}
                      placeholder="E.g., Necklace, Earrings, Ring"
                      value={piece}
                      onChange={(e) => handlePieceChange(index, e.target.value)}
                    />
                    <button
                      onClick={() => removePiece(index)}
                      className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
                      disabled={settings.pieces.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-medium">
                  Materials
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={addMaterial}
                    className={`${themeClasses.secondaryButton} p-1 rounded-lg transition-colors text-sm`}
                  >
                    + Add
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {settings.materials.map((material, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 ${themeClasses.input} border ${themeClasses.border} rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400 text-sm`}
                      placeholder="E.g., Gold, Silver, Platinum"
                      value={material}
                      onChange={(e) => handleMaterialChange(index, e.target.value)}
                    />
                    <button
                      onClick={() => removeMaterial(index)}
                      className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
                      disabled={settings.materials.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="details" className="block text-lg font-medium mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              id="details"
              rows={3}
              className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400`}
              placeholder="E.g., with pearl accents, featuring intricate filigree work, with emerald center stones"
              value={settings.details}
              onChange={(e) => setSettings({ ...settings, details: e.target.value })}
            />
          </div>

          <button
            onClick={generateCollection}
            disabled={isGenerating || !settings.theme.trim() || !settings.style.trim()}
            className={`${themeClasses.button} text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Collection...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Collection
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
          <div 
            ref={collectionRef}
            className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 border ${themeClasses.border}`}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">{collectionName || 'Jewelry Collection'}</h2>
              <p className={`${themeClasses.subtext} text-lg`}>
                {settings.theme} theme in {settings.style} style
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((image) => (
                <div 
                  key={image.id} 
                  className={`${themeClasses.card} border ${themeClasses.border} rounded-lg overflow-hidden`}
                >
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-3">{image.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadImage(image.imageUrl, image.title)}
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

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleCopyCollection}
                className={`${themeClasses.secondaryButton} px-4 py-2 rounded-lg transition-colors flex items-center gap-2`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Details
                  </>
                )}
              </button>
              
              <button
                onClick={downloadCollectionPDF}
                disabled={isGenerating}
                className={`${themeClasses.secondaryButton} px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save as PDF
                  </>
                )}
              </button>
              
              <button
                onClick={generateCollection}
                disabled={isGenerating}
                className={`${themeClasses.button} text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Regenerate Collection
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

export default ImageCollection;