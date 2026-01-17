#!/usr/bin/env python3
"""
test_gitmig.py

Unit tests for gitmig core functions.
Run with: python -m pytest test_gitmig.py -v
Or: python test_gitmig.py
"""

import os
import shutil
import tempfile
import unittest
import zipfile
from unittest.mock import patch

from gitmig import GitMigEngine
from gitmig_config import EXCLUDE_DIRS, EXCLUDE_FILE_PATTERNS, PRESERVE_PATTERNS


class TestGitMigEngine(unittest.TestCase):
    """Test the GitMigEngine class."""

    def setUp(self):
        """Create temporary directories for testing."""
        self.test_dir = tempfile.mkdtemp()
        self.source_dir = os.path.join(self.test_dir, "source")
        self.dest_dir = os.path.join(self.test_dir, "dest")
        os.makedirs(self.source_dir)
        os.makedirs(self.dest_dir)

    def tearDown(self):
        """Clean up temporary directories."""
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def _create_repo(self, name: str, files: dict = None):
        """Helper to create a mock repository."""
        repo_path = os.path.join(self.source_dir, name)
        git_path = os.path.join(repo_path, ".git")
        os.makedirs(git_path)
        
        # Create a dummy file in .git to make it detectable
        with open(os.path.join(git_path, "HEAD"), "w") as f:
            f.write("ref: refs/heads/main\n")
        
        if files:
            for filepath, content in files.items():
                full_path = os.path.join(repo_path, filepath)
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                with open(full_path, "w") as f:
                    f.write(content)
        
        return repo_path

    # =========================================================================
    # Repository Detection Tests
    # =========================================================================

    def test_find_repos_detects_git_repos(self):
        """Test that _find_repos correctly identifies git repositories."""
        self._create_repo("repo1")
        self._create_repo("repo2")
        
        # Create a non-repo folder (no .git)
        os.makedirs(os.path.join(self.source_dir, "not_a_repo"))
        
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        repos = engine._find_repos()
        
        self.assertEqual(sorted(repos), ["repo1", "repo2"])
        self.assertNotIn("not_a_repo", repos)

    def test_find_repos_empty_directory(self):
        """Test _find_repos with no repos."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        repos = engine._find_repos()
        self.assertEqual(repos, [])

    # =========================================================================
    # Exclusion Tests
    # =========================================================================

    def test_should_exclude_dir_node_modules(self):
        """Test that node_modules is excluded."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        self.assertTrue(engine._should_exclude_dir("node_modules"))

    def test_should_exclude_dir_git(self):
        """Test that .git is excluded by default."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        self.assertTrue(engine._should_exclude_dir(".git"))

    def test_should_exclude_dir_with_include_git(self):
        """Test that .git is NOT excluded when --include-git is set."""
        engine = GitMigEngine(self.source_dir, self.dest_dir, include_git=True)
        self.assertFalse(engine._should_exclude_dir(".git"))

    def test_should_exclude_dir_venv(self):
        """Test that venv directories are excluded."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        self.assertTrue(engine._should_exclude_dir("venv"))
        self.assertTrue(engine._should_exclude_dir(".venv"))

    def test_should_exclude_file_log(self):
        """Test that .log files are excluded."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        self.assertTrue(engine._should_exclude_file("debug.log"))
        self.assertTrue(engine._should_exclude_file("app.log"))

    def test_should_exclude_file_pyc(self):
        """Test that .pyc files are excluded."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        self.assertTrue(engine._should_exclude_file("module.pyc"))

    def test_should_not_exclude_source_files(self):
        """Test that source files are NOT excluded."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        self.assertFalse(engine._should_exclude_file("main.py"))
        self.assertFalse(engine._should_exclude_file("index.js"))
        self.assertFalse(engine._should_exclude_file("README.md"))

    def test_extra_excludes(self):
        """Test custom exclusion patterns."""
        engine = GitMigEngine(
            self.source_dir, self.dest_dir, 
            extra_excludes=["*.txt", "temp/"]
        )
        self.assertTrue(engine._should_exclude_file("notes.txt"))
        self.assertTrue(engine._should_exclude_dir("temp"))

    # =========================================================================
    # Preservation Tests
    # =========================================================================

    def test_should_preserve_env_file(self):
        """Test that .env files are preserved."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        self.assertTrue(engine._should_preserve(".env"))
        self.assertTrue(engine._should_preserve(".env.local"))
        self.assertTrue(engine._should_preserve(".env.production"))

    def test_should_not_preserve_regular_files(self):
        """Test that regular files are not marked for preservation."""
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        self.assertFalse(engine._should_preserve("main.py"))
        self.assertFalse(engine._should_preserve("package.json"))

    # =========================================================================
    # Scan Tests
    # =========================================================================

    def test_scan_repo_finds_files(self):
        """Test that _scan_repo finds the correct files."""
        self._create_repo("test_repo", {
            "main.py": "print('hello')",
            "src/utils.py": "# utils",
            "README.md": "# Test"
        })
        
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        files, skipped = engine._scan_repo("test_repo")
        
        file_paths = [f[0] for f in files]
        self.assertIn("main.py", file_paths)
        self.assertIn("README.md", file_paths)
        # src/utils.py should be there with correct path
        self.assertTrue(any("utils.py" in p for p in file_paths))

    def test_scan_repo_excludes_node_modules(self):
        """Test that _scan_repo excludes node_modules."""
        repo_path = self._create_repo("test_repo", {
            "index.js": "console.log('hi')",
        })
        
        # Create node_modules with files
        nm_path = os.path.join(repo_path, "node_modules", "pkg")
        os.makedirs(nm_path)
        with open(os.path.join(nm_path, "index.js"), "w") as f:
            f.write("// package code")
        
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        files, skipped = engine._scan_repo("test_repo")
        
        file_paths = [f[0] for f in files]
        # Should not include node_modules files
        self.assertFalse(any("node_modules" in p for p in file_paths))
        # But should track skipped count
        self.assertIn("node_modules", skipped)

    def test_scan_repo_preserves_env(self):
        """Test that .env files are included even though they match exclusion patterns."""
        self._create_repo("test_repo", {
            "app.py": "import os",
            ".env": "SECRET=123",
            ".env.local": "LOCAL_VAR=abc"
        })
        
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        files, _ = engine._scan_repo("test_repo")
        
        file_paths = [f[0] for f in files]
        self.assertIn(".env", file_paths)
        self.assertIn(".env.local", file_paths)

    def test_scan_populates_extension_stats(self):
        """Test that scanning populates extension_stats for dry run."""
        self._create_repo("test_repo", {
            "main.py": "print('a')",
            "utils.py": "# utils",
            "index.js": "console.log('b')",
            "README.md": "# readme"
        })
        
        engine = GitMigEngine(self.source_dir, self.dest_dir, dry_run=True)
        engine._scan_repo("test_repo")
        
        self.assertIn(".py", engine.extension_stats)
        self.assertIn(".js", engine.extension_stats)
        self.assertEqual(engine.extension_stats[".py"]["count"], 2)
        self.assertEqual(engine.extension_stats[".js"]["count"], 1)

    # =========================================================================
    # Copy Tests
    # =========================================================================

    def test_copy_repo_creates_files(self):
        """Test that _copy_repo creates files at destination."""
        self._create_repo("test_repo", {
            "main.py": "print('hello world')",
            "src/utils.py": "def helper(): pass"
        })
        
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        files, _ = engine._scan_repo("test_repo")
        engine._copy_repo("test_repo", files)
        
        # Check files exist at destination
        dest_main = os.path.join(self.dest_dir, "test_repo", "main.py")
        dest_utils = os.path.join(self.dest_dir, "test_repo", "src", "utils.py")
        
        self.assertTrue(os.path.exists(dest_main))
        self.assertTrue(os.path.exists(dest_utils))
        
        # Check content
        with open(dest_main) as f:
            self.assertEqual(f.read(), "print('hello world')")

    def test_copy_preserves_directory_structure(self):
        """Test that copying preserves nested directory structure."""
        self._create_repo("test_repo", {
            "src/components/Button.js": "export Button",
            "src/components/Input.js": "export Input",
            "src/utils/helpers.js": "export helpers"
        })
        
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        files, _ = engine._scan_repo("test_repo")
        engine._copy_repo("test_repo", files)
        
        # Check full paths
        base = os.path.join(self.dest_dir, "test_repo")
        self.assertTrue(os.path.exists(os.path.join(base, "src", "components", "Button.js")))
        self.assertTrue(os.path.exists(os.path.join(base, "src", "components", "Input.js")))
        self.assertTrue(os.path.exists(os.path.join(base, "src", "utils", "helpers.js")))

    # =========================================================================
    # Zip Tests
    # =========================================================================

    def test_zip_repo_creates_archive(self):
        """Test that _zip_repo creates a valid zip file."""
        self._create_repo("test_repo", {
            "main.py": "print('hello')",
            "README.md": "# Test"
        })
        
        engine = GitMigEngine(self.source_dir, self.dest_dir, use_zip=True)
        files, _ = engine._scan_repo("test_repo")
        size = engine._zip_repo("test_repo", files)
        
        zip_path = os.path.join(self.dest_dir, "test_repo.zip")
        self.assertTrue(os.path.exists(zip_path))
        self.assertGreater(size, 0)
        
        # Verify zip contents
        with zipfile.ZipFile(zip_path, "r") as zf:
            names = zf.namelist()
            self.assertTrue(any("main.py" in n for n in names))
            self.assertTrue(any("README.md" in n for n in names))

    def test_zip_excludes_node_modules(self):
        """Test that zip archives don't include node_modules."""
        repo_path = self._create_repo("test_repo", {
            "index.js": "console.log('app')"
        })
        
        # Create node_modules
        nm = os.path.join(repo_path, "node_modules", "lodash")
        os.makedirs(nm)
        with open(os.path.join(nm, "index.js"), "w") as f:
            f.write("module.exports = {}")
        
        engine = GitMigEngine(self.source_dir, self.dest_dir, use_zip=True)
        files, _ = engine._scan_repo("test_repo")
        engine._zip_repo("test_repo", files)
        
        zip_path = os.path.join(self.dest_dir, "test_repo.zip")
        with zipfile.ZipFile(zip_path, "r") as zf:
            names = zf.namelist()
            self.assertFalse(any("node_modules" in n for n in names))

    # =========================================================================
    # ZIP Path Traversal Security Test
    # =========================================================================

    def test_zip_no_path_traversal(self):
        """Test that zip archives don't allow path traversal attacks."""
        self._create_repo("test_repo", {
            "safe_file.txt": "safe content"
        })
        
        engine = GitMigEngine(self.source_dir, self.dest_dir, use_zip=True)
        files, _ = engine._scan_repo("test_repo")
        engine._zip_repo("test_repo", files)
        
        zip_path = os.path.join(self.dest_dir, "test_repo.zip")
        with zipfile.ZipFile(zip_path, "r") as zf:
            for name in zf.namelist():
                # No path should contain .. or start with /
                self.assertNotIn("..", name)
                self.assertFalse(name.startswith("/"))
                self.assertFalse(name.startswith("\\"))

    # =========================================================================
    # Symlink Tests
    # =========================================================================

    def test_symlinks_skipped(self):
        """Test that symlinks are skipped during scan."""
        repo_path = self._create_repo("test_repo", {
            "real_file.txt": "real content"
        })
        
        # Create a symlink (if supported by OS)
        link_path = os.path.join(repo_path, "link_file.txt")
        real_file = os.path.join(repo_path, "real_file.txt")
        
        try:
            os.symlink(real_file, link_path)
        except (OSError, NotImplementedError):
            # Skip test if symlinks not supported
            self.skipTest("Symlinks not supported on this system")
        
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        files, _ = engine._scan_repo("test_repo")
        
        file_paths = [f[0] for f in files]
        self.assertIn("real_file.txt", file_paths)
        self.assertNotIn("link_file.txt", file_paths)
        self.assertEqual(engine.symlinks_skipped, 1)

    # =========================================================================
    # Full Run Tests
    # =========================================================================

    def test_full_dry_run(self):
        """Test a complete dry run doesn't create any files."""
        self._create_repo("repo1", {"main.py": "# code"})
        self._create_repo("repo2", {"app.js": "// code"})
        
        engine = GitMigEngine(self.source_dir, self.dest_dir, dry_run=True)
        engine.run()
        
        # Nothing should be created in dest
        self.assertEqual(os.listdir(self.dest_dir), [])
        
        # But stats should be tracked
        self.assertEqual(len(engine.repos_found), 2)
        self.assertGreater(engine.total_files_copied, 0)

    def test_full_run_copies_all_repos(self):
        """Test a complete run copies all repos."""
        self._create_repo("repo1", {"main.py": "print(1)"})
        self._create_repo("repo2", {"app.js": "console.log(2)"})
        
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        engine.run()
        
        # Both repos should exist
        self.assertTrue(os.path.isdir(os.path.join(self.dest_dir, "repo1")))
        self.assertTrue(os.path.isdir(os.path.join(self.dest_dir, "repo2")))
        
        # Files should exist
        self.assertTrue(os.path.exists(os.path.join(self.dest_dir, "repo1", "main.py")))
        self.assertTrue(os.path.exists(os.path.join(self.dest_dir, "repo2", "app.js")))

    def test_full_run_with_zip(self):
        """Test a complete run with zip mode."""
        self._create_repo("repo1", {"main.py": "print(1)"})
        
        engine = GitMigEngine(self.source_dir, self.dest_dir, use_zip=True)
        engine.run()
        
        # Zip file should exist
        self.assertTrue(os.path.exists(os.path.join(self.dest_dir, "repo1.zip")))
        # Folder should NOT exist
        self.assertFalse(os.path.isdir(os.path.join(self.dest_dir, "repo1")))

    # =========================================================================
    # New Feature Tests
    # =========================================================================

    def test_max_size_skips_large_files(self):
        """Test that --max-size skips files exceeding the limit."""
        self._create_repo("test_repo", {
            "small.txt": "x" * 100,  # 100 bytes
            "large.txt": "x" * 2000,  # 2000 bytes
        })
        
        # Set max_size to 500 bytes
        engine = GitMigEngine(self.source_dir, self.dest_dir, max_size=500)
        files, _ = engine._scan_repo("test_repo")
        
        file_paths = [f[0] for f in files]
        self.assertIn("small.txt", file_paths)
        self.assertNotIn("large.txt", file_paths)
        self.assertEqual(engine.large_files_skipped, 1)

    def test_only_repos_filters(self):
        """Test that --only filters to specific repos."""
        self._create_repo("repo1", {"a.py": "# 1"})
        self._create_repo("repo2", {"b.py": "# 2"})
        self._create_repo("repo3", {"c.py": "# 3"})
        
        engine = GitMigEngine(self.source_dir, self.dest_dir, only_repos=["repo1", "repo3"])
        repos = engine._find_repos()
        
        self.assertEqual(sorted(repos), ["repo1", "repo3"])
        self.assertNotIn("repo2", repos)

    def test_force_overwrites_silently(self):
        """Test that --force doesn't warn on overwrite."""
        self._create_repo("test_repo", {"file.txt": "original"})
        
        # First copy
        engine = GitMigEngine(self.source_dir, self.dest_dir, force=True)
        files, _ = engine._scan_repo("test_repo")
        engine._copy_repo("test_repo", files)
        
        # Copy again (should overwrite)
        engine2 = GitMigEngine(self.source_dir, self.dest_dir, force=True)
        files2, _ = engine2._scan_repo("test_repo")
        engine2._copy_repo("test_repo", files2)
        
        self.assertEqual(engine2.files_overwritten, 1)

    def test_skip_existing_skips_files(self):
        """Test that --skip-existing skips files that already exist."""
        self._create_repo("test_repo", {"file.txt": "content"})
        
        # First copy
        engine = GitMigEngine(self.source_dir, self.dest_dir)
        files, _ = engine._scan_repo("test_repo")
        engine._copy_repo("test_repo", files)
        
        # Copy again with skip_existing
        engine2 = GitMigEngine(self.source_dir, self.dest_dir, skip_existing=True)
        files2, _ = engine2._scan_repo("test_repo")
        engine2._copy_repo("test_repo", files2)
        
        self.assertEqual(engine2.files_skipped_existing, 1)
        self.assertEqual(engine2.files_overwritten, 0)


class TestConfig(unittest.TestCase):
    """Test the configuration module."""

    def test_exclude_dirs_contains_common_patterns(self):
        """Test that common exclusion patterns are configured."""
        self.assertIn("node_modules", EXCLUDE_DIRS)
        self.assertIn(".git", EXCLUDE_DIRS)
        self.assertIn("__pycache__", EXCLUDE_DIRS)
        self.assertIn("venv", EXCLUDE_DIRS)
        self.assertIn("dist", EXCLUDE_DIRS)

    def test_exclude_file_patterns_contains_common(self):
        """Test that common file exclusion patterns are configured."""
        self.assertIn("*.log", EXCLUDE_FILE_PATTERNS)
        self.assertIn("*.pyc", EXCLUDE_FILE_PATTERNS)

    def test_preserve_patterns_includes_env(self):
        """Test that .env preservation is configured."""
        self.assertIn(".env", PRESERVE_PATTERNS)
        self.assertIn(".env.*", PRESERVE_PATTERNS)


if __name__ == "__main__":
    unittest.main(verbosity=2)
