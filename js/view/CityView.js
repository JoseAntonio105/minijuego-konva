import { getCityLayer } from '../core/layersManager.js';
import {
    getCities,
    setSelectedCity,
    getSelectedCity,
    addGold,
    calculateGoldForCityClick
} from '../model/GameState.js';

import { updateGoldUI, updateSelectedCityUI } from './UIView.js';

let clickLocked = false;

export function renderCities() {
    const layer = getCityLayer();
    const cities = getCities();

    layer.destroyChildren();

    cities.forEach(city => {
        const group = new Konva.Group({
            x: city.x,
            y: city.y,
            listening: true
        });

        const shape = createCityShape(city);
        shape.name('city-shape');

        const halfSize = getCityShapeHalfSize(city);
        const LABEL_GAP = 6; // separación entre icono y texto (ajústalo a gusto)

        const label = new Konva.Text({
            x: -60,
            y: halfSize + LABEL_GAP,
            text: city.name,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: '#000000ff',
            align: 'center',
            width: 120
            
        });

        group.add(shape);
        group.add(label);

        group.on('click', () => {
            if (clickLocked) {
                return;
            }

            setSelectedCity(city.id);
            highlightSelectedCity(layer);
            updateSelectedCityUI();

            const amount = calculateGoldForCityClick(city.id);
            addGold(amount);
            updateGoldUI();

            const absPos = group.getAbsolutePosition();
            showGoldPopup(layer, absPos.x, absPos.y, amount);

            console.log(`Ciudad seleccionada: ${city.name}, +${amount.toFixed(2)} oro (incluye bonus de caravanas si las hay)`);
        });

        group.on('mouseenter', () => {
            document.body.style.cursor = 'pointer';
        });

        group.on('mouseleave', () => {
            document.body.style.cursor = 'default';
        });

        layer.add(group);
    });

    layer.draw();
}

function highlightSelectedCity(layer) {
    const selected = getSelectedCity();

    layer.getChildren().forEach(group => {
        const shape = group.findOne('.city-shape');
        if (!shape) return;

        const isSelected =
            selected &&
            group.getAttr('x') === selected.x &&
            group.getAttr('y') === selected.y;

        if (isSelected) {
            shape.stroke('#00975bff');
            shape.strokeWidth(2);
        } else {
            shape.stroke('#000');
            shape.strokeWidth(2);
        }
    });

    layer.draw();
}


function showGoldPopup(layer, x, y, amount) {
    const popup = new Konva.Text({
        x: x,
        y: y - 30,
        text: `+${amount.toFixed(2)}`,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#00975bff',
        align: 'center'
    });

    popup.offsetX(popup.width() / 2);
    layer.add(popup);
    layer.draw();

    clickLocked = true;

    const tween = new Konva.Tween({
        node: popup,
        duration: 0.7,
        y: popup.y() - 40,
        opacity: 0,
        onFinish: () => {
            popup.destroy();
            layer.draw();
            clickLocked = false;
        }
    });

    tween.play();
}

function createCityShape(city) {
    switch (city.cityRank) {
        case 'city':
            return new Konva.RegularPolygon({
                x: 0,
                y: 0,
                sides: 5,        // pentágono
                radius: 14,
                fill: '#f4b41a',
                stroke: '#000',
                strokeWidth: 2
            });

        case 'town':
            return new Konva.Rect({
                x: -9,
                y: -9,
                width: 18,
                height: 18,
                fill: '#f4b41a',
                stroke: '#000',
                strokeWidth: 2
            });

        case 'village':
        default:
            return new Konva.Circle({
                x: 0,
                y: 0,
                radius: 6,
                fill: '#f4b41a',
                stroke: '#000',
                strokeWidth: 2
            });
    }
}

function getCityShapeHalfSize(city) {
    switch (city.cityRank) {
        case 'city':
            return 14; // radius del pentágono
        case 'town':
            return 18 / 2; // height/2 del cuadrado (18)
        case 'village':
        default:
            return 6; // radius del círculo
    }
}


