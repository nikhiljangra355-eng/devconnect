# DevConnect

DevConnect is a LinkedIn-style social network for developers built with React, Node.js, Express, MongoDB, Socket.io, JWT, bcrypt, and Cloudinary.

## Features

- JWT authentication with hashed passwords
- Developer profiles with skills, experience, portfolio links, and profile photos
- Cloudinary image uploads for profile pictures and post images
- Posts with create, edit, delete, like, bookmark, and comments
- Infinite scrolling feed
- Follow and unfollow developers
- Real-time room-based chat with Socket.io
- Online and offline presence in chat

## Folder Structure

```text
devconnect/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      socket/
      server.js
  frontend/
    src/
      api/
      components/
      context/
      pages/
      socket/
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

3. Create frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

4. Update `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/devconnect
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Start MongoDB locally, then run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/api/health`

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/me`
- `POST /api/users/:id/follow`

### Posts

- `GET /api/posts?page=1&limit=8`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/bookmark`
- `POST /api/posts/:id/comments`

### Chat

- `GET /api/chats/:userId/messages`

Socket events:

- `room:join`
- `room:joined`
- `message:send`
- `message:received`
- `presence:online`

## Points

- The frontend stores the JWT in local storage and attaches it through an Axios interceptor.
- Protected Express routes use JWT verification middleware before reaching controllers.
- Passwords are hashed by a Mongoose pre-save hook using bcrypt.
- Images are uploaded to Cloudinary from memory using Multer, and only the returned URL/public ID are stored in MongoDB.
- Feed pagination supports infinite scrolling by returning `hasMore` from the API.
- Chat uses a deterministic room ID made from both user IDs, so the same two users always enter the same room.
- Socket.io authenticates the connection with the same JWT used by REST APIs.
