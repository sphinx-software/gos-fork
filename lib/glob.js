const _ = require('lodash');
const glob = require('glob');

exports.getGlobbedFiles = (globPatterns, removeRoot) => {
    // URL paths regex
    const urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    let output = [];
    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(globPattern => {
            output = _.union(output, exports.getGlobbedFiles(globPattern, removeRoot));
        });
    } else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        } else {
            let files = glob.sync(globPatterns);
            if (removeRoot) {
                files = _.map(files, file => file.replace(removeRoot, ''));
            }
            output = _.union(output, files);
        }
    }
    return output;
};