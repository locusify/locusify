# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the Locusify codebase.

## Project Overview

**Locusify** is an intelligent travel tool—upload raw photos, get auto visual route maps and seamless, essence-capturing vlogs.

### Technical Architecture

**Tech Stack:**

- React 19 - Latest React version with Compiler
- TypeScript - Complete type safety
- Vite 7 - Modern build tool
- Tailwind CSS 4 - Atomic CSS framework
- Radix UI - Accessible component library
- Zustand - State management
- TanStack Query - Data fetching and caching
- React Router 7 - Routing management
- i18next - Internationalization
- MapLibre GL - Map rendering
- Motion - Animation library

**Project Structure:**

```
Locusify/
├── .claude/                  # Claude Code configuration
│   ├── agents/              # Specialized agents
│   └── commands/            # Custom commands
├── .husky/                  # Git hooks
├── PRPs/                    # Product Requirements and Progress docs
├── public/                  # Static assets
├── src/                     # Source code
│   ├── assets/             # Asset files
│   ├── components/         # UI components
│   │   ├── ui/            # Base UI components (shadcn/ui)
│   │   └── upload/        # Upload-related components
│   ├── data/               # Static data
│   ├── hooks/              # Custom React hooks
│   ├── layout/             # Layout components
│   ├── lib/                # Utility libraries
│   ├── locales/            # i18n translations
│   ├── pages/              # Page components
│   │   ├── error/         # Error pages
│   │   ├── explore/       # Explore page
│   │   ├── map/           # Map page
│   │   └── splashScreen/  # Splash screen
│   ├── routers/            # Route definitions
│   └── types/              # TypeScript type definitions
└── test/                    # Test files
```

## Claude Code Configuration

### Specialized Agent System

The project leverages Claude Code's multi-agent architecture for domain-specific expertise:

#### Available Agents (`/.claude/agents/`)

| Agent                  | Role                | Primary Responsibilities                                    |
| ---------------------- | ------------------- | ----------------------------------------------------------- |
| **product-manager**    | Strategy & Planning | Requirements analysis, PRP generation                       |
| **ui-ux-designer**     | Design & UX         | User experience, design systems                             |
| **frontend-developer** | Implementation      | React web architecture, cross-platform optimization         |
| **code-reviewer**      | Quality Assurance   | Security analysis, performance review, production readiness |

#### Available Commands (`/.claude/commands/`)

**Primary Workflow:**
```bash
/workflow <feature-name> [priority]
```

## Development Workflow

### Feature Development Process

Use the standardized 4-stage workflow for all new features:

```
Requirements → Design → Architecture → Quality
```

| Stage               | Agent                 | Deliverables                                              |
| ------------------- | --------------------- | --------------------------------------------------------- |
| **1. Requirements** | `@product-manager`    | PRP documents, user stories, acceptance criteria          |
| **2. Design**       | `@ui-ux-designer`     | Wireframes, UI mockups, interaction flows                 |
| **3. Architecture** | `@frontend-developer` | Technical specs, API design, data models                  |
| **4. Quality**      | `@code-reviewer`      | Testing strategy, security review, performance benchmarks |

**Automation:** All PRPs saved to `/PRPs/[YYYY-MM-DD]/` with structured documentation and automatic progress tracking.

### PRP Documentation Structure

```
/PRPs/[YYYY-MM-DD]/
├── [feature-name]-progress.md    # Progress tracking (auto-generated)
├── [feature-name]-prd.md         # Product requirements
├── [feature-name]-design.md      # Design specifications
├── [feature-name]-tech.md        # Technical architecture
└── [feature-name]-qa.md          # Quality assurance
```

## Development Standards

### Package Management

**pnpm Commands:**
```bash
pnpm install            # Install all dependencies
pnpm dev                # Start Vite development server
pnpm build              # Build for production (tsc + vite build)
pnpm preview            # Preview production build
pnpm lint               # Run ESLint with auto-fix
pnpm typecheck          # Run TypeScript type checking
```

### Code Quality Standards

#### During Development
- Follow TypeScript strict mode with proper type definitions
- Use Tailwind CSS 4 for consistent, responsive design patterns
- Use Radix UI for consistent UI components
- Implement Zustand stores for state management
- Use TanStack Query for data fetching and caching
- Add comprehensive error handling with proper TypeScript types
- Use i18next for internationalization support
- Write unit tests for core logic and components

#### Commit Standards
Project uses commitlint with conventional commits format:
```bash
feat: add new feature
fix: bug fix
chore: maintenance tasks
docs: documentation updates
```
