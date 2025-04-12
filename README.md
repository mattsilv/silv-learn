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
