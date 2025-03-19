import React from 'react';
import { Calendar, Clock, Tag, Share2 } from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
}

interface BlogPostProps {
  post: BlogPost;
}

const BlogPost: React.FC<BlogPostProps> = ({ post }) => {
  return (
    <article className="bg-white/5 backdrop-blur-lg rounded-lg overflow-hidden border border-purple-500/20">
      <img 
        src={post.image} 
        alt={post.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            {post.category}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
        <p className="text-gray-300 mb-4">{post.description}</p>
        <div className="flex items-center justify-between">
          <a 
            href={`/blog/${post.slug}`}
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Read More →
          </a>
          <button 
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
            title="Share this post"
          >
            <Share2 className="w-5 h-5 text-purple-400" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;

export { BlogPost }