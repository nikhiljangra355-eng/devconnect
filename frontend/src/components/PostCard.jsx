import React from "react";
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "./Avatar.jsx";

const PostCard = ({ post, onChange, onDelete }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const isMine = post.author?._id === user?._id;
  const liked = post.likes?.includes(user?._id);
  const bookmarked = post.bookmarks?.includes(user?._id);

  const toggle = async (path) => {
    await api.post(`/posts/${post._id}/${path}`);
    const next = {
      ...post,
      [path === "like" ? "likes" : "bookmarks"]: post[path === "like" ? "likes" : "bookmarks"]?.includes(user._id)
        ? post[path === "like" ? "likes" : "bookmarks"].filter((id) => id !== user._id)
        : [...(post[path === "like" ? "likes" : "bookmarks"] || []), user._id]
    };
    onChange(next);
  };

  const saveEdit = async () => {
    const { data } = await api.put(`/posts/${post._id}`, { content: draft });
    setEditing(false);
    onChange(data);
  };

  const remove = async () => {
    await api.delete(`/posts/${post._id}`);
    onDelete(post._id);
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;

    const { data } = await api.post(`/posts/${post._id}/comments`, { text: comment.trim() });
    setComment("");
    onChange(data);
  };

  return (
    <article className="post-card">
      <div className="post-head">
        <Avatar user={post.author} />
        <div>
          <strong>{post.author?.name}</strong>
          <p>{post.author?.headline}</p>
        </div>
        {isMine && (
          <div className="post-menu">
            <MoreHorizontal size={18} />
            <button title="Edit post" onClick={() => setEditing(true)}>
              <Pencil size={16} />
            </button>
            <button title="Delete post" onClick={remove}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="edit-box">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} />
          <div className="row right">
            <button className="ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button onClick={saveEdit}>Save</button>
          </div>
        </div>
      ) : (
        <p className="post-content">{post.content}</p>
      )}

      {post.image?.url && <img className="post-image" src={post.image.url} alt="Post upload" />}

      <div className="post-actions">
        <button className={liked ? "active" : ""} onClick={() => toggle("like")}>
          <Heart size={18} />
          {post.likes?.length || 0}
        </button>
        <button className={bookmarked ? "active" : ""} onClick={() => toggle("bookmark")}>
          <Bookmark size={18} />
          {post.bookmarks?.length || 0}
        </button>
        <span>
          <MessageCircle size={18} />
          {post.comments?.length || 0}
        </span>
      </div>

      <div className="comments">
        {post.comments?.slice(-3).map((item) => (
          <p key={item._id}>
            <strong>{item.user?.name}:</strong> {item.text}
          </p>
        ))}
      </div>

      <form className="comment-form" onSubmit={addComment}>
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Add a thoughtful comment"
        />
        <button>Post</button>
      </form>
    </article>
  );
};

export default PostCard;
