import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Loader2, BookOpen, Brain, TrendingUp, AlertTriangle, Settings, Copy, Check, Sun, Moon, Info, Diamond, Sparkles, Palette, Download } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { marked } from 'marked';
import MoodboardGenerator from '../components/MoodboardGenerator';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Tooltip {
  term: string;
  definition: string;
}

const JEWELRY_TOOLTIPS: Tooltip[] = [
  {
    term: 'PVD coating',
    definition: 'Physical Vapor Deposition - A modern coating technique that creates durable, colorful finishes on jewelry'
  },
  {
    term: 'lab-grown diamonds',
    definition: 'Diamonds created in controlled laboratory conditions, sharing identical properties with natural diamonds'
  },
  {
    term: 'CAD/CAM',
    definition: 'Computer-Aided Design and Manufacturing - Digital tools used to design and produce jewelry with precision'
  }
];

const JEWELRY_ANECDOTES = [
  "Did you know? The first diamond engagement ring was given by Archduke Maximilian to Mary of Burgundy in 1477! 💍",
  "Fun fact: Platinum is so rare that all the platinum ever mined would fit in your living room! ✨",
  "Amazing! The largest cut diamond, the Golden Jubilee, weighs 545.67 carats! 💎",
  "Interesting: Ancient Egyptians believed emeralds could grant eternal youth! 🌟",
  "Wow! The world's most expensive piece of jewelry is valued at $250 million! 👑",
  "Cool fact: Pearls are the only gems made by living creatures! 🦪",
  "Did you know? Gold is so rare that the world pours more steel in an hour than it has poured gold since the beginning of recorded history! ⚡"
];

const createEnhancedPrompt = (userQuery: string) => {
  return `Analyze "${userQuery}" with a comprehensive focus on jewelry industry insights. Structure your response using the following format:

# ${userQuery} - Comprehensive Market Analysis

## Historical Context & Evolution
- Trace the evolution and significance
- Key milestones and developments
- Cultural importance and market impact
- **Include specific dates and events**

## Design Trends & Innovations
### Past Trends (Last 10 Years)
- Evolution of design aesthetics
- Material preferences
- Setting styles and techniques

### Current Trends 2024
- **Popular Metal Combinations**
  - Recycled metals usage
  - Mixed metal techniques
  - Finishing innovations
  
- **Gemstone Trends**
  - Popular combinations
  - Cutting techniques
  - Sustainable sourcing
  
- **Design Elements**
  - Architectural influences
  - Cultural fusion styles
  - Minimalist vs. statement pieces

### Future Forecast 2025+
- **Emerging Collection Concepts**
  - Collection names and themes
  - Design philosophy
  - Target market segments
  
- **Material Innovations**
  - New alloys and finishes
  - Sustainable materials
  - Technical advancements

## Market Analysis
### Current Landscape
- **Price Analysis by Category**
  - Entry-level market: $[range]
  - Mid-market segment: $[range]
  - Luxury segment: $[range]
  
### Value Drivers
- Material costs
- Production techniques
- Market demand
- Brand positioning

## Manufacturing & Sourcing
### Production Insights
- **Manufacturing Hubs**
  - Leading regions
  - Specializations
  - Quality standards
  
### Ethical Sourcing
- **Gemstone Sources**
  - Key mining regions
  - Certification standards
  - Sustainability practices

## Future Outlook
### Market Predictions
- **Short-term Forecast (1-2 years)**
  - Design trends
  - Market shifts
  - Price projections
  
### Long-term Vision
- **5-Year Projection**
  - Industry evolution
  - Technology impact
  - Market opportunities

## Investment & Growth
### Opportunities
- **Growth Areas**
  - Emerging markets
  - Product categories
  - Technology adoption
  
### Risk Assessment
- **Market Challenges**
  - Competition analysis
  - Economic factors
  - Industry threats

Please provide specific examples, case studies, and data points where available. Use bold text for key statistics and findings. Include actual market prices, growth rates, and specific trend examples. Do not include citation markers or references in the response.`;
};

const DeepResearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [currentAnecdote, setCurrentAnecdote] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
    if (!apiKey || apiKey === 'your-perplexity-api-key-here') {
      setApiKeyConfigured(false);
      setError('Perplexity API key not configured. Please add your API key to the .env file.');
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setCurrentAnecdote(prev => (prev + 1) % JEWELRY_ANECDOTES.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleCopyReport = async () => {
    try {
      // Clean up citation markers and format the report
      const cleanReport = report
        .replace(/\[\d+\]/g, '') // Remove citation markers like [1], [2], etc.
        .replace(/\s+\[\d+\]/g, '') // Remove citation markers with preceding space
        .replace(/\[\d+\]\s+/g, '') // Remove citation markers with following space
        .replace(/\[citation needed\]/gi, '') // Remove [citation needed] markers
        .replace(/\[source\]/gi, '') // Remove [source] markers
        .replace(/\[ref\]/gi, '') // Remove [ref] markers
        .trim(); // Clean up any extra whitespace

      // Format the report with proper HTML styling
      const formattedReport = `<div style="font-family: Arial, sans-serif;">${marked(cleanReport)}</div>`;
      
      // Create a clipboard item with HTML content
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([formattedReport], { type: 'text/html' }),
        'text/plain': new Blob([cleanReport], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy report:', err);
      // Fallback to plain text
      const cleanReport = report
        .replace(/\[\d+\]/g, '')
        .replace(/\s+\[\d+\]/g, '')
        .replace(/\[\d+\]\s+/g, '')
        .replace(/\[citation needed\]/gi, '')
        .replace(/\[source\]/gi, '')
        .replace(/\[ref\]/gi, '')
        .trim();
      await navigator.clipboard.writeText(cleanReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !report) return;
    
    try {
      setDownloadingPdf(true);
      setLoadingMessage('Preparing PDF download...');
      
      // Get title from the report content
      const titleMatch = report.match(/# ([^\n]+)/);
      const title = titleMatch ? titleMatch[1].trim() : 'Research Report';
      
      // Create a PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Find the actual formatted report content - look for the first h1 element
      const h1Elements = reportRef.current.querySelectorAll('h1');
      let reportContent: HTMLElement | null = null;
      
      if (h1Elements.length > 0) {
        // Get the first h1 element which should be the report title
        const titleElement = h1Elements[0];
        
        // Create a temporary div to hold only the formatted report
        const tempDiv = document.createElement('div');
        tempDiv.className = 'report-content-for-pdf';
        tempDiv.style.padding = '20px';
        tempDiv.style.color = isDarkMode ? '#ffffff' : '#000000';
        tempDiv.style.backgroundColor = isDarkMode ? '#1a1a2e' : '#ffffff';
        tempDiv.style.width = '800px'; // Set a fixed width for better scaling
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        
        // Get all elements starting from the h1 title
        let currentElement: Element | null = titleElement;
        while (currentElement) {
          const clone = currentElement.cloneNode(true) as HTMLElement;
          tempDiv.appendChild(clone);
          currentElement = currentElement.nextElementSibling;
        }
        
        // Append to document temporarily
        document.body.appendChild(tempDiv);
        reportContent = tempDiv;
      } else {
        // Fallback to the entire report div if no h1 found
        reportContent = reportRef.current.querySelector('.prose > div') as HTMLElement;
      }
      
      if (!reportContent) {
        throw new Error('Could not find report content element');
      }
      
      // Set up canvas options for better quality and handling of large content
      const canvasOptions = {
        scale: 1.5, // Adjusted for better balance between quality and performance
        logging: false,
        useCORS: true, // Allow cross-origin images
        allowTaint: true, // Allow tainted canvas
        backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff', // Match background color
        windowWidth: 800, // Fixed width for consistent rendering
        onclone: (clonedDoc: Document) => {
          // Find the cloned element
          const clonedContent = clonedDoc.querySelector('.report-content-for-pdf') || 
                               clonedDoc.querySelector('.prose > div') as HTMLElement;
          
          if (clonedContent) {
            // Apply styles for better PDF rendering
            clonedContent.style.padding = '20px';
            clonedContent.style.color = isDarkMode ? '#ffffff' : '#000000';
            clonedContent.style.fontFamily = 'Arial, sans-serif';
            
            // Increase font size for better readability
            clonedContent.style.fontSize = '16px';
            clonedContent.style.lineHeight = '1.6';
            
            // Make sure all headings are visible and properly sized
            const h1Elements = clonedContent.querySelectorAll('h1');
            h1Elements.forEach((heading: Element) => {
              (heading as HTMLElement).style.color = isDarkMode ? '#ffffff' : '#000000';
              (heading as HTMLElement).style.fontSize = '28px';
              (heading as HTMLElement).style.fontWeight = 'bold';
              (heading as HTMLElement).style.marginTop = '24px';
              (heading as HTMLElement).style.marginBottom = '16px';
              (heading as HTMLElement).style.lineHeight = '1.2';
            });
            
            const h2Elements = clonedContent.querySelectorAll('h2');
            h2Elements.forEach((heading: Element) => {
              (heading as HTMLElement).style.color = isDarkMode ? '#ffffff' : '#000000';
              (heading as HTMLElement).style.fontSize = '24px';
              (heading as HTMLElement).style.fontWeight = 'bold';
              (heading as HTMLElement).style.marginTop = '20px';
              (heading as HTMLElement).style.marginBottom = '12px';
              (heading as HTMLElement).style.lineHeight = '1.2';
            });
            
            const h3Elements = clonedContent.querySelectorAll('h3');
            h3Elements.forEach((heading: Element) => {
              (heading as HTMLElement).style.color = isDarkMode ? '#ffffff' : '#000000';
              (heading as HTMLElement).style.fontSize = '20px';
              (heading as HTMLElement).style.fontWeight = 'bold';
              (heading as HTMLElement).style.marginTop = '16px';
              (heading as HTMLElement).style.marginBottom = '8px';
              (heading as HTMLElement).style.lineHeight = '1.2';
            });
            
            // Style paragraphs
            const paragraphs = clonedContent.querySelectorAll('p');
            paragraphs.forEach((p: Element) => {
              (p as HTMLElement).style.fontSize = '16px';
              (p as HTMLElement).style.marginBottom = '12px';
              (p as HTMLElement).style.lineHeight = '1.6';
            });
            
            // Ensure lists are properly formatted
            const lists = clonedContent.querySelectorAll('ul, ol');
            lists.forEach((list: Element) => {
              (list as HTMLElement).style.paddingLeft = '24px';
              (list as HTMLElement).style.marginBottom = '16px';
            });
            
            const listItems = clonedContent.querySelectorAll('li');
            listItems.forEach((item: Element) => {
              (item as HTMLElement).style.fontSize = '16px';
              (item as HTMLElement).style.marginBottom = '8px';
              (item as HTMLElement).style.lineHeight = '1.6';
            });
            
            // Style tables
            const tables = clonedContent.querySelectorAll('table');
            tables.forEach((table: Element) => {
              (table as HTMLElement).style.width = '100%';
              (table as HTMLElement).style.borderCollapse = 'collapse';
              (table as HTMLElement).style.marginBottom = '16px';
            });
            
            const tableHeaders = clonedContent.querySelectorAll('th');
            tableHeaders.forEach((th: Element) => {
              (th as HTMLElement).style.fontSize = '16px';
              (th as HTMLElement).style.fontWeight = 'bold';
              (th as HTMLElement).style.padding = '8px';
              (th as HTMLElement).style.borderBottom = '2px solid #666';
              (th as HTMLElement).style.textAlign = 'left';
            });
            
            const tableCells = clonedContent.querySelectorAll('td');
            tableCells.forEach((td: Element) => {
              (td as HTMLElement).style.fontSize = '16px';
              (td as HTMLElement).style.padding = '8px';
              (td as HTMLElement).style.borderBottom = '1px solid #666';
            });
            
            // Style bold text
            const boldText = clonedContent.querySelectorAll('strong');
            boldText.forEach((b: Element) => {
              (b as HTMLElement).style.fontWeight = 'bold';
              (b as HTMLElement).style.color = isDarkMode ? '#ffffff' : '#000000';
            });
            
            // Remove any AI reasoning or planning text that might be at the top
            // Look for text that appears to be AI reasoning
            for (let i = 0; i < paragraphs.length; i++) {
              const text = paragraphs[i].textContent?.toLowerCase() || '';
              if (text.includes('need to analyze') || 
                  text.includes('let\'s start by') || 
                  text.includes('i need to') || 
                  text.includes('i should') ||
                  text.includes('moving to') ||
                  text.includes('first, the historical')) {
                // This looks like AI reasoning, remove it
                paragraphs[i].remove();
              }
            }
          }
        }
      };
      
      // Capture the report content
      const canvas = await html2canvas(reportContent, canvasOptions);
      
      // Calculate dimensions
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF with a clean filename
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`);
      
      // Clean up temporary element if created
      if (reportContent.className === 'report-content-for-pdf') {
        document.body.removeChild(reportContent);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
      setLoadingMessage('');
    }
  };

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
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    link: isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500',
    tooltip: isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  };

  const handleResearch = async () => {
    if (!apiKeyConfigured) {
      setError('Please configure your Perplexity API key first.');
      return;
    }

    if (!query.trim()) {
      setError('Please enter a research topic');
      return;
    }

    setLoading(true);
    setError('');
    setLoadingMessage('Roy is enhancing your query for deeper insights...');
    
    try {
      const perplexityApi = axios.create({
        baseURL: 'https://api.perplexity.ai',
        timeout: 300000, // 5 minutes - increased from 3 minutes
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Add request interceptor for timeout handling
      perplexityApi.interceptors.request.use((config) => {
        // Cancel any previous requests
        if (window.previousRequest) {
          window.previousRequest.cancel();
        }
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        window.previousRequest = source;
        config.cancelToken = source.token;
        return config;
      });

      setLoadingMessage('Roy is conducting deep market research...');

      const response = await perplexityApi.post(
        '/chat/completions',
        {
          model: "sonar-deep-research",
          messages: [
            {
              role: "system",
              content: "You are an expert jewelry market researcher with deep industry knowledge. Provide comprehensive, data-driven insights with detailed analysis and professional formatting. Focus on specific examples, case studies, and actionable insights. Use bold text for key findings and statistics."
            },
            {
              role: "user",
              content: createEnhancedPrompt(query)
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
          stream: false
        },
        {
          timeout: 300000, // 5 minutes - increased from 3 minutes
          timeoutErrorMessage: 'The research request is taking longer than expected. Please try a more specific query or try again later.'
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content;
        
        // Clean up citation markers before setting the report
        const cleanContent = content
          .replace(/\[\d+\]/g, '')
          .replace(/\s+\[\d+\]/g, '')
          .replace(/\[\d+\]\s+/g, '')
          .replace(/\[citation needed\]/gi, '')
          .replace(/\[source\]/gi, '')
          .replace(/\[ref\]/gi, '')
          .trim();
        
        // Add tooltips to technical terms
        let enhancedContent = cleanContent;
        JEWELRY_TOOLTIPS.forEach(tooltip => {
          const regex = new RegExp(`\\b${tooltip.term}\\b`, 'gi');
          enhancedContent = enhancedContent.replace(regex, `<span class="tooltip" data-term="${tooltip.term}">${tooltip.term}</span>`);
        });
        
        setReport(enhancedContent);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      let errorMessage = 'Failed to fetch research data. Please try again later.';
      
      if (err instanceof AxiosError) {
        console.error('API Error Details:', {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          data: err.response?.data
        });

        if (err.code === 'ECONNABORTED') {
          errorMessage = 'The research request timed out. Please try a more specific query or break your research into smaller topics.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Invalid API key. Please check your configuration.';
          setApiKeyConfigured(false);
        } else if (err.response?.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a few minutes and try again.';
        } else if (err.message === 'Network Error') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (axios.isCancel(err)) {
          errorMessage = 'Request was cancelled. Please try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMessage('');
      if (window.previousRequest) {
        window.previousRequest = null;
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleResearch();
    }
  };

  const handleTooltipClick = (term: string) => {
    setActiveTooltip(activeTooltip === term ? null : term);
  };

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 ${themeClasses.link} transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to JewelChat
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
            <Brain className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold">Deep Research</h1>
          </div>
          <p className={`text-xl ${themeClasses.subtext} max-w-2xl mx-auto`}>
            Unlock comprehensive insights into jewelry topics with our advanced research AI.
          </p>
        </div>

        <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6 mb-8`}>
          {!apiKeyConfigured ? (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-yellow-400">
                <Settings className="w-5 h-5" />
                <h3 className="font-semibold">API Configuration Required</h3>
              </div>
              <p className={themeClasses.subtext}>
                To use the Deep Research feature, please:
              </p>
              <ol className={`list-decimal list-inside text-sm ${themeClasses.subtext} mt-2 space-y-1`}>
                <li>Create a .env file in the project root</li>
                <li>Add your Perplexity API key: VITE_PERPLEXITY_API_KEY=your-key-here</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter your research topic (e.g., 'Latest trends in sustainable jewelry design')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`flex-1 ${themeClasses.input} border ${themeClasses.border} rounded-lg px-4 py-3 focus:outline-none focus:border-purple-400 ${themeClasses.text} placeholder-gray-400`}
                />
                <button
                  onClick={handleResearch}
                  disabled={loading}
                  className={`${themeClasses.button} text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Start Research
                    </>
                  )}
                </button>
              </div>

              {loading && (
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Diamond className="w-8 h-8 text-purple-400 animate-pulse" />
                    <Sparkles className="w-8 h-8 text-purple-400 animate-pulse delay-100" />
                    <Palette className="w-8 h-8 text-purple-400 animate-pulse delay-200" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {loadingMessage}
                  </p>
                  <p className="text-sm text-purple-400">
                    {JEWELRY_ANECDOTES[currentAnecdote]}
                  </p>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {report && (
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Research Report</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className={`flex items-center gap-2 px-4 py-2 ${themeClasses.input} rounded-lg transition-colors`}
                  title="Copy report to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 text-purple-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPdf}
                  className={`flex items-center gap-2 px-4 py-2 ${themeClasses.input} rounded-lg transition-colors`}
                  title="Download report as PDF"
                >
                  {downloadingPdf ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                      <span>Preparing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-purple-400" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div ref={reportRef} className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none relative`}>
              <div 
                ref={reportContentRef}
                dangerouslySetInnerHTML={{ __html: marked(report) }} 
              />
              
              {activeTooltip && (
                <div 
                  className={`fixed z-50 p-4 rounded-lg shadow-lg max-w-xs ${themeClasses.tooltip} border ${themeClasses.border}`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">{activeTooltip}</h4>
                      <p className="text-sm">
                        {JEWELRY_TOOLTIPS.find(t => t.term === activeTooltip)?.definition}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Add Mood Board Generator */}
            <MoodboardGenerator researchContent={report} isDarkMode={isDarkMode} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <Brain className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
            <p className={themeClasses.subtext}>
              Advanced AI models analyze vast amounts of jewelry industry data to provide comprehensive insights.
            </p>
          </div>
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <BookOpen className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Deep Insights</h3>
            <p className={themeClasses.subtext}>
              Get detailed research reports on any jewelry-related topic, from market trends to design innovations.
            </p>
          </div>
          <div className={`${themeClasses.card} backdrop-blur-lg rounded-lg p-6`}>
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Market Intelligence</h3>
            <p className={themeClasses.subtext}>
              Stay ahead with real-time market analysis and emerging trend identification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepResearchPage;