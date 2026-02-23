<div align="center">

# ⚡ Careerix

### Your AI-Powered Career Intelligence Platform

*Land your dream job faster with the power of AI*

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

![Careerix Dashboard](https://github.com/Vigneshprasad10/Careerix/raw/main/public/preview.png)

> ⚠️ *Replace the image above with an actual screenshot of your app*

</div>

---

## 🧠 What is Careerix?

**Careerix** is a premium, full-stack AI career platform that transforms the way you job hunt. Powered by **Groq's blazing-fast Llama 3.3 70B model**, it acts as your personal career co-pilot — analyzing your resume, matching you to roles, writing cover letters, and preparing you for interviews — all from one stunning command center.

> *Stop applying blindly. Start applying intelligently.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Career Dashboard** | Real-time stats — resumes uploaded, jobs tracked, analyses run, cover letters generated |
| 📄 **Resume Intelligence** | Upload multiple PDF resumes with instant AI-powered text extraction |
| 🔍 **ATS Analyzer** | Get your ATS score, strengths, weaknesses & strategic improvement tips |
| 🎯 **Job Match Tool** | Compare your resume vs any job description — match %, skill gaps, recommendations |
| ✉️ **Cover Letter Generator** | Tailored, professional cover letters generated in seconds |
| 🧠 **Interview Mastery** | 10 targeted Q&As (Behavioral, Technical, Situational) based on the role |
| 📋 **Kanban Job Tracker** | Drag-and-drop board across 5 stages: Saved → Applied → Interview → Offer → Rejected |

---

## 🛠️ Tech Stack

```
Frontend        →  Next.js 16 (App Router) + Tailwind CSS 4
AI Engine       →  Groq SDK (Llama-3.3-70b-versatile)
Database        →  Supabase (PostgreSQL)
File Storage    →  Supabase Storage (S3)
Authentication  →  Clerk
PDF Parsing     →  pdfjs-dist (local, no external API)
Icons           →  Lucide React
Notifications   →  Sonner
UI Style        →  Glassmorphism + Animated Dark Theme
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Vigneshprasad10/Careerix.git
cd Careerix
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# ── Clerk Authentication ──────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ── Supabase ──────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ── Groq AI ───────────────────────────────────────────
GROQ_API_KEY=your_groq_api_key
```

### 4. Set up Supabase

Run the SQL migration in your Supabase SQL Editor:

```bash
# Copy and run the contents of:
supabase/schema.sql
```

Then create a **private** storage bucket named `resumes` in your Supabase dashboard under Storage.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Careerix in action. 🎉

---

## 🎨 Design Philosophy

Careerix is built with a **Premium AI SaaS Aesthetic** inspired by Linear, Vercel, and Raycast:

- 🌑 **Dark Mode First** — Deep `#0a0a0f` background with purple-tinted depth
- 🪟 **Glassmorphism** — Translucent cards with `backdrop-blur` and subtle borders
- 🌊 **Ambient Animations** — Floating gradient blobs and glowing state indicators  
- ⚡ **Micro-interactions** — Scale animations, shimmer loaders, and smooth transitions
- 🎨 **Gradient Palette** — Purple `#8b5cf6` → Blue `#3b82f6` → Cyan `#06b6d4`

---

## 📁 Project Structure

```
careerix/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx          # Dashboard home
│   │   ├── resume/           # Resume upload & management
│   │   ├── analyze/          # ATS resume analyzer
│   │   ├── job-match/        # Job description matcher
│   │   ├── cover-letter/     # Cover letter generator
│   │   ├── interview-prep/   # Interview Q&A generator
│   │   └── tracker/          # Kanban job tracker
│   ├── api/
│   │   ├── ai/               # AI feature routes (Groq)
│   │   ├── resume/           # Resume upload/delete routes
│   │   └── jobs/             # Job tracker CRUD routes
│   ├── sign-in/
│   └── sign-up/
├── lib/
│   ├── supabase.ts
│   └── groq.ts
├── supabase/
│   └── schema.sql
└── middleware.ts
```

---

## 🔑 Required API Keys & Services

| Service | Purpose | Link |
|---|---|---|
| **Clerk** | Authentication | [clerk.com](https://clerk.com) |
| **Supabase** | Database + Storage | [supabase.com](https://supabase.com) |
| **Groq** | AI Engine (Free) | [console.groq.com](https://console.groq.com) |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Built with ❤️ by [Vignesh Prasad](https://github.com/Vigneshprasad10)

⭐ **Star this repo if you found it helpful!**

</div>