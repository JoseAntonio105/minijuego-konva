let stage = null;

export function createStage() {
    stage = new Konva.Stage({
        container: 'juego', // id del div en index.html
        width: 800,
        height: 600
    });

    return stage;
}

export function getStage() {
    return stage;
}
