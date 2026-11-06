'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {compose, run, write, VERSION} =
  require('../simulation/evaluation/agent35-rank11-firstturn-family-native-v4.cjs');

const SOURCE = '11:102:A:champion-reference';
const FAMILY_VERSION =
  'agent49-firstturn-source-call-for-family-owner-bench-prompt-v1';
const familyAudit = () => ({
  version: FAMILY_VERSION,
  genuineOwnerBasicDeckPrompts: 1,
  ownerBasicPromptAnswersNativeAccepted: 1,
  oneOriginalBasicMovedToBench: 1,
  physicalBenchTransferFailures: 0
});

test('real wrapper ordering keeps Letter last and delegates Family search', () => {
  const calls = [];
  const letter = next => {
    calls.push('letter-install');
    const child = next();
    calls.push('letter-uninstall');
    return {result: child, audit: {searchPromptsSettled: 1}};
  };
  const family = next => {
    calls.push('family-install');
    const child = next();
    calls.push('family-uninstall');
    return {result: child, audit: familyAudit()};
  };
  const actual = compose(() => {
    calls.push('native-match');
    return 7;
  }, {}, letter, family);
  assert.deepEqual(calls, [
    'letter-install', 'family-install', 'native-match',
    'family-uninstall', 'letter-uninstall'
  ]);
  assert.equal(actual.result, 7);
  assert.equal(actual.audit.searchPromptsSettled, 1);
  assert.equal(actual.familyAudit.oneOriginalBasicMovedToBench, 1);
});

function fixture(opts = {}) {
  const tape = [
    {actionOrdinal: 11, action: 'PlayCardAction'},
    {actionOrdinal: 16, action: 'PlayCardAction'},
    {actionOrdinal: 17, action: 'AttackAction',
      attack: opts.noAttack ? 'Super Poison Breath' : 'Call for Family'}
  ];
  const record = {
    sourceOriginalRegistration: SOURCE,
    exactOriginalDeal: true,
    identicalOriginalRootPrefix: true,
    nativeLetterAccepted: true,
    nativeLetterPhysicalTwoDarkness: true,
    allEightOriginalNativeDispositions: Array.from({length: 8},
      (_, i) => ({id: i, status: i === 4 ? 'engine-error' : null})),
    sourceAttackCustody: {
      nativeSourceTurnRootActions: tape,
      beforeAndAfterSourceTurnAttackTransitions: []
    },
    lateLetterAudit: {searchPromptsSettled: 1},
    actualSourceDisposition: 'engine-error'
  };
  const late = ({wrapper}) => {
    const wrapped = wrapper(() => 'native-result', {});
    assert.equal(wrapped.result, 'native-result');
    return {ownerLetterSearchAudit: wrapped.audit};
  };
  const observe = ({lateRun}) => {
    lateRun({registration: {selectedOriginalId: SOURCE},
      baseRun: () => 'native'});
    return record;
  };
  return {
    observe, late,
    letter: next => ({result: next(), audit: {searchPromptsSettled: 1}}),
    family: next => ({result: next(), audit: familyAudit()})
  };
}

test('native classification keeps all eight original arms and zero wins', () => {
  const actual = run(fixture());
  assert.equal(actual.schema, VERSION);
  assert.equal(actual.originalSourceAttackAction.actionOrdinal, 17);
  assert.equal(actual.physicalCallForFamilyBasicToBench, true);
  assert.equal(actual.sourceAttackSettled, false);
  assert.equal(actual.opponentStrategicReplyIndependentlyQualified, false);
  assert.equal(actual.failureInclusiveEight.length, 8);
  assert.equal(actual.competitivelyQualifiedGames, 0);
  assert.equal(actual.fieldWinRate, null);
});

test('source-root custody rejects substituted non-Family attack', () => {
  assert.throws(() => run(fixture({noAttack: true})),
    /Call for Family root must survive/);
});

test('native report requires genuine physical Bench settlement', () => {
  const deps = fixture();
  deps.family = next => ({
    result: next(),
    audit: {...familyAudit(), oneOriginalBasicMovedToBench: 0,
      physicalBenchTransferFailures: 1}
  });
  const actual = run(deps);
  assert.equal(actual.physicalCallForFamilyBasicToBench, false);
  assert.equal(actual.competitivelyQualifiedGames, 0);
});

test('lock-protected atomic native receipt and reread digest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),
    'agent35-family-v4-'));
  const file = path.join(dir, 'result.json');
  try {
    const result = run(fixture());
    const saved = write(file, result);
    assert.ok(saved.bytes > 0);
    assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), result);
    const lock = file + '.lock';
    const fd = fs.openSync(lock, 'wx');
    try {
      assert.throws(() => write(file, result), /EEXIST/);
    } finally {
      fs.closeSync(fd);
      fs.unlinkSync(lock);
    }
  } finally {
    fs.rmSync(dir, {force: true, recursive: true});
  }
});
