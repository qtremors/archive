# TASKS

Remaining improvements and future ideas for gitmig.

---

## 🐛 Remaining Bug Fixes

- [ ] **Normalize line endings** — Convert CRLF to LF in source files (or keep consistent)

---

## ✨ Remaining Features

- [ ] **Confirmation prompt** — Ask before large operations (with `--yes` to skip)
- [ ] **`--single-zip`** — All repos in one combined archive
- [ ] **`--since "date"`** — Only repos modified after a date
- [ ] **Backup manifest** — Generate `manifest.json` with repo metadata

---

## 🎨 Remaining UI/UX

- [ ] **Progress bar** — For large copy operations (using `tqdm` or simple counter)

---

## 💡 Future Ideas

These are ideas that may or may not be implemented:

- **`.gitmigignore`** — Per-repo exclusion file support
- **Cloud backup** — `--to s3://bucket` or similar
- **Incremental backups** — Track what changed since last backup

---

## ✅ Completed (26 items)

<details>
<summary>Click to expand completed items</summary>

### Bug Fixes (8)
- [x] Symlink handling — Symlinks are skipped during scan
- [x] Max file size limit — `--max-size` flag
- [x] ZIP path traversal — Security validation in `_zip_repo()`
- [x] Silent permission errors — Logged via `_on_walk_error`
- [x] File collision warning — `--force` flag
- [x] Dry run ZIP stats — Extension stats populate in dry run
- [x] Extension stats in dry run — Fixed
- [x] Add logging — `--verbose` flag

### Documentation (4)
- [x] Fix standalone usage example — Positional args in README
- [x] Fix error message — Show actual source path
- [x] Add personal use disclaimer — Added to README
- [x] Update roadmap — Removed implemented features

### Code Cleanup (3)
- [x] Remove unused constants — Deleted `BOLD` and `MAGENTA`
- [x] Fix type hints — Added `Optional` import
- [x] Consistent string quotes — Standardized to double quotes

### New Features (8)
- [x] Basic test suite — 32 unit tests
- [x] Execution time — "Completed in X.Xs"
- [x] Preserved files report — Track `.env` files
- [x] `--quiet` mode — Suppress output
- [x] `--verbose` mode — Show every file
- [x] Resume/skip existing — `--skip-existing` flag
- [x] `--only "repo1,repo2"` — Filter repos
- [x] `--stats-all` — Show all extensions

### UI/UX (3)
- [x] Clickable destination — OSC 8 hyperlinks
- [x] Stats pagination — `--stats-all` flag
- [x] Total time elapsed — Display in summary

</details>

---

## 📊 Status Summary

| Category | Remaining | Done |
|----------|-----------|------|
| Bug fixes | 1 | 8 |
| Features | 4 | 8 |
| UI/UX | 1 | 3 |
| **Total** | **6** | **26** |

---

*Last updated: 2025-12-17*
