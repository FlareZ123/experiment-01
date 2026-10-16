'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {assessFieldEvidence,countQualifiedWins}=require('../scripts/aichi-anytime-field-evidence.cjs');

/** @param {number} [loss] Index of a single nonwin cell. */
function round(loss=-1) {
  return Array.from({length:64},(_,i)=>({
    rank:(i%32)+1,startingSeat:i<32?'first':'second',
    outcome:i===loss?'loss':'win'
  }));
}
