import React from "react";

const Avatar = ({ user, size = "md" }) => {
  const initial = user?.name?.charAt(0)?.toUpperCase() || "D";

  if (user?.profilePicture?.url) {
    return (
      <img
        className={`avatar avatar-${size}`}
        src={user.profilePicture.url}
        alt={`${user.name} profile`}
      />
    );
  }

  return <div className={`avatar avatar-${size}`}>{initial}</div>;
};

export default Avatar;
