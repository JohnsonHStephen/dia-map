function displayText(text) {
    document.getElementById('textDisplay').innerText = text;
}

//*******************************************************************************
//                             Hex-grid creation
//*******************************************************************************
const hexGrid = document.getElementById('hexGrid');
function createHex(grid) {
    const hex = document.createElement('div');
    hex.className = 'hex';
    hex.onclick = () => showModal(grid.grid);
    const locationsDiv = document.createElement('div');
    locationsDiv.className = 'locations';
    for (const [i, location] of grid.locations.entries()) {
        const locationDiv = document.createElement('div');
        locationDiv.innerText = location.name;
        locationDiv.className = 'location';
        locationsDiv.appendChild(locationDiv);

        if (i < grid.locations.length - 1) {
            const separator = document.createElement('div');
            separator.className = 'locationseparator';
            locationsDiv.appendChild(separator);
        }
    }
    hex.appendChild(locationsDiv);
    hexGrid.appendChild(hex);
}

// Function to fetch data from the API
function fetchData() {
    fetch('/grid', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }).then(response => {
        if (response.ok)
            return response.json()
        else
            console.log('Server returned ' + response.status + ' : ' + response.statusText)
    }).then(response => {
        for (const grid of response) {
            createHex(grid);
        }
    }).catch(err => {
        console.error(err)
    })
}

fetchData();

//*******************************************************************************
//                              Zoom functionality
//*******************************************************************************
let scale = 1;
const mapContainer = document.getElementById('mapContainer');
const map = document.getElementById('map');

mapContainer.addEventListener('wheel', (event) => {
    event.preventDefault();
    scale += event.deltaY * -0.001;
    scale = Math.min(Math.max(.125, scale), 4);
    mapContainer.style.transform = `scale(${scale})`;
});

//*******************************************************************************
//                          WASD movement functionality
//*******************************************************************************
let posX = 0;
let posY = 0;
document.addEventListener('keydown', (event) => {
    const step = 10;
    switch (event.key) {
        case 'w':
            posY += step;
            break;
        case 'a':
            posX += step;
            break;
        case 's':
            posY -= step;
            break;
        case 'd':
            posX -= step;
            break;
    }
    mapContainer.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
});

//*******************************************************************************
//                          Click and Drag functionality
//*******************************************************************************
let isDragging = false;
let startX, startY;

mapContainer.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX - posX;
    startY = event.clientY - posY;
    mapContainer.style.cursor = 'grabbing';
});

mapContainer.addEventListener('mousemove', (event) => {
    if (isDragging) {
        posX = event.clientX - startX;
        posY = event.clientY - startY;
        mapContainer.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    }
});

mapContainer.addEventListener('mouseup', () => {
    isDragging = false;
    mapContainer.style.cursor = 'grab';
});

mapContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    mapContainer.style.cursor = 'grab';
});

//*******************************************************************************
//                          Random Encounter Toggle
//*******************************************************************************
const toggleRandomEncounterButton = document.getElementById('toggleRandomEncounter');

toggleRandomEncounterButton.onclick = function() {
    if (toggleRandomEncounterButton.className === "pressed") {
        toggleRandomEncounterButton.className = "";
    } else
        toggleRandomEncounterButton.className = "pressed";
}

//*******************************************************************************
//                          Modal functionality
//*******************************************************************************
const modals = document.getElementById('modals');
let grid = 0;
let number = 0;

function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = `modal-${number}`;
    number += 1;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalMenuBar = document.createElement('div');
    modalMenuBar.className = 'modal-menu-bar';

    const closeButton = document.createElement('span');
    closeButton.className = 'close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function () {
        modal.style.display = 'none';
        modal.remove();
    };

    modalMenuBar.appendChild(closeButton);

    modalContent.innerHTML = content;

    modal.appendChild(modalMenuBar);
    modal.appendChild(modalContent);

    modals.appendChild(modal);

    modals.style.display = 'block'; 
}

function createModalWithEdit(content, gridId, locationId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = `modal-${gridId}-${locationId}`;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalMenuBar = document.createElement('div');
    modalMenuBar.className = 'modal-menu-bar';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = function () {
        if (modalContent.isContentEditable) {
            modalContent.contentEditable = "false";
            editButton.textContent = "Edit";
            // Save the content
            fetch(`/location/${gridId}/${locationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: modalContent.innerHTML })
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Content saved');
                    } else {
                        console.log('Failed to save content');
                    }
                })
                .catch(err => console.error(err));
        } else {
            modalContent.contentEditable = "true";
            editButton.textContent = "Save";
        }
    };

    const closeButton = document.createElement('span');
    closeButton.className = 'close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function () {
        modal.style.display = 'none';
        modal.remove();
    };

    modalMenuBar.appendChild(editButton);
    modalMenuBar.appendChild(closeButton);

    modalContent.innerHTML = content;

    modal.appendChild(modalMenuBar);
    modal.appendChild(modalContent);

    modals.appendChild(modal);

    modals.style.display = 'block';
}

function showModal(gridId) {
    if (toggleRandomEncounterButton.className === "pressed") {
        fetch(`/random/${gridId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'text/html' },
        })
            .then(response => response.text())
            .then(html => {
                createModal(html);
            })
            .catch(err => console.error(err));
    } else {
        fetch(`/grids/${gridId}`)
            .then(response => response.text())
            .then(locations => {
                console.log(locations);
                for (const location of locations.split(',')) {
                    if (location === '') continue;
                    console.log(location);
                    fetch(`/location/${gridId}/${location}`)
                    .then(response => response.text())
                    .then(content => {
                        createModalWithEdit(content, gridId, location);
                    })
                    .catch(err => console.error(err));
                }
            })
            .catch(err => console.error(err));
    }
}

function closeModals() {
    modals.style.display = 'none';

    while (modals.firstChild)
        modals.removeChild(modals.firstChild);
}

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModals();
    }
});

window.onclick = function(event) {
    if (event.target == modals) {
        closeModals();
    }
}

//*******************************************************************************
//                          Toggle functionality
//*******************************************************************************
const toggleMapButton = document.getElementById('toggleMap');
const toggleHexGridButton = document.getElementById('toggleHexGrid');
const showLegendButton = document.getElementById('showLegend');

toggleMapButton.onclick = function() {
    if (map.style.display === 'none') {
        map.style.display = 'block';
    } else {
        map.style.display = 'none';
    }
}

toggleHexGridButton.onclick = function() {
    if (hexGrid.style.display === 'none') {
        hexGrid.style.display = 'grid';
    } else {
        hexGrid.style.display = 'none';
    }
}

showLegendButton.onclick = function() {
    fetch('/legend.html')
        .then(response => response.text())
        .then(html => {
            createModal(html);
        })
        .catch(err => console.error(err));
}