function toggleSection(icon) {
    let parent = icon.parentElement;
    parent.nextElementSibling.classList.toggle('active');
    icon.classList.toggle('fa-plus');
    icon.classList.toggle('fa-minus');
}

function createShowElement(showName) {
    const showDiv = document.createElement('div');
    showDiv.classList.add('show-name');
    showDiv.innerHTML = `<i class="fa-solid fa-plus" onclick="toggleSection(this)"></i>${showName}<input type="checkbox" onchange="updateChildren(this); updateAllBoxes() " checked="true"/>`;
    return showDiv;
}

function createSeasonElement(seasonNumber) {
    const seasonDiv = document.createElement('div');
    seasonDiv.classList.add('season-number');
    seasonDiv.innerHTML = `<i class="fa-solid fa-plus" onclick="toggleSection(this)"></i>Season ${seasonNumber}<input type="checkbox" onchange="updateChildren(this); updateAllBoxes()" checked="true"/>`;
    return seasonDiv;
}

function createEpisodeElement(episodeNumber, episodeTitle, seasonNumber, showName) {
    const episodeDiv = document.createElement('div');
    episodeDiv.classList.add('episode-name');
    episodeDiv.innerHTML = `Episode ${episodeNumber}: ${episodeTitle}<input type="checkbox" onchange="updateChildren(this); updateAllBoxes()" checked="true" id="${showName.replace(/\s+/g, '_')}_${seasonNumber}_${episodeNumber}"/>`;
    return episodeDiv;
}

function updateChildren(checkbox) {
    const parentDiv = checkbox.parentElement;

    if (parentDiv.classList.contains('episode-name')) {
        return;
    }

    const section = parentDiv.nextElementSibling;

    if (section) {
        const childCheckboxes = section.querySelectorAll('input[type="checkbox"]');
        if (childCheckboxes.length > 0) {
            childCheckboxes.forEach(childCheckbox => {
                childCheckbox.checked = checkbox.checked;
            });
        }
    }
}

function updateAllBoxes() {
    // Select all show, season, and episode checkboxes
    const parentDivs = document.querySelectorAll('.show-name, .season-number');

    parentDivs.forEach(parentDiv => {
        const parentCheckbox = parentDiv.querySelector('input[type="checkbox"]');
        const childSection = parentDiv.nextElementSibling;

        if (childSection) {
            const childCheckboxes = childSection.querySelectorAll('input[type="checkbox"]');
            const checkedChildren = [...childCheckboxes].filter(child => child.checked).length;
            const totalChildren = childCheckboxes.length;

            if (checkedChildren === totalChildren) {
                parentCheckbox.checked = true;
                parentCheckbox.indeterminate = false;
            } else if (checkedChildren > 0) {
                parentCheckbox.checked = false;
                parentCheckbox.indeterminate = true;
            } else {
                parentCheckbox.checked = false;
                parentCheckbox.indeterminate = false;
            }
        }
    });
}

const jsonFilePath = 'tv_shows_episodes.json';

async function loadJSON(file) {
    const response = await fetch(file);
    const data = await response.json();
    return data;
}

let uniqueShowsArray;

async function loadAndDisplayShows(jsonFilePath) {
    try {
        const records = await loadJSON(jsonFilePath);
        
        const uniqueShows = new Set();

        if (Array.isArray(records)) {
            records.forEach(record => {
                let uniqueID = [
                    record.show_name,
                    record.season_number,
                    record.episode_number,
                    record.episode_title,
                    record.thumbnail,
                    record.description
                ];
                uniqueShows.add(JSON.stringify(uniqueID));
            });

            uniqueShowsArray = Array.from(uniqueShows).map(item => JSON.parse(item));

            const shows = {};

            uniqueShowsArray.forEach(([showName, seasonNumber, episodeNumber, episodeTitle]) => {
                if (!shows[showName]) {
                    shows[showName] = {};
                }
                if (!shows[showName][seasonNumber]) {
                    shows[showName][seasonNumber] = [];
                }
                shows[showName][seasonNumber].push({ episodeNumber, episodeTitle });
            });

            const container = document.getElementById('shows-container');

            Object.keys(shows).forEach(showName => {
                const showElement = createShowElement(showName);
                container.appendChild(showElement);

                const seasonsContainer = document.createElement('div');
                seasonsContainer.classList.add('seasons');
                showElement.insertAdjacentElement('afterend', seasonsContainer);

                Object.keys(shows[showName]).forEach(seasonNumber => {
                    const seasonElement = createSeasonElement(seasonNumber);
                    seasonsContainer.appendChild(seasonElement);

                    const episodesContainer = document.createElement('div');
                    episodesContainer.classList.add('episodes');
                    seasonElement.insertAdjacentElement('afterend', episodesContainer);

                    shows[showName][seasonNumber].forEach(episode => {
                        const episodeElement = createEpisodeElement(episode.episodeNumber, episode.episodeTitle, seasonNumber, showName);
                        episodesContainer.appendChild(episodeElement);
                    });
                });
            });
        } else {
            console.error('The loaded data is not an array');
        }
    } catch (error) {
        console.error('Error processing shows:', error);
    }
}

