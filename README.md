Sparse Matrices Converter
=========================

Converts [collection of sparse matrices](http://www.cise.ufl.edu/research/sparse/matrices/)
from University of Florida to NPM format.


Usage
=====

```
Options:
  -s, --src     Path to /MM folder from public dataset                             [required]
  -o, --out     Path to outupt folder where results will be stored                 [default: "./out"]
  -r, --readme  Generate readme file                                               [default: true]
  -c, --cjs     Generate cjs file format output. If false - simple json is dumped  [default: true]

Example:
  node ./index.js -s ./mm
```

Licnese
=======
MIT
