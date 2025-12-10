export class City {
    constructor({ id, name, x, y, baseProduction }) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.baseProduction = baseProduction;

        // Futuro: nivel, mejoras, rutas asociadas, etc.
        this.level = 1;
    }

    getProduction() {
        // Futuro: aplicar multiplicadores de nivel, mejoras, etc.
        return this.baseProduction * this.level;
    }
}
