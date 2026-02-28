# PDF Chat Annotator

Annotate a PDF together in real time. Select text to highlight it, reference highlights in a shared chat, and see other users' cursors and selections live.

## Stack

-   Frontend: React, Tailwind CSS, shadcn/ui
-   Backend: [Supabase](https://supabase.com/) (real-time presence, broadcast, and auth)
-   PDF Renderer: [React PDF](https://github.com/wojtekmaj/react-pdf)

## Setup

**1. Clone and install**

```bash
git clone https://github.com/rasuleminli/pdf-chat-annotator.git
cd pdf-chat-annotator
pnpm i
```

**2. Create a Supabase project**

1. Go to [Supabase](https://supabase.com) and create a free project
2. Once created, go to **Project Settings -> API**
3. Copy **Project URL** and **anon / public** key

**3. Add your keys**

```bash
cp .env.example .env
```

Open `.env` and paste your keys:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

**4. Run**

```bash
pnpm dev
```

App runs at: `http://localhost:5173`
