# 💻 Coding Platform

A full-stack web-based coding platform built to help users practice coding problems, compete in contests, and receive real-time feedback — all running entirely on a **local environment**.

---

## 📚 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)


---

## 🧾 Introduction

**Coding Platform** is a local web application that allows users to:

- Solve programming problems
- Execute code securely
- Participate in contests
- Compete on leaderboards

Perfect for self-hosted learning environments, classrooms, or personal practice.

---

## ✨ Features

- 👤 **User Authentication** (Register/Login)
- 🧠 **Problem Solving** with in-browser code editor
- ⚙️ **Code Execution** (Local environment)
- 🏁 **Contests** with countdown and scoring
- 🏆 **Leaderboards** and user ranking system

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Development Tool**: Nodemon for auto-restarting backend server

---

## 🚀 Installation

### Prerequisites

- Node.js (v14+)
- MongoDB 

---

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/princegrewall/coding_platform.git
   cd coding_platform
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

---

### 🔁 Running the Project

- **Backend** (with `nodemon`):
  ```bash
  cd backend
  npx nodemon server.js
  ```
  > Or install nodemon globally with:
  > ```bash
  > npm install -g nodemon
  > ```

- **Frontend**:
  ```bash
  cd ../frontend
  npm start
  ```

---

### 🌐 Access the App

Visit the app in your browser:

```
http://localhost:3000
```

---

## 🧪 Usage

- Sign up or log in
- Choose problems to solve
- Write and run your code locally
- Get real-time output and feedback
- Participate in contests and climb the leaderboard

---

## 📁 Project Structure

```
coding_platform/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
└── README.md
```

---

## 🤝 Contributing

1. Fork this repository.
2. Create your branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request.

---

