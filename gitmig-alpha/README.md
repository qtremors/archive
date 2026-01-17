# Git Migration Tool (`gitmig`)

> 🛠️ **Personal Utility** — This is a personal tool I built for my own workflow. Not a commercial product, just a simple script that solves a specific problem I kept running into.

**gitmig** is a lightweight, dependency-free utility designed to copy Git repositories without the bloat.

> *"I just want my source code, not 50,000 files from node_modules."*
>
> — **Every Developer** (probably)

When you need to backup, share, or migrate your repos to another machine, you don't need the `.git` history, virtual environments, or dependency folders. **gitmig** copies only the essential source files while preserving important configs like `.env`.

> ℹ️ **Note:** `gitmig` operates on the current directory and copies all detected Git repositories to your specified destination.

## The Problem

Ever tried to backup or share your project folder? Here's what happens:

### The Manual Nightmare

1. Open File Explorer, navigate into `repo1/`
2. Select files... wait, skip `node_modules`... skip `.git`...
3. There's a nested folder `src/components/` - go deeper
4. Copy those files, but not `__pycache__` inside...
5. Go back up, find the next folder...
6. **Repeat for EVERY level of EVERY folder**
7. Don't forget `.env` (hidden files might not show!)
8. Now do it for `repo2/`, `repo3/`...

### The Math

- 3 repos × ~20 nested levels × manual selection = **60+ folder navigations**
- One mistake and you either miss source code or copy 50,000+ dependency files
- **30+ minutes** of tedious clicking

### Real Example

```
Source: 3 repos with node_modules, venv, .git
├── Total files: 50,462
├── Dependency/cache files: 50,417 (99.9%)
└── Actual source code: 45 files (0.1%)
```

**Manually copying everything:** 30+ minutes, GBs of useless files

**With gitmig:** 2 seconds, ~1 MB of clean source code

## The Solution

```bash
gitmig D:\Backup
# Done. 45 files copied, 50,000+ skipped.
```

## When to Use gitmig

| Scenario | Why gitmig helps |
|----------|------------------|
| **Backup to external drive** | USB drives are slow—skip 50k dependency files |
| **Moving to new machine** | Migrate before your laptop dies |
| **Sharing with colleagues** | They need YOUR `.env` values, not a fresh clone |
| **Archiving old projects** | Long-term storage without bloat |
| **Batch operation** | All repos in a folder—one command |
| **Offline / No internet** | Works locally—no GitHub access needed |

### Why not just `git clone`?

`git clone` pulls from **remote** (GitHub). It won't help when:
- You need files **only on your local machine** (`.env`, unpushed changes)
- GitHub is down or inaccessible
- You want to backup **all repos at once**

**gitmig works on your local folders**—it's a backup/migration tool, not a git replacement.

## Features

- **Auto-Detection:** Automatically finds all Git repositories in the current directory.
- **Smart Exclusions:** Skips heavy folders (`node_modules`, `venv`, `.git`, `dist`, `build`, etc.) without any configuration.
- **Preserves Configs:** Always copies `.env`, `.env.local`, `.env.production`, and similar files.
- **Dry Run Preview:** See exactly what would be copied before committing.
- **Zip Compression:** Optionally output each repo as a `.zip` archive.
- **File Stats:** Show detailed breakdown by file extension.
- **Custom Exclusions:** Add extra patterns via CLI.
- **Progress Feedback:** Shows per-repo stats as it works.
- **Zero Dependencies:** Written in pure Python (standard library only).

## Installation

### 1. Install Globally (Recommended)

This allows you to run the command `gitmig` from any terminal window.

```bash
# Clone or download this repo, then navigate to it
git clone https://github.com/qtremors/gitmig.git
cd gitmig

# Install in editable mode
pip install -e .
```

*The `-e` flag stands for "editable". It links the global command to your local file, so any changes you make to `gitmig.py` apply immediately.*

### 2. Standalone Usage

If you don't want to install it, you can just run the script directly:

```bash
python gitmig.py /path/to/destination
```

## Usage & Commands

### Syntax

```bash
gitmig [destination]             # Current dir → destination
gitmig [source] [destination]    # Source → destination
```

### Options

| Option | Description |
|--------|-------------|
| `--dry-run` | **Preview Mode.** Shows what would be copied without actually copying. |
| `--zip` | **Compress Mode.** Create a `.zip` archive for each repo. |
| `--stats` | **Stats Mode.** Show detailed file type breakdown after migration. |
| `--exclude` | **Custom Exclusions.** Comma-separated patterns (e.g., `"*.txt,temp/"`). |
| `--include-git` | **Include .git.** Keep the `.git` folder (normally excluded). |
| `--verbose`, `-v` | **Verbose Mode.** Show every file being copied and permission warnings. |
| `--quiet`, `-q` | **Quiet Mode.** Suppress all output except errors. |
| `--max-size` | **Size Limit.** Skip files larger than limit (e.g., `10M`, `500K`). |
| `--only` | **Filter Repos.** Only migrate specific repos (comma-separated). |
| `--force` | **Force Mode.** Overwrite existing files without warning. |
| `--stats-all` | **Full Stats.** Show all extensions (not just top 15). |
| `--skip-existing` | **Resume Mode.** Skip files that already exist at destination. |

