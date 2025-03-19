import React from 'react';
import { useParams } from 'react-router-dom';
import { marked } from 'marked';
import { BlogPost as BlogPostType } from '../components/BlogPost';
import BlogSection from '../components/BlogSection';
import { ArrowLeft } from 'lucide-react';
import { FULL_BLOG_POSTS } from './blogData';

const BlogPage: React.FC = () => {
  const { slug } = useParams();
  const post = FULL_BLOG_POSTS.find(p => p.slug === slug);

  if (slug && !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <a 
            href="/blog"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  if (post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <a 
            href="/blog"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </a>
          <article className="prose prose-invert prose-purple max-w-none">
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
              <span>{post.date}</span>
              <span>{post.readTime}</span>
              <span>{post.category}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-gray-300 mb-8">{post.description}</p>
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: marked(post.content) }}
            />
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a 
          href="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to JewelChat
        </a>
        <BlogSection />
      </div>
    </div>
  );
};

export default BlogPage;