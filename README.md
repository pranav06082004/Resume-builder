# Resume Builder

A full-stack Resume Builder application that enables users to create, customize, preview, and download professional resumes with ease. The platform provides an intuitive user interface, secure authentication, and real-time resume management, helping users build ATS-friendly resumes efficiently.

## 🚀 Features

* User Authentication & Authorization (JWT)
* Secure Login and Registration
* Create and Manage Multiple Resumes
* Real-Time Resume Preview
* Edit Personal Details, Education, Experience, Skills, and Projects
* Upload Profile Images
* Responsive UI for Desktop and Mobile
* Resume Download Functionality
* Protected Routes and Secure APIs
* State Management using Redux Toolkit

## 🛠️ Tech Stack

### Frontend

* React.js
* Redux Toolkit
* React Router
* Axios
* Tailwind CSS / CSS

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer

### Database

* MongoDB
* Mongoose

## 📂 Project Structure

```bash
Resume-Builder/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── package.json
│
└── README.md
```

Application Live Link:

resume-builder-ten-lemon.vercel.app/


## 🔐 Authentication Flow

1. User registers with email and password.
2. Password is securely hashed before storage.
3. JWT token is generated upon login.
4. Protected routes verify the token before granting access.
5. Users can create, edit, and manage their resumes securely.


## 🎯 Future Enhancements

* Multiple Resume Templates
* Resume Sharing via Public Link
* AI-Powered Resume Suggestions
* PDF Export Improvements


* GitHub: https://github.com/pranav06082004
