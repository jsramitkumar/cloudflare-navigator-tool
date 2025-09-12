# Frontend Microservice

React-based frontend for Cloudflare Navigator application.

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- TanStack Query
- React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env.local` file:

```
VITE_BACKEND_URL=http://localhost:3001
```

## Project Structure

```
FE/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom hooks
│   ├── services/      # API services
│   ├── types/         # TypeScript types
│   └── lib/           # Utilities
├── public/            # Static assets
└── index.html         # Entry HTML file
```