# locr - Tasks

> **Project:** locr  
> **Version:** 1.2.6  
> **Last Updated:** 2026-01-16

---

## 📋 To Do

### 🔴 High Priority (Bugs / Critical)

- [ ] (No pending critical bugs)

### 🟡 Medium Priority (Code Quality / Enhancements)

- [ ] **Parallel Processing**: Implement `concurrent.futures` for multi-threaded file scanning
- [ ] **Nested `.gitignore`**: Full recursive support for ignore files in subdirectories
- [ ] **Better Tokenization**: Handle edge cases like comment symbols inside strings more robustly
- [ ] **[TEST] Missing test coverage**
  - No tests for `--color` flag behavior
  - No tests for `--out` file writing
  - No tests for `--stats` percentage calculations
  - No tests for `--raw` mode
  - No tests for keyboard interrupt handling
  - No tests for spinner visibility

- [ ] **[CONSISTENCY] Duplicate type hints style**
  - `locr.py` uses `typing` module (`List`, `Tuple`, `Set`, `Optional`)
  - Python 3.9+ supports `list`, `tuple`, `set` natively
  - Should use consistent style (keep current for 3.8 compatibility)

### 🟢 Low Priority (Documentation / Polish)

- [ ] **[DOCS] Version mismatch locations**
  - Version appears in: README.md, DEVELOPMENT.md, CHANGELOG.md, TASKS.md, setup.py
  - Risk of drift when releasing new versions
  - Consider single source of truth (e.g., `__version__` in `locr.py`)

- [ ] **[DOCS] README performance benchmark context**
  - Cold start: 40.7s, Warm start: 1.1s
  - Missing info: hardware specs, SSD vs HDD, what "depth-1 clone" means

- [ ] **[DOCS] Missing `--help` output in README**
  - Would help users see all options at a glance

- [ ] **[POLISH] setup.py missing metadata**
  - No `author`, `description`, `url`, `license`, `classifiers`
  - Would improve `pip show locr` output

- [ ] **[POLISH] No type hints in `locr_config.py`**
  - `DEFAULT_IGNORE_PATTERNS` and `LANGUAGES` could have explicit type annotations

---

## 💡 Ideas / Future
- [ ] Support for more exotic languages (COBOL, Fortran)
- [ ] GUI wrapper for non-CLI users
- [ ] **Config file support** (`.locrrc` or `locr.toml` for project-specific settings)
- [ ] **Exclude patterns CLI flag** (`--exclude "*.test.*"`)
- [ ] **Include only patterns** (`--include "*.py"`)
- [ ] **Verbose/debug mode** for troubleshooting gitignore matching
- [ ] **Progress bar** instead of spinner for large scans

---

## 🏗️ Architecture Notes
- **Philosophy**: Zero dependencies, maximum speed
- **Scanning**: Predominantly I/O bound in cold starts, shifts to CPU bound in warm starts
- **File structure**: 2-file design (`locr.py` + `locr_config.py`) keeps config separate from logic

---
