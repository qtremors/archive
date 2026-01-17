<p align="center">
  <img src="assets/locr-preview.png" alt="locr Logo" width="350" style="border-radius: 20px;"/>
</p>

<h1 align="center"><a href="https://github.com/qtremors/locr">locr</a></h1>

<p align="center">
  A blazing fast, dependency-free utility designed to count lines of code in Git repositories.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-yellow?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Version-1.2.6-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-TSL-red" alt="License">
</p>

> [!NOTE]
> **Personal Project** 🎯 I built `locr` to create a fast, Python-based alternative to tools like `cloc` and `tokei` that works without external dependencies. It is currently in **v1.2.6** and is optimized for standard web and software projects.

---

## ✨ Features

- **Hybrid Git-Awareness:** Uses a smart 2-phase scanner. It **eagerly prunes** massive junk folders (like `node_modules`) for speed, then queries `git check-ignore` for the remaining files to ensure **100% accuracy** with your `.gitignore` rules (including complex negations).
- **Eager Pruning:** Instantly skips heavy directories (`node_modules`, `venv`, `.git`) before even asking Git about them. This keeps scans blazing fast even on massive monorepos.
- **Graceful Interrupts:** Caught in a massive scan? Hit `Ctrl+C` to stop immediately and view the **partial results** collected so far.
- **Smart Colors:** Language-specific row coloring (Python/JS=Yellow, HTML=Red, TS=Blue) for instant visual scanning.
- **Visual Feedback:** Includes a high-visibility loading spinner that respects terminal performance limits.
- **Contextual Output:** Supports saving reports directly into the scanned folder or to a custom path.
- **Zero Dependencies:** Written in pure Python (standard library only).

---

## 🚀 Installation

### 1. Install Globally (Recommended)

This allows you to run the command `locr` from any terminal window.

```bash
# Clone or download this repo, then navigate to it
git clone https://github.com/qtremors/locr.git
cd locr

# Install in editable mode
pip install -e .
```

*The `-e` flag stands for "editable". It links the global command to your local file, so any changes you make to `locr.py` apply immediately.*

### 2. Standalone Usage

If you don't want to install it, you can just run the script directly:

```bash
python locr.py [arguments]
```

---

## 📊 Comparisons

How does `locr` stack up against the alternatives?

| Tool | Language | Strategy | Best For... |
| :--- | :--- | :--- | :--- |
| **`locr`** | Python | **Eager Pruning.** Skips heavy folders *before* entering them. | **Convenience.** No installation required if you have Python. Perfect for quick checks. |
| **`cloc`** | Perl | **Scan & Filter.** Walks tree first, filters later. | **Legacy Support.** Supports huge list of obscure languages (COBOL, Fortran). |
| **`tokei`** | Rust | **Raw Power.** Compiled binary speed. | **Performance.** The gold standard for speed, if you have the Rust toolchain. |
| **`scc`** | Go | **Complexity Analysis.** Fast parallel processing. | **Deep Stats.** If you need cyclomatic complexity scores. |

**The Bottom Line:** If you already have Rust or Go tools installed, keep using them—they are technically faster. But if you just want a tool that works *now* with the Python environment you already have, `locr` is the move.

---

## 📖 Usage & Commands

### Arguments Reference

| Argument | Short | Description |
|----------|-------|-------------|
| `path` | | **Target Directory.** Defaults to current directory (`.`) if omitted. |
| `--color` | `-c` | **Enable Color.** Turn on language-specific syntax highlighting. |
| `--stats` | `-s` | **Show Statistics.** Display percentage breakdowns for comment density and file share. |
| `--out` | `-o` | **Save to file.** <br>1. **No Value:** Save to `[folder]_locr.txt` INSIDE the scanned folder.<br>2. **Filename:** Save to a specific file in the current directory. |
| `--json` | | **JSON Output.** Output the results in structured JSON format (stdout). |
| `--version` | | **Version.** Display the current version of locr. |
| `--raw` | | **Raw Mode.** Ignore `.gitignore` rules and count EVERYTHING. |

---

## 🎮 Common Scenarios

#### 1. Standard Scan (Plain Text)

