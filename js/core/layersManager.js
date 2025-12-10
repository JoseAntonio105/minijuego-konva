import { getStage } from './stageManager.js';

let mapLayer   = null;
let cityLayer  = null;
let caravanLayer = null;
let uiLayer    = null;

export function createLayers() {
    const stage = getStage();
    if (!stage) {
        throw new Error('Stage no creado. Llama a createStage() antes de createLayers().');
    }

    mapLayer     = new Konva.Layer();
    cityLayer    = new Konva.Layer();
    caravanLayer = new Konva.Layer();
    uiLayer      = new Konva.Layer();

    stage.add(mapLayer);
    stage.add(cityLayer);
    stage.add(caravanLayer);
    stage.add(uiLayer);

    // Dibujo inicial
    stage.draw();
}

export function getMapLayer() {
    return mapLayer;
}

export function getCityLayer() {
    return cityLayer;
}

export function getCaravanLayer() {
    return caravanLayer;
}

export function getUiLayer() {
    return uiLayer;
}
