import React from 'react';

const PostCard = ({ post, onDelete }) => {
  return (
    <div className="bg-white shadow-md rounded p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">{post.author_name}</h3>
        {onDelete && (
          <button
            className="text-red-500"
            onClick={() => onDelete(post.id)}
          >
            Delete
          </button>
        )}
      </div>
      <p className="mb-2">{post.content}</p>
      {post.image_url && (
        <img
          src={`/static/posts/${post.image_url}`}
          alt="Post"
          className="w-full max-h-96 object-cover rounded"
        />
      )}
      <p className="text-gray-400 text-sm mt-2">
        {new Date(post.created_at).toLocaleString()}
      </p>
    </div>
  );
};

export default PostCard;
