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

        const circle = new Konva.Circle({
            x: 0,
            y: 0,
            radius: 20,
            fill: '#f4b41a',
            stroke: '#000',
            strokeWidth: 2
        });

        const label = new Konva.Text({
            x: -40,
            y: 25,
            text: city.name,
            fontSize: 14,
            fontFamily: 'Arial',
            fill: '#ffffff',
            align: 'center',
            width: 80
        });

        group.add(circle);
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
        const circle = group.findOne('Circle');
        if (!circle) return;

        const isSelected =
            selected &&
            group.getAttr('x') === selected.x &&
            group.getAttr('y') === selected.y;

        if (isSelected) {
            circle.stroke('#00ff99');
            circle.strokeWidth(4);
        } else {
            circle.stroke('#000');
            circle.strokeWidth(2);
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
        fill: '#00ff99',
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
