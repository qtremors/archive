# rtree - Developer Documentation

> Comprehensive documentation for developers working on rtree.

**Version:** 1.1.0 | **Last Updated:** 2026-01-13

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [Testing](#testing)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Architecture Overview

rtree follows a **Hybrid CLI** architecture designed for performance and accuracy:

```
┌──────────────────────────────────────────────────────────────┐
│                        CLI Parser                            │
│           Handles arguments using `argparse`                 │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    RepoTreeVisualizer                        │
│          Hybrid Ignore Engine (Eager + Git)                  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Rendering Engine                          │
│          ASCII Tree or Flat list generation                  │
└──────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Zero Dependencies** | Ensures maximum portability and ease of installation without worrying about environment conflicts. |
| **Hybrid Ignore Logic** | "Eager Pruning" skips heavy folders (like `node_modules`) instantly, while `git check-ignore` provides 100% accuracy for smaller files. |
| **Pre-computed Ignore Set** | Scanning for ignores once before rendering improves performance on large directory structures. |

---

## Project Structure

```
rtree/
├── .github/workflows/        # CI/CD configurations
│   └── test.yaml             # GitHub Actions test runner
├── tests/                    # Test suite
│   └── test_rtree.py         # Unit tests covering core logic
├── rtree.py                  # Single-file core implementation
├── setup.py                  # Packaging and global CLI entry point
├── README.md                 # User-facing documentation
├── DEVELOPMENT.md            # This file
├── CHANGELOG.md              # Version history
└── LICENSE.md                # License terms
```

---

## Key Components

### `RepoTreeVisualizer`

The main engine of the utility. It handles directory traversal and filtering.

| Method | Description |
|-----------------|-------------|
| `_compute_ignored_set()` | Orchestrates the hybrid ignore logic. |
| `_collect_all_relpaths()` | Performs "Eager Pruning" by modifying `dirnames` in-place during `os.walk`. |
| `get_ascii_tree()` | Generates the visual tree representation. |
| `get_flat_list()` | Generates a simple list of file paths. |

---

## Testing

### Running Tests

```bash
# All tests
python -m unittest discover tests

# Specific test file
python -m unittest tests/test_rtree.py
```

### Test Coverage

| Test Category | Description |
|--------------------|----------|
| **Tree Generation** | Verifies ASCII connectors and hierarchy. |
| **Ignore Logic** | Validates `.gitignore` fallback and Git parity. |
| **Depth Control** | Ensures recursion limits are respected. |

---

## Configuration

### CLI Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `repo` | `.` | Target directory to scan. |
| `max_depth` | `-1` | Recursion limit. |
| `use_color` | `True` | ANSI color output (auto-disabled for files). |

---

## Commands

### `rtree`

The main command to generate a tree.

```bash
rtree --repo /path/to/repo --depth 2 --out structure.txt
```

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Git parity issues** | Ensure `git` is in your PATH. If missing, a manual fallback parser is used which may lack support for complex regex. |
| **Spinner artifacts** | Some terminals may display character ghosts in the spinner; use `--no-color` or pipe output to a file. |

---

## Contributing

### Code Style

- Keep code within the single `rtree.py` file to maintain the "zero-dependency, single-file" philosophy.
- Follow PEP 8 style guidelines.
- Add unit tests for any new features in `tests/`.

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Make your changes
4. Run tests (`python -m unittest discover tests`)
5. Commit with clear messages
6. Push and create a Pull Request

---

<p align="center">
  <a href="README.md">← Back to README</a>
</p>
