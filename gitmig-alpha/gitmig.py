#!/usr/bin/env python3
"""
gitmig.py

A lightweight tool to copy git repositories without dependencies.
Copies all repos from the source directory to destination, excluding
heavy folders like node_modules, .git, venv, etc. while preserving .env files.

Usage:
  gitmig [destination]           Copy from current dir to destination
  gitmig [source] [destination]  Copy from source to destination

Options:
  --dry-run     : Preview mode. Shows what would be copied without copying.
  --zip         : Compress each repo as a .zip archive.
  --stats       : Show detailed file type breakdown.
  --exclude     : Additional patterns to exclude (comma-separated).
  --include-git : Include .git folder in the copy.
  --verbose, -v : Show every file being copied and warnings.
  --quiet, -q   : Suppress all output except errors.
  --max-size    : Skip files larger than this (e.g., '10M', '500K', '1G').
  --only        : Only migrate specific repos (comma-separated).
  --force       : Overwrite existing files without warning.
  --stats-all   : Show all file extensions in stats (not just top 15).
  --skip-existing : Skip files that already exist at destination.

Commands:
    # Copy all repos from current directory to destination
    gitmig ./backup
    gitmig D:\\Backup\\CleanRepos

    # Copy from specific source to destination
    gitmig C:\\Projects\\GitHub D:\\Backup

    # Preview what would be copied (no actual copy)
    gitmig ./backup --dry-run

    # Compress each repo as .zip
    gitmig ./backup --zip

    # Show detailed stats
    gitmig ./backup --stats

    # Custom exclusions
    gitmig ./backup --exclude "*.txt,temp/"

    # Include .git folder
    gitmig ./backup --include-git
"""

import argparse
import fnmatch
import os
import shutil
import sys
import time
import zipfile
from collections import defaultdict
from typing import List, Tuple, Dict, Optional

# --- IMPORT CONFIG ---
try:
    from gitmig_config import EXCLUDE_DIRS, EXCLUDE_FILE_PATTERNS, PRESERVE_PATTERNS, Colors
except ImportError:
    print("Error: gitmig_config.py not found. Please ensure it is in the same directory.")
    sys.exit(1)


# =============================================================================
# Core Logic
# =============================================================================


