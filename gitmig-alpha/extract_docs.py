import os
import shutil
import argparse
import subprocess
from datetime import datetime

# Default Configuration
DEFAULT_SOURCE = r"Z:\Github"
DEFAULT_DEST = r"Z:\Github_Docs"

# Directories to always exclude if not using git
COMMON_IGNORES = {
    'node_modules', 'venv', '.venv', 'env', '.env', 
    'dist', 'build', 'target', 'bin', 'obj', '__pycache__'
}

def get_git_tracked_files(repo_path):
    """Returns a list of tracked markdown files relative to repo_path."""
    try:
        # -z handles filenames with spaces/newlines correctly
        result = subprocess.run(
            ['git', 'ls-files', '-z'], 
            cwd=repo_path, 
            capture_output=True, 
            check=True
        )
        # stdout is bytes, decode and split by null character
        all_files = result.stdout.decode('utf-8', errors='ignore').split('\0')
        # Filter for non-empty strings and markdown extensions
        return [f for f in all_files if f and f.lower().endswith('.md')]
    except Exception as e:
        print(f"Warning: Failed to run git in {repo_path}: {e}")
        return None

def extract_markdown_files(source_root, dest_root):
    """
    Scans source_root for repositories and copies all .md files to dest_root.
    Uses 'git ls-files' if possible to respect .gitignore.
    """
    start_time = datetime.now()
    print(f"[{start_time}] Starting extraction...")
    print(f"Source: {source_root}")
    print(f"Destination: {dest_root}")

    if not os.path.exists(source_root):
        print(f"Error: Source directory '{source_root}' does not exist.")
        return

    files_copied = 0
    errors = 0

    try:
        repos = [d for d in os.listdir(source_root) if os.path.isdir(os.path.join(source_root, d))]
    except Exception as e:
        print(f"Error accessing source root: {e}")
        return

    print(f"Found {len(repos)} potential repositories.")

    for repo in repos:
        repo_path = os.path.join(source_root, repo)
        files_to_copy = []
        
        # Check if it's a git repo
        is_git_repo = os.path.exists(os.path.join(repo_path, '.git'))
        
        if is_git_repo:
            print(f"Scanning Git repo: {repo}")
            files_to_copy = get_git_tracked_files(repo_path)
            
            # Fallback if git command failed for some reason
            if files_to_copy is None:
                is_git_repo = False 

        if not is_git_repo:
            print(f"Scanning Directory (Non-Git): {repo}")
            # Manual walk with exclusions
            files_to_copy = []
            for root, dirs, files in os.walk(repo_path):
                # Modify dirs in-place to skip ignored folders
                dirs[:] = [d for d in dirs if d not in COMMON_IGNORES and not d.startswith('.')]
                
                for file in files:
                    if file.lower().endswith('.md'):
                        abs_path = os.path.join(root, file)
                        try:
                            rel_path = os.path.relpath(abs_path, repo_path)
                            files_to_copy.append(rel_path)
                        except ValueError:
                            continue

        # Copy the identified files
        if files_to_copy:
            for rel_path in files_to_copy:
                source_file = os.path.join(repo_path, rel_path)
                dest_file = os.path.join(dest_root, repo, rel_path)
                dest_dir = os.path.dirname(dest_file)
                
                try:
                    os.makedirs(dest_dir, exist_ok=True)
                    shutil.copy2(source_file, dest_file)
                    files_copied += 1
                except Exception as e:
                    print(f"Error copying {rel_path}: {e}")
                    errors += 1

    end_time = datetime.now()
    duration = end_time - start_time
    
    print("\nExtraction complete.")
    print(f"Time taken: {duration}")
    print(f"Total MD files copied: {files_copied}")
    if errors > 0:
        print(f"Total errors: {errors}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract markdown files from repositories.")
    parser.add_argument("--source", default=DEFAULT_SOURCE, help="Source directory containing repositories")
    parser.add_argument("--dest", default=DEFAULT_DEST, help="Destination directory for extracted docs")
    
    args = parser.parse_args()
    
    extract_markdown_files(args.source, args.dest)
