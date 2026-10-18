'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const test=require('node:test');
const {PROTOCOL,inspectRootActionLedger}=
  require('../scripts/aichi-root-action-ledger.cjs');

const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

function fixture() {
  const root=[
    {actionOrdinal:0,action:'PlayCardAction',card:'Quick Ball',
      playerSlot:0,turnBefore:1,turnAfter:1,pendingPrompt:null},
    {actionOrdinal:1,action:'UseAbilityAction',ability:'Perfection',
      playerSlot:0,turnBefore:1,turnAfter:1,pendingPrompt:null},
    {actionOrdinal:2,action:'ResolvePromptAction',
      playerSlot:0,turnBefore:1,turnAfter:2,pendingPrompt:'ChooseAttackPrompt',
      attackChoice:{printing:'Gengar & Mimikyu-GX TEU 53',
        attackName:'Poltergeist',attackIndex:1,sourceIndex:0}},
    {actionOrdinal:3,action:'AttackAction',attack:'Shadow Mist',
      playerSlot:1,turnBefore:2,turnAfter:3,pendingPrompt:null}
  ];
  const selected=[{...root[1]},{
    actionOrdinal:2,action:'ResolvePromptAction',playerSlot:0,
    turnBefore:1,turnAfter:2,attackChoice:{selection:{
      printing:'Gengar & Mimikyu-GX TEU 53',attackName:'Poltergeist'}}
  },{...root[3]}];
  const declared=[{
    kind:'engine-attack-declaration',actionOrdinal:2,
    triggerAction:'ResolvePromptAction',triggerPlayerSlot:0,
    turnBefore:1,turnAfter:2,attackName:'Poltergeist'
  }];
  return {actions:4,traceSummary:{
    rootActionLedgerProtocol:PROTOCOL,rootActionLedger:root,
    rootActionLedgerSha256:hash(root),
    chronologicalActionTrace:selected,
    attackDeclarationTrace:declared
  }};
}

test('complete Store ledger joins delegated chosen printing and logged attack',()=>{
  const f=fixture();
  const a=inspectRootActionLedger(f);
  assert.equal(a.status,'complete-root-ledger-self-consistent');
  assert.equal(a.events.length,4);
  assert.equal(a.joinedAttackDeclarations,1);
  assert.equal(a.events[2].attackChoice.printing,'Gengar & Mimikyu-GX TEU 53');
});
test('an omitted root action cannot make a digest-valid selective trace complete',()=>{
  const f=fixture();
  f.traceSummary.rootActionLedger.splice(0,1);
  f.traceSummary.rootActionLedgerSha256=hash(f.traceSummary.rootActionLedger);
  assert.equal(inspectRootActionLedger(f).status,'root-ledger-integrity-mismatch');
});
test('wrong selected printing fails despite valid root-ledger hash',()=>{
  const f=fixture();
  f.traceSummary.chronologicalActionTrace[1].attackChoice.selection.printing='Other printing';
  assert.equal(inspectRootActionLedger(f).status,'root-ledger-integrity-mismatch');
});
test('a contradictory Store log trigger or attack name fails closed',()=>{
  const f=fixture();
  f.traceSummary.attackDeclarationTrace[0].triggerPlayerSlot=1;
  assert.equal(inspectRootActionLedger(f).status,'root-ledger-integrity-mismatch');
  f.traceSummary.attackDeclarationTrace[0].triggerPlayerSlot=0;
  f.traceSummary.attackDeclarationTrace[0].attackName='Timeless-GX';
  assert.equal(inspectRootActionLedger(f).status,'root-ledger-integrity-mismatch');
});
test('older selective-only archives remain explicitly unverified',()=>{
  const f=fixture();
  delete f.traceSummary.rootActionLedgerProtocol;
  assert.equal(inspectRootActionLedger(f).status,'root-ledger-unavailable');
});
