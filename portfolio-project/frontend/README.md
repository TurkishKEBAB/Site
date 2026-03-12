# Portfolio Frontend

## React + TypeScript + Vite

Modern, responsive portfolio website built with:
- ⚛️ React 18
- 📘 TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🎭 Framer Motion
- 🧭 React Router

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- ✅ Dark/Light theme
- ✅ Multi-language support (TR, EN, DE, FR)
- ✅ Responsive design
- ✅ Smooth animations
- ✅ API integration
- ✅ SEO optimized

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GITHUB_USERNAME=TurkishKEBAB
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.tsx
│   ├── Navigation.tsx
│   └── Footer.tsx
├── pages/           # Page components
│   ├── Home.tsx
│   ├── About.tsx
│   ├── Projects.tsx
│   ├── Blog.tsx
│   └── Contact.tsx
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Development

- Development server runs on `http://localhost:3000`
- API proxy configured for `/api` → `http://localhost:8000/api/v1`
- Hot module replacement enabled
- TypeScript strict mode

## Production

```bash
npm run build
```

Output in `dist/` directory ready for deployment.

## Deployment

Deploy to Vercel, Netlify, or any static hosting:

```bash
# Example: Vercel
vercel --prod

# Example: Netlify
netlify deploy --prod
```
