<div align="center">
  # 🏥 Elderly Nursing & Healthcare Assistance Platform

  **A full-stack healthtech solution bridging the gap between elderly patients and verified healthcare professionals.**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

## 📖 Project Overview

The **Elderly Nursing & Healthcare Assistance Platform** is an industry-grade, comprehensive web application designed to simplify home-based healthcare. It serves as a secure, role-based marketplace connecting families seeking care for their elderly loved ones with thoroughly vetted caregivers, certified nurses, and physiotherapists. 

Built with scalability, accessibility, and security in mind, this platform handles the entire care lifecycle—from initial caregiver discovery and background verification to booking management, real-time status tracking, and care note documentation.

---

## ✨ Core Features

*   🔐 **Secure User Authentication**: JWT-based role-specific authentication for Patients, Caregivers, and Admins.
*   👵 **Patient Profile Management**: Detailed medical history, emergency contacts, and care requirements.
*   🔍 **Service Browsing & Filtering**: Advanced search capabilities to find specific medical specialists or general attendants.
*   📅 **Booking & Scheduling**: Streamlined interface for scheduling recurring or one-off healthcare visits.
*   🛡️ **Caregiver Verification System**: Robust vetting process and document upload portal for healthcare providers.
*   📊 **Real-time Status Tracking**: Live updates on booking approvals, caregiver arrivals, and service completion.
*   ⚙️ **Admin Dashboard**: Comprehensive control center for user moderation, booking oversight, and platform analytics.
*   📝 **Care Notes System**: Secure documentation of daily health vitals and care provided by the professional.
*   🔔 **Notifications**: Real-time alerts for booking updates and critical messages.

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React, Next.js, Tailwind CSS, TypeScript, Axios |
| **Backend** | Node.js, Next.js API Routes, TypeScript |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Infrastructure** | _[Vercel (Frontend), Render/Railway (Backend)]_ |

---

## 🏗️ System Architecture Overview

The application follows a modern **Client-Server architecture** with a clear separation of concerns:
1.  **Client Layer (Next.js)**: Handles UI rendering, client-side routing, and state management. Communicates with the backend via RESTful APIs.
2.  **API Layer (Next.js API Routes)**: Acts as the centralized gateway. It manages business logic, routing, authentication middleware, and input validation natively inside the backend app.
3.  **Data Layer (MongoDB)**: A NoSQL database structured to efficiently manage complex, inter-relational data like Users, Bookings, Care Notes, and Reviews.

---

## 📂 Folder Structure

```text
elderly-nursing-healthcare-assistant-platform/
├── frontend/                 # Next.js Client Application
│   ├── public/               # Static assets (images, icons)
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable React components (UI, Layouts)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions, API clients
│   │   ├── styles/           # Tailwind configuration and global CSS
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend/                  # Next.js API Route Server
│   ├── src/
│   │   ├── app/api/          # Next.js API routes (Endpoints)
│   │   ├── config/           # Database and environment configurations
│   │   ├── controllers/      # Request handlers & business logic
│   │   ├── middleware/       # Custom middleware (Auth, Error handling)
│   │   ├── models/           # Mongoose schemas (User, Booking, etc.)
│   │   └── services/         # Business logic and database interaction
│   └── package.json
│
└── README.md
```

---

## 🔐 Environment Variables

Create `.env` files in both `frontend` and `backend` directories.

### Backend (`backend/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | API server port (e.g., 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signature |
| `JWT_EXPIRES_IN` | Token expiration time (e.g., 7d) |
| `FRONTEND_URL` | CORS allowed origin (e.g., http://localhost:3000) |

### Frontend (`frontend/.env.local`)
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend API Base URL |

---

## 🚀 Local Development Setup

Follow these steps to run the project locally.

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   MongoDB instance (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/siddhantchasta/elderly-nursing-healthcare-assistant-platform.git
cd elderly-nursing-healthcare-assistant-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
# Set up your .env file
npm run dev
```
*The backend server should now be running on http://localhost:5000*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
# Set up your .env.local file
npm run dev
```
*The frontend application should now be running on http://localhost:3000*

---

## 🔮 Future Enhancements

*   **Video Consultations**: Integrated WebRTC for preliminary virtual check-ins.
*   **Payment Gateway Integration**: Stripe integration for seamless, secure transactions and caregiver payouts.
*   **AI Chatbot Assistant**: 24/7 automated support for basic medical queries and booking assistance.
*   **Medication Reminders**: Push notification system for patient medication schedules.

---

<div align="center">
  <p>Built with ❤️ by an Open-Source Engineer</p>
</div>
