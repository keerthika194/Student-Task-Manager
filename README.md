# Student Task Manager

## Overview
Student Task Manager is a full-stack web application designed to help students manage academic tasks efficiently while allowing administrators to assign and monitor tasks. The system supports role-based access, secure authentication, and real-time task tracking.

This project follows a MERN-like architecture but uses SQLite instead of MongoDB for a lightweight, file-based database.


## Tech Stack

Frontend:
- React.js (Vite)
- JavaScript
- jQuery
- Bootstrap
- CSS3

Backend:
- Node.js
- Express.js

Database:
- SQLite (better-sqlite3)

Other Tools and Libraries:
- JWT (authentication)
- bcryptjs (password hashing)
- Multer (file uploads)
- EJS (server-side rendering)
- Axios (API requests)
- React Router DOM (routing)
- js-cookie (cookie handling)


## Features

Authentication and Security:
- JWT-based login system
- Password hashing using bcrypt
- Role-based access control (Student and Admin)
- Cookies for session management

Student Features:
- Add, edit, and delete tasks
- Mark tasks as completed
- Filter and search tasks in real time
- View task statistics on dashboard
- Export task reports
- Upload profile picture

Admin Features:
- Assign tasks to students
- View all users and tasks
- Edit or delete any task
- Delete users (with cascade delete)

Dashboard:
- Dynamic greeting based on time
- Task statistics (total, pending, completed, high priority)
- Recent tasks overview
- Completion progress tracking

UI/UX:
- Form validation with visual feedback
- Password strength indicator
- jQuery-based animations (fade, stagger, shake)
- Responsive layout


## Application Pages

- Login Page (/)
- Register Page (/register)
- Dashboard (/dashboard)
- Tasks Page (/tasks)
- Profile Page (/profile)
- Admin Panel (/admin)


## How It Works

1. The user interacts with the frontend (React).
2. Axios sends HTTP requests to the backend with a JWT token.
3. Express validates the token using middleware.
4. The backend queries the SQLite database.
5. Data is returned as JSON.
6. React updates the UI dynamically.

---

## API Endpoints

Authentication:
- POST /api/auth/register
- POST /api/auth/login

Tasks:
- GET /api/tasks
- GET /api/tasks/all (admin only)
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

Users:
- GET /api/users (admin only)
- GET /api/users/profile
- POST /api/users/avatar
- DELETE /api/users/:id

Reports:
- GET /report?token=xxx


## Database Structure

Users Table:
- id
- name
- email
- password (hashed)
- role
- avatar

Tasks Table:
- id
- title
- description
- status
- priority
- due_date
- user_id
- assigned_by


## Setup Instructions

1. Clone the repository:
   git clone https://github.com/keerthika194/Student-Task-Manager.git

2. Navigate to project folder:
   cd Student-Task-Manager

3. Start backend:
   cd backend
   node server.js

4. Start frontend:
   npm install
   npm run dev

5. Open in browser:
   http://localhost:5173


## Demonstration Flow

- Register as a student and an admin
- Login as student and create tasks
- Mark tasks as completed and use filters
- Upload profile image and view stats
- Logout and login as admin
- Assign tasks to students
- Access admin panel to manage users and tasks
- Generate report using server-side rendering


## Concepts Used

- REST API design
- JWT authentication
- Role-based access control
- CRUD operations
- File upload handling
- Server-side rendering (EJS)
- AJAX using Axios
- React Hooks (useState, useEffect)
- DOM manipulation using jQuery


## Future Improvements

- Notifications and reminders
- Real-time updates
- Mobile application
- Cloud database integration
- Collaboration features


## Author

Keerthika Ashok


## License

This project is licensed under the MIT License.