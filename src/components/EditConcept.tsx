import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OpenAI from 'openai';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Save,
  Loader2,
  Copy,
  Check,
  Grid2x2,
  Download,
  Wand2,
  X,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import JSON5 from 'json5';

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

const EditConcept: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const concept = location.state?.concept as Concept;
  const concepts = location.state?.concepts as Concept[];

  if (!concept || !concepts) {
    navigate('/concept-generator');
    return null;
  }

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [editedConcept, setEditedConcept] = useState<Concept>(concept);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [imagePrompt, setImagePrompt] = useState(concept.imagePrompt || '');
  const [isRegeneratingPrompt, setIsRegeneratingPrompt] = useState(false);
  const [editedFields, setEditedFields] = useState<{
    name: boolean;
    description: boolean;
    trends: boolean;
    materials: boolean;
    designElements: boolean;
  }>({
    name: false,
    description: false,
    trends: false,
    materials: false,
    designElements: false
  });

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
    link: isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'
  };

  const handleNameChange = (value: string) => {
    setEditedConcept({ ...editedConcept, name: value });
    setEditedFields(prev => ({ ...prev, name: true }));
  };

  const handleDescriptionChange = (value: string) => {
    setEditedConcept({ ...editedConcept, description: value });
    setEditedFields(prev => ({ ...prev, description: true }));
  };

  const handleAddItem = (field: 'trends' | 'materials' | 'designElements') => {
    setEditedConcept({
      ...editedConcept,
      [field]: [...editedConcept[field], '']
    });
  };

  const handleRemoveItem = (field: 'trends' | 'materials' | 'designElements', index: number) => {
    setEditedConcept({
      ...editedConcept,
      [field]: editedConcept[field].filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (field: 'trends' | 'materials' | 'designElements', index: number, value: string) => {
    setEditedConcept({
      ...editedConcept,
      [field]: editedConcept[field].map((item, i) => i === index ? value : item)
    });
    setEditedFields(prev => ({ ...prev, [field]: true }));
  };

  const regenerateImagePrompt = async () => {
    setIsRegeneratingPrompt(true);
    setError('');

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
            content: `You are an expert jewelry photographer. Create a detailed prompt for generating a realistic jewelry image based on the following concept. Focus on visual details, materials, and design elements that will translate well into an image.

Concept Details:
Name: ${editedConcept.name}
Description: ${editedConcept.description}
Materials: ${editedConcept.materials.join(', ')}
Design Elements: ${editedConcept.designElements.join(', ')}

Generate a clear, specific prompt that will help create a photorealistic jewelry image. Include details about:
- Main design features
- Material finishes and textures
- Stone placement and details
- Overall composition
- Lighting and mood

Return ONLY the prompt text, no explanations or additional content.`
          }
        ],
        temperature: 0.7
      });

      const newPrompt = completion.choices[0].message.content;
      if (!newPrompt) throw new Error('Failed to generate image prompt');

      setImagePrompt(newPrompt);
      setEditedConcept(prev => ({
        ...prev,
        imagePrompt: newPrompt
      }));
    } catch (err) {
      console.error('Error generating image prompt:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image prompt');
    } finally {
      setIsRegeneratingPrompt(false);
    }
  };

  const enhanceConcept = async () => {
    setIsEnhancing(true);
    setError('');

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const fieldsToEnhance = Object.entries(editedFields)
        .filter(([_, isEdited]) => isEdited)
        .map(([field]) => field);

      if (fieldsToEnhance.length === 0) {
        setError('Please edit at least one field before enhancing');
        setIsEnhancing(false);
        return;
      }

      // Create a more structured prompt for better JSON output
      const systemPrompt = `You are an expert jewelry designer. Enhance ONLY the following edited fields of this jewelry concept. Keep other fields exactly as they are.

Current concept fields to enhance:
${editedFields.name ? `Name: ${editedConcept.name}` : ''}
${editedFields.description ? `Description: ${editedConcept.description}` : ''}
${editedFields.trends ? `Trends: ${editedConcept.trends.join(', ')}` : ''}
${editedFields.materials ? `Materials: ${editedConcept.materials.join(', ')}` : ''}
${editedFields.designElements ? `Design Elements: ${editedConcept.designElements.join(', ')}` : ''}

Return ONLY a valid JSON object containing ONLY the enhanced fields, with NO additional text or explanation. Example format:
{
  ${editedFields.description ? '"description": "Enhanced description",' : ''}
  ${editedFields.trends ? '"trends": ["trend1", "trend2", "trend3"],' : ''}
  ${editedFields.materials ? '"materials": ["material1", "material2", "material3"],' : ''}
  ${editedFields.designElements ? '"designElements": ["element1", "element2", "element3"]' : ''}
}

IMPORTANT: 
- Only include fields that need enhancement
- Return ONLY the JSON object, no other text
- Keep arrays for trends, materials, and designElements
- Maintain the jewelry design context and style`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ],
        temperature: 0.8
      });

      const response = completion.choices[0].message.content;
      if (!response) {
        throw new Error('No response received from AI');
      }

      // Use JSON5 for more forgiving JSON parsing
      let enhancedDetails;
      try {
        // Remove any potential non-JSON text before parsing
        const jsonStr = response.trim().replace(/^```json\s*|\s*```$/g, '');
        enhancedDetails = JSON5.parse(jsonStr);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      // Validate the response structure
      const validFields = ['description', 'trends', 'materials', 'designElements'];
      const invalidFields = Object.keys(enhancedDetails).filter(field => !validFields.includes(field));
      
      if (invalidFields.length > 0) {
        throw new Error(`Invalid fields in AI response: ${invalidFields.join(', ')}`);
      }

      // Update only the edited fields with the enhanced content
      setEditedConcept(prev => ({
        ...prev,
        ...(editedFields.description && enhancedDetails.description ? { description: enhancedDetails.description } : {}),
        ...(editedFields.trends && enhancedDetails.trends ? { trends: enhancedDetails.trends } : {}),
        ...(editedFields.materials && enhancedDetails.materials ? { materials: enhancedDetails.materials } : {}),
        ...(editedFields.designElements && enhancedDetails.designElements ? { designElements: enhancedDetails.designElements } : {})
      }));

      // Regenerate image prompt after successful enhancement
      await regenerateImagePrompt();

      // Reset edited fields
      setEditedFields({
        name: false,
        description: false,
        trends: false,
        materials: false,
        designElements: false
      });
    } catch (err) {
      console.error('Error enhancing concept:', err);
      setError(
        err instanceof Error 
          ? `Failed to enhance concept: ${err.message}` 
          : 'An unexpected error occurred while enhancing the concept'
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const generateImageVariations = async () => {
    if (!imagePrompt) {
      setError('Please regenerate the image prompt first');
      return;
    }

    setIsGeneratingVariations(true);
    setError('');

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
                text: `Professional jewelry photography: ${imagePrompt}, on white background, studio lighting, macro detail`,
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
      
      setEditedConcept(prev => ({
        ...prev,
        variations
      }));
    } catch (err) {
      console.error('Error generating variations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate variations');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  const handleCopyDetails = () => {
    const conceptText = `
${editedConcept.name}

Description:
${editedConcept.description}

Trends:
${editedConcept.trends.map(t => `• ${t}`).join('\n')}

Materials:
${editedConcept.materials.map(m => `• ${m}`).join('\n')}

Design Elements:
${editedConcept.designElements.map(e => `• ${e}`).join('\n')}

${editedConcept.imagePrompt ? `\nImage Generation Prompt:\n${editedConcept.imagePrompt}` : ''}
    `.trim();

    navigator.clipboard.writeText(conceptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${editedConcept.name.toLowerCase().replace(/\s+/g, '-')}-variation-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => {
    navigate('/concept-generator', {
      state: { concepts }
    });
  };

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 ${themeClasses.link} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Concepts
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

        <div className={`${themeClasses.card} border ${themeClasses.border} rounded-lg p-6`}>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Concept Name
            </label>
            <input
              type="text"
              value={editedConcept.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-2`}
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">
              Description
            </label>
            <textarea
              value={editedConcept.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={4}
              className={`w-full ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-2`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-medium">
                  Trends
                </label>
                <button
                  onClick={() => handleAddItem('trends')}
                  className={`${themeClasses.secondaryButton} p-1 rounded-lg`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {editedConcept.trends.map((trend, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    value={trend}
                    onChange={(e) => handleItemChange('trends', index, e.target.value)}
                    className={`flex-1 ${themeClasses.input} border ${themeClasses.border} rounded-lg px-3 py-2`}
                  />
                  <button
                    onClick={() => handleRemoveItem('trends', index)}
                    className={`${themeClasses.secondaryButton} p-2 rounded-lg`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-medium">
                  Materials
                </label>
                <button
                  onClick={() => handleAddItem('materials')}
                  className={`${themeClasses.secondaryButton} p-1 rounded-lg`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {editedConcept.materials.map((material, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    value={material}
                    onChange={(e) => handleItemChange('materials', index, e.target.value)}
                    className={`flex-1 ${themeClasses.input} border ${themeClasses.border} rounded-lg px-3 py-2`}
                  />
                  <button
                    onClick={() => handleRemoveItem('materials', index)}
                    className={`${themeClasses.secondaryButton} p-2 rounded-lg`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-lg font-medium">
                Design Elements
              </label>
              <button
                onClick={() => handleAddItem('designElements')}
                className={`${themeClasses.secondaryButton} p-1 rounded-lg`}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {editedConcept.designElements.map((element, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  value={element}
                  onChange={(e) => handleItemChange('designElements', index, e.target.value)}
                  className={`flex-1 ${themeClasses.input} border ${themeClasses.border} rounded-lg px-3 py-2`}
                />
                <button
                  onClick={() => handleRemoveItem('designElements', index)}
                  className={`${themeClasses.secondaryButton} p-2 rounded-lg`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              onClick={enhanceConcept}
              disabled={isEnhancing || Object.values(editedFields).every(v => !v)}
              className={`${themeClasses.button} text-white px-6 py-3 rounded-lg flex items-center gap-2 flex-1`}
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  {Object.values(editedFields).some(v => v) ? 'Update with AI' : 'Edit fields to update'}
                </>
              )}
            </button>

            <button
              onClick={regenerateImagePrompt}
              disabled={isRegeneratingPrompt}
              className={`${themeClasses.button} text-white px-6 py-3 rounded-lg flex items-center gap-2 flex-1`}
            >
              {isRegeneratingPrompt ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Regenerating Prompt...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Regenerate Prompt Only
                </>
              )}
            </button>

            <button
              onClick={generateImageVariations}
              disabled={isGeneratingVariations || !imagePrompt}
              className={`${themeClasses.button} text-white px-6 py-3 rounded-lg flex items-center gap-2 flex-1`}
            >
              {isGeneratingVariations ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Grid2x2 className="w-5 h-5" />
                  Generate Variations
                </>
              )}
            </button>

            <button
              onClick={handleCopyDetails}
              className={`${themeClasses.secondaryButton} px-6 py-3 rounded-lg flex items-center gap-2 flex-1`}
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
          </div>

          {imagePrompt && (
            <div className={`mt-6 ${themeClasses.card} p-4 rounded-lg`}>
              <h3 className="font-medium mb-2">Image Generation Prompt</h3>
              <p className={`text-sm ${themeClasses.subtext}`}>
                {imagePrompt}
              </p>
            </div>
          )}

          {editedConcept.variations && (
            <div className="mt-6">
              <h3 className="font-medium mb-4">Image Variations</h3>
              <div className="grid grid-cols-2 gap-4">
                {editedConcept.variations.map((variation, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={variation}
                      alt={`Variation ${index + 1}`}
                      className="w-full rounded-lg"
                    />
                    <button
                      onClick={() => downloadImage(variation, index)}
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
  );
};

export default EditConcept;