### Common Scenarios

#### 1. Basic Migration

Copies all repos from the current directory to the destination.

```bash
gitmig D:\Backup\CleanRepos
```

**Expected Output:**

```
Detected 3 repositories in Z:\AllRepos

[1/3] portfolio/
      → Copying: 45 files
      → Skipping: node_modules/ (12,456), .git/ (1,203)

[2/3] my-api/
      → Copying: 89 files
      → Skipping: venv/ (5,678), .git/ (456), __pycache__/

[3/3] cosmos-app/
      → Copying: 156 files
      → Skipping: node_modules/, dist/, .git/

──────────────────────────────────────────────────
MIGRATION COMPLETE
Copied: 290 files across 3 repos
Skipped: ~19,000 dependency/cache files
Total size: 2.45 MB

Destination: D:\Backup\CleanRepos
```

#### 2. Dry Run (Preview)

See what would be copied without actually copying anything.

```bash
gitmig D:\Backup --dry-run
```

**Expected Output:**

```
Detected 3 repositories in Z:\AllRepos

[1/3] portfolio/
      → Copying: 45 files
      → Skipping: node_modules/ (12,456), .git/ (1,203)

...

──────────────────────────────────────────────────
DRY RUN COMPLETE (no files copied)
Would copy: 290 files across 3 repos
Would skip: ~19,000 dependency/cache files
```

## Commands Cheat Sheet

Quick reference for common commands.

```bash
# --- Basic Usage ---
# Copy from current dir to destination
gitmig ./backup
gitmig D:\Backup\CleanRepos

# Copy from specific source to destination
gitmig C:\Projects\GitHub D:\Backup

# --- Preview Mode ---
# See what would be copied without copying
gitmig ./backup --dry-run

# --- Zip Mode ---
# Create .zip archives instead of folders
gitmig ./backup --zip

# --- With Stats ---
# Show file type breakdown after migration
gitmig ./backup --stats

# --- Custom Exclusions ---
# Exclude additional patterns
gitmig ./backup --exclude "*.txt,temp/,*.log"

# --- Include .git ---
# Keep the .git folder (for full history backup)
gitmig ./backup --include-git

# --- Verbose Mode ---
# Show every file being copied
gitmig ./backup --verbose
```

## What Gets Excluded?

By default, `gitmig` excludes these folders and files:

### Directories

| Category | Excluded |
|----------|----------|
| **Version Control** | `.git`, `.svn`, `.hg` |
| **IDEs** | `.idea`, `.vscode` |
| **Python** | `__pycache__`, `venv`, `.venv`, `env`, `.pytest_cache`, `.mypy_cache`, `*.egg-info` |
| **Node/Web** | `node_modules`, `bower_components`, `.next`, `.nuxt`, `.cache` |
| **Build Artifacts** | `dist`, `build`, `target`, `bin`, `obj`, `out` |

### Files

| Pattern | Description |
|---------|-------------|
| `*.log` | Log files |
| `*.pyc`, `*.pyo` | Python bytecode |
| `*.exe`, `*.dll`, `*.so` | Binary files |

### Always Preserved

| Pattern | Description |
|---------|-------------|
| `.env` | Environment config |
| `.env.*` | All .env variants (`.env.local`, `.env.production`, etc.) |

## Troubleshooting

- **"Command not found":** Ensure you ran `pip install -e .` inside the folder. If it still fails, make sure your Python `Scripts/` (Windows) or `bin/` (Mac/Linux) folder is in your system PATH.

- **"No git repositories found":** `gitmig` only detects folders that contain a `.git/` directory. Make sure you're running it from a directory that contains repo folders.

- **Destination already exists:** `gitmig` will merge into existing directories. Use `--skip-existing` to skip files that already exist, or `--force` to overwrite without warnings.

## FAQ

### 1. Does it preserve folder structure?

**Yes.** Each repo is copied with its full directory structure intact. Only excluded folders are removed.

### 2. What if a repo has no .git folder?

**It won't be detected.** `gitmig` specifically looks for `.git/` directories to identify repos.

### 3. Can I customize exclusions?

**Yes.** Edit `gitmig_config.py` to add or remove patterns from `EXCLUDE_DIRS`, `EXCLUDE_FILE_PATTERNS`, or `PRESERVE_PATTERNS`.

### 4. Is it safe?

**Yes.** `gitmig` only **copies** files—it never modifies or deletes your source repos. Use `--dry-run` first if you want to preview.

### 5. Why not just use `git clone`?

`git clone /local/path` works, but:
- Still copies the entire `.git` history (can be huge)
- Doesn't filter out `node_modules` or `venv`
- Only works on one repo at a time

## 💡 Future Ideas

These are things I might add if I need them:

- `--single-zip` — All repos in one combined archive
- `--since "2024-01-01"` — Only repos modified after a date
- `--yes` — Skip confirmation prompts for large operations
- Backup manifest with metadata (`manifest.json`)
- Progress bar for large operations

---

*See [TASKS.md](TASKS.md) for the full list of potential improvements.*

