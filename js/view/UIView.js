import { getUiLayer } from '../core/layersManager.js';
import {
    getGold,
    getCities,
    getSelectedCity,
    addGold,
    addCaravanBetween,
    hasCaravanBetween,
    calculateCaravanCost,
    getCaravans,
    getPassiveIncomePerSecond
} from '../model/GameState.js';

import { CARAVAN_BONUS_PERCENT, GOLD_DECIMALS } from '../config/gameBalanceConfig.js';

let goldText = null;
let passiveText = null;

// Elementos DOM del panel de caravanas (compra)
let caravanPanel = null;
let originSpan = null;
let destSelect = null;
let createButton = null;
let infoDiv = null;

// Elementos DOM del listado de caravanas actuales
let caravanListContainer = null;

export function initUI() {
    const uiLayer = getUiLayer();

    // Título del juego
    const titleText = new Konva.Text({
        x: 20,
        y: 20,
        text: 'Konva Commerce Game by José Antonio Marín',
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#ffffff'
    });

    // Texto de oro
    goldText = new Konva.Text({
        x: 20,
        y: 50,
        text: `Oro: ${getGold().toFixed(GOLD_DECIMALS)}`,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#ffd700'
    });

    // Texto de ingreso pasivo
    passiveText = new Konva.Text({
        x: 20,
        y: 75,
        text: `Pasivo: ${getPassiveIncomePerSecond().toFixed(GOLD_DECIMALS)} /s`,
        fontSize: 14,
        fontFamily: 'Arial',
        fill: '#00975bff'
    });


    uiLayer.add(titleText);
    uiLayer.add(goldText);
    uiLayer.add(passiveText);
    uiLayer.draw();

    // Panel HTML de caravanas (compra + listado)
    initCaravanPanel();
    populateDestinations();

    // Estado inicial de paneles
    updateCaravanPanel();
    updateCaravanListPanel();
}

// HUD oro en Konva
export function updateGoldUI() {
    if (!goldText) return;
    goldText.text(`Oro: ${getGold().toFixed(GOLD_DECIMALS)}`);
    goldText.getLayer().draw();
}

// HUD ingreso pasivo en Konva
export function updatePassiveIncomeUI() {
    if (!passiveText) return;
    passiveText.text(`Pasivo: ${getPassiveIncomePerSecond().toFixed(GOLD_DECIMALS)} /s`);
    passiveText.getLayer().draw();
}

// HUD de ciudad seleccionada (para el panel HTML)
export function updateSelectedCityUI() {
    updateCaravanPanel();
}

// === Panel HTML de compra de caravanas ===

function initCaravanPanel() {
    // Crear panel base
    caravanPanel = document.createElement('div');
    caravanPanel.id = 'caravan-panel';
    caravanPanel.style.position = 'absolute';
    caravanPanel.style.top = '20px';
    caravanPanel.style.right = '20px';
    caravanPanel.style.backgroundColor = '#222';
    caravanPanel.style.color = '#fff';
    caravanPanel.style.padding = '10px';
    caravanPanel.style.border = '1px solid #555';
    caravanPanel.style.borderRadius = '4px';
    caravanPanel.style.fontFamily = 'sans-serif';
    caravanPanel.style.fontSize = '14px';
    caravanPanel.style.width = '260px';
    caravanPanel.style.maxWidth = '260px';


    const title = document.createElement('div');
    title.textContent = 'Caravanas';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '6px';
    caravanPanel.appendChild(title);

    const originLine = document.createElement('div');
    originLine.textContent = 'Origen: ';
    originSpan = document.createElement('span');
    originSpan.textContent = '(ninguna)';
    originSpan.style.fontWeight = 'bold';
    originLine.appendChild(originSpan);
    caravanPanel.appendChild(originLine);

    // Selector de destino
    const destLine = document.createElement('div');
    destLine.style.marginTop = '6px';

    const destLabel = document.createElement('span');
    destLabel.textContent = 'Destino: ';
    destLine.appendChild(destLabel);

    destSelect = document.createElement('select');
    destSelect.style.width = '100%';
    destSelect.style.marginTop = '4px';
    destLine.appendChild(destSelect);

    caravanPanel.appendChild(destLine);

    // Botón de crear caravana
    createButton = document.createElement('button');
    createButton.textContent = `Crear caravana`;
    createButton.style.marginTop = '8px';
    createButton.style.width = '100%';
    createButton.style.cursor = 'pointer';
    createButton.addEventListener('click', onCreateCaravanClicked);
    caravanPanel.appendChild(createButton);

    // Info / errores
    infoDiv = document.createElement('div');
    infoDiv.style.marginTop = '6px';
    infoDiv.style.minHeight = '18px';
    infoDiv.style.fontSize = '12px';
    caravanPanel.appendChild(infoDiv);

    // ——— NUEVO: listado de caravanas actuales ———
    const listTitle = document.createElement('div');
    listTitle.textContent = 'Caravanas actuales';
    listTitle.style.fontWeight = 'bold';
    listTitle.style.marginTop = '10px';
    listTitle.style.borderTop = '1px solid #444';
    listTitle.style.paddingTop = '6px';
    caravanPanel.appendChild(listTitle);

    caravanListContainer = document.createElement('div');
    caravanListContainer.style.marginTop = '4px';
    caravanListContainer.style.fontSize = '12px';
    caravanPanel.appendChild(caravanListContainer);
    // ————————————————————————————————

    document.body.appendChild(caravanPanel);
}

