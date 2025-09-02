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
      className="post-card bg-white rounded-lg p-6 mb-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
      onClick={handlePostClick}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-4">
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="font-semibold text-gray-900">{post.author_name}</h3>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-500 text-sm flex items-center">
                <FiClock className="mr-1 h-3 w-3" />
                {formatDate(post.created_at)}
              </span>
            </div>

            {onDelete && (
              <div className="relative" ref={optionsRef}>
                <button
                  className="text-gray-400 hover:text-gray-600 rounded-full p-2 hover:bg-gray-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                >
                  <FiMoreHorizontal className="h-4 w-4" />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
            <p className={`text-gray-800 leading-relaxed ${!expanded && post.content.length > 150 ? 'line-clamp-3' : ''}`}>
              {post.content}
            </p>
            {post.content.length > 150 && (
              <button
                className="text-blue-600 text-sm font-medium mt-2 hover:underline flex items-center"
                onClick={toggleExpand}
              >
                {expanded ? 'Show less' : 'Read more'}
                <span className="ml-1">{expanded ? '↑' : '↓'}</span>
              </button>
            )}
          </div>

          {post.image_url && (
            <div
              className="mb-4 rounded-lg overflow-hidden border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`https://muterianc.pythonanywhere.com/static/posts/${post.image_url}`}
                alt="Post"
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <button
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${isLiked
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                }`}
              onClick={handleLike}
            >
              <FiHeart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{formatCount(likeCount)}</span>
            </button>

            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              onClick={handleReplyClick}
            >
              <FiMessageCircle className="h-4 w-4" />
              <span className="text-sm">{formatCount(post.replies_count || 0)}</span>
            </button>

            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              onClick={handleShare}
            >
              <FiShare className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
          </div>

          {isReplying && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="flex-grow">
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Write a reply..."
                    rows="2"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end mt-3 space-x-2">
                    <button
                      className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
                      onClick={() => setIsReplying(false)}
                    >
                      <FiX className="mr-1 h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 rounded-md text-white text-sm font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center"
                      onClick={() => {
                        onReply(post, replyContent);
                        setIsReplying(false);
                        setReplyContent('');
                      }}
                      disabled={!replyContent.trim()}
                    >
                      <FiSend className="mr-1 h-4 w-4" />
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

      // Add image support
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

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
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-gray-50 min-h-screen py-6 px-4">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Community Feed
        </h1>
        <p className="text-gray-600">Share and discover with your community</p>
      </div>

      {token && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          {composingPost ? (
            <div>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What's on your mind?"
                rows="4"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                autoFocus
              />

              <div className="flex items-center justify-between mt-4">
                <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                  <FiImage className="h-4 w-4 mr-2" />
                  Add Image
                </button>

                <div className="flex space-x-2">
                  <button
                    className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-medium hover:bg-gray-200 transition-colors flex items-center"
                    onClick={() => setComposingPost(false)}
                  >
                    <FiX className="mr-1 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 rounded-md text-white font-medium disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                  >
                    <FiSend className="mr-1 h-4 w-4" />
                    Post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <button
                className="flex-grow text-left text-gray-500 p-3 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                onClick={() => setComposingPost(true)}
              >
                <div className="flex items-center">
                  <FiPlusCircle className="h-4 w-4 mr-2" />
                  <span>What's on your mind?</span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm text-center py-12 px-4 border border-gray-200">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FiMessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
          {token && (
            <button
              className="px-6 py-2 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700 transition-colors"
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