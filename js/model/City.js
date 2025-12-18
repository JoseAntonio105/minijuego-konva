export class City {
    constructor({ id, name, x, y, baseProduction, cityRank }) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.baseProduction = baseProduction;
        this.cityRank = cityRank;
        this.level = 1;
    }

    getProduction() {
        return this.baseProduction * this.level;
    }
}
