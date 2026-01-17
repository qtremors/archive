# locr Changelog

> **Project:** locr  
> **Version:** 1.2.5  
> **Last Updated:** 2026-01-16

---

## [1.2.6] - 2026-01-16

### Fixed
- **Dead Code**: Removed redundant return statement in `locr.py`.
- **Tests**: Fixed version assertion in `test_json_output` to be dynamic.

### Changed
- **CI**: Optimized test matrix to focus on Python 3.11 and 3.12.

---

## [1.2.5] - 2026-01-16

### Added
- **JSON Output**: New `--json` flag for machine-readable output.
- **CLI Enhancements**: Added `--version` flag and usage examples to `--help`.

### Fixed
- **Critical Bugs**: Fixed malformed multi-line comment config for HTML, XML, and Markdown.
- **Testing**: Removed unused imports in test suite.
- **Exception Handling**: Refactored broad exceptions in `locr.py` for safety.

---

## [1.2.0] - 2026-01-12

### Added
- **Statistics Mode**: Added `--stats` (`-s`) flag for detailed breakdowns (Density %, Share %).
- **Responsive UI**: Table widths dynamically adjust to terminal size using `shutil`.

### Changed
- **Output Formatting**: Cleaner spacing and footer alignment.
- **Default View**: Maintained "Clean" view as default for readability.

### Fixed
- **Visual Artifacts**: Resolved ghostly spinner text issues.

---

## [1.1.0] - 2025-12-04

### Added
- **Visuals**: Loading spinner animation for larger scans.
- **UX**: Graceful `Ctrl+C` interrupt handling.

### Changed
- **Engine Upgrade**: Switched to a "Hybrid" engine (Eager Pruning + `git check-ignore`).
- **Accuracy**: 100% parity with complex `.gitignore` rules (negations/overrides).
- **Performance**: Eager pruning maintains speed even with Git verification.

---

## [1.0.0] - 2025-12-04

### Added
- **CLI Support**: `setup.py` for global installation via `pip`.
- **Command Entry Point**: `locr` command registered.
- **Language Colors**: Distinct color mapping for major languages.
- **Smart Output**: `-o` flag for automatic or specific file saving.
- **Eager Pruning**: Skip ignored directories before scanning.
- **Partial Results**: Results table generated even on early exit.

---

<p align="center">
  <a href="README.md">← Back to README</a>
</p>
