'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {captureAction, restoreAction, SCHEMA} =
  require('../simulation/twinleaf/source-action-value-codec.cjs');

class OptionalAction {
  constructor() {
    this.log = undefined;
    this.result = [null, {extra:undefined, zero:-0}];
    Object.defineProperty(this, 'hidden', {
      value:'retained', enumerable:false, configurable:false, writable:false
    });
  }
}

test('undefined is distinct from null and survives a JSON archive roundtrip', () => {
  const input = new OptionalAction();
  const archive = JSON.parse(JSON.stringify(captureAction(input)));
  assert.equal(archive.schema, SCHEMA);
  const copy = restoreAction(archive, {OptionalAction});
  assert.ok(copy instanceof OptionalAction);
  assert.ok(Object.hasOwn(copy, 'log'));
  assert.equal(copy.log, undefined);
  assert.equal(copy.result[0], null);
  assert.ok(Object.hasOwn(copy.result[1], 'extra'));
  assert.equal(copy.result[1].extra, undefined);
  assert.ok(Object.is(copy.result[1].zero, -0));
  assert.deepEqual(Object.getOwnPropertyDescriptors(copy),
    Object.getOwnPropertyDescriptors(input));
});

test('prototype pollution-looking field name remains an own data property', () => {
  const input = new OptionalAction();
  Object.defineProperty(input, '__proto__', {
    value:{safe:true}, enumerable:true, configurable:true, writable:true
  });
  const copy = restoreAction(JSON.parse(JSON.stringify(captureAction(input))),
    {OptionalAction});
  assert.equal(Object.getPrototypeOf(copy), OptionalAction.prototype);
  assert.ok(Object.hasOwn(copy, '__proto__'));
  assert.equal(copy.__proto__.safe, true);
});

test('identity aliases and cycles fail closed until reference encoding exists', () => {
  const input = new OptionalAction();
  const shared = {x:1};
  input.a = shared;
  input.b = shared;
  assert.throws(() => captureAction(input), /Repeated object identity/);
  delete input.b;
  shared.cycle = shared;
  assert.throws(() => captureAction(input), /Repeated object identity/);
});

test('nested engine card instances require identity-aware prompt mapping', () => {
  class Card { constructor() { this.fullName = 'Pidgey MEW'; } }
  const input = new OptionalAction();
  input.result = [new Card()];
  assert.throws(() => captureAction(input), /Class instance/);
});

test('accessors, symbols, sparse arrays and unreviewed action classes fail', () => {
  const input = new OptionalAction();
  Object.defineProperty(input, 'getter', {configurable:true, get() { throw Error('MUST NOT RUN'); }});
  assert.throws(() => captureAction(input), /Accessor property/);
  delete input.getter;
  input[Symbol('private')] = 1;
  assert.throws(() => captureAction(input), /Symbol key/);
  delete input[Object.getOwnPropertySymbols(input)[0]];
  input.result = new Array(3);
  input.result[0] = 'only';
  assert.throws(() => captureAction(input), /Nonstandard array slot/);
  input.result = [];
  const payload = JSON.parse(JSON.stringify(captureAction(input)));
  assert.throws(() => restoreAction(payload, {}), /Unknown action class/);
});
