import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, onDelete, onLike, onReply, currentUser }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isClicked, setIsClicked] = useState(false);
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
    // Add a brief visual feedback before navigating
    setIsClicked(true);
    setTimeout(() => {
      navigate(`/post/${post.id}`);
    }, 150);
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
      // Fallback for browsers that don't support Web Share API
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
      className={`post-card bg-white rounded-xl shadow-sm p-5 mb-5 border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer ${isClicked ? 'scale-95 opacity-90' : ''}`}
      onClick={handlePostClick}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onMouseLeave={() => setIsClicked(false)}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900">{post.author_name}</h3>
              <span className="text-gray-500 text-sm">@{post.author_name.toLowerCase().replace(/\s+/g, '')}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
            </div>
            
            {onDelete && (
              <div className="relative" ref={optionsRef}>
                <button 
                  className="text-gray-400 hover:text-blue-500 rounded-lg p-2 hover:bg-blue-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-200">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptions(false);
                        onDelete(post.id);
                      }}
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-2 mb-3" onClick={(e) => e.stopPropagation()}>
            <p className={`text-gray-800 ${!expanded && post.content.length > 150 ? 'line-clamp-3' : ''}`}>
              {post.content}
            </p>
            {post.content.length > 150 && (
              <button 
                className="text-blue-500 text-sm font-medium mt-1 hover:underline"
                onClick={toggleExpand}
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
          
          {post.image_url && (
            <div 
              className="mb-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`https://muterianc.pythonanywhere.com/static/posts/${post.image_url}`}
                alt="Post"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}
          
          <div className="flex justify-between max-w-md mt-4 pt-3 border-t border-gray-100">
            <button 
              className="flex items-center text-gray-500 hover:text-blue-500 group transition-colors"
              onClick={handleReplyClick}
            >
              <div className="p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="ml-1 text-sm">{formatCount(post.replies_count || 0)}</span>
            </button>
            
            <button 
              className="flex items-center text-gray-500 hover:text-green-500 group transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 rounded-xl group-hover:bg-green-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="ml-1 text-sm">{formatCount(post.reposts_count || 0)}</span>
            </button>
            
            <button 
              className={`flex items-center group transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
              onClick={handleLike}
            >
              <div className="p-2 rounded-xl group-hover:bg-rose-50 transition-colors">
                {isLiked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </div>
              <span className="ml-1 text-sm">{formatCount(likeCount)}</span>
            </button>
            
            <button 
              className="flex items-center text-gray-500 hover:text-blue-500 group transition-colors"
              onClick={handleShare}
            >
              <div className="p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
            </button>
          </div>

          {isReplying && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="flex-grow">
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg bg-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Post your reply..."
                    rows="2"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end mt-2 space-x-3">
                    <button
                      className="px-3 py-1 text-sm bg-gray-100 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                      onClick={() => setIsReplying(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white font-medium disabled:opacity-50 hover:from-purple-600 hover:to-blue-600 transition-all"
                      onClick={() => {
                        onReply(post, replyContent);
                        setIsReplying(false);
                        setReplyContent('');
                      }}
                      disabled={!replyContent.trim()}
                    >
                      Reply
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

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
      
      // If you want to add image upload functionality later:
      // if (selectedImage) {
      //   formData.append('image', selectedImage);
      // }
      
      await axios.post('https://muterianc.pythonanywhere.com/api/createPosts', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refetch posts to get the updated list
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
      
      // Refetch posts to get updated counts
      fetchPosts();
      setReplyContent('');
      setReplyingTo(null);
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen py-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Community Feed</h1>
        <p className="text-gray-600">See what everyone is sharing</p>
      </div>
      
      {token && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          {composingPost ? (
            <div className="mb-4">
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share something with the community..."
                rows="4"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                autoFocus
              />
              
              {/* Image upload placeholder - implement if needed */}
              {/* <div className="mt-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                />
              </div> */}
              
              <div className="flex justify-end mt-3 space-x-3">
                <button
                  className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                  onClick={() => setComposingPost(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium disabled:opacity-50 hover:from-purple-600 hover:to-blue-600 transition-all"
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                >
                  Share
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <button
                className="flex-grow text-left text-gray-500 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                onClick={() => setComposingPost(true)}
              >
                Share something with the community...
              </button>
            </div>
          )}
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm text-center py-10 px-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No posts yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share something!</p>
          {token && (
            <button
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
              onClick={() => setComposingPost(true)}
            >
              Create post
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