class GitMigEngine:
    def __init__(
        self,
        source_dir: str,
        dest_dir: str,
        dry_run: bool = False,
        use_zip: bool = False,
        show_stats: bool = False,
        extra_excludes: Optional[List[str]] = None,
        include_git: bool = False,
        verbose: bool = False,
        quiet: bool = False,
        max_size: Optional[int] = None,
        only_repos: Optional[List[str]] = None,
        force: bool = False,
        stats_all: bool = False,
        skip_existing: bool = False,
    ):
        self.source_dir = os.path.abspath(source_dir)
        self.dest_dir = os.path.abspath(dest_dir)
        self.dry_run = dry_run
        self.use_zip = use_zip
        self.show_stats = show_stats
        self.include_git = include_git
        self.verbose = verbose
        self.quiet = quiet
        self.max_size = max_size  # Max file size in bytes
        self.only_repos = only_repos  # Filter to specific repos
        self.force = force  # Overwrite without warning
        self.stats_all = stats_all  # Show all extensions, not just top 15
        self.skip_existing = skip_existing  # Skip files that already exist
        
        # Merge extra excludes
        self.exclude_dirs = list(EXCLUDE_DIRS)
        self.exclude_files = list(EXCLUDE_FILE_PATTERNS)
        
        if extra_excludes:
            for pattern in extra_excludes:
                pattern = pattern.strip()
                if pattern.endswith("/"):
                    self.exclude_dirs.append(pattern.rstrip("/"))
                else:
                    self.exclude_files.append(pattern)
        
        # Remove .git from exclusions if --include-git
        if self.include_git and ".git" in self.exclude_dirs:
            self.exclude_dirs.remove(".git")
        
        # Stats
        self.repos_found: List[str] = []
        self.total_files_copied = 0
        self.total_files_skipped = 0
        self.total_bytes_copied = 0
        self.preserved_files: List[str] = []  # Track .env files etc.
        self.symlinks_skipped = 0
        self.large_files_skipped = 0  # Files skipped due to --max-size
        self.files_overwritten = 0  # Files that already existed
        self.files_skipped_existing = 0  # Files skipped due to --skip-existing
        self.start_time: float = 0
        
        # Detailed stats per extension
        self.extension_stats: Dict[str, Dict[str, int]] = defaultdict(lambda: {"count": 0, "bytes": 0})

    def _print(self, message: str = "", style_color: str = None) -> None:
        """Print message unless in quiet mode."""
        if not self.quiet:
            if style_color:
                print(Colors.style(message, style_color))
            else:
                print(message)

    def _print_error(self, message: str) -> None:
        """Always print errors, even in quiet mode."""
        print(Colors.style(message, Colors.RED))

    def _make_clickable(self, path: str) -> str:
        """Make a file path clickable in supported terminals using OSC 8."""
        # OSC 8 hyperlink format: \e]8;;URL\e\\LABEL\e]8;;\e\\
        # Works in: iTerm2, Windows Terminal, VSCode terminal, Konsole, etc.
        file_url = f"file://{path.replace(os.sep, '/')}"
        return f"\033]8;;{file_url}\033\\{path}\033]8;;\033\\"

    def _find_repos(self) -> List[str]:
        """Find all git repositories (folders containing .git/) in source directory."""
        repos = []
        try:
            for entry in sorted(os.listdir(self.source_dir)):
                full_path = os.path.join(self.source_dir, entry)
                git_path = os.path.join(full_path, ".git")
                if os.path.isdir(full_path) and os.path.isdir(git_path):
                    # Filter by --only if specified
                    if self.only_repos and entry not in self.only_repos:
                        continue
                    repos.append(entry)
        except PermissionError:
            pass
        return repos

    def _should_exclude_dir(self, dirname: str) -> bool:
        """Check if a directory should be excluded."""
        for pattern in self.exclude_dirs:
            if fnmatch.fnmatch(dirname, pattern) or dirname == pattern:
                return True
        return False

    def _should_exclude_file(self, filename: str) -> bool:
        """Check if a file should be excluded."""
        for pattern in self.exclude_files:
            if fnmatch.fnmatch(filename, pattern):
                return True
        return False

    def _should_preserve(self, filename: str) -> bool:
        """Check if a file should be preserved (override exclusion)."""
        for pattern in PRESERVE_PATTERNS:
            if fnmatch.fnmatch(filename, pattern):
                return True
        return False

    def _scan_repo(self, repo_name: str) -> Tuple[List[Tuple[str, int]], Dict[str, int]]:
        """
        Scan a repository and return files to copy and skip stats.
        Returns: (list of (relative path, size) tuples, dict of skipped folder stats)
        """
        repo_path = os.path.join(self.source_dir, repo_name)
        files_to_copy: List[Tuple[str, int]] = []  # (path, size)
        skipped_stats: Dict[str, int] = {}  # folder_name -> file count

        try:
            walker = os.walk(repo_path, topdown=True, onerror=self._on_walk_error)
        except PermissionError as e:
            print(f"  {Colors.style('Warning:', Colors.YELLOW)} Could not access {repo_path}: {e}")
            return files_to_copy, skipped_stats

        for dirpath, dirnames, filenames in walker:
            rel_dir = os.path.relpath(dirpath, repo_path)
            if rel_dir == ".":
                rel_dir = ""

            # Filter out excluded directories
            dirs_to_remove = []
            for d in dirnames:
                if self._should_exclude_dir(d):
                    # Count files in excluded directory
                    excluded_path = os.path.join(dirpath, d)
                    try:
                        count = sum(len(files) for _, _, files in os.walk(excluded_path))
                        skipped_stats[d] = skipped_stats.get(d, 0) + count
                    except PermissionError:
                        skipped_stats[d] = skipped_stats.get(d, 0)
                    dirs_to_remove.append(d)
            
            for d in dirs_to_remove:
                dirnames.remove(d)

            # Process files
            for f in filenames:
                rel_path = os.path.join(rel_dir, f) if rel_dir else f
                full_path = os.path.join(dirpath, f)
                
                # Skip symlinks (they can cause issues)
                if os.path.islink(full_path):
                    self.symlinks_skipped += 1
                    if self.verbose:
                        self._print(f"      Skipping symlink: {rel_path}")
                    continue
                
                try:
                    file_size = os.path.getsize(full_path)
                except OSError:
                    file_size = 0
                
                # Skip files exceeding max_size
                if self.max_size and file_size > self.max_size:
                    self.large_files_skipped += 1
                    if self.verbose:
                        size_mb = file_size / (1024 * 1024)
                        self._print(f"      Skipping large file ({size_mb:.1f} MB): {rel_path}")
                    continue
                
                # Check preservation first (e.g., .env files)
                if self._should_preserve(f):
                    files_to_copy.append((rel_path, file_size))
                    self.preserved_files.append(f"{repo_name}/{rel_path}")
                elif not self._should_exclude_file(f):
                    files_to_copy.append((rel_path, file_size))
                
                # Track extension stats during scan (for dry run mode)
                ext = os.path.splitext(f)[1].lower() or "(no ext)"
                self.extension_stats[ext]["count"] += 1
                self.extension_stats[ext]["bytes"] += file_size

        return files_to_copy, skipped_stats

    def _on_walk_error(self, error: OSError) -> None:
        """Handle errors during os.walk (e.g., permission denied)."""
        if self.verbose:
            self._print(f"  {Colors.style('Warning:', Colors.YELLOW)} {error}")

    def _copy_repo(self, repo_name: str, files_to_copy: List[Tuple[str, int]]) -> int:
        """Copy files from repo to destination. Returns bytes copied."""
        src_repo = os.path.join(self.source_dir, repo_name)
        dst_repo = os.path.join(self.dest_dir, repo_name)
        bytes_copied = 0

        for rel_path, file_size in files_to_copy:
            src_file = os.path.join(src_repo, rel_path)
            dst_file = os.path.join(dst_repo, rel_path)

            try:
                # Create destination directory
                dst_dir = os.path.dirname(dst_file)
                os.makedirs(dst_dir, exist_ok=True)
                
                # Check for existing file
                if os.path.exists(dst_file):
                    if self.skip_existing:
                        self.files_skipped_existing += 1
                        if self.verbose:
                            self._print(f"      {Colors.style('Skipped (exists):', Colors.GREY)} {rel_path}")
                        continue
                    self.files_overwritten += 1
                    if not self.force and not self.quiet:
                        self._print(f"      {Colors.style('Overwriting:', Colors.YELLOW)} {rel_path}")

                # Copy file
                shutil.copy2(src_file, dst_file)
                bytes_copied += file_size
                
                if self.verbose:
                    self._print(f"      {rel_path}")
                
            except (PermissionError, OSError) as e:
                self._print_error(f"  Warning: Could not copy {rel_path}: {e}")

        return bytes_copied

    def _zip_repo(self, repo_name: str, files_to_copy: List[Tuple[str, int]]) -> int:
        """Create a zip archive of the repo. Returns bytes of archive."""
        src_repo = os.path.join(self.source_dir, repo_name)
        zip_path = os.path.join(self.dest_dir, f"{repo_name}.zip")
        
        try:
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for rel_path, file_size in files_to_copy:
                    # Security: Validate rel_path to prevent path traversal
                    if ".." in rel_path or rel_path.startswith(("/", "\\")):
                        self._print_error(f"  Skipping unsafe path: {rel_path}")
                        continue
                    
                    src_file = os.path.join(src_repo, rel_path)
                    # Store with repo name as root folder in zip
                    arc_name = os.path.join(repo_name, rel_path).replace("\\", "/")
                    zf.write(src_file, arc_name)
                    
                    if self.verbose:
                        self._print(f"      {rel_path}")
            
            return os.path.getsize(zip_path)
        except Exception as e:
            self._print_error(f"  Warning: Could not create zip for {repo_name}: {e}")
            return 0

    def run(self) -> None:
        """Execute the migration."""
        self.start_time = time.time()
        self._print()
        
        # Find repos
        self.repos_found = self._find_repos()
        
        if not self.repos_found:
            self._print(f"No git repositories found in {self.source_dir}", Colors.YELLOW)
            return

        self._print(f"Detected {Colors.style(str(len(self.repos_found)), Colors.CYAN)} repositories in {self.source_dir}")
        self._print()

        # Process each repo
        for idx, repo_name in enumerate(self.repos_found, 1):
            self._print(f"[{idx}/{len(self.repos_found)}] {Colors.style(repo_name + '/', Colors.BLUE)}")
            
            files_to_copy, skipped_stats = self._scan_repo(repo_name)
            
            # Calculate totals for this repo
            total_skipped = sum(skipped_stats.values())
            total_bytes = sum(size for _, size in files_to_copy)
            
            # Show what's being copied
            mode_label = "Zipping" if self.use_zip else "Copying"
            self._print(f"      → {mode_label}: {Colors.style(str(len(files_to_copy)), Colors.GREEN)} files")
            
            # Show what's being skipped
            if skipped_stats:
                skip_parts = [f"{k}/ ({v:,})" for k, v in sorted(skipped_stats.items(), key=lambda x: -x[1])[:5]]
                self._print(f"      → Skipping: {Colors.style(', '.join(skip_parts), Colors.GREY)}")
            
            # Actually copy/zip if not dry run
            if not self.dry_run:
                if self.use_zip:
                    bytes_out = self._zip_repo(repo_name, files_to_copy)
                else:
                    bytes_out = self._copy_repo(repo_name, files_to_copy)
                self.total_bytes_copied += bytes_out
            else:
                self.total_bytes_copied += total_bytes
            
            self.total_files_copied += len(files_to_copy)
            self.total_files_skipped += total_skipped
            self._print()

        # Summary
        self._print_summary()

    def _print_summary(self) -> None:
        """Print final summary."""
        elapsed = time.time() - self.start_time
        sep = "─" * 50
        self._print(sep)
        
        if self.dry_run:
            self._print(Colors.style("DRY RUN COMPLETE", Colors.YELLOW) + " (no files copied)")
            self._print(f"Would copy: {Colors.style(f'{self.total_files_copied:,}', Colors.GREEN)} files across {len(self.repos_found)} repos")
            self._print(f"Would skip: ~{Colors.style(f'{self.total_files_skipped:,}', Colors.GREY)} dependency/cache files")
        else:
            mode = "ZIPPED" if self.use_zip else "COPIED"
            self._print(Colors.style(f"MIGRATION COMPLETE ({mode})", Colors.GREEN))
            self._print(f"Copied: {Colors.style(f'{self.total_files_copied:,}', Colors.GREEN)} files across {len(self.repos_found)} repos")
            self._print(f"Skipped: ~{Colors.style(f'{self.total_files_skipped:,}', Colors.GREY)} dependency/cache files")
            
            # Show size
            if self.total_bytes_copied > 0:
                size_mb = self.total_bytes_copied / (1024 * 1024)
                self._print(f"Total size: {Colors.style(f'{size_mb:.2f} MB', Colors.CYAN)}")
            
            self._print(f"\nDestination: {Colors.style(self._make_clickable(self.dest_dir), Colors.BLUE)}")
        
        # Show preserved files (.env etc.)
        if self.preserved_files:
            self._print(f"\nPreserved configs: {Colors.style(str(len(self.preserved_files)), Colors.GREEN)} files (.env, etc.)")
            if self.verbose:
                for pf in self.preserved_files[:10]:
                    self._print(f"  • {pf}")
                if len(self.preserved_files) > 10:
                    self._print(f"  ... and {len(self.preserved_files) - 10} more")
        
        # Show symlinks skipped
        if self.symlinks_skipped > 0:
            self._print(f"Symlinks skipped: {Colors.style(str(self.symlinks_skipped), Colors.GREY)}")
        
        # Show large files skipped
        if self.large_files_skipped > 0:
            self._print(f"Large files skipped: {Colors.style(str(self.large_files_skipped), Colors.GREY)}")
        
        # Show files overwritten
        if self.files_overwritten > 0:
            self._print(f"Files overwritten: {Colors.style(str(self.files_overwritten), Colors.YELLOW)}")
        
        # Show files skipped (--skip-existing)
        if self.files_skipped_existing > 0:
            self._print(f"Files skipped (existing): {Colors.style(str(self.files_skipped_existing), Colors.GREY)}")
        # Show execution time
        self._print(f"\nCompleted in {Colors.style(f'{elapsed:.2f}s', Colors.CYAN)}")
        
        # Show detailed stats if requested
        if self.show_stats and self.extension_stats:
            self._print_stats()
        
        self._print()

    def _print_stats(self) -> None:
        """Print detailed file type breakdown."""
        self._print()
        self._print(Colors.style("─" * 50, Colors.WHITE))
        self._print(Colors.style("FILE TYPE BREAKDOWN", Colors.CYAN))
        self._print(Colors.style("─" * 50, Colors.WHITE))
        
        # Sort by count descending
        sorted_stats = sorted(
            self.extension_stats.items(),
            key=lambda x: x[1]["count"],
            reverse=True
        )
        
        # Limit to top 15 unless --stats-all
        if not self.stats_all:
            sorted_stats = sorted_stats[:15]
        
        # Header
        self._print(f"{'Extension':<15} {'Files':>10} {'Size':>12}")
        self._print("-" * 40)
        
        for ext, stats in sorted_stats:
            size_kb = stats["bytes"] / 1024
            if size_kb > 1024:
                size_str = f"{size_kb / 1024:.1f} MB"
            else:
                size_str = f"{size_kb:.1f} KB"
            self._print(f"{ext:<15} {stats['count']:>10,} {size_str:>12}")


