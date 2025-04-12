# Learning Style Quiz App

A simple web application designed to help users identify their primary learning style (Visual, Auditory, Reading/Writing, or Kinesthetic) through a short quiz.

## Features

- A multi-question quiz based on common learning scenarios.
- Calculates and displays the user's dominant learning style(s).
- Provides a percentage breakdown of all learning styles.
- Offers brief tips tailored to the user's primary style.
- Generates a personalized prompt for Large Language Models (LLMs) to help users learn new topics according to their style.
- Includes a dark/light theme switcher.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Headless UI / Catalyst Components
- React Router
- React Icons

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/mattsilv/silv-learn.git
    cd silv-learn
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port).

## Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm preview`: Serves the production build locally.
- `pnpm lint`: Lints the code using ESLint.
- `pnpm format`: Formats the code using Prettier.
- `pnpm test`: Runs unit tests with Vitest.
- `pnpm e2e`: Runs end-to-end tests with Playwright.

## Troubleshooting Build Failures

Common reasons for build failures, especially on deployment platforms like Netlify:

1.  **Outdated Lockfile (`ERR_PNPM_OUTDATED_LOCKFILE`):**
    *   **Cause:** `package.json` was updated (e.g., added/updated dependencies) but `pnpm-lock.yaml` was not regenerated and committed.
    *   **Solution:** Run `pnpm install` locally, then commit and push the updated `pnpm-lock.yaml` file.

2.  **Missing Type Definitions (e.g., `Cannot find type definition file for 'node'`):**
    *   **Cause:** A required `@types/` package (like `@types/node`) is missing from `devDependencies` in `package.json`.
    *   **Solution:** Run `pnpm add -D @types/node` (or the relevant types package), then commit and push the updated `package.json` and `pnpm-lock.yaml`.

3.  **Unused Variables/Imports (TypeScript/ESLint Errors):**
    *   **Cause:** Code includes imported modules or declared variables that are never used. The TypeScript compiler (`tsc -b` in the build script) is configured to treat these as errors.
    *   **Solution:** Remove the unused imports or variables from the corresponding `.tsx` or `.ts` file. Run `pnpm lint` locally to catch these errors before committing.

4.  **Incorrect Netlify Settings (Base Directory, etc.):**
    *   **Cause:** Netlify build settings (Base directory, Package directory, Build command, Publish directory) don't match the project structure.
    *   **Solution:** Ensure the Base directory points to the root of the Git repository (`my-learning-style-app` in this case) and the Publish directory is set to `dist`.

5.  **Dependency Resolution Issues (`[plugin:vite:import-analysis] Failed to resolve import`):**
    *   **Cause:** Vite has trouble resolving an import path, sometimes due to how pnpm links packages or complex dependency structures.
    *   **Solution:** Try adding the problematic import path to `optimizeDeps.include` in `vite.config.ts`. For example: `optimizeDeps: { include: ['react-icons/fa'] }`.

**General Tip:** Always run `pnpm build` and `pnpm lint` locally before pushing changes to catch potential build errors early.
