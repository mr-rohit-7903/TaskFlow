# TaskFlow - Enterprise Project Management Platform

TaskFlow is a full-stack, enterprise-grade project management application designed for modern team collaboration. Inspired by professional tools like Jira, TaskFlow provides teams with visual project tracking, role-based controls, real-time activity metrics, and interactive Kanban boards.

---

## Key Features

- **JWT Authentication** - Secure user registration and login utilizing bcrypt password hashing and token-based validation.
- **Role-Based Access Control (RBAC)** - Admin and Member roles with scoped access controls over projects, tasks, and system configurations.
- **Analytics Dashboard** - Real-time statistics, weekly productivity visualization, and a global workspace activity feed.
- **Project Tracking** - Core project CRUD actions, status management, and team member assignments.
- **Kanban Board** - Interactive board view featuring state-synced card columns for managing workflow states.
- **Search and Filters** - Multi-criteria search capabilities supporting queries by status, priority, assignee, and text.
- **Task Comments** - Nested comment streams within specific tasks to foster seamless team communication.
- **Deadlines and Overdue Management** - Date parsing and relative time calculations with visual warnings for overdue deliverables.
- **Responsive Layout** - Responsive views built using a unified design system supporting desktop, tablet, and mobile browsers.

---

## Technology Stack

| Layer | Technology | Description |
|---|---|---|
| Frontend | React 18, Vite | High-performance SPA bundler and component library |
| Styling | Tailwind CSS | Utility-first CSS framework for structural styling |
| Backend | Node.js, Express.js | RESTful HTTP API server with modular route handlers |
| Database | MongoDB, Mongoose | NoSQL document database and schema-based modeling |
| Auth | JWT, bcryptjs | JSON Web Tokens for stateless sessions and credential hashing |
| Drag & Drop | @dnd-kit | Lightweight, modular drag-and-drop primitives |
| Charts | Recharts | Declarative charts for reporting workspace metrics |
| Hosting | Vercel | Production static client and serverless function deployment |

---

## Architectural Highlights

- **Vite API Proxying**: During local development, the client proxies api calls to the backend via Vite's `server.proxy` configurations. In production, request routing is seamlessly mapped directly to the serverless backend deployment.
- **Dynamic CORS Handling**: The backend Express server validates incoming request origins dynamically against a list of safe domains, automatically parsing environment configurations and wildcard Vercel domains to allow secure front-to-back connectivity.
- **Clean REST Design**: Independent controllers decouple route registration from business logic, structured under resource namespaces (Auth, Projects, Tasks, Users, Activity).

---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB instance (local or Atlas cloud cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/mr-rohit-7903/TaskFlow.git
cd taskflow
```

### 2. Install Dependencies
```bash
# Install root package dependencies
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 3. Configure Environment Variables

**Server** - Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signature_secret
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Run in Development Mode
You can start both the client and the server simultaneously from the repository root:
```bash
npm run dev
```

Alternatively, run them in separate terminals:
```bash
# Start backend server (listening on http://localhost:5000)
npm run server

# Start Vite dev client (listening on http://localhost:5173)
npm run client
```

---

## Directory Structure

```
taskflow/
├── server/                     # Backend application code
│   ├── config/                 # DB connection and system configs
│   ├── controllers/            # Request handlers matching REST endpoints
│   ├── middleware/             # Route protection, RBAC, and error handlers
│   ├── models/                 # Mongoose schemas (User, Project, Task, Activity)
│   ├── routes/                 # Express router sub-modules
│   ├── vercel.json             # Vercel deployment serverless routing
│   └── server.js               # Express entrypoint
│
└── client/                     # Frontend application code
    ├── public/                 # Static assets
    ├── src/
    │   ├── components/         # Layout modules and shared visual components
    │   ├── context/            # React AuthContext for state-wide user sessions
    │   ├── layouts/            # Page layouts and global wrapping grids
    │   ├── pages/              # Routing views (Dashboard, Kanban, Auth pages)
    │   ├── services/           # Axios instance configuration and API request modules
    │   └── utils/              # Data formatting and configuration helpers
    └── vercel.json             # Vercel deployment SPA rewrite configuration
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create new account |
| POST | /api/auth/login | Public | Authenticate user and issue token |
| GET | /api/auth/me | Private | Fetch details of currently logged-in user |
| PUT | /api/auth/profile | Private | Update authenticated user credentials |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/projects | Private | List all projects current user belongs to |
| POST | /api/projects | Private | Instantiate a new project |
| GET | /api/projects/:id | Private | Fetch detailed metadata for a project |
| PUT | /api/projects/:id | Private | Update project information |
| DELETE | /api/projects/:id | Private | Remove a project |
| POST | /api/projects/:id/members | Private | Add team members to a project |
| DELETE | /api/projects/:id/members/:uid | Private | Revoke member access to project |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/tasks | Private | Retrieve tasks filtering by project/owner |
| POST | /api/tasks | Private | Create a task within a project |
| GET | /api/tasks/:id | Private | Retrieve full details of a task |
| PUT | /api/tasks/:id | Private | Modify details or status of a task |
| DELETE | /api/tasks/:id | Private | Delete a task |
| POST | /api/tasks/:id/comments | Private | Append a comment to a task |
| GET | /api/tasks/stats | Private | Retrieve aggregate stats for analytics |

### Users & Administration
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/users | Admin Only | View a directory of all registered users |
| GET | /api/users/:id | Private | View specific user information |
| PUT | /api/users/:id/role | Admin Only | Modify role assignment (Admin/Member) |
| DELETE | /api/users/:id | Admin Only | Terminate user account |

---

## Deployment Reference

### Client Hosting (Vercel)
To deploy the frontend React app to Vercel:
1. Navigate to your Vercel Dashboard and import the repository.
2. Select the `client` directory as the project root.
3. Configure the output directory as `dist` and build command as `npm run build`.
4. Define the production API target via env: `VITE_API_URL=https://your-backend-api.vercel.app`.

### Server Hosting (Vercel / Render)
To deploy the backend REST server as serverless functions to Vercel:
1. Ensure the `server/vercel.json` exists to handle incoming routes.
2. Link the repository, choosing `server` as the root folder.
3. Configure the environment variables in the settings dashboard: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL`, `NODE_ENV`.

---

## Permissions & Roles

- **Automatic Admin Elevation**: The first user to register on any fresh instance of TaskFlow is automatically designated as the system Admin.
- **Workspace Administration**: Only Admins have permissions to query user rosters, delete accounts, or elevate other Members to the Admin role.
- **Collaborator Controls**: Members can create, view, assign, and comment on tasks within any projects they are explicitly added to.

---

## License

This project is licensed under the MIT License.