loadAndDisplayShows(jsonFilePath);

const initialButton = document.getElementById('randomizerButton');
const secondaryButton = document.getElementById('randomizerButtonTwo');
const terciaryButton = document.getElementById('return-to-filter');

initialButton.addEventListener("click", () => {

    // Step 1: Filter the records to only include checked episodes
    let checkedEpisodes = uniqueShowsArray.filter(record => {
        const episodeId = `${record[0].replace(/\s+/g, '_')}_${record[1]}_${record[2]}`;
        const checkEpisode = document.getElementById(episodeId);
        return checkEpisode && checkEpisode.checked;
    });

    // Step 2: Check if there are any checked episodes
    if (checkedEpisodes.length > 0) {
        // Step 3: Select a random episode from the filtered list
        const page1 = document.getElementById('page1');
        const page2 = document.getElementById('page2');
        page1.classList.add('hidden');
        page2.classList.remove('hidden');
        const randomIndex = getRandomIntInclusive(0, checkedEpisodes.length - 1);
        const selectedEpisode = checkedEpisodes[randomIndex];

        const selectionId = document.getElementById('selection-episode-id');
        const selectionTitle = document.getElementById('selection-title');
        const selectionDescription = document.getElementById('episode-description');
        const selectionThumbnail = document.getElementById('selection-thumbnail');

        selectionId.innerHTML = `${selectedEpisode[0]} / Season ${selectedEpisode[1]} / Episode ${selectedEpisode[2]}`;
        selectionTitle.innerHTML = selectedEpisode[3];
        selectionDescription.innerHTML = selectedEpisode[5];
        selectionThumbnail.setAttribute('src', `${selectedEpisode[4]}`)

    } else {
        alert('Please select at least 1 episode')
    }



});

secondaryButton.addEventListener("click", () => {
    // Step 1: Filter the records to only include checked episodes
    let checkedEpisodes = uniqueShowsArray.filter(record => {
        const episodeId = `${record[0].replace(/\s+/g, '_')}_${record[1]}_${record[2]}`;
        const checkEpisode = document.getElementById(episodeId);
        return checkEpisode && checkEpisode.checked;
    });

    // Step 2: Check if there are any checked episodes
    if (checkedEpisodes.length > 0) {
        // Step 3: Select a random episode from the filtered list
        const randomIndex = getRandomIntInclusive(0, checkedEpisodes.length - 1);
        const selectedEpisode = checkedEpisodes[randomIndex];

        const selectionId = document.getElementById('selection-episode-id');
        const selectionTitle = document.getElementById('selection-title');
        const selectionDescription = document.getElementById('episode-description');
        const selectionThumbnail = document.getElementById('selection-thumbnail');

        selectionId.innerHTML = `${selectedEpisode[0]} / Season ${selectedEpisode[1]} / Episode ${selectedEpisode[2]}`;
        selectionTitle.innerHTML = selectedEpisode[3];
        selectionDescription.innerHTML = selectedEpisode[5];
        selectionThumbnail.setAttribute('src', `${selectedEpisode[4]}`)
    } else {
        console.log("No episode found");
    }
});

terciaryButton.addEventListener("click", () => {
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    page1.classList.remove('hidden');
    page2.classList.add('hidden');
});



function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
