# Repository Guidelines

## Project Structure & Module Organization

This directory is the deployable static version of the Bowen Engineering & Surveying website. Top-level HTML files represent individual pages: `index.html`, `engineering.html`, `surveying.html`, `testing.html`, `projects.html`, `staff.html`, `news.html`, and `contact.html`. `404.html` provides the GitHub Pages error page, and `.nojekyll` disables Jekyll processing.

Shared resources live under `assets/`: site-wide styles are in `assets/css/styles.css`, browser behavior is in `assets/js/site.js`, and images are grouped by page or subject under `assets/images/`. Keep relative URLs portable and use lowercase, hyphenated names for new assets.

## Build, Test, and Development Commands

There is no build pipeline or package installation step. From this directory, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`. Use `rg --files` to inventory content and `rg "search text" *.html assets` to find repeated markup, styles, or links.

## Coding Style & Naming Conventions

Match the existing HTML5, CSS, and vanilla JavaScript style. HTML uses tabs for nested markup and lowercase element and attribute names. Keep CSS selectors lowercase and hyphenated, such as `.service-card`, and preserve the patterns already established in `site.js`. No formatter or linter is configured, so keep edits focused and review diffs for accidental reformatting. Update shared navigation consistently across every HTML page.

## Testing Guidelines

No automated tests or coverage requirements are configured. Preview changed pages through the local server at desktop and narrow viewport widths. Confirm navigation, images, responsive menus, hero sliders, and interactive controls work, and check the browser console for new errors. When editing shared CSS or JavaScript, also inspect at least one unaffected page. Verify internal links and asset paths, including `404.html` behavior.

## Commit & Pull Request Guidelines

No reliable Git history is available here, so use short, imperative commit subjects such as `Fix staff image paths`. Keep unrelated changes separate. Pull requests should summarize affected pages and assets, describe manual checks, link relevant issues, and include before-and-after screenshots for visible changes. Do not commit local-server output, editor metadata, or temporary files.
