# My Research Archive

A minimal, modern Jekyll template designed for building a personal research archive, "digital garden," or knowledge base. It's built for GitHub Pages and focuses on a clean, fast, Obsidian-like reading experience with rich content features.

This project uses a custom, minimal Jekyll setup (`theme: null`) to convert Markdown files into a static website.

## Features

This template includes a host of client-side enhancements to provide a modern, interactive reading experience for your notes.

* **Modern Dark-Mode Design:** A clean, typography-focused dark theme.
* **Obsidian-Style Callouts:** Transform blockquotes into styled callouts (e.g., `[!NOTE]`, `[!WARNING]`, `[!BUG]`).
* **Code Block Enhancements:** Uses **Prism.js** (`okaidia` theme) for syntax highlighting and adds a one-click **"Copy" button** to all code blocks.
* **Math & Diagrams:**
    * **KaTeX** support for rendering LaTeX math equations (e.g., `$E=mc^2$`).
    * **Mermaid.js** support for rendering diagrams and flowcharts from code.
* **Tag Rendering:** Automatically finds and styles text-based tags (e.g., `#my-tag` or `#project/status`).
* **Task Lists:** Styles GitHub-flavored Markdown task lists (`- [x]`).
* **Wikilink Stubs:** Renders `[[Wikilinks]]` as "broken" links, helping you identify topics that still need to be created.

## Project Structure

This project uses **Jekyll Collections** to automatically manage and display your research notes.

* `index.html`: The main homepage. It's a Jekyll-powered layout that **automatically** finds and lists notes from your collections.
* `_config.yml`: Configures Jekyll and defines your research collections (e.g., `python`).
* `_layouts/default.html`: The main HTML template for all your individual research notes.
* `_python/` (Example Collection): A folder that holds all Markdown notes related to Python. You will create new folders like this for new subjects.