# =============================================================================
# Main
# =============================================================================


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "paths",
        nargs="+",
        help="Destination, or [source] [destination]"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview mode - show what would be copied without copying"
    )
    parser.add_argument(
        "--zip",
        action="store_true",
        help="Compress each repo as a .zip archive"
    )
    parser.add_argument(
        "--stats",
        action="store_true",
        help="Show detailed file type breakdown"
    )
    parser.add_argument(
        "--exclude",
        type=str,
        default="",
        help="Additional patterns to exclude (comma-separated, e.g., '*.txt,temp/')"
    )
    parser.add_argument(
        "--include-git",
        action="store_true",
        help="Include .git folder in the copy"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Show every file being copied and permission warnings"
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Suppress all output except errors"
    )
    parser.add_argument(
        "--max-size",
        type=str,
        default=None,
        help="Skip files larger than this size (e.g., '10M', '500K', '1G')"
    )
    parser.add_argument(
        "--only",
        type=str,
        default="",
        help="Only migrate specific repos (comma-separated, e.g., 'repo1,repo2')"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files without warning"
    )
    parser.add_argument(
        "--stats-all",
        action="store_true",
        help="Show all file extensions in stats (not just top 15)"
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip files that already exist at destination (resume mode)"
    )

    args = parser.parse_args()
    
    # Parse positional arguments
    if len(args.paths) == 1:
        source_dir = os.getcwd()
        dest_dir = args.paths[0]
    elif len(args.paths) == 2:
        source_dir = args.paths[0]
        dest_dir = args.paths[1]
    else:
        print("Error: Expected [destination] or [source] [destination]")
        sys.exit(1)
    
    # Parse extra excludes
    extra_excludes = [e.strip() for e in args.exclude.split(",") if e.strip()] if args.exclude else []
    
    # Parse --only repos
    only_repos = [r.strip() for r in args.only.split(",") if r.strip()] if args.only else None
    
    # Parse --max-size (e.g., "10M", "500K", "1G")
    max_size = None
    if args.max_size:
        size_str = args.max_size.upper().strip()
        try:
            if size_str.endswith("G"):
                max_size = int(float(size_str[:-1]) * 1024 * 1024 * 1024)
            elif size_str.endswith("M"):
                max_size = int(float(size_str[:-1]) * 1024 * 1024)
            elif size_str.endswith("K"):
                max_size = int(float(size_str[:-1]) * 1024)
            else:
                max_size = int(size_str)
        except ValueError:
            print(f"Error: Invalid size format '{args.max_size}'. Use format like '10M', '500K', or '1G'.")
            sys.exit(1)

    # Validate source
    if not os.path.isdir(source_dir):
        print(f"Error: Source '{source_dir}' is not a valid directory.")
        sys.exit(1)
    source_dir = os.path.abspath(source_dir)

    # Validate destination
    if os.path.exists(dest_dir) and not os.path.isdir(dest_dir):
        print(f"Error: Destination '{dest_dir}' exists but is not a directory.")
        sys.exit(1)

    # Prevent copying into source
    abs_dest = os.path.abspath(dest_dir)
    if abs_dest.startswith(source_dir + os.sep) or abs_dest == source_dir:
        print("Error: Destination cannot be inside the source directory.")
        sys.exit(1)

    # Create destination if needed (and not dry run)
    if not args.dry_run and not os.path.exists(dest_dir):
        try:
            os.makedirs(dest_dir)
        except OSError as e:
            print(f"Error: Could not create destination directory: {e}")
            sys.exit(1)

    # Run migration
    engine = GitMigEngine(
        source_dir,
        dest_dir,
        dry_run=args.dry_run,
        use_zip=args.zip,
        show_stats=args.stats,
        extra_excludes=extra_excludes,
        include_git=args.include_git,
        verbose=args.verbose,
        quiet=args.quiet,
        max_size=max_size,
        only_repos=only_repos,
        force=args.force,
        stats_all=args.stats_all,
        skip_existing=args.skip_existing,
    )
    
    try:
        engine.run()
    except KeyboardInterrupt:
        print(f"\n{Colors.style('Migration interrupted.', Colors.YELLOW)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
