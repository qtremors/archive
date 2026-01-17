"""
gitmig_config.py
Configuration file for gitmig.
Contains excluded directories, patterns, and preserved files.
"""

# =============================================================================
# 1. Directories to Always Exclude
# =============================================================================
EXCLUDE_DIRS = [
    # Version Control
    ".git",
    ".svn",
    ".hg",
    # IDEs
    ".idea",
    ".vscode",
    # Python
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    "venv",
    ".venv",
    "env",
    ".env",  # Note: .env FOLDER, not .env FILE
    ".tox",
    ".nox",
    "*.egg-info",
    # Node / Web
    "node_modules",
    "bower_components",
    ".next",
    ".nuxt",
    ".output",
    ".cache",
    # Build Artifacts
    "dist",
    "build",
    "target",
    "bin",
    "obj",
    "out",
    ".parcel-cache",
    # Misc
    ".DS_Store",
    "Thumbs.db",
    ".turbo",
]

# =============================================================================
# 2. File Patterns to Exclude
# =============================================================================
EXCLUDE_FILE_PATTERNS = [
    "*.log",
    "*.tmp",
    "*.temp",
    "*.bak",
    "*.swp",
    "*.pyc",
    "*.pyo",
    "*.class",
    "*.dll",
    "*.exe",
    "*.o",
    "*.so",
    "*.dylib",
]

# =============================================================================
# 3. Files/Patterns to ALWAYS Preserve (override excludes)
# =============================================================================
PRESERVE_PATTERNS = [
    ".env",
    ".env.*",  # Covers .env.local, .env.production, etc.
]

# =============================================================================
# 4. ANSI Colors
# =============================================================================
class Colors:
    RESET = "\033[0m"
    
    GREY = "\033[90m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"

    @staticmethod
    def style(text: str, color: str, enabled: bool = True) -> str:
        if not enabled:
            return text
        return f"{color}{text}{Colors.RESET}"
