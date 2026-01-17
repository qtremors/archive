# locr - Developer Documentation

> Comprehensive documentation for developers working on locr.

**Version:** 1.2.6 | **Last Updated:** 2026-01-16

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)

---

## Architecture Overview

`locr` follows a **2-Phase Hybrid Scanning** architecture designed for maximum performance without sacrificing accuracy.

```
┌──────────────────────────────────────────────────────────────┐
│                  Phase 1: Eager Pruning                      │
│      Instantly skips massive folders (node_modules, .git)    │
│      using fast pattern matching and root .gitignore.        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                Phase 2: Git Verification                     │
│      Queries 'git check-ignore' for the survivors to         │
│      ensure 100% accuracy with Git's state.                  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                Phase 3: Heuristic Analysis                   │
│      Fast, line-by-line scanning to count blank,             │
│      comment, and code lines using simple patterns.          │
└──────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Zero Dependencies** | Ensures the tool is easily portable and usable in any Python environment. |
| **Hybrid Engine** | Balances the speed of custom pruning with the precision of Git's own logic. |
| **Heuristic Parsing** | Prioritizes speed over absolute compiler precision for general stats. |

---

## Project Structure

```
locr/
├── tests/                    # Unit test suite
│   └── test_locr.py          # Core logic tests
├── archive/                  # Historical versions
├── locr.py                   # Main engine and CLI logic
├── locr_config.py            # Language definitions and colors
├── setup.py                  # Installation script
├── README.md                 # User-facing documentation
├── DEVELOPMENT.md            # This file
├── CHANGELOG.md              # Version history
└── LICENSE.md                # License terms
```

---

## Key Components

### `LocrEngine`

The core class responsible for orchestrating the scan and analysis.

| Method | Description |
|--------|-------------|
| `_collect_and_filter_files()` | Implements the 2-phase scanning/filtering logic. |
| `scan()` | Iterates over valid files and aggregates statistics. |
| `_analyze_file()` | Heuristically parses a single file for lines of code. |

---

## Configuration

### `locr_config.py`

Customization is handled via global constants in the config file.

| Setting | Description |
|---------|-------------|
| `DEFAULT_IGNORE_PATTERNS` | List of folders to always prune eagerly. |
| `LANGUAGES` | Mapping of extensions to names, colors, and comment markers. |
| `Colors` | ANSI color escape sequences used for the UI. |

---

## Testing

### Running Tests

```bash
# Run all tests
python tests/test_locr.py
```

### Test Coverage
- **Counting Logic**: Verifies correct line categorization for major patterns.
- **Ignore Logic**: Ensures `node_modules` and `.gitignore` rules are respected.
- **Heuristic Limits**: Documents and tests known edge cases (e.g., comments in strings).

---

## Contributing

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/cool-feature`)
3. Make your changes
4. Run tests (`python tests/test_locr.py`)
5. Commit with clear messages
6. Push and create a Pull Request

---

<p align="center">
  <a href="README.md">← Back to README</a>
</p>
