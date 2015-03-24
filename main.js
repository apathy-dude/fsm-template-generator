var plumb = require('./src/jsPlumbInstance');
var genOutput = require('./src/outputGenerator');

var fsm = {
    name: "",
    states: {}
};

var generationVisible = false;

function generate() {
    if(generationVisible)
        document.getElementById('output').value = genOutput(fsm);
}

function* idGenerator(prefix) {
    var index = 0;
    while(++index)
        yield prefix + index;
}

var menuIdGenerator = idGenerator('menu_');

var mainDOM = document.getElementById('main-content');
mainDOM.style.height = window.innerHeight + "px";
var detailDOM = document.getElementById('details');

var details = {
    state: null,
    connection: null
};

function removeSelectedDetail() {
    var d;
    for(d in details) {
        var detail = details[d];
        if(detail)
            detail.classList.remove('selected');
        details[d] = null;
    }

    for(d in detailDOM.children) {
        var dom = detailDOM.children[d];
        if(dom.style)
            dom.classList.remove('visible');
    }
}

document.body.onresize = function(e) {
    mainDOM.style.height = window.innerHeight + "px";
};

document.getElementById('namespace').onchange = function(e) {
    fsm.name = e.target.value;
    generate();
};

document.getElementById('add-state').onclick = function(e) {
    var id = menuIdGenerator.next().value;
    var state = { name: "", transitions: {} };

    var menu = document.createElement('div');
    menu.classList.add('menu');
    menu.id = id;

    var text = document.createElement('p');
    text.textContent = '';
    menu.appendChild(text);

    var point = document.createElement('div');
    point.classList.add('point');
    menu.appendChild(point);

    var menuTop = (window.innerHeight) / 2;
    var menuLeft = (window.innerWidth) / 2;

    menu.style.top = menuTop + "px";
    menu.style.left = menuLeft + "px";

    mainDOM.appendChild(menu);

    plumb.draggable(menu);

    fsm.states[id] = state;

    var stateDetailDOM = document.getElementById('state-details');

    plumb.makeSource(menu, {
        filter: '.point',
        anchor: 'Continuous',
        connector: [ 'StateMachine', { curviness: 20 } ],
        connectorStyle: { strokeStyle: '#5C96BC', lineWidth: 2, outlineColor: 'transparent', outlineWidth: 4 },
        maxConnections: -1
    });
    plumb.makeTarget(menu, {
        dropOptions: { hoverClass: 'dragHover' },
        anchor: 'Continuous',
        allowLoopback: true
    });

    function select(e) {
        removeSelectedDetail();

        details.state = menu;
        menu.classList.add('selected');
        stateDetailDOM.classList.add('visible');

        var stateName = document.getElementById('state-name');
        var stateClose = document.getElementById('state-close');
        var stateDelete = document.getElementById('state-delete');

        stateName.value = fsm.states[id].name;

        function closeStateDetail() {
            details[state] = null;
            stateDetailDOM.classList.remove('visible');
            stateClose.onclick = undefined;
            stateDelete.onclick = undefined;
        }

        stateName.onchange = function(e) {
            fsm.states[id].name = stateName.value;
            menu.children[0].textContent = stateName.value;
            generate();
        };
        stateClose.onclick = function(e) {
            menu.classList.remove('selected');
            closeStateDetail();
        };
        stateDelete.onclick = function(e) {
            menu.parentNode.removeChild(menu);
            plumb.remove(menu);
            delete fsm.states[id];
            closeStateDetail();
            generate();
        };
    }

    menu.onmousedown = select;

    select();
    generate();
};

document.getElementById('output-gen').onclick = function(e) {
    document.getElementById('output-display').classList.add('visible');
    generate();
    generationVisible = true;
};

document.getElementById('output-hide').onclick = function(e) {
    document.getElementById('output-display').classList.remove('visible');
    generationVisible = false;
};

plumb.bind('ready', function jsPlumbBind() {
    var transitionDetailDOM = document.getElementById('transition-details');

    var transitionName = document.getElementById('transition-name');
    var transitionClose = document.getElementById('transition-close');
    var transitionDelete = document.getElementById('transition-delete');

    function closeTransitionDetail() {
        details.connection = null;
        transitionDetailDOM.classList.remove('visible');
        transitionClose.onclick = undefined;
        transitionDelete.onclick = undefined;
    }

    function select(conn) {
        removeSelectedDetail();
        var detail = conn.canvas;
        details.connection = detail;
        detail.classList.add('selected');
        transitionDetailDOM.classList.add('visible');
        transitionName.value = conn.getOverlay('label').getLabel();

        transitionName.onchange = function(e) {
            var name = transitionName.value;
            fsm.states[conn.sourceId].transitions[conn.id].name = name;
            conn.getOverlay('label').setLabel(name);
            generate();
        };
        transitionClose.onclick = function(e) {
            detail.classList.remove('selected');
            closeTransitionDetail();
        };
        transitionDelete.onclick = function(e) {
            delete fsm.states[conn.sourceId].transitions[conn.id];
            plumb.detach(conn);
            closeTransitionDetail();
        };
    }

    plumb.bind('click', function(conn) {
        select(conn);
    });

    plumb.bind('connection', function(conn) {
        fsm.states[conn.sourceId].transitions[conn.connection.id] = { target: conn.targetId, name: 'transition' };
        conn.connection.getOverlay('label').setLabel("transition");
        select(conn.connection);
        generate();
    });

    plumb.bind('beforeDetach', function(conn) {
        delete fsm.states[conn.sourceId].transitions[conn.id];
        genOutput(fsm);
    });
});

