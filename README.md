<p align="center">
  <img src="src/assets/locusify.png" alt="Locusify" width="120" />
</p>

<h1 align="center">Locusify</h1>

<p align="center">
  Upload raw photos, get auto visual route maps and seamless, essence-capturing vlogs.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-ISC-blue" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node" />
  <img src="https://img.shields.io/badge/pnpm-%3E%3D10-f69220" alt="pnpm" />
</p>

## Features

- **Photo Upload** — Drag-and-drop upload with automatic EXIF / GPS extraction
- **Interactive Map** — MapLibre-powered map with cluster markers and auto-fit bounds
- **Trajectory Replay** — Timeline-based animated route playback with camera follow
- **i18n** — Multi-language support via i18next

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| Map | MapLibre GL |
| State Management | Zustand |
| Data Fetching | TanStack Query |
| Animation | Motion |
| UI Primitives | Radix UI |
| Backend | Supabase |

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 10

### Setup

```bash
# Clone the repository
git clone https://github.com/locusify/locusify.git
cd locusify

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Vite development server |
| `pnpm build` | Build for production (tsc + vite build) |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint with auto-fix |
| `pnpm typecheck` | Run TypeScript type checking |

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Shared UI components (shadcn/ui)
├── data/            # Static data
├── hooks/           # Custom React hooks
├── layout/          # Layout components
├── lib/             # Utility libraries
├── locales/         # i18n translations
├── pages/           # Page components
│   ├── explore/     # Explore page
│   ├── map/         # Map page
│   └── splashScreen/# Splash screen
├── routers/         # Route definitions
└── types/           # TypeScript type definitions
```

## License

[ISC](LICENSE) © caterpi11ar
