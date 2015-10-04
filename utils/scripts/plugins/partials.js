var Fs = require('fs');
var Path = require('path');
/**
 * Map handlebars partials as { $partialName: $partialPath/$partialName }
 */
module.exports = function mapHandlebarsPartials (metalsmith, layoutPath, partialPath) {

    var fullPath = metalsmith.path(layoutPath, partialPath);
    var partials = {};

    Fs.readdirSync(fullPath).forEach(function (file) {

        if ( Path.extname(file) !== '.html') { return; }
        var partialName = Path.basename(file, '.html');
        partials[partialName] = Path.join(partialPath, partialName);
    });

    return partials;
};
