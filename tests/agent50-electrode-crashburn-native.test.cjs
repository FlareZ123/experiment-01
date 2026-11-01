'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const native=name=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',name));
