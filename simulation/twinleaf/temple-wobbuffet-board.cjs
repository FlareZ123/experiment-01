'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(root,name));

module.exports={};
