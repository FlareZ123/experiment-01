'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {initializeCards,runMatch}=require('./headless.cjs');

/** @param {unknown} object */
const digest=object=>createHash('sha256').update(JSON.stringify(object)).digest('hex');

/**
 * Observe only the genuine root Store's Battle Compressor selection actions.
 * Read the prompt before dispatch; never change the answer, source Card or state.
 * Speculative stores created during AI decisions are deliberately excluded.
 *
 * @template T
 * @param {Function} Store Compiled pinned engine Store class.
 * @param {()=>T} work A single source-dealt engine match.
 * @returns {{result:T,rootDispatches:number,selections:object[]}}
 */
function withBattleCompressorSourceSelections(Store,work) {
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  let root=null,rootDispatches=0;
  const selections=[];
  function observed(action,...rest) {
    if(root===null && action?.constructor?.name==='AddPlayerAction')root=this;
    if(this!==root)return original.value.call(this,action,...rest);
    const actionName=action?.constructor?.name;
    const step=rootDispatches++;
    let selected=null;
    if(actionName==='ResolvePromptAction') {
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      if(prompt?.constructor?.name==='ChooseCardsPrompt' &&
         prompt.player?.deck===prompt.cards &&
         prompt.player.supporter.cards.some(c=>c.name==='Battle Compressor')) {
        selected={
          step,turn:this.state.turn,
          playerSeat:this.state.players.indexOf(prompt.player),
          promptMin:prompt.options.min,promptMax:prompt.options.max,
          selectionCount:Array.isArray(action.result)?action.result.length:null,
          pendingCardNames:Array.isArray(action.result)?
            action.result.map(c=>typeof c==='number' ?
              prompt.cards.cards[c]?.fullName??null : c?.fullName??null):null
        };
      }
    }
    try {
      const returned=original.value.call(this,action,...rest);
      if(selected)selections.push({...selected,dispatch:'accepted'});
      return returned;
    } catch(error) {
      if(selected)selections.push({...selected,dispatch:'rejected',
        error:String(error.message)});
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:observed});
  try {
    return {result:work(),rootDispatches,selections};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

/**
 * Use the fixed Aichi rank-1/rank-10 source printing resolver; compare
 * corrected and pinned behavior under the same physical seat and seed.
 * These bounded generic-bot games are exposure diagnostics, not win evidence.
 */
function auditSource() {
  initializeCards();
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const opponent=plan.opponents.find(o=>o.rank===10);
  assert.equal(opponent?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent.cards.length,60);
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const originalDispatch=Store.prototype.dispatch;
  const cases=[];
  for(const candidateSeat of [0,1]) {
    const seed=20261017+candidateSeat;
    for(const corrected of [false,true]) {
      const request={
        deckA:candidateSeat===0?plan.candidate.cards:opponent.cards,
        deckB:candidateSeat===1?plan.candidate.cards:opponent.cards,
        seed,maxActions:120,
        strictPromptValidation:true,isolatePolicyRandomness:true,
        captureDecisionTrace:true,
        battleCompressorPositiveSelectionCorrection:corrected
      };
      const observed=withBattleCompressorSourceSelections(Store,
        ()=>runMatch(request));
      assert.equal(Store.prototype.dispatch,originalDispatch);
      assert.equal(observed.result.battleCompressorPositiveSelectionCorrection,
        corrected);
      const handSightings=[0,1].map(slot=>{
        const rows=observed.result.decisionTrace.filter(row=>
          row.playerSlot===slot &&
          row.decisionHandBefore?.ownHandPrintings?.some(name=>
            name.startsWith('Battle Compressor')));
        return {
          seat:slot,decisionObservationsWithCompressor:rows.length,
          turnNumbers:[...new Set(rows.map(row=>row.turnBefore))]
        };
      });
      cases.push({
        candidateSeat,seed,corrected,
        turns:observed.result.turns,
        battleCompressorInSourceDecks:[request.deckA,request.deckB].map(cards=>
          cards.filter(name=>name.startsWith('Battle Compressor')).length),
        battleCompressorPlayedBySeat:observed.result.cardsPlayedBySeat.map(plays=>
          Object.entries(plays).filter(([name])=>
            name.startsWith('Battle Compressor')).reduce((sum,[,n])=>sum+n,0)),
        handSightings,
        actualFirstSeat:observed.result.firstTurnSlot,
        drawLogVerified:observed.result.verifiedByDrawLog,
        rootDispatches:observed.rootDispatches,
        actions:observed.result.actions,
        endReason:observed.result.endReason,
        engineWinnerDiagnosticOnly:observed.result.winner,
        selectedBattleCompressorCount:observed.selections.length,
        selectedZeroCount:observed.selections.filter(x=>
          x.selectionCount===0).length,
        selections:observed.selections,
        candidateCardHash:digest(plan.candidate.cards),
        opponentCardHash:digest(opponent.cards),
        policy:observed.result.policy
      });
    }
  }
  return {
    schema:'aichi-rank1-vs-rank10-battle-compressor-prompt-source-exposure-v1',
    qualification:'Unqualified bounded generic-bot games; inspect actual source selections, not win rates',
    engine:plan.engineRevision,sourceManifestDigest:plan.manifestDigest,
    missingRanks:plan.opponents.filter(o=>o.status==='missing-published-list')
      .map(o=>o.rank),
    cases,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(auditSource(),null,2)+'\n');
module.exports={withBattleCompressorSourceSelections,auditSource};
