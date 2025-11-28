#!/usr/bin/env node

/**
 * Static HTML Generator for Studio Ghibli API
 * Fetches all data from the Ghibli API and generates static HTML files
 * Includes HTML minification for production output
 */

const fs = require('fs');
const path = require('path');

// Try to import html-minifier, fallback to no minification if not available
let minify;
try {
    minify = require('html-minifier').minify;
} catch (e) {
    console.warn('⚠️  html-minifier not installed. Install with: npm install html-minifier');
    console.warn('   HTML will not be minified.\n');
    minify = null;
}

// ============================================
// API DATA FETCHER
// ============================================

const API_BASE = 'https://ghibliapi.vercel.app';

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

async function fetchAllData() {
    console.log('Fetching data from Ghibli API...');
    
    const [films, locations, vehicles, people, species] = await Promise.all([
        fetchAPI('/films'),
        fetchAPI('/locations'),
        fetchAPI('/vehicles'),
        fetchAPI('/people'),
        fetchAPI('/species')
    ]);
    
    console.log('✓ Data fetched successfully');
    return { films, locations, vehicles, people, species };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getIdFromUrl(url) {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
}

function getLocationsForFilm(filmId, locations) {
    return locations.filter(location => {
        if (!location.films || !Array.isArray(location.films)) return false;
        return location.films.some(filmUrl => filmUrl.includes(filmId));
    });
}

function getPeopleForFilm(filmId, people) {
    return people.filter(person => {
        if (!person.films || !Array.isArray(person.films)) return false;
        return person.films.some(filmUrl => filmUrl.includes(filmId));
    });
}

function getVehiclesForFilm(filmId, vehicles) {
    return vehicles.filter(vehicle => {
        if (!vehicle.films || !Array.isArray(vehicle.films)) return false;
        return vehicle.films.some(filmUrl => filmUrl.includes(filmId));
    });
}

function getSpeciesById(speciesIdOrUrl, speciesArray) {
    const speciesId = speciesIdOrUrl.includes('/') ? speciesIdOrUrl.split('/').pop() : speciesIdOrUrl;
    return speciesArray.find(species => species.id === speciesId);
}

function capitalize(str) {
    if (!str || str === 'n/a' || str === 'NA') return str;
    return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(gender) {
    if (!gender) return 'avatar-neutral';
    const genderLower = gender.toLowerCase();
    if (genderLower === 'female') return 'avatar-female';
    if (genderLower === 'male') return 'avatar-male';
    return 'avatar-neutral';
}

function getSpeciesHeroClass(classification) {
    if (!classification) return 'species-hero-default';
    const classLower = classification.toLowerCase();
    if (classLower.includes('mammal')) return 'species-hero-mammal';
    if (classLower.includes('spirit') || classLower.includes('god')) return 'species-hero-spirit';
    if (classLower.includes('bird') || classLower.includes('avian')) return 'species-hero-bird';
    return 'species-hero-default';
}

// ============================================
// HTML MINIFICATION
// ============================================

function minifyHTML(html) {
    if (!minify) return html;
    
    return minify(html, {
        removeComments: true,
        collapseWhitespace: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        conservativeCollapse: false,
        processConditionalComments: true
    });
}

// ============================================
// HTML TEMPLATES
// ============================================

function getBaseTemplate(content, title = 'Studio Ghibli') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="global-min.css">
    <link rel="stylesheet" href="film-min.css">
</head>
<body>
    <div class="clouds"></div>

    ${content}

    <footer>
        <div class="container">
            <p>Data provided by <a href="https://ghibliapi.vercel.app/" target="_blank">Ghibli API</a></p>
            <p>&copy; 2025 Studio Ghibli Fan Site</p>
        </div>
    </footer>
</body>
</html>`;
}

function getSpeciesTemplate(content, title = 'Species - Studio Ghibli') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="global-min.css">
    <link rel="stylesheet" href="species-min.css">
</head>
<body>
    <div class="clouds"></div>

    ${content}

    <footer>
        <div class="container">
            <p>Data provided by <a href="https://ghibliapi.vercel.app/" target="_blank">Ghibli API</a></p>
            <p>&copy; 2025 Studio Ghibli Fan Site</p>
        </div>
    </footer>
</body>
</html>`;
}

function getIndexTemplate(content, title = 'Studio Ghibli') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="global-min.css">
    <link rel="stylesheet" href="index-min.css">
</head>
<body>
    
    <!-- Soot Sprites (Susuwatari) -->
    <div class="soot-sprites">
        <div class="soot-sprite" style="left: 10%; animation-delay: 0s; width: 28px; height: 28px;">
            <div class="soot-limbs"></div>
        </div>
        <div class="soot-sprite" style="left: 25%; animation-delay: 2s; width: 32px; height: 32px;">
            <div class="soot-limbs"></div>
        </div>
        <div class="soot-sprite" style="left: 45%; animation-delay: 4s; width: 26px; height: 26px;">
            <div class="soot-limbs"></div>
        </div>
        <div class="soot-sprite" style="left: 65%; animation-delay: 1s; width: 30px; height: 30px;">
            <div class="soot-limbs"></div>
        </div>
        <div class="soot-sprite" style="left: 80%; animation-delay: 3s; width: 34px; height: 34px;">
            <div class="soot-limbs"></div>
        </div>
        <div class="soot-sprite" style="left: 90%; animation-delay: 5s; width: 27px; height: 27px;">
            <div class="soot-limbs"></div>
        </div>
    </div>
    
    <!-- Kodama (Tree Spirits) -->
    <div class="kodama-container">
        <div class="kodama" style="left: 15%; top: 20%;"></div>
        <div class="kodama" style="left: 75%; top: 35%;"></div>
        <div class="kodama" style="left: 30%; top: 60%;"></div>
    </div>
    
    <!-- Floating Leaves -->
    <div class="leaves">
        <div class="leaf" style="left: 20%; animation-delay: 0s;"></div>
        <div class="leaf" style="left: 50%; animation-delay: 3s;"></div>
        <div class="leaf" style="left: 70%; animation-delay: 6s;"></div>
        <div class="leaf" style="left: 85%; animation-delay: 9s;"></div>
    </div>

    ${content}

    <footer>
        <div class="container">
            <p>Data provided by <a href="https://ghibliapi.vercel.app/" target="_blank">Ghibli API</a></p>
            <p>&copy; 2025 Studio Ghibli Fan Site</p>
        </div>
    </footer>

    <script src="soot-min.js"></script>
</body>
</html>`;
}

function generateIndexPage(films) {
    const sortedFilms = films.sort((a, b) => 
        parseInt(a.release_date) - parseInt(b.release_date)
    );

    const filmsHTML = sortedFilms.map(film => {
        const imageId = film.id.replace(/-/g, '_');
        const imageUrl = `https://marsbj.folk.ntnu.no/images/films_${imageId}.webp`;
        return `
            <a href="film_${film.id}.html" class="film-card" style="text-decoration: none; color: inherit; cursor: pointer;">
                <img src="${imageUrl}" alt="${film.title}" class="film-image" loading="lazy">
                <div class="film-content">
                    <div class="release-year">${film.release_date}</div>
                    <h2>${film.title}</h2>
                    <div class="original-title">${film.original_title}</div>
                    <div class="film-info">
                        <div class="info-item">
                            <span class="info-label">Director:</span>
                            <span>${film.director}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Producer:</span>
                            <span>${film.producer}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Runtime:</span>
                            <span>${film.running_time} mins</span>
                        </div>
                        <div class="info-item">
                            <span class="rt-score">⭐ ${film.rt_score}%</span>
                        </div>
                    </div>
                    <div class="description">
                        ${film.description}
                    </div>
                </div>
            </a>
        `;
    }).join('');

    const headerHTML = `
    <header>
        <div class="container">
            <h1 class="logo">STUDIO GHIBLI</h1>
            <p class="tagline">Explore the Magical World of Ghibli</p>
        </div>
    </header>

    <main class="container">
        <div id="films-grid" class="films-grid">
            ${filmsHTML}
        </div>
    </main>
    `;

    return getIndexTemplate(headerHTML, 'Studio Ghibli Films');
}

