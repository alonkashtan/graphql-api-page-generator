const sanitize = require('sanitize-html');

module.exports = function(schema){

    let visited = new Set(); //prevents infinite loops

    function sanitizeBranch(branch){
        for(let item in branch){
            if (branch.hasOwnProperty && !branch.hasOwnProperty(item)) continue;

            if (typeof branch[item] === 'string'){
                branch[item] = sanitize(branch[item]);
            }

            // recursion needed and prevent loops
            if (typeof branch[item] === 'object' && !visited.has(branch[item])){
                visited.add(branch[item]);
                sanitizeBranch(branch[item]);

                if (item === 'description'){
                    branch[item].text = sanitize(branch[item].value, { allowedTags: [] });
                }
            }
        }
    }

    sanitizeBranch(schema);
}