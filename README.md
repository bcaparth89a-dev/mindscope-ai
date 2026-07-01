# MindScope AI 🧠

MindScope AI is an advanced AI-powered psychology and self-improvement assistant designed to provide direct, honest, and actionable insights. Built with **Next.js 16**, **Tailwind CSS**, **Supabase**, and **Google Gemini**, the application acts as a "Reality Mirror" to guide users through relationship counseling, confidence building, rejection recovery, and emotional reasoning.

---

## 🚀 Live Deployment
You can access the live version of the application here:
👉 **[Live Vercel Deployment Link](https://mind-scope-ai.vercel.app)**

---

## ✨ Key Features
- **MindHeart AI Engine**: A specialized AI personality focused on psychological patterns, accountability, truth over comfort, and emotional intelligence.
- **RAG (Retrieval-Augmented Generation)**: Uses a local knowledge base (`data/knowledge-base.txt`) processed via LangChain splitters to answer user queries with customized, contextual information.
- **Multilingual Recognition**: Automatically detects and responds in **English**, **Hindi**, **Gujarati**, and **Hinglish** naturally.
- **Supabase Authentication**: Secure user registration, login, and session preservation.
- **Chat Management**: Multi-chat sidebar enabling users to create, delete, and switch between multiple conversations seamlessly.
- **Premium Sleek UI**: Features an immersive dark mode theme, responsive layout, smooth interactive sidebar, animated SplashScreen, and AppLoader transitions.

---

## 🛠️ Technology Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Model**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Text Processing**: [LangChain](https://www.langchain.com/)
- **Styling**: Tailwind CSS & Lucide Icons

---

## 📦 How to Proceed with the Application

### 1. Prerequisites & Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Supabase Keys (Public and Private)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### 2. Database Schema Setup
Ensure your Supabase project contains the following tables:
- **`chats`**:
  - `id`: uuid (Primary Key)
  - `user_id`: uuid (References auth.users)
  - `title`: text
  - `created_at`: timestamptz
- **`messages`**:
  - `id`: uuid (Primary Key)
  - `chat_id`: uuid (References chats)
  - `content`: text
  - `role`: text (e.g., 'user', 'model')
  - `created_at`: timestamptz
- **`documents`**:
  - `id`: bigint (Primary Key)
  - `content`: text
  - `metadata`: jsonb
  - `created_at`: timestamptz

### 3. Embed Knowledge Base
To seed/embed your documents and knowledge base data into Supabase, run the embed script:
```bash
npm run embed
```

### 4. Run Locally
Install dependencies and run the Next.js development server:
```bash
npm install
```
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view and test the application locally.
