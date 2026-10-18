'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {auditSourcePass}=require('../simulation/twinleaf/rank11-turn23-pass-resource-audit.cjs');

/** @param {string[]} afterMarnie @param {string[]} attached */
function example(afterMarnie,attached=[]) {
  const beforeHand=['Marnie','Shopping Center','Float Stone'];
  const ownerActions=[
    {actionOrdinal:217,playerSlot:0,turnBefore:23,action:'PlayCardAction',card:'Float Stone'},
    {actionOrdinal:218,playerSlot:0,turnBefore:23,action:'PlayCardAction',card:'Shopping Center'},
    {actionOrdinal:220,playerSlot:0,turnBefore:23,action:'PlayCardAction',card:'Marnie'},
    ...attached.map((action,i)=>({actionOrdinal:221+i,playerSlot:0,turnBefore:23,action})),
    {actionOrdinal:223,playerSlot:0,turnBefore:23,action:'PassTurnAction'}
  ];
  return {
    rootActionLedger:ownerActions,
    decisionTrace:[
      {actionOrdinal:217,turnBefore:23,playerSlot:0,action:'PlayCardAction',card:'Float Stone',
        decisionHandBefore:{perspectiveSeat:0,ownHandPrintings:beforeHand,opponentHandSize:2}},
      {actionOrdinal:220,turnBefore:23,playerSlot:0,action:'PlayCardAction',card:'Marnie',
        decisionHandBefore:{perspectiveSeat:0,ownHandPrintings:beforeHand,opponentHandSize:2}},
      {actionOrdinal:223,turnBefore:23,playerSlot:0,action:'PassTurnAction',
        decisionHandBefore:{perspectiveSeat:0,ownHandPrintings:afterMarnie,opponentHandSize:4},
        publicBoardBeforePass:[{
          active:{name:'Mega Absol ex',energyCards:['Darkness Energy SVE'],printedAttacks:[]}
        },{active:{name:'Mewtwo & Mew-GX'}}]}
    ]
  };
}

test('retrospective one-Darkness pass flags an unspent Basic Darkness when present',()=>{
  const a=auditSourcePass(example(['Darkness Energy SVE','Carmine']));
  assert.equal(a.printedSingleDarknessInsufficientForMegaAbsolTerminalPeriod,true);
  assert.equal(a.potentialBasicDarknessAttachmentMiss,true);
  assert.deepEqual(a.handBasicDarknessPrintings,['Darkness Energy SVE']);
});

test('no Basic Darkness means no positive basic-attachment flag',()=>{
  const a=auditSourcePass(example(['Marnie','Float Stone','Double Colorless Energy']));
  assert.equal(a.potentialBasicDarknessAttachmentMiss,false);
  assert.deepEqual(a.handEnergyPrintings,['Double Colorless Energy']);
});

test('actual attachment on the turn defeats the missed-manual-attachment flag',()=>{
  const a=auditSourcePass(example(['Darkness Energy SVE'],['AttachEnergyAction']));
  assert.equal(a.observedManualEnergyActions.length,1);
  assert.equal(a.potentialBasicDarknessAttachmentMiss,false);
});

test('do not extrapolate if Pass lacks own-hand evidence',()=>{
  const game=example([]);
  delete game.decisionTrace.at(-1).decisionHandBefore;
  assert.throws(()=>auditSourcePass(game),/perspectiveSeat/);
});
