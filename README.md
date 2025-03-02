# MicroLearn Platform

A Next.js microlearning platform supporting multiple learning styles (reading, listening, watching) with interactive quizzes.

## Features

- Multiple learning styles (reading, listening, watching)
- Interactive quizzes
- Responsive design
- JSON-based mock data structure

## Tech Stack

- Next.js 13.4
- React 18.2.0
- TypeScript
- TailwindCSS 3.3.3
- Lucide React icons

## Recent Changes

- Moved hardcoded lesson data to JSON files in `data/lessons.json`
- Created database schema design in `data/README.md`
- Added utility service (`utils/lessonService.ts`) for data operations
- Implemented dynamic routing for lessons via `pages/lessons/[slug].tsx`
- Extracted UI components for better maintainability

## Data Structure

Currently using JSON mock data with a structure designed for future PostgreSQL migration:

- Lessons with metadata (id, slug, title, duration)
- Learning styles content (reading, listening, watching)
- Quiz questions with answers and explanations

## Future Plans

- Integration with `api.silv.blog` for all data operations and authentication
- User progress tracking
- More interactive learning elements
- Search functionality

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
npm start
```

## Puppeteer MCP Agent Setup

To enable browser automation with your LLM:

1. Install the MCP agent globally:

```bash
npm install -g @modelcontextprotocol/server-puppeteer
```

2. Configure Cursor:

Create `.cursor/config.json` in your project root with:

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "mcp-server-puppeteer"
    }
  }
}
```

3. Restart Cursor to activate the agent.

Alternative Docker approach (if needed):

```bash
docker build -t mcp/puppeteer -f src/puppeteer/Dockerfile .
docker run -i --rm --init -e DOCKER_CONTAINER=true mcp/puppeteer
```

## Project Structure

```
silv-learn/
├── components/
│   └── MicrolearningPlatform.tsx  # Main component for the learning platform UI
├── pages/
│   ├── _app.tsx                   # Next.js app wrapper
│   ├── index.tsx                  # Homepage with lesson listings
│   └── lessons/
│       └── [slug].tsx             # Dynamic lesson page that renders content based on slug
├── data/
│   ├── README.md                  # Database schema design documentation
│   └── lessons.json               # Mock lesson data with content and quizzes
├── utils/
│   └── lessonService.ts           # Service for fetching and processing lesson data
├── styles/                        # Global styles and Tailwind configuration
├── public/                        # Static assets
└── .cursor/
    └── config.json                # Cursor IDE configuration for MCP agents
```

### Key Files

- **components/MicrolearningPlatform.tsx**: Core UI component that handles rendering different learning styles and quiz interactions
- **pages/lessons/[slug].tsx**: Dynamic routing for individual lesson pages
- **utils/lessonService.ts**: Handles data fetching, filtering, and processing for lessons
- **data/lessons.json**: Structured mock data that simulates database content
- **data/README.md**: Documentation for database schema design and future implementation plans