Scans the current directory. Output is monochrome by default (safer for piping to files).

```bash
locr
```

**Expected Output:**

```text
===========================================================================
Language                    Files        Blank      Comment         Code
---------------------------------------------------------------------------
JSON                            5            4            0         4717
TypeScript TSX                 21          257           19         2256
Python                         11           86           40          623
TypeScript                      7           36           14          239
Markdown                        1           91            0           99
CSS                             2           15            7           99
JavaScript                      3            1            1           48
HTML                            1            0            0           13
TOML                            1            8            0           11
---------------------------------------------------------------------------
TOTAL                          52          490           81         8105
===========================================================================
Processed 52 files in 0.032 seconds.
```

#### 2. Colored Scan

Scans a specific folder (`src`) with syntax highlighting enabled.

```bash
locr src --color
```

#### 3. Save to File (Auto-Location)

Scans the `frontend` folder and saves the report _inside_ that folder.

```bash
locr frontend -o
```

**Console Output:**

```text
Output written to: Z:\Projects\MyApp\frontend\frontend_locr.txt
```

#### 4. Detailed Statistics (Percentages)

Use the `-s` flag to see the composition of your codebase, including comment density and file share percentages.

```bash
locr --stats
```

**Expected Output (with percentages):**

```text
===========================================================================
Language                    Files          Blank        Comment        Code
---------------------------------------------------------------------------
Python                  15 (30%)     120 (10%)      240 (20%)      840 (70%)
HTML                    20 (40%)      50 ( 5%)        0 ( 0%)      950 (95%)
JavaScript              15 (30%)       5 ( 5%)       10 (10%)       85 (85%)
---------------------------------------------------------------------------
TOTAL                   50 (100%)    175 ( 9%)      250 (13%)     1875 (78%)
===========================================================================
Processed 50 files in 0.042 seconds.
```

#### 5. Raw Mode (Debug)

Ignores your `.gitignore` and counts everything (virtual environments, build artifacts, etc).

```bash
locr --raw
```

#### 6. Interrupting a Scan

If you start scanning a massive monorepo and realize you have enough data, press `Ctrl+C`.

```bash
locr giant-repo
# User presses Ctrl+C...
```

**Console Output:**

```text
⚠ Scan interrupted. Showing partial results...

===========================================================================
Language                    Files        Blank      Comment         Code
---------------------------------------------------------------------------
Python                        458         6160         7293        30962
JavaScript                     88         4680         3970        19377
CSS                            16          955          114         4145
HTML                           63          221            0         1686
YAML                           17           83           10          938
Markdown                        6           30            0          113
TOML                            1            8            0           60
JSON                            1            0            0           19
---------------------------------------------------------------------------
TOTAL                         650        12137        11387        57300
===========================================================================
Processed 650 files in 0.422 seconds.
```

#### 7. JSON Output

Generate a machine-readable JSON report for CI/CD pipelines.

```bash
locr --json
```

---

## ⌨️ Commands Cheat Sheet

Quick reference for common commands.

```bash
# --- Basic Usage ---
# Scan current directory (Plain text)
locr
python locr.py

# Scan a specific folder with Color
locr src --color
python locr.py src -c

# --- Detailed Statistics ---
# Show breakdown of Comment Density % and File Share %
locr --stats
locr -s

# --- Output to File ---
# Scan 'src' and save to 'src/src_locr.txt'
locr src -o
python locr.py src -o

# Scan current dir and save to 'current_folder_locr.txt'
locr -o
python locr.py -o

# Scan 'src' but save to a specific file in current location
locr src -o my_report.txt
python locr.py src -o my_report.txt

# --- Raw / Debug Mode ---
locr --raw
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Core** | Python 3.8+ |
| **Logic** | Standard Library (`os`, `subprocess`, `argparse`, `itertools`) |
| **Testing** | `unittest` |

---

## 📁 Project Structure

```text
locr/
├── tests/                # Unit test suite
│   └── test_locr.py      # Core logic tests
├── archive/              # Historical versions
├── locr.py               # Main engine and CLI logic
├── locr_config.py        # Language definitions and colors
├── setup.py              # Installation script
├── DEVELOPMENT.md        # Developer documentation
├── CHANGELOG.md          # Version history
├── LICENSE.md            # License terms
└── README.md
```

---

## 📊 System Resource usage and impact

- **CPU:** Low; optimized for fast file system traversal.
- **RAM:** Negligible; uses stream-based processing (line-by-line).
- **Disk:** Read-only; minimal impact.

---

## ⚡ Performance: Cold vs. Warm Start

`locr` leverages your Operating System's file system cache to deliver near-instant results on repeat scans.

**The Benchmark:** Scanning the **Django** repository (~3,500 files, ~400,000 lines of code).
```bash
# Clone the Django repo (depth-1)
git clone --depth 1 https://github.com/django/django.git

