# MicroLearn Platform

A Next.js microlearning platform supporting multiple learning styles (reading, listening, watching) with interactive quizzes and an integrated terminology system.

## Features

- Multiple learning styles (reading, listening, watching)
- Interactive quizzes
- Responsive design
- JSON-based mock data structure
- Smart terminology system with hover definitions
- Term prerequisites verification before lessons
- User progress tracking and statistics

## Tech Stack

- Next.js 13.4
- React 18.2.0
- TypeScript
- TailwindCSS 3.3.3
- Lucide React icons

## Recent Changes

- Updated app icon to a lightbulb design
- Implemented user progress tracking and statistics in header
- Implemented comprehensive glossary/terminology system
- Created term highlighting and hover definitions
- Added term prerequisite verification for lessons
- Moved hardcoded lesson data to JSON files in `data/lessons.json`
- Created database schema design in `data/README.md`
- Added utility services for data operations
- Implemented dynamic routing for lessons
- Extracted UI components for better maintainability

## Data Structure

Currently using JSON mock data with a structure designed for future PostgreSQL migration:

- Lessons with metadata (id, slug, title, duration)
- Learning styles content (reading, listening, watching)
- Quiz questions with answers and explanations
- Glossary terms with definitions, aliases, and relationships
- User progress tracking for completed terms

## Future Plans

- Integration with `api.silv.blog` for all data operations and authentication
- User progress tracking
- More interactive learning elements
- Search functionality
- Advanced terminology visualization

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
│   ├── MicrolearningPlatform.tsx  # Main component for the learning platform UI
│   ├── TermHighlighter.tsx        # Component for highlighting terms with hover definitions
│   ├── TermLearningModule.tsx     # Component for learning required terms
│   └── TermVerificationQuestion.tsx # Component for verifying term understanding
├── pages/
│   ├── _app.tsx                   # Next.js app wrapper
│   ├── index.tsx                  # Homepage with lesson listings
│   └── lessons/
│       └── [slug].tsx             # Dynamic lesson page that renders content based on slug
├── data/
│   ├── README.md                  # Database schema design documentation
│   ├── lessons.json               # Mock lesson data with content and quizzes
│   └── glossary.json              # Glossary terms with definitions and relationships
├── utils/
│   ├── lessonService.ts           # Service for fetching and processing lesson data
│   ├── glossaryService.ts         # Service for managing glossary terms
│   ├── termDetectionService.ts    # Service for detecting and highlighting terms in content
│   └── userProgressService.ts     # Service for tracking user term completion
├── types/
│   ├── glossary.ts                # TypeScript interfaces for glossary terms
│   └── userProgress.ts            # TypeScript interfaces for user progress tracking
├── styles/                        # Global styles and Tailwind configuration
├── public/                        # Static assets
└── .cursor/
    └── config.json                # Cursor IDE configuration for MCP agents
```

### Key Files

- **components/MicrolearningPlatform.tsx**: Core UI component that handles rendering different learning styles and quiz interactions
- **components/TermHighlighter.tsx**: Component that detects and highlights terms in content with hover definitions
- **components/TermLearningModule.tsx**: Component for learning required terms before accessing lessons
- **pages/lessons/[slug].tsx**: Dynamic routing for individual lesson pages with term prerequisite checks
- **utils/lessonService.ts**: Handles data fetching, filtering, and processing for lessons
- **utils/glossaryService.ts**: Manages glossary term retrieval and verification
- **utils/termDetectionService.ts**: Processes text to detect and highlight terms
- **data/lessons.json**: Structured mock data that simulates database content
- **data/glossary.json**: Glossary terms with definitions, aliases, and relationships
- **data/README.md**: Documentation for database schema design and future implementation plans

# Silv Learn

A microlearning platform built with Next.js.

## Authentication Integration

This project integrates with the Silv API backend for authentication using Stytch as the authentication provider. The authentication flow works as follows:

1. User initiates login via email, phone, Google, or Apple
2. For email login, a magic link is sent to the user's email
3. User clicks the magic link and is redirected to the `/authenticate` page
4. The `/authenticate` page exchanges the Stytch token for a JWT from the Silv API
5. The JWT is stored in localStorage and used for authenticated API requests

## Local Development

### Prerequisites

- Node.js 14+
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/silv-learn.git
cd silv-learn
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the project root with the following variables:

```
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_API_URL_PROD=https://api.silv.app

# Stytch Configuration
NEXT_PUBLIC_STYTCH_PROJECT_ID=your-stytch-project-id
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=your-stytch-public-token
NEXT_PUBLIC_STYTCH_ENV=test
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The project is currently using local environment variables via `.env.local`. Future implementation will use Doppler for secret management in all environments.

### Troubleshooting

- If you see port conflicts (e.g., "Port 3000 is in use"), you can kill the existing process:

  ```bash
  # Find the process using port 3000
  lsof -i :3000

  # Kill the process (replace PID with the actual process ID)
  kill <PID>
  ```

- For authentication testing, use the "Simulate Login" button in the test environment.

## Secret Management with Doppler

This project uses Doppler for secret management. All environment variables are stored in Doppler and injected at runtime.

Required secrets:

```
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_API_URL_PROD=https://api.silv.app

# Stytch Configuration
NEXT_PUBLIC_STYTCH_PROJECT_ID=your-stytch-project-id
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=your-stytch-public-token
NEXT_PUBLIC_STYTCH_ENV=test
```

## CI/CD with GitHub Actions

This project uses GitHub Actions for CI/CD. The workflow is defined in `.github/workflows/deploy.yml`.

To set up CI/CD:

1. Create a Doppler Service Token with access to your project and environment:

   - Go to Doppler Dashboard > Access > Service Tokens
   - Create a new token with access to your project and environment
   - Copy the token

2. Add the token as a GitHub Secret:

   - Go to your GitHub repository > Settings > Secrets and variables > Actions
   - Create a new repository secret named `DOPPLER_TOKEN`
   - Paste the Doppler Service Token as the value

3. Push to the main branch to trigger a deployment.

## API Integration

The application integrates with the Silv API backend for authentication and data retrieval. The API endpoints used include:

- `/auth/stytch/token` - Exchange Stytch session token for JWT
- `/auth/users/me` - Get current user information

## Authentication Flow

1. **Email Login**:

   - User enters email address
   - Magic link is sent to email
   - User clicks magic link
   - Redirected to `/authenticate` page
   - Stytch token exchanged for JWT
   - User logged in

2. **Phone Login**:

   - User enters phone number
   - Verification code sent via SMS
   - User enters verification code
   - Stytch token exchanged for JWT
   - User logged in

3. **Social Login (Google/Apple)**:
   - User clicks social login button
   - Redirected to OAuth provider
   - After successful authentication, redirected back
   - Stytch token exchanged for JWT
   - User logged in

## License

ISC
