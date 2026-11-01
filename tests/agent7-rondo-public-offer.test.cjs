'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {offerPublicRondo}=require('../simulation/twinleaf/agent7-public-rondo-attack-offer.cjs');

test('exports a public attack offer',()=>assert.equal(typeof offerPublicRondo,'function'));
