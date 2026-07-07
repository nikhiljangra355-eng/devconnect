import React from "react";
import { MessageSquare, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import Avatar from "../components/Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Developers = () => {
  const { user } = useAuth();
  const [developers, setDevelopers] = useState([]);
  const [search, setSearch] = useState("");

  const loadDevelopers = async (term = "") => {
    const { data } = await api.get(`/users?search=${encodeURIComponent(term)}`);
    setDevelopers(data.filter((item) => item._id !== user._id));
  };

  useEffect(() => {
    loadDevelopers();
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    loadDevelopers(search);
  };

  const follow = async (id) => {
    await api.post(`/users/${id}/follow`);
    setDevelopers((current) =>
      current.map((item) =>
        item._id === id
          ? {
              ...item,
              followers: item.followers?.includes(user._id)
                ? item.followers.filter((followerId) => followerId !== user._id)
                : [...(item.followers || []), user._id]
            }
          : item
      )
    );
  };

  return (
    <main className="page narrow">
      <div className="section-title">
        <div>
          <p className="eyebrow">Network</p>
          <h1>Find developers</h1>
        </div>
        <form className="searchbox" onSubmit={submitSearch}>
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or skill" />
        </form>
      </div>

      <section className="developer-grid">
        {developers.map((developer) => {
          const isFollowing = developer.followers?.includes(user._id);

          return (
            <article key={developer._id} className="developer-card">
              <Avatar user={developer} size="lg" />
              <div>
                <h2>{developer.name}</h2>
                <p>{developer.headline}</p>
                <div className="chips">
                  {developer.skills?.slice(0, 5).map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </div>
              <div className="row">
                <button className={isFollowing ? "ghost" : ""} onClick={() => follow(developer._id)}>
                  <UserPlus size={18} />
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <Link className="button ghost" to={`/chat/${developer._id}`}>
                  <MessageSquare size={18} />
                  Chat
                </Link>
                <Link className="button ghost" to={`/profile/${developer._id}`}>
                  View
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default Developers;