function generateFilmPage(film, filmId, data) {
    const filmLocations = getLocationsForFilm(filmId, data.locations);
    const filmPeople = getPeopleForFilm(filmId, data.people);
    const filmVehicles = getVehiclesForFilm(filmId, data.vehicles);

    const uniqueSpecies = new Set(
        filmPeople
            .filter(person => person.species)
            .map(person => person.species)
    );

    const imageId = filmId.replace(/-/g, '_');
    const bannerUrl = `https://marsbj.folk.ntnu.no/images/banner_${imageId}.webp`;

    // Generate characters HTML
    const charactersHTML = filmPeople.map(person => {
        let speciesName = 'Unknown';
        let speciesUrl = null;
        if (person.species && typeof person.species === 'string') {
            speciesUrl = person.species;
            const speciesData = getSpeciesById(person.species, data.species);
            if (speciesData && speciesData.name) {
                speciesName = speciesData.name;
            }
        }

        return `
            <div class="character-card">
                <div class="character-avatar ${getAvatarColor(person.gender)}">
                    ${getInitials(person.name)}
                </div>
                <h4>${person.name}</h4>
                <div class="character-details">
                    ${person.gender ? `
                        <div class="character-detail-item">
                            <span class="detail-label">Gender:</span>
                            <span class="detail-value">${capitalize(person.gender)}</span>
                        </div>
                    ` : ''}
                    ${person.age ? `
                        <div class="character-detail-item">
                            <span class="detail-label">Age:</span>
                            <span class="detail-value">${person.age}</span>
                        </div>
                    ` : ''}
                    ${person.eye_color ? `
                        <div class="character-detail-item">
                            <span class="detail-label">Eye Color:</span>
                            <span class="detail-value">${capitalize(person.eye_color)}</span>
                        </div>
                    ` : ''}
                    ${person.hair_color ? `
                        <div class="character-detail-item">
                            <span class="detail-label">Hair Color:</span>
                            <span class="detail-value">${capitalize(person.hair_color)}</span>
                        </div>
                    ` : ''}
                    ${speciesName && speciesName !== 'Unknown' ? `
                        <div class="character-detail-item">
                            <span class="detail-label">Species:</span>
                            <span class="detail-value">
                                ${speciesUrl ? 
                                    `<a href="species_${getIdFromUrl(speciesUrl)}.html" class="species-link">${speciesName}</a>` : 
                                    speciesName
                                }
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    // Generate locations HTML
    const locationsHTML = filmLocations.length > 0 
        ? filmLocations.map(location => `<div class="info-tag">${location.name}</div>`).join('')
        : '<div class="info-tag">None</div>';

    // Generate species HTML
    const speciesHTML = uniqueSpecies.size > 0
        ? Array.from(uniqueSpecies)
            .map(speciesUrl => {
                const speciesObj = getSpeciesById(speciesUrl, data.species);
                if (speciesObj) {
                    return `<a href="species_${speciesObj.id}.html" class="info-tag" style="text-decoration: none; cursor: pointer;">${speciesObj.name}</a>`;
                }
                return '';
            })
            .filter(html => html)
            .join('')
        : '<div class="info-tag">None</div>';

    // Generate vehicles HTML
    const vehiclesHTML = filmVehicles.length > 0
        ? filmVehicles.map(vehicle => `<div class="info-tag">${vehicle.name}</div>`).join('')
        : '<div class="info-tag">None</div>';

    const headerHTML = `
    <header>
        <div class="container">
            <h1 class="logo">STUDIO GHIBLI</h1>
            <a href="index.html" class="back-btn">← Back to All Films</a>
        </div>
    </header>

    <main class="container">
        <div id="film-detail" class="film-detail">
            <div class="detail-hero">
                <img src="${bannerUrl}" alt="${film.title}" class="detail-banner" onerror="this.style.display='none'">
            </div>
            
            <div class="detail-header">
                <h2>${film.title}</h2>
                <div class="detail-original-title">${film.original_title} (${film.original_title_romanised})</div>
                
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-box-label">Release Year</div>
                        <div class="info-box-value">${film.release_date}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-label">Director</div>
                        <div class="info-box-value">${film.director}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-label">Producer</div>
                        <div class="info-box-value">${film.producer}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-label">Running Time</div>
                        <div class="info-box-value">${film.running_time} mins</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-label">RT Score</div>
                        <div class="info-box-value">⭐ ${film.rt_score}%</div>
                    </div>
                </div>
                
                <div class="detail-description">
                    ${film.description}
                </div>
            </div>
            
            <div class="characters-section">
                <h3 class="section-title">Characters (${filmPeople ? filmPeople.length : 0})</h3>
                <div id="characters-grid" class="characters-grid">
                    ${charactersHTML || '<p style="text-align: center; grid-column: 1/-1; color: var(--text-dark);">No character information available.</p>'}
                </div>
            </div>
            
            <div class="additional-section">
                <h3 class="section-title">Additional Information</h3>
                
                <div class="info-section">
                    <h4>Locations (${filmLocations ? filmLocations.length : 0})</h4>
                    <div class="info-list" id="locations-list">
                        ${locationsHTML}
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Species (${uniqueSpecies.size})</h4>
                    <div class="info-list" id="species-list">
                        ${speciesHTML}
                    </div>
                </div>
                
                <div class="info-section">
                    <h4>Vehicles (${filmVehicles ? filmVehicles.length : 0})</h4>
                    <div class="info-list" id="vehicles-list">
                        ${vehiclesHTML}
                    </div>
                </div>
            </div>
        </div>
    </main>
    `;

    return getBaseTemplate(headerHTML, `${film.title} - Studio Ghibli`);
}

function generateSpeciesPage(species, speciesId, data) {
    const speciesPeople = species.people && Array.isArray(species.people)
        ? species.people
            .filter(url => {
                const parts = url.split('/').filter(part => part.length > 0);
                const lastPart = parts[parts.length - 1];
                return !['people', 'locations', 'species', 'vehicles', 'films'].includes(lastPart);
            })
            .map(url => {
                const personId = getIdFromUrl(url);
                return data.people.find(p => p.id === personId);
            })
            .filter(p => p)
        : [];

    const speciesFilms = species.films && Array.isArray(species.films)
        ? species.films
            .filter(url => {
                const parts = url.split('/').filter(part => part.length > 0);
                const lastPart = parts[parts.length - 1];
                return !['people', 'locations', 'species', 'vehicles', 'films'].includes(lastPart);
            })
            .map(url => {
                const filmId = getIdFromUrl(url);
                return data.films.find(f => f.id === filmId);
            })
            .filter(f => f)
        : [];

    // Generate people HTML
    const peopleHTML = speciesPeople.map(person => `
        <div class="character-card">
            <div class="character-avatar ${getAvatarColor(person.gender)}">
                ${getInitials(person.name)}
            </div>
            <h4>${person.name}</h4>
            <div class="character-details">
                ${person.gender ? `
                    <div class="character-detail-item">
                        <span class="detail-label">Gender:</span>
                        <span class="detail-value">${capitalize(person.gender)}</span>
                    </div>
                ` : ''}
                ${person.age ? `
                    <div class="character-detail-item">
                        <span class="detail-label">Age:</span>
                        <span class="detail-value">${person.age}</span>
                    </div>
                ` : ''}
                ${person.eye_color ? `
                    <div class="character-detail-item">
                        <span class="detail-label">Eye Color:</span>
                        <span class="detail-value">${capitalize(person.eye_color)}</span>
                    </div>
                ` : ''}
                ${person.hair_color ? `
                    <div class="character-detail-item">
                        <span class="detail-label">Hair Color:</span>
                        <span class="detail-value">${capitalize(person.hair_color)}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    // Generate films HTML
    const filmsHTML = speciesFilms.length > 0
        ? speciesFilms.map(film => `<a href="film_${film.id}.html" class="info-tag" style="text-decoration: none; cursor: pointer;">${film.title}</a>`).join('')
        : '<div class="info-tag">None</div>';

    const headerHTML = `
    <header>
        <div class="container">
            <h1 class="logo">STUDIO GHIBLI</h1>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="index.html" class="back-btn">← All Films</a>
                <a href="javascript:history.back()" class="back-btn">← Back</a>
            </div>
        </div>
    </header>

    <main class="container">
        <div id="species-detail" class="species-detail">
            <div class="species-hero ${getSpeciesHeroClass(species.classification)}">
                <div class="species-hero-content">
                    <h2 class="species-hero-title">${species.name}</h2>
                    <p class="species-hero-subtitle">${species.classification || 'Unknown Classification'}</p>
                </div>
            </div>
            
            <div class="detail-header">
                <h2>${species.name}</h2>
                
                <div class="info-grid">
                    <div class="info-box">
                        <div class="info-box-label">Classification</div>
                        <div class="info-box-value">${species.classification || 'Unknown'}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-label">Eye Colors</div>
                        <div class="info-box-value">${species.eye_colors || 'Unknown'}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-label">Hair Colors</div>
                        <div class="info-box-value">${species.hair_colors || 'Unknown'}</div>
                    </div>
                </div>
            </div>
            
            <div class="characters-section">
                <h3 class="section-title">Characters of this Species (${speciesPeople.length})</h3>
                <div id="people-grid" class="characters-grid">
                    ${peopleHTML || '<p style="text-align: center; grid-column: 1/-1; color: var(--text-dark);">No characters data available.</p>'}
                </div>
            </div>
            
            <div class="additional-section">
                <h3 class="section-title">Films Featuring this Species</h3>
                <div id="films-list" class="info-list">
                    ${filmsHTML}
                </div>
            </div>
        </div>
    </main>
    `;

    return getSpeciesTemplate(headerHTML, `${species.name} - Studio Ghibli`);
}

// ============================================
// FILE GENERATION
// ============================================

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function generateStaticFiles(data) {
    const outputDir = path.join(__dirname, 'public');
    ensureDir(outputDir);

    // Generate index page
    console.log('Generating public/index.html...');
    fs.writeFileSync(
        path.join(outputDir, 'index.html'),
        minifyHTML(generateIndexPage(data.films))
    );
    console.log('✓ public/index.html generated');

    // Generate film pages
    console.log('Generating film pages...');
    if (data.films && Array.isArray(data.films)) {
        for (const film of data.films) {
            fs.writeFileSync(
                path.join(outputDir, `film_${film.id}.html`),
                minifyHTML(generateFilmPage(film, film.id, data))
            );
        }
        console.log(`✓ ${data.films.length} film pages generated`);
    }

    // Generate species pages
    console.log('Generating species pages...');
    if (data.species && Array.isArray(data.species)) {
        for (const species of data.species) {
            fs.writeFileSync(
                path.join(outputDir, `species_${species.id}.html`),
                minifyHTML(generateSpeciesPage(species, species.id, data))
            );
        }
        console.log(`✓ ${data.species.length} species pages generated`);
    }

    console.log('\n✓ All static files generated successfully in public/');
}

// ============================================
// MAIN
// ============================================

async function main() {
    try {
        console.log('🎬 Studio Ghibli Static HTML Generator\n');
        
        const data = await fetchAllData();
        
        if (!data.films || !data.people || !data.species) {
            console.error('❌ Failed to fetch required data');
            process.exit(1);
        }

        console.log(`Loaded ${data.films.length} films`);
        console.log(`Loaded ${data.people.length} people`);
        console.log(`Loaded ${data.species.length} species`);
        console.log(`Loaded ${data.locations.length} locations`);
        console.log(`Loaded ${data.vehicles.length} vehicles\n`);

        await generateStaticFiles(data);
        
        console.log('\n✨ Generation complete! Generated files in public/:');
        console.log(`  - index.html`);
        console.log(`  - film_[id].html (${data.films.length} files)`);
        console.log(`  - species_[id].html (${data.species.length} files)`);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

main();
