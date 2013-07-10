#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtml = function(html) {
    return cheerio.load(html);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checking = function(checksfile, che) {
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = che(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
}

var checkHtmlFile = function(htmlfile, checksfile) {    
    $ = cheerioHtml(fs.readFileSync(htmlfile).toString());    
    return checking(checksfile, $);    
};

var checkHtml = function(html, checksfile) {
    $ = cheerioHtml(html);
    return checking(checksfile, $);    
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var writeJson = function(json) {
  var outJson = JSON.stringify(json, null, 4);
  console.log(outJson);
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <html_url>', 'URL of a webpage')
        .parse(process.argv);

    if (program.url) {      
      rest.get(program.url).on('complete', function(result) {
        if (result instanceof Error) {
          console.log('Error retrieving the URL: ' + result.message);          
        } else {          
          var checkJson = checkHtml(result, program.checks);          
          writeJson(checkJson);
        }
      });      
    }
    else {
      var checkJson = checkHtmlFile(program.file, program.checks);    
      writeJson(checkJson);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
