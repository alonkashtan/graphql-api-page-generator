module.exports ={
    addImplementors: function(types, interfaces) {
        // Go over all types
        for (var i in types) {
            if (!types.hasOwnProperty(i))
                continue;
            let typeInterfaces = types[i].interfaces;
            // Go over interfaces this type implements
            for (var j in typeInterfaces) {
                if (!typeInterfaces.hasOwnProperty(j))
                    continue;
                interfaces.
                    filter(intfc => intfc.name.value === typeInterfaces[j].name.value).
                    forEach(intfc => {
                        if (!intfc.implementors)
                            intfc.implementors = [];
                        intfc.implementors.push(types[i].name.value);
                    });
            }
        }
    }
}