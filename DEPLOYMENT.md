# DevConnect Deployment

Deploy this project as three online services:

```text
Frontend: Vercel
Backend: Render
Database: MongoDB Atlas
Images: Cloudinary
```

## 1. MongoDB Atlas

Create a free MongoDB Atlas cluster and copy the connection string.

Use a database name at the end:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/devconnect
```

In Atlas Network Access, allow access from Render. For a beginner deployment, you can use `0.0.0.0/0`.

## 2. Cloudinary

Create a Cloudinary account and copy:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Cloudinary is important in production because Render's free filesystem is not permanent.

## 3. Deploy Backend On Render

Create a new Render Web Service from the GitHub repo:

```text
https://github.com/nikhiljangra355-eng/devconnect
```

Use these settings:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Environment variables:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=make_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
API_PUBLIC_URL=https://your-render-backend.onrender.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

After deploy, test:

```text
https://your-render-backend.onrender.com/api/health
```

## 4. Deploy Frontend On Vercel

Create a new Vercel project from the same GitHub repo.

Use these settings:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Environment variables:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
VITE_SOCKET_URL=https://your-render-backend.onrender.com
```

## 5. Connect Frontend And Backend

After Vercel gives you the frontend URL, go back to Render and update:

```env
CLIENT_URL=https://your-vercel-app.vercel.app
```

Redeploy the backend.

## 6. Common Problems

If login/register fails:

```text
Check MONGO_URI and JWT_SECRET in Render.
```

If images do not upload:

```text
Check Cloudinary variables in Render.
```

If frontend says network error:

```text
Check VITE_API_URL in Vercel.
Check CLIENT_URL in Render.
```

If chat does not work:

```text
Check VITE_SOCKET_URL in Vercel.
Check backend Render service is awake.
```
