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

    var initial = fsm.initial.name || '';

    var out = ""
        .concat("var fsm = new machina.BehavioralFsm({\n")
        .concat("\tinitialize: function(options) {\n")
        .concat("\t},\n")
        .concat("\tnamespace: '" + fsm.name + "',\n")
        .concat("\tinitialState: '" + initial + "',\n")
        .concat("\tstates: {\n");
        
    for(var s in fsm.states)
        out = appendState(out, fsm.states[s], 2);

    out = out
        .concat("\t}\n")
        .concat("});\n");

    return out;
};
