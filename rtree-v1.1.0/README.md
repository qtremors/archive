<p align="center">
  <img src="assets/rtree-preview.png" alt="rtree Logo" width="350" style="border-radius: 20px;"/>
</p>

<h1 align="center"><a href="https://github.com/qtremors/rtree">RepoTree Generator (`rtree`)</a></h1>

<p align="center">
  A fast, context-aware utility designed to generate plain-text representations of directory structures for Git repositories.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.6+-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/License-TSL-red" alt="License">
</p>

> [!NOTE]
> **Personal Project** 🎯 I built this to quickly generate directory structures for documentation and LLM context, ensuring build artifacts and ignored files are automatically filtered.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌲 **Git-Aware** | Automatically prioritizes `git check-ignore` to filter files exactly as Git sees them. |
| 🎨 **Smart Colors** | Blue for directories, Green for files, Yellow for configs (auto-disabled when writing to files). |
| 📏 **Depth Control** | Limit recursion depth to get a high-level overview of massive projects. |
| 🔄 **Fallback Logic** | Includes a manual `.gitignore` parser if Git is not installed or the directory is not initialized. |
| 📊 **Visualization Modes** | Supports visual ASCII trees, flat file lists, and raw modes. |
| 🚀 **Zero Dependencies** | Written in pure Python (standard library only). |

---

## 🚀 Quick Start

To use `rtree` globally from any terminal window, clone the repo and install it using pip.

```bash
# Clone the repository
git clone https://github.com/qtremors/rtree.git

# Navigate to the project folder
cd rtree

# Install the CLI in editable mode
pip install -e .
```

*The `-e` flag stands for "editable". It links the global command to your local file, so any changes apply immediately.*

### Standalone Usage

If you do not wish to install it, you can simply run the script using Python:

```bash
python rtree.py [arguments]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Language** | Python 3.6+ |
| **Logic** | `argparse`, `subprocess`, `os`, `itertools` |
| **Testing** | `unittest` |

---

## 🎮 Usage & Commands

Once installed, use the command `rtree`. Below are the supported arguments and scenarios.

### Arguments Reference

#### 📍 Navigation & Targets
| Argument | Short | Description |
|---|---|---|
| `--repo` | `-r` | Target Directory. Defaults to CWD if omitted. |
| `--list` | | Scans CWD and lists all valid Git repositories found. |

#### 🎨 Visualization & Depth
| Argument | Short | Description |
|---|---|---|
| `--depth` | | Depth Limit. Stop scanning after N levels. |
| `--flat` | | Flat Mode. Output a flat list of paths instead of a tree. |
| `--ascii` | | Force standard tree characters (`├──`) (default). |
| `--raw` | | Raw Mode. Ignore `.gitignore` rules and show everything. |

#### 💾 Output & Formatting
| Argument | Short | Description |
|---|---|---|
| `--out` | `-o` | Save to file. Auto-generates name if no value provided. |
| `--no-color` | | Plain Text. Disable ANSI colors in the terminal. |

---

### Scenarios

#### 1. Standard Tree Visualization
```bash
rtree -r my-project
```

#### 2. Depth Control
```bash
rtree -r my-project --depth 1
```

#### 3. Flat List Mode
```bash
rtree -r my-project --flat
```

#### 4. Save to File
```bash
rtree -r my-project --out
```

---

### Commands

```bash
    # --- Basic Usage ---
    # Scan the current directory
    rtree
    python rtree.py

    # Scan a specific subdirectory
    rtree -r my-project
    python rtree.py -r my-project

    # Scan an absolute path
    rtree -r "C:/Projects/App"
    python rtree.py -r "C:/Projects/App"

    # --- Depth Control ---
    # Limit tree to 2 levels deep (great for large repos)
    rtree --depth 2
    python rtree.py --depth 2

    # Combine specific target with depth limit
    rtree -r src --depth 3
    python rtree.py -r src --depth 3

    # --- Output to File ---
    # Auto-name the output file (e.g., 'folder_tree.txt')
    rtree -o
    python rtree.py -o

    # Save to a specific filename
    rtree -o structure.txt
    python rtree.py -o structure.txt

    # Scan 'src' and save to 'src.txt'
    rtree -r src -o src.txt
    python rtree.py -r src -o src.txt

    # --- Flat List Mode ---
    # Output a flat list of file paths instead of a tree
    rtree --flat
    python rtree.py --flat

    # Save the flat list to a file
    rtree --flat -o list.txt
    python rtree.py --flat -o list.txt

    # --- Raw / Debug Mode ---
    # Ignore .gitignore rules (shows .git, venv, etc.)
    rtree --raw
    python rtree.py --raw

    # See top-level hidden files only
    rtree --raw --depth 1
    python rtree.py --raw --depth 1

    # Flat list of every file on disk (ignoring rules)
    rtree --raw --flat
    python rtree.py --raw --flat

    # --- Utilities ---
    # List all git repositories found in the current directory
    rtree --list
    python rtree.py --list

    # Force disable colored output in the terminal
    rtree --no-color
    python rtree.py --no-color
```

---

## 📁 Project Structure

```
rtree/
├── .github/workflows/    # CI/CD configurations
├── tests/                # Test suite
│   └── test_rtree.py     # Unit tests
├── rtree.py              # Main core logic
├── setup.py              # Package installation
├── DEVELOPMENT.md        # Developer documentation
├── CHANGELOG.md          # Version history
├── LICENSE.md            # License terms
└── README.md
```

---

## ⚙️ How It Works

The script relies on the `RepoTreeVisualizer` class to handle scanning and filtering.

1. **Initialization:** The script accepts a target repository path (`--repo`). If omitted, it defaults to the current working directory. It immediately locates the `.gitignore` file.
    
2. **Hybrid Ignore Calculation:**
    - **Phase 1 (Eager Pruning):** As the script walks the directory, it immediately skips known heavy folders (like `node_modules` or `venv`) using internal pattern matching. This prevents unnecessary scanning of thousands of files.
    - **Phase 2 (Git Precision):** For the remaining files, it queries `git check-ignore` to ensure 100% parity with your `.gitignore` rules (handling negations and complex overrides correctly).
        
3. **Traversal:**
    
    - It uses `os.walk` to traverse the directory.
        
    - **Depth Logic:** If `--depth` is set, it stops recursion when the specified level is reached.
        
    - **Filtering:** For every file/folder, it checks against the computed `ignored_set`. Special care is taken to always show the root `.gitignore` and `.git` folder.
        
4. **Rendering:**
    
    - **ASCII Tree:** Uses a recursive function to draw `├──`, `│`, and `└──` characters.
        
    - **Color Logic:** Wraps strings in ANSI escape codes (e.g., `\033[94m` for directories) unless `--no-color` or `--out` is used.

---

## 📊 System Resource usage and impact

- **CPU:** Low impact (single-threaded traversal).
- **RAM:** Minimal (tree dictionary fits in memory even for large repos).
- **Disk:** Read-only operation; output files are small text files.

---

## 🧪 Testing

```bash
python -m unittest discover tests
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Architecture, implementation details, and testing |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [LICENSE.md](LICENSE.md) | License terms and attribution |

---

## 📄 License

**Tremors Source License (TSL)** - Source-available license allowing viewing, forking, and derivative works with **mandatory attribution**. Commercial use requires written permission.

See [LICENSE.md](LICENSE.md) for full terms.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/qtremors">Tremors</a>
</p>
