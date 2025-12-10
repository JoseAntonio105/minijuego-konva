// js/model/Caravan.js

export class Caravan {
    constructor({ id, cityAId, cityBId, bonusPercent, cost }) {
        this.id = id;
        this.cityAId = cityAId;
        this.cityBId = cityBId;
        this.bonusPercent = bonusPercent; // ej: 0.2 = 20% de la suma de producciones
        this.cost = cost;                 // coste en oro al comprar esta caravana
    }
}
