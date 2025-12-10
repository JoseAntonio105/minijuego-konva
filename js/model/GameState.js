// js/model/GameState.js

import { CITIES_CONFIG } from '../config/citiesConfig.js';
import { CARAVAN_PASSIVE_PERCENT_PER_SECOND, GOLD_DECIMALS } from '../config/gameBalanceConfig.js';
import { City } from './City.js';
import { Caravan } from './Caravan.js';


const gameState = {
    gold: 0,
    cities: [],
    caravans: [],
    selectedCityId: null
};

export function initGameState() {
    gameState.gold = 0;
    gameState.cities = CITIES_CONFIG.map(cfg => new City(cfg));
    gameState.caravans = [];
    gameState.selectedCityId = null;
}

// === Getters básicos ===

export function getGameState() {
    return gameState;
}

export function getCities() {
    return gameState.cities;
}

export function getCityById(id) {
    return gameState.cities.find(c => c.id === id) || null;
}

export function getGold() {
    return gameState.gold;
}

export function getSelectedCity() {
    return gameState.cities.find(c => c.id === gameState.selectedCityId) || null;
}

export function getCaravans() {
    return gameState.caravans;
}

// === Modificadores básicos ===

export function addGold(amount) {
    gameState.gold += amount;

    // Redondear siempre a GOLD_DECIMALS
    const factor = 10 ** GOLD_DECIMALS;
    gameState.gold = Math.round(gameState.gold * factor) / factor;

    if (gameState.gold < 0) {
        gameState.gold = 0;
    }
}

export function setSelectedCity(cityId) {
    gameState.selectedCityId = cityId;
}

// === Caravanas: creación y consulta ===

function normalizePair(a, b) {
    return a < b ? `${a}__${b}` : `${b}__${a}`;
}

export function hasCaravanBetween(cityAId, cityBId) {
    const key = normalizePair(cityAId, cityBId);
    return gameState.caravans.some(
        c => normalizePair(c.cityAId, c.cityBId) === key
    );
}

export function addCaravanBetween(cityAId, cityBId, bonusPercent, cost) {
    if (cityAId === cityBId) return null;
    if (hasCaravanBetween(cityAId, cityBId)) return null;

    const id = `caravan_${normalizePair(cityAId, cityBId)}_${gameState.caravans.length + 1}`;

    const caravan = new Caravan({
        id,
        cityAId,
        cityBId,
        bonusPercent,
        cost
    });

    gameState.caravans.push(caravan);
    return caravan;
}

export function getCaravansForCity(cityId) {
    return gameState.caravans.filter(
        c => c.cityAId === cityId || c.cityBId === cityId
    );
}

// === Cálculo del oro por clic en una ciudad (base + bonus caravanas) ===

export function calculateGoldForCityClick(cityId) {
    const city = gameState.cities.find(c => c.id === cityId);
    if (!city) return 0;

    const base = city.getProduction(); // producción base de la ciudad

    let bonusTotal = 0;

    const caravans = getCaravansForCity(cityId);

    caravans.forEach(caravan => {
        const cityA = getCityById(caravan.cityAId);
        const cityB = getCityById(caravan.cityBId);
        if (!cityA || !cityB) return;

        const sumProd = cityA.getProduction() + cityB.getProduction();
        bonusTotal += sumProd * caravan.bonusPercent;
    });

    const total = base + bonusTotal;

    // Redondear el oro que se gana al clic a 2 decimales
    return Math.round(total * 100) / 100;
}

// === Cálculo dinámico del coste de una caravana ===
// Depende de la ganancia por clic de cada ciudad y de la distancia entre ellas.

export function calculateCaravanCost(cityAId, cityBId) {
    const cityA = getCityById(cityAId);
    const cityB = getCityById(cityBId);

    if (!cityA || !cityB) {
        return Infinity;
    }

    const gainA = calculateGoldForCityClick(cityAId);
    const gainB = calculateGoldForCityClick(cityBId);

    const dx = cityA.x - cityB.x;
    const dy = cityA.y - cityB.y;
    const dist = Math.hypot(dx, dy);

    // Ajusta estos factores a tu gusto
    const baseGain = gainA + gainB;
    const distanceFactor = 0.5 + dist / 300;

    let cost = baseGain * distanceFactor;

    // Redondear a 2 decimales
    cost = Math.round(cost * 100) / 100;

    // Coste mínimo
    if (cost < 10) {
        cost = 10;
    }

    return cost;
}

// === Ingresos pasivos de caravanas ===

export function getPassiveIncomePerSecond() {
    let total = 0;

    gameState.caravans.forEach(caravan => {
        total += caravan.cost * CARAVAN_PASSIVE_PERCENT_PER_SECOND;
    });

    const factor = 10 ** GOLD_DECIMALS;
    return Math.round(total * factor) / factor;
}

// Llamar a esto en un bucle de juego con deltaSeconds (segundos transcurridos)
export function tickEconomy(deltaSeconds) {
    const incomePerSecond = getPassiveIncomePerSecond();
    if (incomePerSecond <= 0) return;

    const amount = incomePerSecond * deltaSeconds;
    addGold(amount);
}
