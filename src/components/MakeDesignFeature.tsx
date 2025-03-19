import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  BellRing as Ring, 
  Gem, 
  Copy, 
  ImageIcon, 
  Check, 
  Loader2, 
  ChevronRight, 
  Diamond, 
  Palette 
} from 'lucide-react';

interface DesignPrompt {
  id: string;
  text: string;
  image?: string;
}

interface DesignCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  prompts: DesignPrompt[];
}

const DESIGN_CATEGORIES: DesignCategory[] = [
  {
    id: 'rings',
    title: 'Rings',
    icon: <Ring className="w-5 h-5 text-purple-400" />,
    prompts: [
      {
        id: 'ring-1',
        text: 'Create a modern engagement ring with a cushion cut diamond in a halo setting, white gold band with delicate pavé diamonds',
      },
      {
        id: 'ring-2',
        text: 'Design an Art Deco inspired cocktail ring featuring a large emerald center stone surrounded by geometric diamond patterns',
      },
      {
        id: 'ring-3',
        text: 'Generate a minimalist wedding band with a brushed rose gold finish and hidden diamond accents',
      }
    ]
  },
  {
    id: 'pendants',
    title: 'Pendants',
    icon: <Diamond className="w-5 h-5 text-purple-400" />,
    prompts: [
      {
        id: 'pendant-1',
        text: 'Design a vintage-style sapphire pendant with an ornate diamond halo and filigree details',
      },
      {
        id: 'pendant-2',
        text: 'Create a modern geometric pendant featuring a triangular diamond with asymmetrical gold framework',
      },
      {
        id: 'pendant-3',
        text: 'Generate a nature-inspired pendant with a pear-shaped emerald surrounded by diamond leaf motifs',
      }
    ]
  },
  {
    id: 'earrings',
    title: 'Earrings',
    icon: <Gem className="w-5 h-5 text-purple-400" />,
    prompts: [
      {
        id: 'earring-1',
        text: 'Design chandelier earrings with graduated diamond drops and vintage-inspired metalwork',
      },
      {
        id: 'earring-2',
        text: 'Create modern geometric stud earrings with princess cut diamonds in a floating setting',
      },
      {
        id: 'earring-3',
        text: 'Generate art nouveau style drop earrings with pearl and diamond combination',
      }
    ]
  }
];

const DesignFeatureContent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrompt = (promptId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(promptId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateImage = async (promptId: string, text: string) => {
    setGeneratingImages(prev => ({ ...prev, [promptId]: true }));
    
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
                text: `Professional jewelry photography: ${text}`,
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
      const categoryIndex = DESIGN_CATEGORIES.findIndex(c => c.id === selectedCategory);
      const promptIndex = DESIGN_CATEGORIES[categoryIndex].prompts.findIndex(p => p.id === promptId);
      DESIGN_CATEGORIES[categoryIndex].prompts[promptIndex].image = `data:image/png;base64,${data.artifacts[0].base64}`;
      
      setGeneratingImages(prev => ({ ...prev }));
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [promptId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left hover:bg-white/5 p-2 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold">Design Gallery</h2>
        </div>
        <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="pl-4 space-y-4">
          {DESIGN_CATEGORIES.map(category => (
            <div key={category.id}>
              <button
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span>{category.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory === category.id ? 'rotate-90' : ''}`} />
              </button>

              {selectedCategory === category.id && (
                <div className="mt-2 space-y-3">
                  {category.prompts.map(prompt => (
                    <div key={prompt.id} className="bg-white/5 rounded-lg p-4">
                      <p className="mb-3 text-sm">{prompt.text}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyPrompt(prompt.id, prompt.text)}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 rounded-md transition-colors text-sm"
                        >
                          {copiedId === prompt.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-purple-400" />
                          )}
                          <span>{copiedId === prompt.id ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => handleGenerateImage(prompt.id, prompt.text)}
                          disabled={generatingImages[prompt.id]}
                          className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 rounded-md transition-colors disabled:opacity-50 text-sm"
                        >
                          {generatingImages[prompt.id] ? (
                            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-purple-400" />
                          )}
                          <span>{generatingImages[prompt.id] ? 'Generating...' : 'Generate'}</span>
                        </button>
                      </div>
                      {prompt.image && (
                        <img
                          src={prompt.image}
                          alt={prompt.text}
                          className="mt-4 rounded-lg w-full max-w-md mx-auto"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MakeDesignFeature: React.FC = () => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const findAndInsertAfterGemstoneLibrary = () => {
      // Find the Gemstone Library section by looking for its button
      const gemstoneButton = Array.from(document.querySelectorAll('button')).find(
        button => button.textContent?.includes('Gemstone Library')
      );
      
      if (gemstoneButton) {
        // Get the parent div that contains all sections
        const parentDiv = gemstoneButton.closest('.space-y-4')?.parentElement;
        
        if (parentDiv && !document.getElementById('make-design-feature')) {
          // Create our container
          const container = document.createElement('div');
          container.id = 'make-design-feature';
          container.className = 'space-y-4';
          
          // Find the Market Trends div to insert before it
          const marketTrendsDiv = Array.from(parentDiv.children).find(
            child => child.textContent?.includes('Market Trends')
          );
          
          if (marketTrendsDiv) {
            parentDiv.insertBefore(container, marketTrendsDiv);
            setPortalContainer(container);
          }
        }
      }
    };

    // Initial insertion
    findAndInsertAfterGemstoneLibrary();

    // Set up MutationObserver to handle dynamic DOM changes
    const observer = new MutationObserver(() => {
      const existingContainer = document.getElementById('make-design-feature');
      if (!existingContainer) {
        findAndInsertAfterGemstoneLibrary();
      }
    });

    // Observe the sidebar content
    const sidebarContent = document.querySelector('.p-6.space-y-6');
    if (sidebarContent) {
      observer.observe(sidebarContent, {
        childList: true,
        subtree: true
      });
    }

    // Cleanup
    return () => {
      observer.disconnect();
      const container = document.getElementById('make-design-feature');
      if (container) {
        container.remove();
      }
    };
  }, []);

  return portalContainer ? createPortal(<DesignFeatureContent />, portalContainer) : null;
};