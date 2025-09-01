import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import { useAuth } from '../context/AuthContext';

const PostsFeed = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading posts...</span>
      </div>
      <p className="mt-2">Loading posts...</p>
    </div>
  );

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12 text-center mb-5">
          <h1 className="display-4 fw-bold">Community Posts</h1>
          <p className="lead text-muted">See what everyone is sharing</p>
        </div>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="row">
          {posts.map(post => (
            <div key={post.id} className="col-lg-8 col-xl-6 mx-auto mb-4">
              <PostCard 
                post={post} 
                onDelete={token && post.user_id ? () => handleDelete(post.id) : null} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsFeed;
