# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Dev: `pnpm dev` - Start development server
- Build: `pnpm build` - Build for production
- Lint: `pnpm lint` / `pnpm lint:fix` - Run/fix ESLint issues
- Format: `pnpm format` - Format with Prettier
- Test: 
  - Run all: `pnpm test`
  - Single test: `pnpm test -- -t "description"`
  - Single file: `pnpm test -- src/utils/file.test.ts`
  - Coverage: `pnpm test:coverage`
- E2E: `pnpm e2e` / `pnpm e2e:debug` (with UI)

## Code Style Guidelines
- TypeScript with strict types; explicit interfaces for props/states
- React functional components with explicit type annotations
- Custom hooks must start with "use" prefix
- Follow Prettier config: single quotes, no semicolons, trailing commas
- Import order: React first, then external deps, then internal imports
- Error handling: Use try/catch with appropriate error handling

## Catalyst UI Components
- ALWAYS check if a Catalyst component exists in `src/components/catalyst/` first
- Inspect component source file to verify available props before using
- Use component source code as the source of truth, not documentation
- Use Tailwind CSS only when no suitable Catalyst component exists
- Never hardcode colors; use theme variables from `config/theme.ts`

## Testing
- Utility/hook tests: Place `.test.ts` files in same directory as source
- Component tests: Place in `__tests__` subdirectory inside component folder