import React from 'react';
import { useParams } from 'react-router-dom';

const BlogPage: React.FC = () => {
  const { slug } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Blog {slug ? `- ${slug}` : ''}</h1>
      <div className="prose max-w-none">
        {/* Blog content will go here */}
      </div>
    </div>
  );
};

export default BlogPage; 