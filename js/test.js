var game = {
    init: function() {
        // Crear el escenario principal (canvas) indicando su contenedor y tamaño
        var stage = new Konva.Stage({
            container: 'game',  // ID del div donde Konva insertará sus canvas
            width: 200,         // Ancho del escenario en píxeles
            height: 200,        // Alto del escenario en píxeles
        });

        // Crear una capa (Konva puede tener varias capas independientes)
        var layer = new Konva.Layer();

        // Crear un círculo
        var circle = new Konva.Circle({
            x: stage.width() / 2,     // Posición X centrada
            y: stage.height() / 2,    // Posición Y centrada
            radius: 50,               // Radio del círculo en píxeles
            fill: 'orange',           // Color de relleno
            stroke: 'white',          // Color del borde
            strokeWidth: 4,           // Grosor del borde en píxeles
        });

        // Añadir el círculo a la capa
        layer.add(circle);

        // Añadir la capa al escenario
        stage.add(layer);
    }
};