# run locr
locr django
```

### 🥶 1. Cold Start (First Run)
*State: Fresh clone, OS file cache empty. The script must wait for the physical hard drive to read every file.*
- **Time:** ~40.7 seconds

### 🔥 2. Warm Start (Second Run)
*State: Files are now cached in System RAM. The bottleneck shifts from Disk I/O to pure CPU processing.*
- **Time:** ~1.1 seconds

> [!TIP]
> The huge jump demonstrates that `locr` is lightweight enough to keep up with your RAM. The initial delay is hardware-bound.

### ❄️ When will caching NOT work?
Since `locr` relies on your Operating System's RAM cache (Page Cache), you will experience a slow **Cold Start** again if:

1.  **You Reboot your Computer:** RAM is volatile. When you restart, the cache is wiped.
2.  **You Run Heavy Applications:** If you open a AAA game or heavy video editor, Windows/Linux will flush the file cache to free up RAM for that application.
3.  **You Re-clone the Repo:** If you delete the folder and `git clone` it again, the OS treats them as brand new files on the disk.
4.  **You Use a Network Drive:** Scanning files on a NAS or mounted drive (`Z:\`) is limited by network latency, not just disk speed. 

---

## 🧪 Testing

```bash
# Run all tests
python tests/test_locr.py
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Architecture, setup, and contribution guide |
| [CHANGELOG.md](CHANGELOG.md) | Version history and release notes |
| [LICENSE.md](LICENSE.md) | License terms and attribution |

---

## ❓ FAQ

**1. Will `locr` eat my RAM?**  
No. It processes files line-by-line. Memory usage remains low regardless of project size.

**2. Is it safe to run on my main User directory?**  
Yes. `locr` is strictly Read-Only. You can stop long scans anytime with `Ctrl+C`.

**3. Will it crash on binary files?**  
No. `locr` only opens files with known source code extensions. It automatically ignores images, EXEs, and zips.

**4. What if I don't have a `.gitignore`?**  
No problem. `locr` has a built-in safety list to skip `node_modules`, `.git`, `venv`, etc., by default.

**5. Does it send my code anywhere?**  
No. `locr` runs 100% locally. You can audit the source code in `locr.py`—it uses standard Python libraries only.

**6. Is the count 100% compiler-accurate?**  
It is a close estimate. Heuristic scanning may occasionally miscount symbols inside strings, but the error is negligible for 99% of use cases.

**7. Why is the second run faster?**  
Your OS caches file locations in RAM after the first run. `locr` takes advantage of this "Warm Cache" to fly through directories instantly on subsequent runs.

---

## 🛠️ Troubleshooting

- **"Command not found":** Ensure you ran `pip install -e .` inside the folder.
- **Spinner not showing:** Automatically disabled if output is not a TTY (e.g., piping to a file).
- **Colors not showing:** Requires the `-c` or `--color` flag and a supported terminal.

---

## 🚀 Roadmap

- **Parallel Processing:** Multi-core scanning for even greater speed.
- **Better Tokenization:** Move to robust tokenizing for string/comment edge cases.
- **Nested .gitignore:** Full recursive support for sub-directory ignore rules.

---

## 📄 License

**Tremors Source License (TSL)** - Source-available license allowing viewing, forking, and derivative works with **mandatory attribution**. Commercial use requires permission.

See [LICENSE.md](LICENSE.md) for full terms.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/qtremors">Tremors</a>
</p>
