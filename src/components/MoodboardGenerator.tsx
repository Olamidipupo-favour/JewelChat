import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Loader2, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Droplet,
  History,
  TrendingUp,
  PenTool,
  Sparkles,
  Layers,
  Lightbulb,
  BookOpen,
  Gem,
  Scissors,
  X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface MoodboardGeneratorProps {
  researchContent: string;
  isDarkMode: boolean;
}

interface ResearchSummary {
  title: string;
  historicalContext: string;
  currentTrends: string[];
  marketInsights: string;
}

interface ColorInfo {
  name: string;
  hex: string;
}

interface DesignElement {
  name: string;
  description: string;
}

interface MaterialTexture {
  name: string;
  description: string;
}

interface TrendKeyword {
  text: string;
  category: 'material' | 'design' | 'technique' | 'style';
}

interface GeneratedImage {
  imageUrl: string;
  prompt: string;
}

const MoodboardGenerator: React.FC<MoodboardGeneratorProps> = ({ researchContent, isDarkMode }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(5);
  const [copied, setCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const moodboardRef = useRef<HTMLDivElement>(null);

  // Extracted data
  const [researchSummary, setResearchSummary] = useState<ResearchSummary | null>(null);
  const [colorPalette, setColorPalette] = useState<ColorInfo[]>([]);
  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [materialTextures, setMaterialTextures] = useState<MaterialTexture[]>([]);
  const [trendKeywords, setTrendKeywords] = useState<TrendKeyword[]>([]);

  const themeClasses = {
    button: isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600',
    secondaryButton: isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20',
    card: isDarkMode ? 'bg-white/5' : 'bg-black/5',
    sectionBg: isDarkMode ? 'bg-[#1a1a2e]/80' : 'bg-white/80',
    border: isDarkMode ? 'border-purple-500/20' : 'border-purple-300/20',
    heading: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    accent: isDarkMode ? 'text-purple-400' : 'text-purple-600',
  };

  // Extract research insights
  const extractResearchInsights = (content: string): ResearchSummary => {
    // Default values
    const summary: ResearchSummary = {
      title: 'Jewelry Research',
      historicalContext: 'Jewelry has been an important part of human culture for thousands of years, serving as symbols of status, wealth, and personal expression.',
      currentTrends: [
        'Sustainable and ethical sourcing',
        'Minimalist designs',
        'Mixed metals',
        'Personalized pieces'
      ],
      marketInsights: 'The global jewelry market continues to grow, with increasing demand for unique, handcrafted pieces and sustainable materials.'
    };

    try {
      // Extract title
      const titleMatch = content.match(/# ([^-]+)/);
      if (titleMatch && titleMatch[1]) {
        summary.title = titleMatch[1].trim();
      }

      // Extract historical context
      const historicalSection = content.match(/## Historical Context[^\n]*\n([\s\S]*?)(?=##)/i);
      if (historicalSection && historicalSection[1]) {
        const cleanedContext = historicalSection[1]
          .replace(/\*\*/g, '')
          .replace(/- /g, '')
          .trim()
          .split('\n')
          .filter(line => line.length > 20)
          .slice(0, 2)
          .join(' ');
        
        if (cleanedContext) {
          summary.historicalContext = cleanedContext;
        }
      }

      // Extract current trends
      const trendsSection = content.match(/## Design Trends[^\n]*\n([\s\S]*?)(?=##)/i) || 
                           content.match(/### Current Trends[^\n]*\n([\s\S]*?)(?=###)/i);
      
      if (trendsSection && trendsSection[1]) {
        const trendLines = trendsSection[1]
          .split('\n')
          .filter(line => line.startsWith('- ') || line.startsWith('* '))
          .map(line => line.replace(/^[- *]+/, '').trim())
          .filter(line => line.length > 5);
        
        if (trendLines.length > 0) {
          summary.currentTrends = trendLines.slice(0, 4);
        }
      }

      // Extract market insights
      const marketSection = content.match(/## Market Analysis[^\n]*\n([\s\S]*?)(?=##)/i);
      if (marketSection && marketSection[1]) {
        const cleanedMarket = marketSection[1]
          .replace(/\*\*/g, '')
          .replace(/- /g, '')
          .trim()
          .split('\n')
          .filter(line => line.length > 20)
          .slice(0, 2)
          .join(' ');
        
        if (cleanedMarket) {
          summary.marketInsights = cleanedMarket;
        }
      }

      return summary;
    } catch (error) {
      console.error('Error extracting research insights:', error);
      return summary;
    }
  };

  // Extract trend keywords
  const extractTrendKeywords = (content: string): TrendKeyword[] => {
    const keywords: TrendKeyword[] = [];
    
    try {
      // Common jewelry materials
      const materials = [
        'gold', 'silver', 'platinum', 'diamond', 'ruby', 'sapphire', 'emerald', 
        'pearl', 'opal', 'jade', 'amber', 'turquoise', 'titanium', 'brass', 
        'copper', 'steel', 'ceramic', 'wood', 'leather', 'resin', 'mother of pearl',
        'mop', 'gemstone', 'crystal', 'stone', 'metal', 'bronze', 'rose gold'
      ];
      
      // Design terms
      const designTerms = [
        'minimalist', 'vintage', 'art deco', 'geometric', 'organic', 'abstract',
        'floral', 'nature', 'asymmetric', 'symmetric', 'modern', 'contemporary',
        'traditional', 'avant-garde', 'bohemian', 'industrial', 'architectural',
        'sculptural', 'layered', 'statement', 'delicate', 'bold', 'intricate'
      ];
      
      // Techniques
      const techniques = [
        'casting', 'setting', 'engraving', 'filigree', 'granulation', 'enameling',
        'inlay', 'mokume gane', 'chasing', 'repoussé', 'hammered', 'forged',
        'wire-wrapped', 'bezel', 'prong', 'pavé', 'channel', 'flush', 'tension',
        'soldering', 'polishing', 'oxidizing', 'patina', 'plating', 'anodizing'
      ];
      
      // Style periods
      const styles = [
        'victorian', 'edwardian', 'art nouveau', 'art deco', 'retro', 'mid-century',
        'baroque', 'renaissance', 'gothic', 'byzantine', 'celtic', 'tribal',
        'egyptian', 'roman', 'greek', 'asian', 'african', 'native american'
      ];
      
      // Extract words from content
      const words = content.toLowerCase().match(/\b\w+\b/g) || [];
      const uniqueWords = [...new Set(words)];
      
      // Check for materials
      materials.forEach(material => {
        if (content.toLowerCase().includes(material)) {
          keywords.push({ text: material, category: 'material' });
        }
      });
      
      // Check for design terms
      designTerms.forEach(term => {
        if (content.toLowerCase().includes(term)) {
          keywords.push({ text: term, category: 'design' });
        }
      });
      
      // Check for techniques
      techniques.forEach(technique => {
        if (content.toLowerCase().includes(technique)) {
          keywords.push({ text: technique, category: 'technique' });
        }
      });
      
      // Check for styles
      styles.forEach(style => {
        if (content.toLowerCase().includes(style)) {
          keywords.push({ text: style, category: 'style' });
        }
      });
      
      // Limit to 15 keywords and ensure uniqueness
      const uniqueKeywords = keywords.filter((keyword, index, self) => 
        index === self.findIndex(k => k.text === keyword.text)
      );
      
      return uniqueKeywords.slice(0, 15);
    } catch (error) {
      console.error('Error extracting trend keywords:', error);
      return keywords;
    }
  };

  // Generate color palette based on research
  const generateColorPalette = (content: string): ColorInfo[] => {
    const defaultPalette: ColorInfo[] = [
      { name: 'Yellow Gold', hex: '#D4AF37' },
      { name: 'Sterling Silver', hex: '#C0C0C0' },
      { name: 'Diamond White', hex: '#F4F9FF' },
      { name: 'White Gold', hex: '#E8E8E8' },
      { name: 'Rose Gold', hex: '#B76E79' }
    ];
    
    try {
      const palette: ColorInfo[] = [];
      const mentionedColors: ColorInfo[] = [];
      
      // Map of gemstones to colors
      const gemstoneColors: Record<string, ColorInfo> = {
        'ruby': { name: 'Ruby Red', hex: '#E0115F' },
        'emerald': { name: 'Emerald Green', hex: '#50C878' },
        'sapphire': { name: 'Sapphire Blue', hex: '#0F52BA' },
        'amethyst': { name: 'Amethyst Purple', hex: '#9966CC' },
        'topaz': { name: 'Topaz Blue', hex: '#1DB5E4' },
        'citrine': { name: 'Citrine Yellow', hex: '#E4D00A' },
        'peridot': { name: 'Peridot Green', hex: '#AAFF00' },
        'aquamarine': { name: 'Aquamarine Blue', hex: '#7FFFD4' },
        'opal': { name: 'Opal White', hex: '#F8F8FF' },
        'garnet': { name: 'Garnet Red', hex: '#733635' },
        'turquoise': { name: 'Turquoise Blue', hex: '#40E0D0' },
        'jade': { name: 'Jade Green', hex: '#00A36C' },
        'pearl': { name: 'Pearl White', hex: '#FDEEF4' },
        'amber': { name: 'Amber Gold', hex: '#FFBF00' },
        'onyx': { name: 'Onyx Black', hex: '#353839' },
        'lapis': { name: 'Lapis Blue', hex: '#26619C' },
        'malachite': { name: 'Malachite Green', hex: '#0BDA51' },
        'moonstone': { name: 'Moonstone Blue', hex: '#CDD6DD' },
        'mother of pearl': { name: 'Mother of Pearl', hex: '#F5F7E3' },
        'mop': { name: 'Mother of Pearl', hex: '#F5F7E3' }
      };
      
      // Check for gemstone mentions
      Object.keys(gemstoneColors).forEach(gemstone => {
        if (content.toLowerCase().includes(gemstone)) {
          mentionedColors.push(gemstoneColors[gemstone]);
        }
      });
      
      // Ensure we have at least 5 colors by adding complementary colors
      if (mentionedColors.length < 5) {
        // Add metal colors
        const metalColors = [
          { name: 'Yellow Gold', hex: '#D4AF37' },
          { name: 'Sterling Silver', hex: '#C0C0C0' },
          { name: 'White Gold', hex: '#E8E8E8' },
          { name: 'Rose Gold', hex: '#B76E79' },
          { name: 'Platinum', hex: '#E5E4E2' }
        ];
        
        for (const color of metalColors) {
          if (mentionedColors.length < 5 && !mentionedColors.some(c => c.name === color.name)) {
            mentionedColors.push(color);
          }
        }
      }
      
      // Still need more colors? Add some defaults
      if (mentionedColors.length < 5) {
        for (const color of defaultPalette) {
          if (mentionedColors.length < 5 && !mentionedColors.some(c => c.name === color.name)) {
            mentionedColors.push(color);
          }
        }
      }
      
      return mentionedColors;
    } catch (error) {
      console.error('Error generating color palette:', error);
      return defaultPalette;
    }
  };

  // Generate design elements
  const generateDesignElements = (content: string): DesignElement[] => {
    const defaultElements: DesignElement[] = [
      { name: 'Mixed Metals', description: 'Combination of different metal colors and finishes for visual contrast' },
      { name: 'Minimalist Settings', description: 'Clean lines and simple settings that highlight gemstones with minimal metal' },
      { name: 'Geometric Patterns', description: 'Angular and precise shapes creating modern, architectural appeal' },
      { name: 'Organic Forms', description: 'Nature-inspired shapes with flowing, asymmetrical designs' }
    ];
    
    try {
      // Design element patterns to look for
      const designPatterns = [
        { 
          pattern: /minimalist/i, 
          element: { 
            name: 'Minimalist Settings', 
            description: 'Clean lines and simple settings that highlight gemstones with minimal metal' 
          }
        },
        { 
          pattern: /geometric/i, 
          element: { 
            name: 'Geometric Patterns', 
            description: 'Angular and precise shapes creating modern, architectural appeal' 
          }
        },
        { 
          pattern: /organic|nature|natural|flowing/i, 
          element: { 
            name: 'Organic Forms', 
            description: 'Nature-inspired shapes with flowing, asymmetrical designs' 
          }
        },
        { 
          pattern: /mixed metal|multi-metal|two-tone/i, 
          element: { 
            name: 'Mixed Metals', 
            description: 'Combination of different metal colors and finishes for visual contrast' 
          }
        },
        { 
          pattern: /vintage|retro|antique/i, 
          element: { 
            name: 'Vintage Revival', 
            description: 'Modern interpretations of classic designs with historical influences' 
          }
        },
        { 
          pattern: /statement|bold|dramatic/i, 
          element: { 
            name: 'Statement Pieces', 
            description: 'Bold, eye-catching designs that serve as conversation starters' 
          }
        },
        { 
          pattern: /layered|stacking|stackable/i, 
          element: { 
            name: 'Layered Designs', 
            description: 'Multiple components designed to be worn together for dimensional effect' 
          }
        },
        { 
          pattern: /asymmetric|asymmetrical|unbalanced/i, 
          element: { 
            name: 'Asymmetrical Balance', 
            description: 'Intentionally uneven designs creating visual interest and uniqueness' 
          }
        },
        { 
          pattern: /textured|texture|hammered|brushed/i, 
          element: { 
            name: 'Textured Surfaces', 
            description: 'Varied surface treatments creating tactile interest and light play' 
          }
        },
        { 
          pattern: /negative space|open|airy/i, 
          element: { 
            name: 'Negative Space', 
            description: 'Designs that incorporate empty areas as integral elements of the piece' 
          }
        },
        { 
          pattern: /mother of pearl|mop|shell|iridescent/i, 
          element: { 
            name: 'Iridescent Inlays', 
            description: 'Mother of pearl and shell materials creating luminous color effects' 
          }
        }
      ];
      
      const foundElements: DesignElement[] = [];
      
      // Check for design patterns in content
      designPatterns.forEach(({ pattern, element }) => {
        if (pattern.test(content)) {
          foundElements.push(element);
        }
      });
      
      // Ensure we have at least 4 elements
      if (foundElements.length < 4) {
        for (const element of defaultElements) {
          if (foundElements.length < 4 && !foundElements.some(e => e.name === element.name)) {
            foundElements.push(element);
          }
        }
      }
      
      return foundElements.slice(0, 4);
    } catch (error) {
      console.error('Error generating design elements:', error);
      return defaultElements;
    }
  };

  // Generate material textures
  const generateMaterialTextures = (content: string): MaterialTexture[] => {
    const defaultTextures: MaterialTexture[] = [
      { name: 'Polished Gold', description: 'High-shine reflective surface with luxurious appeal' },
      { name: 'Hammered Gold', description: 'Textured surface with small indentations catching light' },
      { name: 'Brushed Silver', description: 'Matte finish with fine linear texture for subtle elegance' },
      { name: 'Oxidized Silver', description: 'Darkened recesses creating depth and contrast' }
    ];
    
    try {
      // Texture patterns to look for
      const texturePatterns = [
        { 
          pattern: /polished|high shine|reflective/i, 
          texture: { 
            name: 'Polished Gold', 
            description: 'High-shine reflective surface with luxurious appeal' 
          }
        },
        { 
          pattern: /hammered|textured|dimpled/i, 
          texture: { 
            name: 'Hammered Gold', 
            description: 'Textured surface with small indentations catching light' 
          }
        },
        { 
          pattern: /brushed|satin|matte/i, 
          texture: { 
            name: 'Brushed Silver', 
            description: 'Matte finish with fine linear texture for subtle elegance' 
          }
        },
        { 
          pattern: /oxidized|blackened|patina/i, 
          texture: { 
            name: 'Oxidized Silver', 
            description: 'Darkened recesses creating depth and contrast' 
          }
        },
        { 
          pattern: /florentine|cross-hatched|engraved/i, 
          texture: { 
            name: 'Florentine Finish', 
            description: 'Cross-hatched pattern creating a textured, non-reflective surface' 
          }
        },
        { 
          pattern: /sandblasted|frosted|grainy/i, 
          texture: { 
            name: 'Sandblasted Gold', 
            description: 'Fine, grainy texture with soft, non-reflective appearance' 
          }
        },
        { 
          pattern: /mother of pearl|mop|iridescent|shell/i, 
          texture: { 
            name: 'Mother of Pearl', 
            description: 'Iridescent natural material with shifting color play' 
          }
        },
        { 
          pattern: /enamel|enameled|vitreous/i, 
          texture: { 
            name: 'Vitreous Enamel', 
            description: 'Glass-like colored surface fused to metal for vibrant color' 
          }
        }
      ];
      
      const foundTextures: MaterialTexture[] = [];
      
      // Check for texture patterns in content
      texturePatterns.forEach(({ pattern, texture }) => {
        if (pattern.test(content)) {
          foundTextures.push(texture);
        }
      });
      
      // Ensure we have at least 4 textures
      if (foundTextures.length < 4) {
        for (const texture of defaultTextures) {
          if (foundTextures.length < 4 && !foundTextures.some(t => t.name === texture.name)) {
            foundTextures.push(texture);
          }
        }
      }
      
      return foundTextures.slice(0, 4);
    } catch (error) {
      console.error('Error generating material textures:', error);
      return defaultTextures;
    }
  };

  // Generate image prompts based on research
  const generateImagePrompts = (content: string, keywords: TrendKeyword[]): string[] => {
    try {
      // Extract the main topic
      const titleMatch = content.match(/# ([^-]+)/);
      const mainTopic = titleMatch && titleMatch[1] ? titleMatch[1].trim() : 'jewelry';
      
      // Get material keywords
      const materials = keywords
        .filter(k => k.category === 'material')
        .map(k => k.text);
      
      // Get design keywords
      const designs = keywords
        .filter(k => k.category === 'design')
        .map(k => k.text);
      
      // Get technique keywords
      const techniques = keywords
        .filter(k => k.category === 'technique')
        .map(k => k.text);
      
      // Create prompts
      const prompts: string[] = [];
      
      // Prompt 1: Main topic with materials
      if (materials.length > 0) {
        const materialsList = materials.slice(0, 2).join(' and ');
        prompts.push(`Professional jewelry photography: ${mainTopic} featuring ${materialsList}, on white background, studio lighting, macro detail`);
      } else {
        prompts.push(`Professional jewelry photography: ${mainTopic} on white background, studio lighting, macro detail`);
      }
      
      // Prompt 2: Design style
      if (designs.length > 0) {
        const designStyle = designs[0];
        prompts.push(`Professional jewelry photography: ${designStyle} style ${mainTopic}, on white background, studio lighting, macro detail`);
      } else {
        prompts.push(`Professional jewelry photography: modern ${mainTopic} design, on white background, studio lighting, macro detail`);
      }
      
      // Prompt 3: Technique focus
      if (techniques.length > 0) {
        const technique = techniques[0];
        prompts.push(`Professional jewelry photography: ${mainTopic} with ${technique} technique, on white background, studio lighting, macro detail`);
      } else {
        prompts.push(`Professional jewelry photography: detailed ${mainTopic} craftsmanship, on white background, studio lighting, macro detail`);
      }
      
      return prompts;
    } catch (error) {
      console.error('Error generating image prompts:', error);
      return [
        'Professional jewelry photography: elegant jewelry design on white background, studio lighting, macro detail',
        'Professional jewelry photography: modern jewelry piece on white background, studio lighting, macro detail',
        'Professional jewelry photography: detailed jewelry craftsmanship on white background, studio lighting, macro detail'
      ];
    }
  };

  // Generate mood board
  const generateMoodboard = async () => {
    setIsGenerating(true);
    setError('');
    setCurrentStep(1);
    setTotalSteps(5);
    setLoadingMessage('Analyzing research content...');
    
    try {
      // Step 1: Extract research insights
      const summary = extractResearchInsights(researchContent);
      setResearchSummary(summary);
      setCurrentStep(2);
      setLoadingMessage('Identifying trend keywords...');
      
      // Step 2: Extract trend keywords
      const keywords = extractTrendKeywords(researchContent);
      setTrendKeywords(keywords);
      setCurrentStep(3);
      setLoadingMessage('Generating color palette...');
      
      // Step 3: Generate color palette
      const palette = generateColorPalette(researchContent);
      setColorPalette(palette);
      setCurrentStep(4);
      setLoadingMessage('Creating design elements...');
      
      // Step 4: Generate design elements and textures
      const elements = generateDesignElements(researchContent);
      setDesignElements(elements);
      const textures = generateMaterialTextures(researchContent);
      setMaterialTextures(textures);
      
      // Step 5: Generate images using Stability AI
      setCurrentStep(5);
      setLoadingMessage('Generating jewelry concept images...');
      
      const imagePrompts = generateImagePrompts(researchContent, keywords);
      const generatedImageResults: GeneratedImage[] = [];
      
      // Use Stability AI to generate images
      const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
      
      if (!apiKey || apiKey === 'your-stability-api-key-here') {
        throw new Error('Stability API key not configured. Please add your API key to the .env file.');
      }
      
      // Generate images sequentially
      for (let i = 0; i < imagePrompts.length; i++) {
        const prompt = imagePrompts[i];
        
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to generate image');
          }
          
          const data = await response.json();
          generatedImageResults.push({
            imageUrl: `data:image/png;base64,${data.artifacts[0].base64}`,
            prompt: prompt
          });
          
        } catch (error) {
          console.error(`Error generating image for prompt "${prompt}":`, error);
          // Continue with other prompts even if one fails
        }
      }
      
      setGeneratedImages(generatedImageResults);
      
    } catch (error) {
      console.error('Error generating mood board:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate mood board');
    } finally {
      setIsGenerating(false);
      setLoadingMessage('');
    }
  };

  // Copy mood board to clipboard
  const handleCopyMoodboard = () => {
    if (!researchSummary) return;
    
    const moodboardText = `
# ${researchSummary.title} - Mood Board

## Historical Context
${researchSummary.historicalContext}

## Current Trends
${researchSummary.currentTrends.map(trend => `- ${trend}`).join('\n')}

## Color Palette
${colorPalette.map(color => `- ${color.name}`).join('\n')}

## Design Elements
${designElements.map(element => `- ${element.name}: ${element.description}`).join('\n')}

## Material Textures
${materialTextures.map(texture => `- ${texture.name}: ${texture.description}`).join('\n')}
    `;
    
    navigator.clipboard.writeText(moodboardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download the mood board as PDF
  const downloadMoodboardAsPDF = async () => {
    if (!moodboardRef.current) return;
    
    try {
      setLoadingMessage('Preparing PDF download...');
      
      // Create a PDF with multiple pages
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      // Capture each page separately
      const pages = moodboardRef.current.querySelectorAll('.moodboard-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Temporarily make the page visible for capturing
        const originalDisplay = page.style.display;
        page.style.display = 'block';
        
        const canvas = await html2canvas(page, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        
        // Add the canvas as an image to the PDF
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height, undefined, 'FAST');
        
        // Restore original display
        page.style.display = originalDisplay;
      }
      
      // Save the PDF
      pdf.save(`${researchSummary?.title || 'Jewelry'}_Moodboard.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setLoadingMessage('');
    }
  };

  // Navigate between pages
  const navigateToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'material':
        return <Gem className="w-3 h-3" />;
      case 'design':
        return <PenTool className="w-3 h-3" />;
      case 'technique':
        return <Scissors className="w-3 h-3" />;
      case 'style':
        return <Sparkles className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'material':
        return isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700';
      case 'design':
        return isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700';
      case 'technique':
        return isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700';
      case 'style':
        return isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700';
      default:
        return isDarkMode ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  if (!researchContent) {
    return null;
  }

  return (
    <div className="mt-6">
      {!generatedImages.length ? (
        <button
          onClick={generateMoodboard}
          disabled={isGenerating}
          className={`${themeClasses.button} text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                {loadingMessage || 'Generating Mood Board...'}
                {' '}({currentStep}/{totalSteps})
              </span>
            </>
          ) : (
            <>
              <Palette className="w-5 h-5" />
              Create Mood Board from Research
            </>
          )}
        </button>
      ) : (
        <div className={`${themeClasses.card} rounded-lg p-6 border ${themeClasses.border}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Palette className="w-6 h-6 text-purple-400" />
              {researchSummary?.title || 'Jewelry'} Mood Board
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyMoodboard}
                className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
                title="Copy mood board details"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={downloadMoodboardAsPDF}
                className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
                title="Download mood board as PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={generateMoodboard}
                disabled={isGenerating}
                className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors`}
                title="Refresh mood board"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-2">
              <X className="w-5 h-5 text-red-400" />
              <p>{error}</p>
            </div>
          )}

          {/* Page Navigation */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={() => navigateToPage(1)}
              disabled={currentPage === 1}
              className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="mx-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => navigateToPage(2)}
              disabled={currentPage === totalPages}
              className={`${themeClasses.secondaryButton} p-2 rounded-lg transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mood Board Content */}
          <div ref={moodboardRef} className="relative">
            {/* Page 1 - FIXED: Removed fixed aspect ratio and added overflow handling */}
            <div 
              className={`moodboard-page ${currentPage === 1 ? 'block' : 'hidden'}`}
              style={{
                maxWidth: '100%',
                margin: '0 auto',
                minHeight: '600px',
                overflow: 'visible'
              }}
            >
              <div className={`${themeClasses.sectionBg} p-6 rounded-lg h-full`}>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-bold ${themeClasses.heading}`}>
                    {researchSummary?.title || 'Jewelry Research'}
                  </h2>
                  <p className={`text-lg ${themeClasses.accent} mt-2`}>Trend & Design Mood Board</p>
                </div>

                {/* Historical Context */}
                <div className="mb-8">
                  <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
                    <History className="w-5 h-5 text-purple-400" />
                    Historical Context
                  </h3>
                  <div className={`${themeClasses.card} p-4 rounded-lg`}>
                    <p className={themeClasses.subtext}>
                      {researchSummary?.historicalContext || 'Historical context not available.'}
                    </p>
                  </div>
                </div>

                {/* Current Trends */}
                <div className="mb-8">
                  <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Current Trends
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {researchSummary?.currentTrends.map((trend, index) => (
                      <div key={index} className={`${themeClasses.card} p-4 rounded-lg`}>
                        <p className={themeClasses.subtext}>{trend}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Palette */}
                <div className="mb-8">
                  <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
                    <Droplet className="w-5 h-5 text-purple-400" />
                    Color Palette
                  </h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {colorPalette.map((color, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full border border-white/10 mx-auto mb-2"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="font-medium text-sm">{color.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Design Elements */}
                <div>
                  <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
                    <PenTool className="w-5 h-5 text-purple-400" />
                    Design Elements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {designElements.map((element, index) => (
                      <div key={index} className={`${themeClasses.card} p-4 rounded-lg`}>
                        <div className="font-medium mb-1">{element.name}</div>
                        <div className={`text-sm ${themeClasses.subtext}`}>{element.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 - FIXED: Removed fixed aspect ratio and added overflow handling */}
            <div 
              className={`moodboard-page ${currentPage === 2 ? 'block' : 'hidden'}`}
              style={{
                maxWidth: '100%',
                margin: '0 auto',
                minHeight: '600px',
                overflow: 'visible'
              }}
            >
              <div className={`${themeClasses.sectionBg} p-6 rounded-lg h-full`}>
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className={`text-3xl font-bold ${themeClasses.heading}`}>
                    {researchSummary?.title || 'Jewelry Research'}
                  </h2>
                  <p className={`text-lg ${themeClasses.accent} mt-2`}>Design Inspiration</p>
                </div>

                {/* Trend Keywords */}
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Trend Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {trendKeywords.map((keyword, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getCategoryColor(keyword.category)}`}
                      >
                        {getCategoryIcon(keyword.category)}
                        {keyword.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Material Textures */}
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
                    <Layers className="w-5 h-5 text-purple-400" />
                    Material Textures
                  </h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {materialTextures.map((texture, index) => (
                      <div key={index} className={`${themeClasses.card} p-3 rounded-lg max-w-[30%]`}>
                        <div className="font-medium text-sm text-center mb-1">{texture.name}</div>
                        <div className={`text-xs ${themeClasses.subtext} text-center`}>{texture.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI-Generated Jewelry Designs */}
                <div className="mb-6">
                  <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
                    <Lightbulb className="w-5 h-5 text-purple-400" />
                    AI-Generated Jewelry Concepts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="overflow-hidden rounded-lg">
                        <img 
                          src={image.imageUrl} 
                          alt={`AI-generated jewelry concept ${index + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Insights */}
                <div>
                  <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${themeClasses.heading}`}>
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Market Insights
                  </h3>
                  <div className={`${themeClasses.card} p-4 rounded-lg`}>
                    <p className={themeClasses.subtext}>
                      {researchSummary?.marketInsights || 'Market insights not available.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodboardGenerator;