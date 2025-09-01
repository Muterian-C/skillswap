import React, { useState } from 'react';
import axios from 'axios';
import { Image, X, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Your auth context

const CreatePost = ({ onPostCreated }) => {
  const { token } = useAuth(); // Real authentication
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

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
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await axios.post(
        "https://muterianc.pythonanywhere.com/api/createPosts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

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


  const charCount = content.length;
  const maxChars = 500;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="relative">
      {/* ✅ ADD THIS FORM WRAPPER WITH onSubmit HANDLER */}
      <form onSubmit={handleSubmit} className={`
      bg-white rounded-2xl shadow-lg border transition-all duration-300 ease-in-out
      ${focused ? 'shadow-xl border-blue-200 ring-2 ring-blue-100' : 'border-gray-100 hover:shadow-lg'}
    `}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">You</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Share your thoughts</h3>
              <p className="text-sm text-gray-500">What's happening in your world?</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-in slide-in-from-left-1 duration-300">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Textarea */}
          <div className="relative mb-4">
            <textarea
              className={`
              w-full border-2 p-4 rounded-xl text-gray-900 placeholder-gray-400
              resize-none transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-0
              ${focused ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 bg-gray-50/50'}
              ${isOverLimit ? 'border-red-300 bg-red-50/30' : ''}
            `}
              placeholder="Share something interesting..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={focused || content ? 4 : 3}
              maxLength={maxChars + 50}
            />

            {/* Character Counter */}
            <div className={`
            absolute bottom-3 right-3 text-xs font-medium transition-colors duration-200
            ${isOverLimit ? 'text-red-500' : charCount > maxChars * 0.8 ? 'text-yellow-600' : 'text-gray-400'}
          `}>
              {charCount}/{maxChars}
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4 relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative overflow-hidden rounded-xl border-2 border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={removeImage}
                  className="
                  absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white 
                  p-2 rounded-full shadow-lg transition-all duration-200
                  hover:scale-110 active:scale-95
                "
                >
                  <X size={16} />
                </button>
              </div>

              {/* Image Info */}
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Image size={14} className="mr-1" />
                <span>Image attached</span>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Image Upload Button */}
            <label className="
            flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 
            hover:bg-blue-50 rounded-lg cursor-pointer transition-all duration-200
            group
          ">
              <Image size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Post Button - This will now work as a submit button */}
            <button
              type="submit"
              disabled={loading || !content.trim() || isOverLimit}
              className={`
              relative flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold
              transition-all duration-200 transform hover:scale-105 active:scale-95
              disabled:transform-none disabled:hover:scale-100
              ${loading || !content.trim() || isOverLimit
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                }
            `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Share Post</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form> {/* ✅ CLOSING FORM TAG */}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-in fade-in duration-200">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-700">Creating your post...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;