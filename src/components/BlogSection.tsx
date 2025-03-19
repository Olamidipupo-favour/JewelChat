import React from 'react';
import BlogPost, { BlogPost as BlogPostType } from './BlogPost';
import { Diamond, TrendingUp, Brain } from 'lucide-react';

const BLOG_POSTS: BlogPostType[] = [
  {
    id: '1',
    title: 'The Future of Jewelry Design: AI-Powered Innovation',
    description: 'Discover how artificial intelligence is revolutionizing the jewelry design process, from concept to creation.',
    content: '',
    date: 'Feb 15, 2024',
    readTime: '5 min read',
    category: 'AI Design',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800',
    slug: 'future-of-jewelry-design-ai'
  },
  {
    id: '2',
    title: '2024 Jewelry Market Trends: AI Analysis',
    description: 'An in-depth analysis of current jewelry market trends using advanced AI market prediction models.',
    content: '',
    date: 'Feb 14, 2024',
    readTime: '7 min read',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800',
    slug: 'jewelry-market-trends-2024'
  },
  {
    id: '3',
    title: 'Smart Investment: AI-Guided Gemstone Selection',
    description: 'Learn how AI technology can help you make informed decisions when investing in precious gemstones.',
    content: '',
    date: 'Feb 13, 2024',
    readTime: '6 min read',
    category: 'Investment',
    image: 'https://images.unsplash.com/photo-1583937443566-6fe1a1c6e400?auto=format&fit=crop&w=800',
    slug: 'ai-guided-gemstone-investment'
  }
];

const BlogSection: React.FC = () => {
  return (
    <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest Insights</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Expert analysis and insights on jewelry design, market trends, and investment opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {BLOG_POSTS.map(post => (
            <BlogPost key={post.id} post={post} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <Diamond className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Design Insights</h3>
            <p className="text-gray-300">
              Weekly updates on AI-powered jewelry design innovations and trends.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
            <p className="text-gray-300">
              Real-time market trends and investment opportunities in the jewelry sector.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
            <Brain className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expert Insights</h3>
            <p className="text-gray-300">
              Professional guidance on gemstone selection and jewelry manufacturing.
            </p>
          </div>
        </div>

        {/* Product Hunt Badge */}
        <div className="mt-12 text-center">
          <a 
            href="https://www.producthunt.com/posts/jewelchat?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-jewelchat" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=875619&theme=light&t=1739429619708" 
              alt="JewelChat - AI‑Powered Jewelry Design & Market Insights – Free to Use!" 
              style={{ width: '250px', height: '54px' }} 
              width="250" 
              height="54" 
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogSection;