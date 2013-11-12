var argv = require('optimist')
    .usage('Converts Sparse Matrices collection (http://aws.amazon.com/datasets/2379) to npm module format.\nUsage: $0')
    .demand('s')
    .alias('s', 'src')
    .describe('s', 'Path to /MM folder from public dataset ')
    .default({'o': './out'})
    .alias('o', 'out')
    .describe('o', 'Path to outupt folder where results will be stored')
    .argv;

var readdirp = require('readdirp'),
    mkdirp = require('mkdirp'),
    mtxParser = require('ngraph.serialization/mtx'),
    fs = require('fs'),
    path = require('path');

readdirp({ root: argv.src, fileFilter: mtxFileFilter })
  .on('data', convertToNPMEntry);

function convertToNPMEntry(mtxFileEntry) {
  console.log('Processing ' + mtxFileEntry.fullPath);
  var mtxFile = fs.readFileSync(mtxFileEntry.fullPath, 'ascii');
  var graph = mtxParser.load(mtxFile);
  var storedGraph = mtxParser.saveToObject(graph);

  var outDir = path.join(argv.out, mtxFileEntry.parentDir);
  mkdirp.sync(outDir);

  var fileContent = 'module.exports = ' + JSON.stringify(storedGraph) + ';';
  var saveTo = path.join(outDir, 'index.js');
  fs.writeFileSync(saveTo, fileContent);
  console.log('Saved to ' + saveTo + '; Vertices: ' + graph.getNodesCount() + '; Edges: ' + graph.getLinksCount());
}

function mtxFileFilter(fileEntry) {
  if (path.extname(fileEntry.name) !== '.mtx') {
    return false;
  }

  var fileName = path.basename(fileEntry.name, '.mtx');
  return fileEntry.parentDir.match(new RegExp(fileName + '$'));
}
