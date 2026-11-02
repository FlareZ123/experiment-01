'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'../..');
const OUTPUT=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
const SEED=198157155;
const SOURCE_DEALS={
  'champion-reference':'7ca732f19dcd4bc26e2cd0ff984b31a47392c5d6276f3e22daaab608a3099c39',
  'new-moon-lockbreaker-v1':'59409becd35dafc9e61ce9d91f66883d76afd7b5685a1b9d2114b68c26878c61'
};

/**
 * Read only the actual selected candidate Pass's own hand, public discard and
 * public boards; no decision receives this post-selection research evidence.
 * @param {object} state Genuine Store state.
 * @param {0|1} ownerSeat Original candidate physical seat.
 */
function inspectNightStretcherPass(state,ownerSeat){
  assert.ok(ownerSeat===0||ownerSeat===1);
  const owner=state.players[ownerSeat];
  const opponent=state.players[1-ownerSeat];
  const night=owner.hand.cards.some(c=>c.fullName==='Night Stretcher ASC');
  const eligible=new Set(['Dialga-GX','Latias ex']);
  const discarded=owner.discard.cards.filter(c=>eligible.has(c.name))
    .map(c=>c.fullName);
  return {
    turn:state.turn,ownerSeat,ownHandSize:owner.hand.cards.length,
    nightStretcherHeld:night,targetBasicDiscardPrintings:discarded,
    active:owner.active.getPokemonCard()?.name??null,
    benchCount:owner.bench.filter(x=>x.cards.length>0).length,
    ownerItemPlayLocked:owner.cannotPlayItemCards===true,
    ownerPokemonPlayLocked:owner.cannotPlayPokemonCards===true,
    opponentActive:opponent.active.getPokemonCard()?.name??null,
    opponentBench:opponent.bench.map(x=>x.getPokemonCard()?.name)
      .filter(Boolean),
    ownerOnlyAndPublicSource:true,competitiveQualifiedGame:false
  };
}

/**
 * Retrospective two-candidate real Store observation using the original rank5
 * physical seed and published original-60s; evidence remains developmental.
 */
function run(){
  const {Store}=require(path.join(OUTPUT,'game/store/store'));
  const {PassTurnAction}=require(path.join(OUTPUT,
    'game/store/actions/game-actions'));
  const frozen=JSON.parse(fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/agent41-frozen-bilateral-development-v2.json'),'utf8'));
  const options={...frozen.policyOptions,actorNaturalEvolutionRoot:true,
    actorMewGenesectTechnoBlast:true};
  const trials=Object.keys(SOURCE_DEALS).map(candidateId=>({
    rank:5,repeat:1,candidateSlot:'A',seed:SEED,candidateId,
    id:'5:1:A:'+candidateId
  }));
  const {runDevelopment}=require('../evaluation/agent41-bilateral-v2-development.cjs');
  const previous=Store.prototype.dispatch;
  const observed=[];
  const oldEnv=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  /** @param {object} action @param {...unknown} args */
  function observedDispatch(action,...args){
    const st=this.state;
    if(action instanceof PassTurnAction&&st.turn===24&&
       st.activePlayer===0&&
       action.playerId===st.players[0].id&&
       st.prompts.every(p=>p.result!==undefined))
      observed.push(inspectNightStretcherPass(st,0));
    return previous.call(this,action,...args);
  }
  Store.prototype.dispatch=observedDispatch;
  let result;
  try{
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    result=runDevelopment({...options,registeredTrials:trials,
      registeredFrameName:'agent20-retrospective-rank5-item-defensive-pass',
      allowAdditionalOriginalSourceRanks:true});
  }finally{
    Store.prototype.dispatch=previous;
    if(oldEnv===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=oldEnv;
  }
  assert.strictEqual(Store.prototype.dispatch,previous);
  assert.equal(result.attempted,2);
  const rows=result.rows.map(row=>({
    trial:row.trial,nativeError:row.error??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    historicalSourcePhysicalMatch:
      row.sourceDealFingerprint===SOURCE_DEALS[row.trial.candidateId],
    nativeEndReason:row.endReason??null,finished:row.finished??false,
    winner:row.winner??null,paperAndPolicyQualified:false
  }));
  return {
    schema:'agent20-rank5-night-stretcher-postdecision-v1',
    historicalSeed:SEED,sourceRank:5,candidateSeat:0,
    nativePolicyOptions:options,
    observedPass24:observed,rows,
    readOnlyStoreDispatchRestored:true,
    historicalSourceDealsMatch:rows.every(x=>x.historicalSourcePhysicalMatch),
    competitivelyQualifiedGames:0,
    note:'Retrospective read of already-selected Pass. No modified action or competitive win inference.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={inspectNightStretcherPass,run};
