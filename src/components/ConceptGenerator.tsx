import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OpenAI from 'openai';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Lightbulb, 
  Send, 
  Loader2, 
  Sparkles,
  Diamond,
  Palette,
  Download,
  Copy,
  Check,
  RefreshCw,
  ImageIcon,
  Wand2,
  X,
  Grid2x2,
  Edit,
} from 'lucide-react';

interface Concept {
  id: string;
  name: string;
  description: string;
  trends: string[];
  materials: string[];
  designElements: string[];
  imagePrompt?: string;
  imageUrl?: string;
  variations?: string[];
}

const ConceptGenerator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [concepts, setConcepts] = useState<Concept[]>(location.state?.concepts || []);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [numConcepts, setNumConcepts] = useState<5 | 10 | 15>(15);
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<string | null>(null);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState<string | null>(null);
  const conceptsRef = useRef<HTMLDivElement>(null);

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
    error: isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600'
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      generateConceptsWithCount(numConcepts);
    }
  };

  const generateConceptsWithCount = (count: 5 | 10 | 15) => {
    setNumConcepts(count);
    if (!prompt.trim()) {
      setError('Please enter a jewelry design idea');
      return;
    }

    setIsGenerating(true);
    setError('');
    setConcepts([]);
    setCurrentStep(1);
    setLoadingMessage(`Analyzing your design idea...`);

    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    setCurrentStep(2);
    setLoadingMessage(`Generating ${count} unique concepts...`);

    openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert jewelry designer with deep knowledge of trends, aesthetics, and creative design. Generate EXACTLY ${count} unique jewelry design concepts based on the user's idea. Each concept should be innovative and distinct, focusing purely on design aesthetics (no manufacturing details).

For each concept, provide:
1. A creative, marketable name
2. A detailed design description focusing on aesthetics and vision
3. Current design trends that influenced the concept
4. Suggested materials that complement the design
5. Key design elements (purely aesthetic features, no manufacturing details)

Format the response as a JSON array with EXACTLY ${count} objects, each containing:
{
  "name": "Creative concept name",
  "description": "Aesthetic vision and design details",
  "trends": ["trend1", "trend2", "trend3"],
  "materials": ["material1", "material2", "material3"],
  "designElements": ["element1", "element2", "element3"]
}

IMPORTANT: Return EXACTLY ${count} concepts, no more and no less.
Be creative and ensure each concept is unique and marketable.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 2000,
    })
    .then(completion => {
      const response = completion.choices[0].message.content;
      if (!response) throw new Error('Failed to generate concepts');

      const generatedConcepts = JSON.parse(response);
      
      // Validate the number of concepts
      if (generatedConcepts.length !== count) {
        throw new Error(`Expected ${count} concepts but received ${generatedConcepts.length}`);
      }

      // Add IDs to concepts
      const conceptsWithIds = generatedConcepts.map((concept: any) => ({
        ...concept,
        id: `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      setConcepts(conceptsWithIds);
    })
    .catch(err => {
      console.error('Error generating concepts:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate concepts');
    })
    .finally(() => {
      setIsGenerating(false);
      setLoadingMessage('');
      setCurrentStep(1);
    });
  };

  const enhanceConcept = async (conceptId: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) return;

    setIsGenerating(true);
    setLoadingMessage('Enhancing concept...');

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert jewelry designer. Enhance the following jewelry concept with more creative details and generate a detailed prompt for AI image generation. The image prompt should help create a realistic jewelry visualization.

Current concept:
Name: ${concept.name}
Description: ${concept.description}
Trends: ${concept.trends.join(', ')}
Materials: ${concept.materials.join(', ')}
Design Elements: ${concept.designElements.join(', ')}

Provide the enhanced concept in JSON format:
{
  "description": "Enhanced description with more creative details",
  "trends": ["Additional trend insights"],
  "materials": ["Refined material suggestions"],
  "designElements": ["Enhanced design elements"],
  "imagePrompt": "Detailed prompt for generating a realistic jewelry visualization"
}`
          }
        ],
        temperature: 0.8
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error('Failed to enhance concept');

      const enhancedDetails = JSON.parse(response);
      
      setConcepts(prev => prev.map(c => 
        c.id === conceptId 
          ? { 
              ...c, 
              ...enhancedDetails,
              imagePrompt: enhancedDetails.imagePrompt
            }
          : c
      ));
    } catch (err) {
      console.error('Error enhancing concept:', err);
      setError(err instanceof Error ? err.message : 'Failed to enhance concept');
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  const generateConceptImage = async (conceptId: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept || !concept.imagePrompt) return;

    setIsGeneratingImage(conceptId);

    try {
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
                text: `Professional jewelry photography: ${concept.imagePrompt}, on white background, studio lighting, macro detail`,
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
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      setConcepts(prev => prev.map(c => 
        c.id === conceptId 
          ? { ...c, imageUrl: `data:image/png;base64,${data.artifacts[0].base64}` }
          : c
      ));
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const generateImageVariations = async (conceptId: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept || !concept.imagePrompt) return;

    setIsGeneratingVariations(conceptId);

    try {
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
                text: `Professional jewelry photography: ${concept.imagePrompt}, on white background, studio lighting, macro detail`,
                weight: 1,
              },
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            samples: 4,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate variations');
      }

      const data = await response.json();
      
      const variations = data.artifacts.map((artifact: any) => 
        `data:image/png;base64,${artifact.base64}`
      );
      
      setConcepts(prev => prev.map(c => 
        c.id === conceptId 
          ? { ...c, variations }
          : c
      ));
    } catch (err) {
      console.error('Error generating variations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate variations');
    } finally {
      setIsGeneratingVariations(null);
    }
  };

  const handleCopyConcept = (conceptId: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) return;

    const conceptText = `
${concept.name}

Description:
${concept.description}

Trends:
${concept.trends.map(t => `• ${t}`).join('\n')}

Materials:
${concept.materials.map(m => `• ${m}`).join('\n')}

Design Elements:
${concept.designElements.map(e => `• ${e}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(conceptText);
    setCopied(conceptId);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadConceptImage = (conceptId: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept || !concept.imageUrl) return;

    const link = document.createElement('a');
    link.href = concept.imageUrl;
    link.download = `${concept.name.toLowerCase().replace(/\s+/g, '-')}-concept.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${filename.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearPage = () => {
    setPrompt('');
    setConcepts([]);
    setError('');
    setIsGenerating(false);
    setIsGeneratingImage(null);
    setIsGeneratingVariations(null);
    setLoadingMessage('');
    setCurrentStep(1);
  };

  const handleEditConcept = (concept: Concept) => {
    navigate('/edit-concept', { 
      state: { 
        concept,
        concepts
      }
    });
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
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        <div className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold">Generate Jewelry Design Concepts</h1>
            </div>
            
            <button
              onClick={clearPage}
              className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
              title="Clear page"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your jewelry design idea..."
              className={`w-full h-32 rounded-lg px-4 py-3 pr-12 ${themeClasses.input} border ${themeClasses.border}`}
            />
            
            <div className="mt-4 flex flex-wrap gap-4">
              <button
                onClick={() => generateConceptsWithCount(5)}
                disabled={isGenerating}
                className={`${themeClasses.button} text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors flex-1`}
              >
                {isGenerating && numConcepts === 5 ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating 5...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate 5 Concepts
                  </>
                )}
              </button>

              <button
                onClick={() => generateConceptsWithCount(10)}
                disabled={isGenerating}
                className={`${themeClasses.button} text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors flex-1`}
              >
                {isGenerating && numConcepts === 10 ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating 10...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate 10 Concepts
                  </>
                )}
              </button>

              <button
                onClick={() => generateConceptsWithCount(15)}
                disabled={isGenerating}
                className={`${themeClasses.button} text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors flex-1`}
              >
                {isGenerating && numConcepts === 15 ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating 15...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate 15 Concepts
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={`${themeClasses.error} px-4 py-3 rounded-lg`}>
              {error}
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Diamond className="w-8 h-8 text-purple-400 animate-pulse" />
                <Palette className="w-8 h-8 text-purple-400 animate-pulse delay-100" />
                <Sparkles className="w-8 h-8 text-purple-400 animate-pulse delay-200" />
              </div>
              <p className="text-lg font-medium mb-2">
                {loadingMessage}
              </p>
              <p className="text-sm text-purple-400">
                Step {currentStep} of 2
              </p>
            </div>
          )}
        </div>

        {concepts.length > 0 && (
          <div ref={conceptsRef} className="space-y-8">
            {concepts.map((concept) => (
              <div 
                key={concept.id}
                className={`${themeClasses.card} border ${themeClasses.border} rounded-lg p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{concept.name}</h2>
                  <button
                    onClick={() => handleEditConcept(concept)}
                    className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
                    title="Edit concept"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Design Vision</h3>
                      <p className={themeClasses.subtext}>{concept.description}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Design Trends</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {concept.trends.map((trend, index) => (
                          <li key={index} className={themeClasses.subtext}>{trend}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Materials</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {concept.materials.map((material, index) => (
                          <li key={index} className={themeClasses.subtext}>{material}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Design Elements</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {concept.designElements.map((element, index) => (
                          <li key={index} className={themeClasses.subtext}>{element}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {concept.imageUrl ? (
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <img 
                          src={concept.imageUrl} 
                          alt={concept.name}
                          className="w-full rounded-lg"
                        />
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => downloadConceptImage(concept.id)}
                            className={`${themeClasses.secondaryButton} flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2`}
                          >
                            <Download className="w-5 h-5" />
                            Download
                          </button>
                          
                          <button
                            onClick={() => generateImageVariations(concept.id)}
                            disabled={isGeneratingVariations === concept.id}
                            className={`${themeClasses.secondaryButton} flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2`}
                          >
                            {isGeneratingVariations === concept.id ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Grid2x2 className="w-5 h-5" />
                                Variations
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : concept.imagePrompt ? (
                      <button
                        onClick={() => generateConceptImage(concept.id)}
                        disabled={isGeneratingImage === concept.id}
                        className={`${themeClasses.button} text-white w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2`}
                      >
                        {isGeneratingImage === concept.id ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Image...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5" />
                            Create Image
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => enhanceConcept(concept.id)}
                        disabled={isGenerating}
                        className={`${themeClasses.button} text-white w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2`}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            Enhance Concept
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyConcept(concept.id)}
                      className={`${themeClasses.secondaryButton} w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2`}
                    >
                      {copied === concept.id ? (
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

                    {concept.imagePrompt && !concept.imageUrl && (
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <h4 className="font-medium mb-2">Image Generation Prompt</h4>
                        <p className={`text-sm ${themeClasses.subtext}`}>
                          {concept.imagePrompt}
                        </p>
                      </div>
                    )}

                    {concept.variations && (
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <h4 className="font-medium mb-3">Variations</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {concept.variations.map((variation, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={variation} 
                                alt={`Variation ${index + 1}`}
                                className="w-full rounded-lg"
                              />
                              <button
                                onClick={() => downloadImage(variation, `${concept.name}-variation-${index + 1}`)}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                              >
                                <Download className="w-5 h-5 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptGenerator;