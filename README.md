# varunmenon website

A static single-page site. No build step.

- `index.html`: all content
- `style.css`: styling, with automatic light and dark themes
- `lattice.js`: the animated surface-code patch in the header
- `static/cv.pdf`: the linked CV

## Preview locally

    python3 -m http.server 8000
    # open http://localhost:8000

## Live site

https://varun-s-menon.github.io

Hosted on GitHub Pages from the `varun-s-menon/varun-s-menon.github.io`
repository (`main` branch). To publish changes:

    git add -A
    git commit -m "Describe the change"
    git push

The live site updates within a minute or two.

## Updating

- To add a paper, copy an `<li>` inside the relevant `<ol class="pubs">` list.
- To add Google Scholar or GitHub links, uncomment the placeholders in the `links` list in `index.html`.
