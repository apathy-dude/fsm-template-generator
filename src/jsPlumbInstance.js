var instance = jsPlumb.getInstance({
    Endpoint: ['Dot', { radius: 2}],
    HoverPaintStyle: { strokeStyle: '#1E8151', lineWidth: 2 },
    ConnectionOverlays: [
        [ 'Arrow', {
            location: 1,
            id: 'arrow',
            length: 14,
            foldback: 0.8
        }],
        [ 'Label', { label: 'transition', id: 'label', cssClass: 'aLabel' }]
    ],
    Container: 'main-content'
});

module.exports = instance;
