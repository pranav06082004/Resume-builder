# AI-Powered Resume Builder 🚀

A modern, full-stack AI Resume Builder built using the MERN stack (MongoDB, Express, React, Node.js). Instantly parse, edit, and enhance your resumes with OpenAI GPT.

🔗 **[Live Demo](https://resume-builder-ten-lemon.vercel.app/)**

---

## ✨ Features

- **AI Resume Parser**: Upload a PDF resume to dynamically extract and auto-populate all builder fields (personal info, experience, education, skills, projects) using OpenAI GPT.
- **AI Enhancer Tools**: Generate ATS-friendly professional summaries and optimize job descriptions in seconds.
- **Redux State Management**: Seamless nested state modifications (adding/editing/removing work history and skills dynamically) powered by Redux Toolkit.
- **Image Optimization**: Profile picture uploads integrated with ImageKit CDN.
- **Secure Authentication**: JWT-based authorization and secure password hashing using bcrypt.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS, Axios, Lucide Icons, react-pdftotext.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **APIs & Services**: OpenAI API, ImageKit API.

---

## ⚙️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-username/resume-builder.git
cd resume-builder
```

### 2. Configure Backend (`server/`)
Create a `server/.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
```
Run the API:
```bash
cd server && npm install && npm start
```

### 3. Run Frontend (`client/`)
```bash
cd client && npm install && npm run dev
```

---

## 👤 Author
- **Your Name** - [GitHub](https://github.com/your-username) | [LinkedIn](https://linkedin.com/in/your-profile)
