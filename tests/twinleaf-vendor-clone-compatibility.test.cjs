'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {assertVendorCloneCompatibleSource} =
  require('../simulation/twinleaf/normalize-deep-clone.cjs');

test('pinned clone compatibility preflight rejects a readonly own field', () => {
  const source = Object.defineProperty({count:2}, 'protected', {
    value:5, enumerable:true, writable:false, configurable:true
  });
  assert.throws(
    () => assertVendorCloneCompatibleSource({source}),
    /cannot copy non-writable own properties/
  );

  // The actual vendor cloning pattern, Object.create(source) followed by
  // strict-mode property assignment, cannot write this inherited field.
  const dest = Object.create(source);
  assert.throws(() => {dest.protected = 5;}, TypeError);
});

test('compatibility check traverses nested readonly objects', () => {
  class ExampleCard {
    constructor() {
      this.attacks = [Object.freeze({name:'Retribution Strike'})];
    }
  }
  assert.throws(
    () => assertVendorCloneCompatibleSource({cards:[new ExampleCard()]}),
    /cannot copy non-writable own properties/
  );
});

test('ordinary game-shaped objects and readonly Array elements remain supported', () => {
  const basic = {cards:[{name:'Koraidon ex',damageTakenLastTurn:0}]};
  assert.doesNotThrow(() => assertVendorCloneCompatibleSource(basic));

  // Vendor deepClone uses Array.map(), which creates new writable indices.
  const frozenArray = Object.freeze([{name:'Energy'}, 3]);
  assert.doesNotThrow(
    () => assertVendorCloneCompatibleSource({cards:frozenArray})
  );
});

test('preflight catches silent losses of named properties on Arrays', () => {
  const cards = [{name:'Koraidon ex'}];
  cards.researchMarker = 'source marker';
  assert.throws(
    () => assertVendorCloneCompatibleSource({cards}),
    /drops custom Array own properties/
  );
  assert.equal(cards.map(item => item).researchMarker, undefined);

  const nonIndex = [{name:'Koraidon ex'}];
  nonIndex['00'] = 'not a canonical index';
  assert.throws(
    () => assertVendorCloneCompatibleSource({cards:nonIndex}),
    /drops custom Array own properties/
  );
});
