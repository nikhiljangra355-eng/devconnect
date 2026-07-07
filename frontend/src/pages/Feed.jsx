import React from "react";
import { ImagePlus, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../api/client.js";
import Avatar from "../components/Avatar.jsx";
import PostCard from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);

  const loadPosts = async (nextPage = 1) => {
    if (loading) return;
    setLoading(true);

    const { data } = await api.get(`/posts?page=${nextPage}&limit=8`);
    setPosts((current) => (nextPage === 1 ? data.posts : [...current, ...data.posts]));
    setPage(nextPage);
    setHasMore(data.hasMore);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadPosts(page + 1);
      }
    });

    const marker = observerRef.current;
    if (marker) observer.observe(marker);

    return () => {
      if (marker) observer.unobserve(marker);
    };
  }, [hasMore, loading, page]);

  const createPost = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;

    const formData = new FormData();
    formData.append("content", content.trim());
    if (image) formData.append("image", image);

    const { data } = await api.post("/posts", formData);
    setPosts((current) => [data, ...current]);
    setContent("");
    setImage(null);
    event.target.reset();
  };

  const updatePost = (nextPost) => {
    setPosts((current) => current.map((post) => (post._id === nextPost._id ? nextPost : post)));
  };

  const deletePost = (postId) => {
    setPosts((current) => current.filter((post) => post._id !== postId));
  };

  return (
    <main className="page feed-layout">
      <aside className="profile-strip">
        <Avatar user={user} size="lg" />
        <h2>{user.name}</h2>
        <p>{user.headline}</p>
        <div className="stat-grid">
          <span>
            <strong>{user.followers?.length || 0}</strong>
            Followers
          </span>
          <span>
            <strong>{user.following?.length || 0}</strong>
            Following
          </span>
        </div>
      </aside>

      <section className="feed-column">
        <form className="composer" onSubmit={createPost}>
          <div className="composer-row">
            <Avatar user={user} />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share a build, bug fix, learning, or hiring update"
              required
            />
          </div>
          <div className="row between">
            <label className="file-button">
              <ImagePlus size={18} />
              <span>{image ? image.name : "Image"}</span>
              <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files[0])} />
            </label>
            <button>
              <Send size={18} />
              Publish
            </button>
          </div>
        </form>

        {posts.map((post) => (
          <PostCard key={post._id} post={post} onChange={updatePost} onDelete={deletePost} />
        ))}

        <div ref={observerRef} className="load-marker">
          {loading ? "Loading posts..." : hasMore ? "Scroll for more" : "You are caught up"}
        </div>
      </section>
    </main>
  );
};

export default Feed;
