import { createStage } from '../core/stageManager.js';
import { createLayers, getMapLayer } from '../core/layersManager.js';

import { initGameState, tickEconomy } from '../model/GameState.js';
import { renderCities } from '../view/CityView.js';
import { initUI, updateGoldUI, updatePassiveIncomeUI } from '../view/UIView.js';
import { loadImage } from '../utils/loadImage.js';

let backgroundImage = null;

export async function initGame() {
    // 1. Stage y capas
    createStage();
    createLayers();

    // 2. Estado de juego
    initGameState();

    // 3. Fondo del mapa (imagen)
    await initMapBackground();

    // 4. UI (oro + panel caravanas)
    initUI();

    // 5. Ciudades
    renderCities();

    // 6. Bucle de ingresos pasivos (cada 1 segundo)
    startPassiveIncomeLoop();
}

async function initMapBackground() {
    const mapLayer = getMapLayer();
    const stage = mapLayer.getStage();

    // Cargar imagen del tablero
    const img = await loadImage('js/assets/mapa.jpg');

    backgroundImage = new Konva.Image({
        x: 0,
        y: 0,
        image: img
    });

    // Ajustar la imagen al tamaño del tablero (tipo cover)
    fitImageContain(backgroundImage, stage.width(), stage.height());

    mapLayer.add(backgroundImage);
    mapLayer.draw();

    // Reajustar si cambia el tamaño de la ventana
    window.addEventListener('resize', () => {
        const stage = mapLayer.getStage();
        fitImageContain(backgroundImage, stage.width(), stage.height());
        mapLayer.draw();
    });
}

function fitImageContain(konvaImage, targetW, targetH) {
    const img = konvaImage.image();
    const iw = img.width;
    const ih = img.height;

    // 1) Dejamos margen arriba para HUD
    const TOP_PADDING = 90;
    const usableH = Math.max(0, targetH - TOP_PADDING);

    // 2) Encajar sin recortar (contain)
    const baseScale = Math.min(targetW / iw, usableH / ih);

    // 3) Zoom extra para que se vea más grande
    const ZOOM = 0.95;
    const scale = baseScale * ZOOM;

    const w = iw * scale;
    const h = ih * scale;

    konvaImage.width(w);
    konvaImage.height(h);

    // 4) Centrado horizontal
    konvaImage.x((targetW - w) / 2);

    // 5) Centrado vertical dentro del área "usable", respetando TOP_PADDING
    konvaImage.y(TOP_PADDING + (usableH - h) / 2);
}



function startPassiveIncomeLoop() {
    const TICK_SECONDS = 1; // intervalo de 1 segundo

    setInterval(() => {
        // Actualizar economía pasiva
        tickEconomy(TICK_SECONDS);

        // Refrescar HUD
        updateGoldUI();
        updatePassiveIncomeUI();
    }, TICK_SECONDS * 1000);
}
