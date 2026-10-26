# varunmenon website

A static single-page site. No build step.

- `index.html`: all content
- `style.css`: styling, with automatic light and dark themes
- `lattice.js`: the animated surface-code patch in the header
- `static/cv.pdf`: the linked CV

## Preview locally

    python3 -m http.server 8000
    # open http://localhost:8000

## Publish on GitHub Pages

1. Create a repo named `<your-github-username>.github.io`.
2. Push these files to its `main` branch.
3. The site goes live at `https://<your-github-username>.github.io`.

## Updating

- To add a paper, copy an `<li>` inside the relevant `<ol class="pubs">` list.
- To add Google Scholar or GitHub links, uncomment the placeholders in the `links` list in `index.html`.
