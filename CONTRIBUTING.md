# Contributing to ALGORANARCHY

We love your input! We want to make contributing to ALGORANARCHY as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Setting Up Development Environment

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone your fork
git clone https://github.com/yourusername/algoranarchy.git
cd algoranarchy

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Required API Keys

1. **Algorand API Token**
   - Sign up at [Nodely](https://nodely.io) or [AlgoNode](https://algonode.io)
   - Get your API token
   - Add to `.env` as `VITE_ALGO_API_TOKEN`

2. **CoinGecko API Key** (Optional but recommended)
   - Sign up at [CoinGecko API](https://www.coingecko.com/en/api)
   - Get your API key
   - Add to `.env` as `VITE_COINGECKO_API_KEY`

## Code Style

- Use TypeScript for all new code
- Follow the existing code style (ESLint + Prettier)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Commit Messages

Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

Example: `feat: add real-time price updates for tokens`

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md with your changes
3. The PR will be merged once you have the sign-off of maintainers

## Bug Reports

Use GitHub issues to report bugs. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/OS information

## Feature Requests

We welcome feature requests! Please:
- Check if the feature already exists
- Describe the feature clearly
- Explain why it would be useful
- Consider implementation complexity

## Code of Conduct

Be respectful and inclusive. We're all here to build something awesome together.

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

Thanks for contributing to ALGORANARCHY! 🤘