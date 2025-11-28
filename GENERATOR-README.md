#!/usr/bin/env node

# Static HTML Generator for Studio Ghibli

This script fetches all data from the Ghibli API and generates fully static HTML files that don't require any client-side JavaScript data fetching.

## Usage

```bash
node generate-static.js
```

## What It Does

1. **Fetches Data**: Retrieves all films, people, species, locations, and vehicles from the Ghibli API
2. **Generates Pages**:
   - `index-static.html` - Main page with all films
   - `film_[id].html` - Individual film detail pages (one for each film)
   - `species_[id].html` - Individual species detail pages (one for each species)

3. **Creates Links**: All internal links are pre-generated:
   - Film cards link to their detail pages
   - Species links point to their detail pages
   - Back links navigate to index

## Output Files

- **index-static.html** (43KB) - Main page with all 22 films
- **film_*.html** (22 files) - Film detail pages with characters, locations, vehicles, and species
- **species_*.html** (7 files) - Species detail pages with characters and films

## Advantages of Static HTML

✓ **No client-side API calls** - All data is embedded in the HTML
✓ **Faster load times** - No waiting for API responses
✓ **Better SEO** - Search engines can crawl all content
✓ **Works offline** - Generated files can be served statically
✓ **Reduced bandwidth** - API only called once during generation
✓ **Fully self-contained** - Each page has all required styling and structure

## How to Update

Run the script again whenever you want to regenerate the files with fresh data from the API.

## Technical Details

The generator:
- Parallelly fetches all data from the Ghibli API
- Extracts helper functions from the client-side scripts
- Generates semantic HTML with inline styling
- Creates internal navigation links between pages
- Includes all animations and styling from the original site

## Files

- `generate-static.js` - Main generator script
- `script.js` - Client-side manager for non-static version
- `film.js` - Film detail logic (not needed for static version)
- `species.js` - Species detail logic (not needed for static version)
