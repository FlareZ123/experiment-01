'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {ticketStoneMeloetta}=require('../scripts/aichi-ticket-stone-meloetta.cjs');
test('rank26 direct Meloetta co-access',()=>{const x=ticketStoneMeloetta(60,12,7,6);assert.ok(Math.abs(x.firstEight-0.00001900326602798801)<1e-12);assert.ok(Math.abs(x.meloettaInitially-0.000016627857774489508)<1e-12);});
