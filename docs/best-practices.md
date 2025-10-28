# Python Development Workflow Best Practices

## Overview
This specification defines the standardized Python development workflow for this project using uv, Docker, and quality tools. This document serves as context for Claude Code and other development tools.

## Technology Stack
- **Python**: 3.12.x
- **Package Manager**: uv
- **Container**: Docker
- **Testing**: pytest
- **Linting/Formatting**: ruff
- **Type Checking**: mypy
- **Git Hooks**: pre-commit

## Core Commands

### Initial Setup (one-time)
```bash
# Install dependencies
uv sync

# Setup development environment
uv run setup-dev

# Run python scripts
uv run python
```

### Docker Commands
```bash
# Build development image
docker-compose build

# Run development container
docker-compose up

# Run tests in container
docker-compose run app uv run test
```

## Testing Guidelines

### Running Tests
```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src

# Run specific test file
uv run pytest tests/test_main.py

# Run tests in Docker
docker-compose run app uv run pytest
```

### Adding Dependencies
```bash
# Add production dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Sync dependencies after changes
uv sync
```

## Development Workflow

1. **Start Development**: Run `tree` to see current project structure
2. **Install Dependencies**: Run `uv sync` if new dependencies are added
3. **Code**: Write code following type hints and docstrings
4. **Test Frequently**: Run `uv run pytest` during development
5. **Code Review**: After completing implementation, run CodeRabbit (see CodeRabbit Usage below)
6. **Quality Check**: Always run quality sequence after fixing CodeRabbit issues and before committing:
   ```bash
   uv run ruff check . --fix && uv run ruff format . && uv run mypy src/
   ```
7. **Test Again**: Run `uv run pytest` to ensure fixes didn't break anything
8. **Commit**: Pre-commit hooks will run automatically (run `uv run setup-dev` first if not set up)

```bash
# Run tests
uv run pytest

# Individual quality commands
uv run ruff check .       # Check code style (lint)
uv run ruff format .      # Format code
uv run mypy src/          # Type checking

# Auto-fix linting issues
uv run ruff check . --fix

# Quality check sequence (run all three)
uv run ruff check . && uv run ruff format . && uv run mypy src/
```


## Claude Code - CodeRabbit Integration

**When to Run CodeRabbit (Claude must follow):**

1. **After implementing any feature or Story** - Automatically run CodeRabbit review
2. **When user explicitly requests** - "Run code review" or similar
3. **Before marking work complete** - Always review before saying "done"

**How Claude Should Run CodeRabbit:**

```bash
# Always use this command
coderabbit --prompt-only
```

**Claude's Workflow:**
1. Complete the implementation as requested
2. Run `coderabbit --prompt-only` in the background (let it take as long as needed)
3. Wait for CodeRabbit to complete (7-30 minutes typical)
4. Read the output and create a task list of issues
5. Fix each issue systematically
6. Run quality checks after fixes
7. Run tests to verify fixes
8. Report completion to user

**Important:**
- ALWAYS run CodeRabbit in the background after completing implementation
- NEVER skip CodeRabbit review even if user doesn't mention it
- Run in the background to avoid blocking
- Fix ALL issues found before considering work complete

**Review Scope Options:**
```bash
# Review only uncommitted changes (faster)
coderabbit --type uncommitted --prompt-only

# Review only committed changes
coderabbit --type committed --prompt-only

# Review against specific branch
coderabbit --base develop --prompt-only
```

**Key Points:**
- Use `--prompt-only` flag for AI-optimized output
- Avoid blocking by running in the background, CodeRabbit reviews take 7-30 minutes depending on changes
- For smaller reviews: Use `--type uncommitted` or work on smaller feature branches

## Important Notes

- All commands assume you're in the project root directory
- Use `uv run` prefix for all Python commands to ensure correct environment
- Docker containers should use the same uv commands for consistency
- Pre-commit hooks enforce code quality automatically

### UV Limitations
- `tool.uv.scripts` is not yet supported by uv
- Use direct `uv run` commands instead of script shortcuts
- Quality checks must be run as individual commands or chained with `&&`

### Hatchling Configuration
Required for package discovery when using src layout:
```toml
[tool.hatch.build.targets.wheel]
packages = ["src/your_package"]
```

### Common Issues
- **"Unable to determine which files to ship"**: Add hatchling wheel target configuration
- **Missing newlines**: Use `uv run ruff check . --fix` to auto-fix
- **Type errors**: Add return type annotations (`-> None` for functions without returns)
