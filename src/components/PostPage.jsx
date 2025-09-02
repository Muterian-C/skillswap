import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard'; // Assuming PostCard is in the same directory

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchPostAndReplies();
  }, [id]);

  const fetchPostAndReplies = async () => {
    try {
      setLoading(true);
      // Fetch the main post
      const postRes = await axios.get(`https://muterianc.pythonanywhere.com/api/posts/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      setPost(postRes.data.post);
      
      // Fetch replies (you might need to implement this endpoint)
      // For now, let's assume your backend returns replies with the post
      // If not, you'll need to create a separate endpoint for fetching replies
      
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    
    try {
      const formData = new FormData();
      formData.append('content', replyContent);
      
      await axios.post(`https://muterianc.pythonanywhere.com/api/posts/${id}/reply`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh the post to see the new reply
      fetchPostAndReplies();
      setReplyContent('');
    } catch (err) {
      console.error('Error posting reply:', err);
      alert(err.response?.data?.error || 'Error posting reply');
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await axios.post(`https://muterianc.pythonanywhere.com/api/posts/${postId}/like`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.delete(`https://muterianc.pythonanywhere.com/api/posts/${postId}/like`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      // Refresh the post to see updated like count
      fetchPostAndReplies();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen py-6">
      <div className="mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-500 font-medium hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to feed
        </button>
      </div>

      {/* Main post */}
      <PostCard 
        post={post} 
        onDelete={token && post.user_id === currentUser?.id ? () => {
          // Handle delete and navigate back
          handleDelete(post.id);
        } : null}
        onLike={handleLike}
        onReply={null} // Disable reply button since we have a dedicated reply section
        currentUser={currentUser}
      />

      {/* Reply form */}
      {token && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Post your reply</h3>
          </div>
          
          <textarea
            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your reply..."
            rows="3"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          
          <div className="flex justify-end mt-3">
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium disabled:opacity-50 hover:from-purple-600 hover:to-blue-600 transition-all"
              onClick={handleReply}
              disabled={!replyContent.trim()}
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      {/* Replies section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Replies</h2>
        
        {replies.length > 0 ? (
          <div className="space-y-4">
            {replies.map(reply => (
              <div key={reply.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      {reply.author_name ? reply.author_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{reply.author_name}</h4>
                      <span className="text-gray-500 text-sm">@{reply.author_name.toLowerCase().replace(/\s+/g, '')}</span>
                    </div>
                    <p className="text-gray-800 mt-1">{reply.content}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(reply.created_at).toLocaleDateString()} at{' '}
                      {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No replies yet. Be the first to reply!</p>
        )}
      </div>
    </div>
  );
};

export default PostPage;