'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {ticketStoneCrobat}=require('../scripts/aichi-ticket-stone-search.cjs');
test('rank26 direct Stone event',()=>assert.ok(Math.abs(ticketStoneCrobat(60,12,7,6).directRoute-0.0002043271707307589)<1e-12));
