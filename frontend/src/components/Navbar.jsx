import React from "react";
import { Code2, LogOut, MessageSquare, Newspaper, Search, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        <Code2 size={24} />
        <span>DevConnect</span>
      </NavLink>
      <nav className="navlinks">
        <NavLink to="/">
          <Newspaper size={18} />
          Feed
        </NavLink>
        <NavLink to="/developers">
          <Search size={18} />
          Developers
        </NavLink>
        <NavLink to={`/profile/${user?._id}`}>
          <UserRound size={18} />
          Profile
        </NavLink>
        <NavLink to="/developers">
          <MessageSquare size={18} />
          Chat
        </NavLink>
      </nav>
      <button className="icon-text ghost" onClick={handleLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </header>
  );
};

export default Navbar;
