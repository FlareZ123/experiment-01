'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const {actionTuple, archivedGame, firstRootDifference, comparePanels} =
  require('../scripts/aichi-actual-root-policy-diff.cjs');

/** @returns {object} Genuine-root-shaped synthetic fixture event. */
function root(actionOrdinal, action, other={}) {
  return {actionOrdinal, turnBefore:2, turnAfter:2, playerSlot:1,
    action, pendingPrompt:null, initiatingRootActionOrdinal:actionOrdinal,
    ...other};
}

/** @returns {object} Archived row with a versioned full first-episode deal. */
function row(actions, trial='rank6:A:reference', extras={}) {
  return {
    trial:{id:trial,rank:6},
    rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
    rootActionLedger:actions, rootActionLedgerSha256:'synthetic-a',
    sourceDealEpochs:{deals:[{episodeIndex:0,
      fullPhysicalDealDigestSha256:'full60-sha',
      sourceDealDigestSha256:'source60-sha',initialPrizeCounts:[6,6]}]},
    suddenDeathClockResets:[], ...extras
  };
}

/** @returns {object} Canonical archive panel with one registered trial. */
function panel(r) {
  return {schema:'canonical-development-fixture',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    attempted:1,rows:[r]};
}

test('native public root tuple preserves typed printed actions and prompt provenance',()=>{
  const item=root(2,'PlayCardAction',{card:'Speed Lightning Energy RCL',
    pendingPrompt:'ChooseCardsPrompt',turnAfter:3});
  assert.deepEqual(actionTuple(item),{
    actionOrdinal:2,turnBefore:2,turnAfter:3,playerSlot:1,
    action:'PlayCardAction',pendingPrompt:'ChooseCardsPrompt',
    initiatingRootActionOrdinal:2,card:'Speed Lightning Energy RCL',
    attack:null,ability:null
  });
});

test('identical first physical deals expose first fork even for failed rows',()=>{
  const prefix=[root(0,'PlayCardAction',{card:'Thunder Mountain Prism Star LOT'})];
  const off=row([...prefix,root(1,'PassTurnAction')],undefined,{
    winner:0,attackDeclarations:{source:1,candidate:4}
  });
  const on=row([...prefix,root(1,'AttackAction',{attack:'Volt Cyclone'})],
    undefined,{status:'engine-error',error:'tiebreak epoch veto'});
  const x=comparePanels(panel(off),panel(on));
  assert.equal(x.competitivelyQualifiedGames,0);
  assert.equal(x.pairs[0].firstDifferentRoot.ordinal,1);
  assert.equal(x.pairs[0].firstDifferentRoot.left.action,'PassTurnAction');
  assert.equal(x.pairs[0].firstDifferentRoot.right.attack,'Volt Cyclone');
  assert.equal(x.pairs[0].commonPrefixRoots,1);
  assert.equal(x.pairs[0].fullPhysicalFirstEpisodeMatched,true);
  assert.equal(x.pairs[0].treatment.error,'tiebreak epoch veto');
});

test('identical public root tuples do not imply identical full archived histories',()=>{
  const actions=[root(0,'AttackAction',{attack:'Volt Cyclone'})];
  const off=row(actions);
  const on=row(actions,undefined,{rootActionLedgerSha256:'synthetic-b'});
  const result=comparePanels(panel(off),panel(on)).pairs[0];
  assert.equal(result.samePublicRootTuples,true);
  assert.equal(result.fullRootLedgerSha256Equal,false);
  assert.equal(result.firstDifferentRoot,null);
});

test('a native clock restart is accounted for and retained as a censor',()=>{
  const old=root(0,'AttackAction',{attack:'Volt Cyclone'});
  const reset=root(1,'ResolvePromptAction',{turnBefore:4,turnAfter:0,
    pendingPrompt:'WaitPrompt'});
  const newEpisode={episodeIndex:1,fullPhysicalDealDigestSha256:'second60-sha',
    sourceDealDigestSha256:'new-source-sha',initialPrizeCounts:[6,6]};
  const withRestart=row([old,reset],undefined,{
    suddenDeathClockResets:[{actionOrdinal:1,fromTurn:4,toTurn:0}],
    sourceDealEpochs:{deals:[
      row([old]).sourceDealEpochs.deals[0],newEpisode
    ]}
  });
  assert.equal(archivedGame(withRestart).episodes.length,2);
  const compared=comparePanels(panel(withRestart),panel(row([old]))).pairs[0];
  assert.equal(compared.reference.nativeClockResets,1);
  assert.equal(compared.reference.nativeEpisodes,2);
  assert.equal(compared.competitiveQualified,false);
});

test('fail closed when episodes, source deals, or registered trial ids mismatch',()=>{
  const a=panel(row([root(0,'PassTurnAction')]));
  const b=panel(row([root(0,'PassTurnAction')]));
  b.rows[0].sourceDealEpochs.deals[0].fullPhysicalDealDigestSha256='mismatch';
  assert.throws(()=>comparePanels(a,b),/physical deal mismatch/);
  b.rows[0].sourceDealEpochs.deals[0].fullPhysicalDealDigestSha256='full60-sha';
  b.rows[0].trial.id='other-trial';
  assert.throws(()=>comparePanels(a,b),/same registered trials/);
  b.rows[0].trial.id=a.rows[0].trial.id;
  b.rows[0].sourceDealEpochs.deals.push({episodeIndex:1});
  assert.throws(()=>comparePanels(a,b),/additional physical deal/);
});

test('a strict prefix difference records absent first action without guessing intent',()=>{
  const x=firstRootDifference([root(0,'PassTurnAction')],[]);
  assert.equal(x.commonPrefixRoots,0);
  assert.equal(x.firstDifferentRoot.right,null);
  assert.equal(x.firstDifferentRoot.left.action,'PassTurnAction');
});
