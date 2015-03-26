(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

document.getElementById('initial').onchange = function(e) {
    fsm.initial = e.target.value;
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


},{"./src/jsPlumbInstance":2,"./src/outputGenerator":3}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = function(fsm) {
    function appendTransition(out, target, transition, indent) {
        var ind = "";
        for(var i = 0; i < indent; i++)
            ind += "\t";

        out = out
            .concat(ind + transition + ": '" + target + "',\n");

        return out;
    }

    function appendState(out, state, indent) {
        var ind = "";
        for(var i = 0; i < indent; i++)
            ind += "\t";

        out = out
            .concat(ind + state.name + ": {\n")
            .concat(ind + "\t_onEnter: function(client) {\n")
            .concat(ind + "\t},\n")
            .concat(ind + "\t_onExit: function(client) {\n")
            .concat(ind + "\t},\n");

        for(var t in state.transitions) {
            var trans = state.transitions[t];
            out = appendTransition(out, fsm.states[trans.target].name, trans.name, indent + 1);
        }

        out = out.concat(ind + "},\n");

        return out;
    }

    var out = ""
        .concat("var fsm = new machina.BehavioralFsm({\n")
        .concat("\tinitialize: function(options) {\n")
        .concat("\t},\n")
        .concat("\tnamespace: '" + fsm.name + "',\n")
        .concat("\tinitialState: '" + fsm.initial + "',\n")
        .concat("\tstates: {\n");
        
    for(var s in fsm.states)
        out = appendState(out, fsm.states[s], 2);

    out = out
        .concat("\t}\n")
        .concat("});\n");

    return out;
};

},{}]},{},[2,3,1]);
