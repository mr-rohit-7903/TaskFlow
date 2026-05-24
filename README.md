# TaskFlow — Enterprise Project Management Platform

> A full-stack MERN application for modern team collaboration. Jira-inspired, beautifully designed, production-ready.

![TaskFlow Dashboard](https://placehold.co/1200x600/6750a4/ffffff?text=TaskFlow+Dashboard)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 👥 **Role-based Access** — Admin and Member roles with scoped permissions
- 📊 **Analytics Dashboard** — Task stats, productivity charts, activity feed
- 📁 **Project Management** — Create, edit, delete projects with progress tracking
- 🗂️ **Kanban Board** — Drag-and-drop task management across 4 columns
- 🔍 **Search & Filters** — Filter tasks by status, priority, assignee, and search text
- 💬 **Task Comments** — Real-time comment threads per task
- 📅 **Due Dates & Overdue Tracking** — Visual overdue indicators
- 🏷️ **Labels & Tags** — Organize tasks and projects
- 📱 **Fully Responsive** — Desktop, tablet, and mobile-ready
- 🎨 **Material Design 3** — Modern, clean UI with smooth animations

---

## 🛠 Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS           |
| Backend     | Node.js + Express.js                     |
| Database    | MongoDB + Mongoose                       |
| Auth        | JWT + bcryptjs                           |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable        |
| Charts      | Recharts                                 |
| Deployment  | Vercel (client) + Render (server)        |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

### 2. Install all dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

**Server** — copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/taskflow
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Run in development
```bash
# From root — runs both server and client concurrently
npm run dev

# Or individually:
npm run server   # API on http://localhost:5000
npm run client   # App on http://localhost:5173
```

---

## 📁 Project Structure

```
taskflow/
├── server/                     # Express API
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Route handlers
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   └── activityController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protection + admin guard
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── userRoutes.js
│   │   └── activityRoutes.js
│   └── server.js
│
└── client/                     # React app
    └── src/
        ├── components/
        │   ├── common/         # Reusable UI components
        │   ├── kanban/         # Kanban board components
        │   └── layout/         # Sidebar, Navbar, MobileNav
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        ├── layouts/
        │   └── AppLayout.jsx
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── ProjectsPage.jsx
        │   ├── ProjectDetailPage.jsx
        │   ├── KanbanPage.jsx
        │   ├── TasksPage.jsx
        │   ├── TeamPage.jsx
        │   ├── SettingsPage.jsx
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        ├── services/           # Axios API calls
        └── utils/              # Helpers, constants
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint            | Access  | Description        |
|--------|---------------------|---------|--------------------|
| POST   | /api/auth/register  | Public  | Register user      |
| POST   | /api/auth/login     | Public  | Login user         |
| GET    | /api/auth/me        | Private | Get current user   |
| PUT    | /api/auth/profile   | Private | Update profile     |

### Projects
| Method | Endpoint                        | Access  | Description          |
|--------|---------------------------------|---------|----------------------|
| GET    | /api/projects                   | Private | List user projects   |
| POST   | /api/projects                   | Private | Create project       |
| GET    | /api/projects/:id               | Private | Get project          |
| PUT    | /api/projects/:id               | Private | Update project       |
| DELETE | /api/projects/:id               | Private | Delete project       |
| POST   | /api/projects/:id/members       | Private | Add member           |
| DELETE | /api/projects/:id/members/:uid  | Private | Remove member        |

### Tasks
| Method | Endpoint                   | Access  | Description        |
|--------|----------------------------|---------|--------------------|
| GET    | /api/tasks                 | Private | List/filter tasks  |
| POST   | /api/tasks                 | Private | Create task        |
| GET    | /api/tasks/:id             | Private | Get task           |
| PUT    | /api/tasks/:id             | Private | Update task        |
| DELETE | /api/tasks/:id             | Private | Delete task        |
| POST   | /api/tasks/:id/comments    | Private | Add comment        |
| GET    | /api/tasks/stats           | Private | Dashboard stats    |

### Users
| Method | Endpoint               | Access        | Description      |
|--------|------------------------|---------------|------------------|
| GET    | /api/users             | Admin only    | List all users   |
| GET    | /api/users/:id         | Private       | Get user         |
| PUT    | /api/users/:id/role    | Admin only    | Update role      |
| DELETE | /api/users/:id         | Admin only    | Delete user      |

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd client
# Push to GitHub, connect repo to Vercel
# Set env var: VITE_API_URL=https://your-api.onrender.com
```

### Backend → Render
```bash
# Push server/ to GitHub
# Create new Web Service on Render
# Set environment variables from .env.example
# Build: npm install  |  Start: npm start
```

### Database → MongoDB Atlas
1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user and whitelist `0.0.0.0/0`
3. Copy the connection string into `MONGO_URI`

---

## 🔑 Environment Variables

### Server (`server/.env`)
| Variable     | Description                        | Example                        |
|--------------|------------------------------------|-------------------------------|
| PORT         | Server port                        | `5000`                        |
| MONGO_URI    | MongoDB connection string          | `mongodb+srv://...`           |
| JWT_SECRET   | Secret for signing JWTs            | `mysupersecret123`            |
| JWT_EXPIRE   | Token expiration                   | `30d`                         |
| CLIENT_URL   | Frontend URL for CORS              | `http://localhost:5173`       |
| NODE_ENV     | Environment                        | `development` / `production`  |

---

## 👤 Default Roles

- **First registered user** → automatically assigned `Admin` role
- All subsequent users → assigned `Member` role by default
- Admins can promote any user to Admin via the Team page

---

## 📸 Screenshots

| Dashboard | Kanban Board | Projects | Team |
|-----------|--------------|----------|------|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

---

## 📄 License

MIT © TaskFlow

---

Built with ❤️ using the MERN stack.
# TaskFlow
