'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));

/**
 * Read only the acting rank-11 bot's own hand and public board at real
 * source-dealt decision boundaries. The hook returns the original action.
 * @template T
 * @param {number} sourceId
 * @param {()=>T} execute
 */
function observeShop(sourceId,execute){
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const samples=[],seen=new Set();
  SimpleTacticsAi.prototype.decodeNextAction=function sourceShopObserver(state){
    const id=this.client?.id;
    const player=state.players.find(p=>p.id===id);
    let sample=null;
    if(id===sourceId && player && state.activePlayer===state.players.indexOf(player)){
      const occupied=[player.active,...player.bench]
        .filter(slot=>slot.getPokemonCard());
      const garbo=occupied.filter(slot=>slot.getPokemonCard()?.name==='Garbodor');
      const equipped=garbo.filter(slot=>slot.tools.length>0).length;
      const hand=player.hand.cards;
      const shopInPlay=state.players.some(p=>
        p.stadium.cards.some(card=>card.fullName==='Shopping Center EVS'));
      const crobatInHand=hand.some(card=>card.fullName==='Crobat V DAA');
      const shopInHand=hand.some(card=>card.fullName==='Shopping Center EVS');
      const floatInHand=hand.filter(card=>card.fullName==='Float Stone BKT').length;
      const benchOpen=player.bench.length<5||
        player.bench.some(slot=>!slot.getPokemonCard());
      const phase=state.phase;
      if(equipped>0||shopInPlay||shopInHand||crobatInHand){
        const signature=[state.turn,phase,equipped,shopInPlay,crobatInHand,
          shopInHand,floatInHand,benchOpen,
          hand.length,player.bench.filter(x=>x.getPokemonCard()).length].join(':');
        if(!seen.has(signature)){
          seen.add(signature);
          sample={
            turn:state.turn,phase,sourceId,garbodorInPlay:garbo.length,
            equippedGarbodor:equipped,
            shoppingCenterInPlay:shopInPlay,
            shoppingCenterInHand:shopInHand,
            crobatVInOwnHand:crobatInHand,
            floatStonesInOwnHand:floatInHand,
            benchOpen,ownHandCount:hand.length,
            ownsCrobatWindow:equipped===1&&shopInPlay&&crobatInHand&&benchOpen,
            observedOwnHand:hand.map(card=>card.fullName),
            selectedAction:null
          };
          samples.push(sample);
        }
      }
    }
    const action=original.call(this,state);
    if(sample) sample.selectedAction=action?.constructor?.name||null;
    return action;
  };
  try{return {result:execute(),samples};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}

/** Examine two unchanged exact source 60s in both physical positions. */
function run(){
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const source=plan.opponents.find(p=>p.rank===11);
  assert.equal(source?.status,'ready');
  const cases=[];
  for(const candidateSeat of [0,1]){
    const sourceSeat=1-candidateSeat;
    const slot=candidateSeat===0?'A':'B';
    const seed=deriveSlotSeeds(20261017,'pilot',11,0)[slot];
    const req={
      deckA:candidateSeat===0?plan.candidate.cards:source.cards,
      deckB:candidateSeat===1?plan.candidate.cards:source.cards,
      seed,maxActions:450,strictPromptValidation:true,
      forestSealSearchCorrection:true,battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      label:'rank11-shop-own-policy-readonly-candidate-'+slot
    };
    const baseline=runMatch(req);
    const observed=observeShop(sourceSeat===0?101:202,()=>runMatch(req));
    for(const key of ['finished','winner','actions','turns','firstTurnSlot',
      'prizesRemaining','deckHashes','abilityTrace','attackTrace',
      'cardsPlayedBySeat','decisionTrace']){
      assert.deepEqual(observed.result[key],baseline[key],
        'Read-only rank11 observer changed source gameplay key '+key);
    }
    const samples=observed.samples;
    cases.push({
      candidateSeat,seed,actualFirstSlot:baseline.firstTurnSlot,
      matchingSourceDecisionTrace:true,
      sourceDecisionEvents:baseline.decisionTrace.filter(x=>
        x.playerSlot===sourceSeat).length,
      sourceEnded:baseline.finished,sourceEngineWinner:baseline.winner,
      observedStateSignatures:samples.length,
      equippedGarbodorStates:samples.filter(x=>x.equippedGarbodor>0).length,
      equippedGarbodorAndShoppingCenter:samples.filter(x=>
        x.equippedGarbodor>0&&x.shoppingCenterInPlay).length,
      qualifiedSelfUnlockWindows:samples.filter(x=>x.ownsCrobatWindow).length,
      windows:samples.filter(x=>x.ownsCrobatWindow).slice(0,8),
      otherRelevantStates:samples.filter(x=>
        x.equippedGarbodor>0||x.shoppingCenterInPlay).slice(0,10)
    });
  }
  return {
    study:'read-only source-rank11 Shopping Center / Garbotoxin / Crobat opportunity observer',
    engine:plan.engineRevision,
    protocol:'two real exact-source 60 deals, one in each physical seat; no action intervention',
    scope:'same-seed full decision/effect equality under observer, unqualified weak-bot policy',
    cases,qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={observeShop,run};
