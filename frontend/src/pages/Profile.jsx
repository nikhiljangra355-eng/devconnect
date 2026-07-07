import React from "react";
import { Camera, ExternalLink, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import Avatar from "../components/Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Profile = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    headline: "",
    skills: "",
    experience: "",
    portfolioLinks: ""
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const isMine = id === user._id;

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await api.get(`/users/${id}`);
      setProfile(data);
      setForm({
        name: data.name || "",
        headline: data.headline || "",
        skills: data.skills?.join(", ") || "",
        experience: data.experience || "",
        portfolioLinks:
          data.portfolioLinks
            ?.map((link) => `${link.label}|${link.url}`)
            .join("\n") || ""
      });
    };

    loadProfile();
  }, [id]);

  const save = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("headline", form.headline);
    formData.append("skills", form.skills);
    formData.append("experience", form.experience);

    const parsedLinks = form.portfolioLinks
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, url] = line.split("|");
        return { label: label?.trim() || "Portfolio", url: url?.trim() || label?.trim() };
      });

    formData.append("portfolioLinks", JSON.stringify(parsedLinks));
    if (profilePicture) formData.append("profilePicture", profilePicture);

    const { data } = await api.put("/users/me", formData);
    setProfile(data);
    refreshUser(data);
  };

  if (!profile) {
    return <main className="page narrow">Loading profile...</main>;
  }

  return (
    <main className="page profile-page">
      <section className="profile-hero">
        <Avatar user={profile} size="xl" />
        <div>
          <p className="eyebrow">Developer profile</p>
          <h1>{profile.name}</h1>
          <p>{profile.headline}</p>
          <div className="chips">
            {profile.skills?.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
        {!isMine && (
          <Link className="button" to={`/chat/${profile._id}`}>
            Message
          </Link>
        )}
      </section>

      <section className="profile-main">
        <article className="panel">
          <h2>Experience</h2>
          <p className="preserve">{profile.experience || "No experience added yet."}</p>
          <h2>Portfolio</h2>
          <div className="link-list">
            {profile.portfolioLinks?.length ? (
              profile.portfolioLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                  <ExternalLink size={16} />
                </a>
              ))
            ) : (
              <p>No portfolio links added yet.</p>
            )}
          </div>
        </article>

        {isMine && (
          <form className="panel stack" onSubmit={save}>
            <h2>Edit profile</h2>
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              Headline
              <input
                value={form.headline}
                onChange={(event) => setForm({ ...form, headline: event.target.value })}
              />
            </label>
            <label>
              Skills
              <input
                value={form.skills}
                onChange={(event) => setForm({ ...form, skills: event.target.value })}
                placeholder="React, Node.js, MongoDB"
              />
            </label>
            <label>
              Experience
              <textarea
                value={form.experience}
                onChange={(event) => setForm({ ...form, experience: event.target.value })}
              />
            </label>
            <label>
              Portfolio links
              <textarea
                value={form.portfolioLinks}
                onChange={(event) => setForm({ ...form, portfolioLinks: event.target.value })}
                placeholder={"GitHub|https://github.com/username\nPortfolio|https://your-site.com"}
              />
            </label>
            <label className="file-button wide">
              <Camera size={18} />
              <span>{profilePicture ? profilePicture.name : "Upload profile picture"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setProfilePicture(event.target.files[0])}
              />
            </label>
            <button>
              <Save size={18} />
              Save profile
            </button>
          </form>
        )}
      </section>
    </main>
  );
};

export default Profile;
