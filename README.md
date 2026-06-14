# ChartFlow

**Modern Web-Based Collaboration & Communication Platform**

ChartFlow is an all-in-one communication, file-sharing, and project collaboration platform where users can chat, share files, manage projects, collaborate in teams, and organize work efficiently.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS + Vite |
| Backend | Node.js + Express.js + TypeScript |
| Database | MySQL 8.0+ |
| Auth | JWT + Refresh Tokens |
| Real-time | Socket.io |
| State | Redux Toolkit |
| File Storage | Local + AWS S3 |
| API Docs | Swagger / OpenAPI |

## Project Structure

```
ChartFlow/
├── backend/
│   ├── src/
│   │   ├── config/          # App config, DB, logger, swagger
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, validation, errors, upload, rate limiter
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Socket.io handlers
│   │   ├── utils/           # Helpers, email, storage, audit
│   │   └── server.ts        # Entry point
│   ├── uploads/             # Local file storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (layout, auth, chat, files, etc.)
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store & slices
│   │   ├── hooks/           # Custom hooks (useAuth, useSocket)
│   │   ├── services/        # API client, socket client
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Formatting utilities
│   │   └── App.tsx          # Root component with routing
│   └── package.json
├── database/
│   └── schema.sql           # Full MySQL schema
└── .gitignore
```

## Features

### Authentication
- Register, Login, Logout
- JWT + Refresh Token authentication
- Email verification
- Password reset (forgot/reset)
- Profile management
- Role-based access (user, admin, super_admin)

### Real-Time Chat
- Private direct messages
- Group conversations
- Team chat rooms
- Message reactions (emojis)
- Message pinning
- Typing indicators
- Read receipts
- Message search
- File attachments in messages

### File Management
- Single & multiple file upload
- Drag-and-drop upload
- File preview & download
- File versioning
- File tags & categories
- File sharing with permissions
- Search files
- Local & S3 storage support

### Team Management
- Create & manage teams
- Invite members via email
- Team roles (owner, admin, member)
- Team activity logs
- Team analytics

### Project Management
- Kanban board with drag-and-drop
- Task creation & assignment
- Status columns (Backlog, Todo, In Progress, Review, Done)
- Priority levels
- Due dates
- Task comments
- Progress tracking
- Project analytics

### Admin Panel
- User management
- Role management
- System dashboard with stats
- Activity monitoring
- System logs

### Additional
- Dark mode
- Responsive design
- PWA ready
- Global search
- Real-time notifications
- API documentation (Swagger)

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

### 1. Database Setup

```bash
# Create the database and tables
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and secrets
npm run dev
```

The backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`

### Default .env Configuration

```env
PORT=5000
NODE_ENV=development
API_PREFIX=/api/v1

DB_HOST=localhost
DB_PORT=3306
DB_NAME=chartflow
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh tokens |
| POST | /api/v1/auth/logout | Logout |
| POST | /api/v1/auth/forgot-password | Forgot password |
| POST | /api/v1/auth/reset-password | Reset password |
| GET | /api/v1/auth/verify-email | Verify email |
| GET | /api/v1/auth/profile | Get profile |
| PUT | /api/v1/auth/profile | Update profile |
| PUT | /api/v1/auth/change-password | Change password |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/chat/conversations | List conversations |
| POST | /api/v1/chat/conversations/direct | Create DM |
| POST | /api/v1/chat/conversations/group | Create group |
| GET | /api/v1/chat/conversations/:id/messages | Get messages |
| POST | /api/v1/chat/conversations/:id/messages | Send message |
| POST | /api/v1/chat/messages/:id/reactions | Add reaction |
| DELETE | /api/v1/chat/messages/:id/reactions | Remove reaction |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/files | Upload file |
| POST | /api/v1/files/multiple | Upload multiple |
| GET | /api/v1/files | List files |
| GET | /api/v1/files/:id | Get file |
| DELETE | /api/v1/files/:id | Delete file |
| GET | /api/v1/files/search | Search files |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/teams | List teams |
| POST | /api/v1/teams | Create team |
| GET | /api/v1/teams/:id | Get team |
| PUT | /api/v1/teams/:id | Update team |
| POST | /api/v1/teams/:id/invite | Invite member |
| GET | /api/v1/teams/invitations/accept | Accept invite |
| DELETE | /api/v1/teams/:id/members/:userId | Remove member |
| GET | /api/v1/teams/:id/analytics | Team analytics |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/projects | List projects |
| POST | /api/v1/projects | Create project |
| GET | /api/v1/projects/:id | Get project |
| PUT | /api/v1/projects/:id | Update project |
| DELETE | /api/v1/projects/:id | Delete project |
| GET | /api/v1/projects/:id/tasks | List tasks |
| POST | /api/v1/projects/:id/tasks | Create task |
| PUT | /api/v1/projects/tasks/:id | Update task |
| DELETE | /api/v1/projects/tasks/:id | Delete task |
| POST | /api/v1/projects/tasks/:id/comments | Add comment |
| GET | /api/v1/projects/:id/analytics | Project analytics |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/notifications | List notifications |
| PUT | /api/v1/notifications/:id/read | Mark read |
| PUT | /api/v1/notifications/read-all | Mark all read |
| GET | /api/v1/notifications/settings | Get settings |
| PUT | /api/v1/notifications/settings | Update settings |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/admin/dashboard | Dashboard stats |
| GET | /api/v1/admin/users | List users |
| PUT | /api/v1/admin/users/:id/role | Update role |
| DELETE | /api/v1/admin/users/:id | Delete user |
| GET | /api/v1/admin/logs | System logs |
| GET | /api/v1/admin/search | Global search |

## Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Serve dist/ with Nginx or similar
```

### Docker Deployment (Optional)

Create a `Dockerfile` for both frontend and backend, then use `docker-compose`:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: chartflow
    ports:
      - "3306:3306"
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name chartflow.example.com;

    root /var/www/chartflow/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT with short expiration + refresh tokens
- Rate limiting on auth endpoints
- Input validation with express-validator
- Helmet.js security headers
- CORS configured
- SQL injection protection via parameterized queries
- File upload validation & size limits
- Session management with activity tracking

## License

MIT
