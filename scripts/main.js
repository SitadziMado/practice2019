ymaps.ready(init);

var ymap;

var ON = true;
var OFF = false;
var OTHER = undefined;
var ON_COLOR = 'darkGreen';
var OFF_COLOR = 'red';
var OTHER_COLOR = 'black';
var DEFAULT_PRESET = 'islands#';
var DOT_ICON = 'DotIcon';
var CLUSTER_ICONS = 'ClusterIcons';

function init() { 
    // Создаем карту, отцентрированную на Перми.
    ymap = new ymaps.Map("map", {
        center: [58.0048, 56.241077],
        zoom: 12
    });

    addPoints(ymap);

    /* fetch('http://pddd.perm.ru/obzornie_videokamery', {
        method: "GET",
        mode: "no-cors"
    }).then(function (response) { 
        var js = response.json();
        alert(js);
    }); */
}

function generateDotPreset(color) {
    return DEFAULT_PRESET + color + DOT_ICON;
}

function generateClusterPreset(color) {
    return DEFAULT_PRESET + color + CLUSTER_ICONS;
}

function switchOnStatus(onBranch, offBranch, otherBranch, status) {
    switch (status) {
        case ON: return onBranch.call(this);
        case OFF: return offBranch.call(this);
        default: return otherBranch.call(this);
    }
}

function colorFromStatus(status) {
    return switchOnStatus(
        function () { return ON_COLOR; },
        function () { return OFF_COLOR; },
        function () { return OTHER_COLOR; },
        status
    );
}

// Конструктор для кластеров.
function createCluster(status) {
    var cl = new ymaps.Clusterer({
        gridSize: 128, 
        maxZoom: 15,
        preset: generateClusterPreset(colorFromStatus(status))
    });

    cl.createCluster = function (center, geoObjects) {
        // Создаем метку-кластер с помощью стандартной реализации метода. 
        var clusterPlacemark = ymaps.Clusterer.prototype.createCluster.call(this, center, geoObjects);
        var geoObjectsLength = clusterPlacemark.getGeoObjects().length;
        
        var hintContent = switchOnStatus(
            function () { return 'Работающие камеры'; },
            function () { return 'Выключенные камеры'; },
            function () { return 'Нет информации о камере'; },
            status
        );
        
        clusterPlacemark.properties.set('hintContent', hintContent);
        return clusterPlacemark;
    };
    
    return cl;
}

function addPoints(ymap) {
    var data = Data.items;
   
    // Объект хранит кластеры для разных типов камер.
    var pts = {
        on: createCluster(ON),
        off: createCluster(OFF),
        other: createCluster(OTHER)
    };

    data.forEach(item => {
        addPoint.apply(pts, item)
    });

    // Группируем отдельно работающие, неработающие камеры.
    addObject(pts.on);
    addObject(pts.off);
    addObject(pts.other);
}

function addPoint(x, y, id, name, content, on) {    
    var content;
    var put;
    var color = colorFromStatus(on);
    
    // На основе входных данных присваиваем камере "цвет".
    switchOnStatus(
        function () {
            content = 'Камера работает.';
            put = 'on';
        }, function () { 
            content = 'На данный момент камера не работает.'; 
            put = 'off';
        }, function () { 
            content = 'Нет информации о камере.';
            put = 'other';
        }, on
    );

    // Создаем точку, которую в будущем поместим на карту.
    var place = new ymaps.GeoObject({
            geometry: {
                type: 'Point',
                coordinates: [x, y]
            },
            properties: {
                hintContent: name,
                balloonContentHeader: name,
                balloonContent: content
            }
        }, {
            preset: generateDotPreset(color)
        }
    );

    // Событие, возникающее при нажатии на точку.
    place.events.add('balloonopen', function (e) {
        // ToDo: write balloon open code here...
    });

    // Добавляем точку в кластер, соответствующий статусу камеры.
    this[put].add(place);

    return place;
}

function addObject(object) {
    ymap.geoObjects.add(object);
}