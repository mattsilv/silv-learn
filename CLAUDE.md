# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure
- This is a monorepo project using pnpm workspaces
- The main app is in `/Users/m/gh/learn/my-learning-style-app/`
- Root-level dependencies are shared across projects
- App-specific dependencies are in the app's package.json

## Build and Development Commands
- Root level:
  - `pnpm dev`: Start development server for the app
  - `pnpm build`: Build the app for production
  - `pnpm test`: Run Vitest unit tests for the app
  - `pnpm lint`: Run ESLint for the app
  - `pnpm e2e`: Run Playwright E2E tests for the app

- App level:
  - `pnpm dev`: Start development server
  - `pnpm build`: Build for production
  - `pnpm lint`: Run ESLint
  - `pnpm lint:fix`: Fix ESLint issues
  - `pnpm format`: Format with Prettier
  - `pnpm test`: Run Vitest unit tests
  - `pnpm test -- -t "description"`: Run specific test by description
  - `pnpm test -- src/utils/calculateLearningStyle.test.ts`: Run tests in specific file
  - `pnpm test:coverage`: Run unit tests with coverage report
  - `pnpm e2e`: Run Playwright E2E tests
  - `pnpm e2e:debug`: Run E2E tests in debug mode with browser UI

## Package Management Guidelines
- ALWAYS use pnpm for package management (not npm or yarn)
- Adding dependencies:
  - App-specific: `cd my-learning-style-app && pnpm add <package>`
  - Shared/root: `pnpm add -w <package>`
- Use the root-level commands to run scripts when possible
- Do not create duplicate node_modules folders or package.json entries

## Code Style Guidelines
- TypeScript with strict types; use explicit interfaces for props/states
- React functional components with explicit type annotations (React.FC<Props>)
- Custom hooks must start with "use" prefix
- Follow Prettier config: single quotes, no semi, trailing commas
- Tailwind classes should follow recommended sorting order
- Component imports: React first, then external deps, then internal imports
- Keep component files under 100 lines when possible
- Use named exports except for default component exports
- Unhandled errors should use try/catch with appropriate error handling

## Catalyst Design System Guidelines
- Use Catalyst UI components from `/src/components/catalyst/` where possible
- Never hardcode colors directly in components; use theme variables from `config/theme.ts`
- Use the PRIMARY_BUTTON_COLOR constant for primary actions
- Follow the Button component's props pattern for consistent UI
- Maintain accessibility standards with proper ARIA attributes
- Use Heading, Text, and other semantic components with appropriate level props