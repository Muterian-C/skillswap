import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiShare, 
  FiMoreHorizontal, 
  FiTrash2,
  FiPlusCircle,
  FiSend,
  FiX,
  FiImage,
  FiClock
} from 'react-icons/fi';

const PostCard = ({ post, onDelete, onLike, onReply, currentUser }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const optionsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.liked_by_current_user || false);
    }
  }, [currentUser, post.liked_by_current_user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post.id, !isLiked);
  };

  const handleReplyClick = (e) => {
    e.stopPropagation();
    if (onReply) {
      onReply(post);
      setIsReplying(true);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        text: post.content.substring(0, 100) + '...',
        url: `${window.location.origin}/post/${post.id}`,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Could not copy text: ', err));
    }
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div 
      className="post-card bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handlePostClick}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="font-bold text-gray-900 text-lg">{post.author_name}</h3>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-500 text-sm flex items-center">
                <FiClock className="mr-1" />
                {formatDate(post.created_at)}
              </span>
            </div>
            
            {onDelete && (
              <div className="relative" ref={optionsRef}>
                <button 
                  className="text-gray-400 hover:text-indigo-600 rounded-full p-2 hover:bg-indigo-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                >
                  <FiMoreHorizontal className="h-5 w-5" />
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-10 border border-gray-200">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptions(false);
                        onDelete(post.id);
                      }}
                    >
                      <FiTrash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-3 mb-4" onClick={(e) => e.stopPropagation()}>
            <p className={`text-gray-800 text-base leading-relaxed ${!expanded && post.content.length > 150 ? 'line-clamp-3' : ''}`}>
              {post.content}
            </p>
            {post.content.length > 150 && (
              <button 
                className="text-indigo-600 text-sm font-medium mt-2 hover:underline flex items-center"
                onClick={toggleExpand}
              >
                {expanded ? 'Show less' : 'Read more'}
                <span className="ml-1">{expanded ? '↑' : '↓'}</span>
              </button>
            )}
          </div>
          
          {post.image_url && (
            <div 
              className="mb-4 rounded-2xl overflow-hidden border border-gray-200 shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`https://muterianc.pythonanywhere.com/static/posts/${post.image_url}`}
                alt="Post"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                isLiked 
                  ? 'text-rose-600 bg-rose-50' 
                  : 'text-gray-600 hover:text-rose-600 hover:bg-rose-50'
              }`}
              onClick={handleLike}
            >
              <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{formatCount(likeCount)}</span>
            </button>
            
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
              onClick={handleReplyClick}
            >
              <FiMessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{formatCount(post.replies_count || 0)}</span>
            </button>
            
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <FiShare className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          {isReplying && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="flex-grow">
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Share your thoughts..."
                    rows="2"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end mt-3 space-x-3">
                    <button
                      className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors flex items-center"
                      onClick={() => setIsReplying(false)}
                    >
                      <FiX className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50 hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center"
                      onClick={() => {
                        onReply(post, replyContent);
                        setIsReplying(false);
                        setReplyContent('');
                      }}
                      disabled={!replyContent.trim()}
                    >
                      <FiSend className="mr-2 h-4 w-4" />
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostsFeed = () => {
  const { token, user: currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composingPost, setComposingPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://muterianc.pythonanywhere.com/api/posts', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`https://muterianc.pythonanywhere.com/api/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error deleting post');
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    try {
      const formData = new FormData();
      formData.append('content', newPostContent);
      
      await axios.post('https://muterianc.pythonanywhere.com/api/createPosts', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchPosts();
      setNewPostContent('');
      setSelectedImage(null);
      setComposingPost(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error creating post');
    }
  };

  const handleReply = async (post, content) => {
    if (!content.trim()) return;
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      await axios.post(`https://muterianc.pythonanywhere.com/api/posts/${post.id}/reply`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error posting reply');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Community Stream
        </h1>
        <p className="text-gray-600 text-lg">Discover and share with your community</p>
      </div>
      
      {token && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          {composingPost ? (
            <div className="mb-4">
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                placeholder="What's on your mind?"
                rows="4"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                autoFocus
              />
              
              <div className="flex items-center justify-between mt-4">
                <button className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                  <FiImage className="h-5 w-5 mr-2" />
                  Add Image
                </button>
                
                <div className="flex space-x-3">
                  <button
                    className="px-5 py-2 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors flex items-center"
                    onClick={() => setComposingPost(false)}
                  >
                    <FiX className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50 hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                  >
                    <FiSend className="mr-2 h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <button
                className="flex-grow text-left text-gray-500 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
                onClick={() => setComposingPost(true)}
              >
                <div className="flex items-center">
                  <FiPlusCircle className="h-5 w-5 mr-3 text-indigo-500" />
                  <span className="text-lg">Share your thoughts...</span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg text-center py-16 px-4 border border-gray-200">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
            <FiMessageCircle className="h-12 w-12 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-medium text-gray-900 mb-3">No posts yet</h3>
          <p className="text-gray-600 text-lg mb-6">Be the first to share something inspiring!</p>
          {token && (
            <button
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all text-lg"
              onClick={() => setComposingPost(true)}
            >
              Create your first post
            </button>
          )}
        </div>
      ) : (
        <div>
          {posts.map(post => (
            <PostCard 
              key={post.id}
              post={post} 
              onDelete={token && post.user_id === currentUser?.id ? handleDelete : null}
              onLike={handleLike}
              onReply={handleReply}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsFeed;