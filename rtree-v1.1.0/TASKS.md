# rtree - Tasks

> **Project:** rtree  
> **Version:** 1.1.0  
> **Last Updated:** 2026-01-14

---

## ✅ Completed (v1.1.0)

### Documentation
- [x] Align project documentation with new Templates
- [x] Create comprehensive `DEVELOPMENT.md`
- [x] Standardize `CHANGELOG.md` history
- [x] Update `README.md` with resource impact and tech stack

### Core Features
- [x] Hybrid Ignore Engine (Eager Pruning + Git)
- [x] ASCII Tree and Flat list modes
- [x] Depth recursion limits
- [x] CLI Spinner for long-running scans

### Quality Assurance
- [x] Unit test suite in `tests/`
- [x] Multi-version Python CI (3.8-3.12) via GitHub Actions

---

## � Code Quality Issues

### Critical - Dead Code
- [ ] **Remove unreachable code in `_compute_ignored_set()`** (lines 302-311)
  - Code block after `return` statement is never executed
  - Duplicates logic already present before the return

### High Priority - Bugs & Logic
- [ ] **Fix `Colors.style()` call in file output message** (line 575)
  - Missing `use_color` parameter: `Colors.style(str(outname), Colors.GREEN)` → should include `use_color`
  - Currently always shows color codes even when writing to file

### Medium Priority - Code Improvements
- [ ] **Add type hints to callback parameter** (line 141)
  - `callback=None` lacks type annotation: should be `Optional[Callable[[], None]]`
- [ ] **Remove unused import** - `time` module imported but only used by spinner callback
  - Consider if spinner logic should be extracted to reduce import overhead
- [ ] **Add `--ascii` argument handling** (documented in README but only mentioned in `auto_out_name()`)
  - README lists `--ascii` flag but it's not actually implemented in argparse

---

## 🏗️ Architecture Issues

### Medium Priority
- [ ] **Extract spinner logic into separate function/class**
  - Spinner setup (lines 524-545) and cleanup (lines 561-564, 581-583) are scattered
  - Could be encapsulated in a context manager for cleaner code
- [ ] **Consider extracting color/formatting utilities**
  - `Colors` class could support Windows native colors (see CLI Usability below)

### Low Priority
- [ ] **Add `__init__.py` to project root** for cleaner imports
- [ ] **Consider pyproject.toml migration** instead of `setup.py` (modern packaging)

---

## ⚡ Performance Considerations

### Medium Priority
- [ ] **Cache `_is_git_repo()` result** - Currently called during ignore computation
  - Result doesn't change during execution, should be computed once
- [ ] **Batch git subprocess calls more efficiently**
  - For very large repos, multiple subprocess invocations add overhead

### Low Priority
- [ ] **Profile startup time** for frequently-run use cases
  - Single-file design is good for portability, minimal import overhead

---

## 🖥️ CLI Usability Issues

### High Priority
- [ ] **Implement Windows CMD/PowerShell native color support** (existing TODO)
  - Current ANSI codes work in Windows Terminal/modern PowerShell but not legacy CMD
  - Consider using `colorama` or detecting terminal capabilities

### Medium Priority
- [ ] **Add `--version` argument** - Standard CLI expectation
- [ ] **Add `--help` examples** - Epilog could show common usage patterns
- [ ] **Improve error message for missing Git** - Currently silently falls back
  - Consider informing user when fallback parser is used

### Low Priority
- [ ] **Add `--quiet` / `-q` flag** to suppress progress spinner
- [ ] **Support stdin for piping** (e.g., `echo "/path" | rtree`)

---

## 📚 Documentation Issues

### High Priority
- [ ] **Fix typo in DEVELOPMENT.md** - References `test.yml` but file is `test.yaml`
- [ ] **Sync version numbers** - Ensure `setup.py`, docs, and CHANGELOG all match

### Medium Priority
- [ ] **Add inline code comments** for complex logic
  - `_simple_gitignore_match()` has non-obvious pattern matching logic
  - `_compile_simple_patterns()` anchoring rules need explanation
- [ ] **Document the callback parameter** in docstrings
- [ ] **Add CONTRIBUTING.md** (currently only a section in DEVELOPMENT.md)

### Low Priority
- [ ] **Add docstrings to `auto_out_name()` and `main()`**
- [ ] **README: Add badges for PyPI if published**

---

## 🧪 Testing Gaps

### High Priority
- [ ] **Add test for raw mode** (`--raw` flag)
- [ ] **Add test for color output** (verify ANSI codes presence/absence)
- [ ] **Add test for output file writing** (`--out` flag)

### Medium Priority
- [ ] **Add tests for edge cases:**
  - [ ] Empty directories
  - [ ] Permission denied scenarios
  - [ ] Symlinks handling
  - [ ] Unicode filenames
- [ ] **Add test for `--list` command**

### Low Priority
- [ ] **Add integration tests** that run the CLI as a subprocess
- [ ] **Add test coverage reporting** to CI pipeline

---

## 🔐 Security Considerations

### Low Priority (Minimal Attack Surface for CLI Tool)
- [ ] **Validate user input paths** - Prevent path traversal (currently uses `os.path.abspath`)
- [ ] **Consider timeout for `git check-ignore`** - Already has 10s timeout, but document rationale

---

## 📋 Existing TODOs (Validated)

### High Priority
- [ ] Add more granular filtering (e.g., `--exclude` specific files via CLI)
- [ ] Implement color support for Windows CMD/PowerShell natively *(see CLI section)*

### Medium Priority
- [ ] Add summary output (total files/folders scanned)
- [ ] Support for `.rtree-ignore` custom ignore files

### Low Priority
- [ ] GUI viewer for generated trees
- [ ] Export to JSON/XML formats

---

## 🏗️ Architecture Notes

- **Single-File Strategy**: Maintain core logic in `rtree.py` for easy copy/paste deployment
- **Performance First**: Prioritize "Eager Pruning" for speed on massive repositories
- **Zero Dependencies**: Standard library only - no external packages required

---

## 📊 Review Summary

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Code Quality | 1 | 1 | 3 | 0 |
| Architecture | 0 | 0 | 2 | 2 |
| Performance | 0 | 0 | 2 | 1 |
| CLI Usability | 0 | 1 | 3 | 2 |
| Documentation | 0 | 2 | 3 | 2 |
| Testing | 0 | 3 | 2 | 2 |
| Security | 0 | 0 | 0 | 2 |

**Review Date:** 2026-01-14

---