function populateDestinations() {
    if (!destSelect) return;

    const cities = getCities();

    // Limpiar opciones
    destSelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '(elige destino)';
    destSelect.appendChild(placeholder);

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        destSelect.appendChild(option);
    });

    // Recalcular panel al cambiar destino (para actualizar coste dinámico)
    destSelect.addEventListener('change', () => {
        infoDiv.textContent = '';
        updateCaravanPanel();
    });
}

// Actualiza texto de origen, botón y coste dinámico
function updateCaravanPanel() {
    if (!caravanPanel) return;

    const selectedCity = getSelectedCity();

    if (selectedCity) {
        originSpan.textContent = selectedCity.name;
        createButton.disabled = false;

        const destId = destSelect.value;

        if (destId && destId !== selectedCity.id) {
            const cost = calculateCaravanCost(selectedCity.id, destId);
            if (isFinite(cost)) {
                createButton.textContent = `Crear caravana (-${cost.toFixed(GOLD_DECIMALS)} oro)`;
            } else {
                createButton.textContent = `Crear caravana`;
            }
        } else {
            createButton.textContent = `Crear caravana`;
        }
    } else {
        originSpan.textContent = '(ninguna)';
        createButton.disabled = true;
        createButton.textContent = 'Crear caravana';
        infoDiv.textContent = 'Haz clic en una ciudad para seleccionarla como origen.';
    }
}

// === Listado de caravanas actuales por ciudad ===

function updateCaravanListPanel() {
    if (!caravanListContainer) return;

    const caravans = getCaravans();
    const cities = getCities();

    // Limpiar contenido
    caravanListContainer.innerHTML = '';

    if (!caravans.length) {
        caravanListContainer.textContent = 'No hay caravanas activas.';
        return;
    }

    // Construimos un mapa: ciudadId -> [cityIdConectada1, cityIdConectada2, ...]
    const connectionsByCity = {};

    caravans.forEach(c => {
        if (!connectionsByCity[c.cityAId]) {
            connectionsByCity[c.cityAId] = [];
        }
        if (!connectionsByCity[c.cityBId]) {
            connectionsByCity[c.cityBId] = [];
        }
        connectionsByCity[c.cityAId].push(c.cityBId);
        connectionsByCity[c.cityBId].push(c.cityAId);
    });

    // Solo mostramos las ciudades que tengan al menos una conexión
    Object.keys(connectionsByCity).forEach(cityId => {
        const city = cities.find(c => c.id === cityId);
        if (!city) return;

        const connectedIds = connectionsByCity[cityId];

        // Convertir a nombres de ciudad
        const names = connectedIds
            .map(id => {
                const c = cities.find(ci => ci.id === id);
                return c ? c.name : id;
            })
            .filter(Boolean);

        if (!names.length) return;

        const line = document.createElement('div');
        line.textContent = `${city.name}: ${names.join(', ')}`;
        caravanListContainer.appendChild(line);
    });
}

// === Creación de caravana desde el botón ===

function onCreateCaravanClicked() {
    const origin = getSelectedCity();
    const destId = destSelect.value;

    if (!origin) {
        infoDiv.textContent = 'Selecciona una ciudad origen (clic en el mapa).';
        return;
    }

    if (!destId) {
        infoDiv.textContent = 'Elige una ciudad destino en el desplegable.';
        return;
    }

    if (origin.id === destId) {
        infoDiv.textContent = 'Origen y destino no pueden ser la misma ciudad.';
        return;
    }

    if (hasCaravanBetween(origin.id, destId)) {
        infoDiv.textContent = 'Ya existe una caravana entre esas dos ciudades.';
        return;
    }

    const cost = calculateCaravanCost(origin.id, destId);
    if (!isFinite(cost)) {
        infoDiv.textContent = 'Error calculando el coste de la caravana.';
        return;
    }

    if (getGold() < cost) {
        infoDiv.textContent =
            `No tienes suficiente oro para crear esta caravana. Coste: ${cost.toFixed(GOLD_DECIMALS)} oro.`;
        return;
    }

    // Crear caravana y pagarla
    const caravan = addCaravanBetween(origin.id, destId, CARAVAN_BONUS_PERCENT, cost);
    if (!caravan) {
        infoDiv.textContent = 'No se pudo crear la caravana (ya existe o datos inválidos).';
        return;
    }

    addGold(-cost);
    updateGoldUI();

    const cities = getCities();
    const destCity = cities.find(c => c.id === destId);

    infoDiv.innerHTML =
    `Caravana creada entre ${origin.name} y ${destCity ? destCity.name : destId}. <br>` +
    `Coste: ${cost.toFixed(GOLD_DECIMALS)} oro. <br>` +
    `Bonus: ${Math.round(CARAVAN_BONUS_PERCENT * 100)}% de la suma de producciones al hacer clic en ellas.`;

    updateCaravanPanel();
    updateCaravanListPanel();
    updatePassiveIncomeUI();
}
