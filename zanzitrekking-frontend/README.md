# Zanzitrekking Frontend

React + Vite frontend application for Zanzitrekking tours and safaris.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Code Quality

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Code Standards

This project follows strict coding standards for consistency and maintainability. Please read [CODE_STANDARDS.md](./CODE_STANDARDS.md) before contributing.

Key highlights:
- **File Structure**: Organized by feature with clear separation of concerns
- **Naming Conventions**: PascalCase for components, camelCase for utilities
- **Linting**: ESLint with React-specific rules
- **Formatting**: Prettier with Tailwind CSS plugin
- **Documentation**: JSDoc comments for utilities and API functions

## Project Structure

```
src/
├── api/              # API client configuration
├── components/       # Reusable React components
├── config/          # Configuration files
├── hooks/           # Custom React hooks
├── pages/           # Page-level components
├── store/           # Redux store and reducers
├── styles/          # Global styles
└── utils/           # Utility functions
```

## Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Material-UI** - Component library
- **Axios** - HTTP client

## License

Private - All rights reserved
