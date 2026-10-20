# Sign Up Backend API

## DFS Maze website

The project now includes a browser frontend for the second mini-project from the
provided list: **Maze generation using DFS**. The maze algorithm remains in C++
(`maze_dfs.cpp`) and is exposed through the Express API. The original SFML
desktop implementation in `dfs.cpp` is unchanged.

### Run the website

1. Install Node.js, npm, and a C++ compiler (`g++` on Windows).
2. Install the Node dependencies:

```bash
npm install
```

3. Start the website without needing PostgreSQL:

```bash
# Windows PowerShell
$env:MAZE_ONLY="true"; npm start
```

4. Open `http://localhost:3000`.

The server compiles `maze_dfs.cpp` to `maze_dfs.exe` on the first maze request.
The frontend lets you choose a grid size, provide a repeatable seed, generate a
maze, and animate the DFS traversal. The API endpoint is
`GET /api/maze/generate?rows=20&cols=20&seed=123`.

### Deploy a public teacher-demo link on Render

This repository includes [`render.yaml`](./render.yaml). Create a GitHub
repository containing the contents of this folder, then in Render choose
**New > Blueprint** and select that GitHub repository. Render will install the
Node dependencies, compile the C++ DFS engine, and deploy the website with
PostgreSQL disabled. The generated `onrender.com` URL can be shared with your
teacher.

A complete authentication backend built with Node.js/Express and PostgreSQL featuring email verification, password hashing, JWT tokens, and comprehensive input validation.

## Features

- ✅ User registration with input validation
- ✅ Email verification system
- ✅ Password hashing with bcryptjs
- ✅ JWT token generation and verification
- ✅ PostgreSQL database integration
- ✅ CORS support
- ✅ Error handling middleware
- ✅ Secure password requirements (uppercase, lowercase, numbers, special characters)
- ✅ Protected routes with authentication middleware

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone or navigate to the project directory:**
```bash
cd your-project-directory
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

4. **Configure your `.env` file:**
```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@authapp.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

5. **Create PostgreSQL database:**
```bash
createdb auth_db
```

6. **Start the server:**
```bash
npm run dev
```

The server will automatically initialize the database schema on startup.

## API Endpoints

### 1. Sign Up
**POST** `/api/auth/signup`

Request body:
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

Response:
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "is_verified": false
  }
}
```

### 2. Verify Email
**POST** `/api/auth/verify-email`

Request body:
```json
{
  "token": "verification_token_from_email"
}
```

Response:
```json
{
  "message": "Email verified successfully",
  "token": "jwt_token_for_authentication",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "is_verified": true
  }
}
```

### 3. Get Profile (Protected)
**GET** `/api/auth/profile`

Headers:
```
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "is_verified": true,
    "created_at": "2026-10-10T13:30:25.000Z"
  }
}
```

### 4. Health Check
**GET** `/api/health`

Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Password Requirements

Passwords must:
- Be at least 8 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)
- Contain at least one special character (@$!%*?&)

Example: `SecurePassword123!`

## Email Configuration

### Gmail Setup
1. Enable 2-step verification on your Google Account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the generated password in `EMAIL_PASSWORD` env variable

### Other Email Providers
Update `EMAIL_HOST` and `EMAIL_PORT` in `.env` for your provider:
- **Outlook**: smtp-mail.outlook.com:587
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

The API returns appropriate HTTP status codes:
- `201 Created`: Successful sign up
- `200 OK`: Successful operations
- `400 Bad Request`: Validation errors or invalid input
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Security Considerations

1. **Always use HTTPS** in production
2. **Keep JWT_SECRET secure** and unique in production
3. **Use environment variables** for sensitive data (never hardcode)
4. **Implement rate limiting** for sign up and login endpoints
5. **Use CORS carefully** - restrict to your frontend domain in production
6. **Implement password reset** functionality for production use
7. **Add logging and monitoring** for security events

## Project Structure

```
src/
├── config/
│   ├── database.js       # PostgreSQL connection
│   └── init.js          # Database initialization
├── controllers/
│   └── authController.js # Authentication logic
├── middleware/
│   ├── auth.js          # JWT authentication
│   └── errorHandler.js  # Error handling
├── models/
│   └── User.js          # User model and database operations
├── routes/
│   └── authRoutes.js    # Route definitions
├── utils/
│   ├── emailService.js  # Email sending
│   └── tokenUtils.js    # JWT utilities
├── validators/
│   └── authValidator.js # Input validation schemas
└── index.js             # Main application file
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2 or systemd
3. Enable HTTPS/SSL
4. Set strong, unique JWT_SECRET
5. Configure proper CORS origins
6. Implement rate limiting
7. Set up monitoring and logging
8. Use a reverse proxy (nginx)

## License

MIT
