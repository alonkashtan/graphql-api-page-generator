const sanitize = require('sanitize-html');

module.exports = function(schema){

    function sanitizeBranch(branch){
        for(let item in branch){
            if (!branch.hasOwnProperty(item)) continue;

            if (typeof branch[item] === 'string'){
                branch[item] = sanitize(branch[item]);
            }

            if (typeof branch[item] === 'object'){
                sanitizeBranch(branch[item]);

                if (item === 'description'){
                    branch[item].text = sanitize(branch[item].value, { allowedTags: [] });
                }
            }
        }
    }

    sanitizeBranch(schema);
}