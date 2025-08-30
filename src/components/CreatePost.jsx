import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiImage, FiX } from 'react-icons/fi';

const CreatePost = ({ onPostCreated }) => {
  const { token } = useAuth();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content is required');
      return;
    }
    
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const res = await axios.post('https://muterianc.pythonanywhere.com/api/createPosts', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onPostCreated(res.data.post_id);
      setContent('');
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Create a Post</h3>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <textarea
        className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      
      <div className="mb-4">
        <label className="flex items-center cursor-pointer text-gray-600 hover:text-gray-800">
          <FiImage className="mr-2" />
          <span>Add Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>

      {imagePreview && (
        <div className="mb-4 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        disabled={loading || !content.trim()}
      >
        {loading ? (
          <span className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Posting...
          </span>
        ) : (
          'Post'
        )}
      </button>
    </form>
  );
};

export default CreatePost;