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
        case 'ArrowUp':
            posY += step;
            break;
        case 'a':
        case 'ArrowLeft':
            posX += step;
            break;
        case 's':
        case 'ArrowDown':
            posY -= step;
            break;
        case 'd':
        case 'ArrowRight':
            posX -= step;
            break;
    }
    mapContainer.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
});

//*******************************************************************************
//                          Modal functionality
//*******************************************************************************
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');

function showModal(gridId) {
    fetch(`/grids/${gridId}.html`)
        .then(response => response.text())
        .then(html => {
            modalContent.innerHTML = html;
            modal.style.display = 'block';
        })
        .catch(err => console.error(err));
}

closeModal.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}