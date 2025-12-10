// js/controller/GameController.js

import { createStage } from '../core/stageManager.js';
import { createLayers, getMapLayer } from '../core/layersManager.js';

import { initGameState, tickEconomy } from '../model/GameState.js';
import { renderCities } from '../view/CityView.js';
import { initUI, updateGoldUI, updatePassiveIncomeUI } from '../view/UIView.js';

export function initGame() {
    // 1. Stage y capas
    createStage();
    createLayers();

    // 2. Estado de juego
    initGameState();

    // 3. Fondo del mapa
    const mapLayer = getMapLayer();

    const backgroundRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: mapLayer.getStage().width(),
        height: mapLayer.getStage().height(),
        fill: '#1e1e2e'
    });

    mapLayer.add(backgroundRect);
    mapLayer.draw();

    // 4. UI (oro + panel caravanas)
    initUI();

    // 5. Ciudades
    renderCities();

    // 6. Bucle de ingresos pasivos (cada 1 segundo)
    startPassiveIncomeLoop();
}

function startPassiveIncomeLoop() {
    const TICK_SECONDS = 1; // intervalo de 1 segundo

    setInterval(() => {
        // Actualizar economía pasiva
        tickEconomy(TICK_SECONDS);  // deltaSeconds = 1

        // Refrescar HUD
        updateGoldUI();
        updatePassiveIncomeUI();
    }, TICK_SECONDS * 1000);
}
