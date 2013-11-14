var argv = require('optimist')
    .usage('Converts Sparse Matrices collection (http://aws.amazon.com/datasets/2379) to npm module format.\nUsage: $0')
    .demand('s')
    .alias('s', 'src')
    .describe('s', 'Path to /MM folder from public dataset ')
    .boolean(['readme', 'cjs'])
    .default({
      'o': './out',
      'r': true,
      'c': true
    })
    .alias('o', 'out').describe('o', 'Path to outupt folder where results will be stored')
    .alias('r', 'readme').describe('r', 'Generate readme file')
    .alias('c', 'cjs').describe('c', 'Generate cjs file format output. If false - simple json is dumped')
    .argv;

var readdirp = require('readdirp'),
    mkdirp = require('mkdirp'),
    mtxParser = require('ngraph.serialization/mtx'),
    fs = require('fs'),
    allEntries = [],
    path = require('path');

readdirp({ root: argv.src, fileFilter: mtxFileFilter })
  .on('data', convertToNPMEntry);


function convertToNPMEntry(mtxFileEntry) {
  console.log('Processing ' + mtxFileEntry.fullPath);
  var mtxFile = fs.readFileSync(mtxFileEntry.fullPath, 'ascii'),
      graph = mtxParser.load(mtxFile),
      storedGraph = mtxParser.saveToObject(graph);

  var outDir = path.join(argv.out, mtxFileEntry.parentDir);
  mkdirp.sync(outDir);

  if (graph.description) {
    storedGraph.description = graph.description;
  }
  var savedFileName = saveJavaScriptFile(storedGraph, outDir);
  if (argv.readme) {
    saveReadmeFile(graph.description, outDir);
  }

  allEntries.push(mtxFileEntry.parentDir);
  console.log('Saved to ' + savedFileName + '; Vertices: ' + graph.getNodesCount() + '; Edges: ' + graph.getLinksCount());
}

function saveJavaScriptFile(graphObject, outDir) {
  var fileContent,
      saveTo = path.join(outDir, 'index.js');
  if (argv.cjs) {
    fileContent = 'module.exports = ' + JSON.stringify(graphObject) + ';';
  } else {
    fileContent = JSON.stringify(graphObject);
  }
  fs.writeFileSync(saveTo, fileContent);
  return saveTo;
}

function saveReadmeFile(description, outDir) {
  if (!description) { return; }

  var saveTo = path.join(outDir, 'Readme.md');

  var lines = description.split('\n'),
      content = [],
      name = '';
  for (var i = 0; i < lines.length; ++i) {
    if (!lines[i].length) {
      continue;
    }
    var firstChar = lines[i][0];
    if (firstChar === '%' || firstChar === '-') {
      // Skip header and separators
      continue;
    } 
    var nameMatch = lines[i].match(/ name: (.*)/);
    if (nameMatch) {
      name = nameMatch[1];
    } else {
      content.push(lines[i]);
    }
  }

  if (name) {
    content.unshift('# ' + name);
    var thumbnail = 'http://www2.research.att.com/~yifanhu/GALLERY/GRAPHS/GIF_SMALL/' + name.replace('/', '@') + '.gif';
    content.push('![' + name + '](' + thumbnail + ')');
  }

  fs.writeFileSync(saveTo, content.join('\n\n'));
}

function mtxFileFilter(fileEntry) {
  if (path.extname(fileEntry.name) !== '.mtx') {
    return false;
  }

  var fileName = path.basename(fileEntry.name, '.mtx');
  return fileEntry.parentDir.match(new RegExp(fileName + '$'));
}
