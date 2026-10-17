'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards,runMatch} = require('./headless.cjs');
const {resolveManifestFile} = require('./resolve-field.cjs');

/** Observe the live root Store only; never instrument a speculative Simulator. */
function withSourceGxTimeline(Store,run){
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let root=null;
  const timeline=[];
  /** @param {object} state */
  const snapshot=state=>({
    turn:state.turn,phase:state.phase,activePlayer:state.activePlayer,
    usedGX:state.players.map(p=>Boolean(p.usedGX)),
    usedTurnSkip:state.players.map(p=>Boolean(p.usedTurnSkip)),
    prizes:state.players.map(p=>p.getPrizeLeft()),
    active:state.players.map(p=>p.active.getPokemonCard()?.fullName??null),
    lastAttack:state.players.map(p=>state.playerLastAttack[p.id]?.attack?.name??null)
  });
  const dispatch=function(...args){
    const action=args[0];
    const type=action?.constructor?.name??'Unknown';
    if(root===null&&type==='AddPlayerAction')root=this;
    if(this!==root)return descriptor.value.apply(this,args);
    const state=this.state;
    const pending=state.prompts?.find(p=>p.result===undefined);
    const promptName=pending?.constructor?.name??null;
    const selected=type==='ResolvePromptAction'&&promptName==='ChooseAttackPrompt'
      ? action.result?.name??null:null;
    const observed=(type==='AttackAction'&&action.name==='Apex Dragon')||
      (selected!==null);
    const before=state.players.length===2?snapshot(state):null;
    const result=descriptor.value.apply(this,args);
    if(this.state.players.length===2) {
      const after=snapshot(this.state);
      const beforeGx=before?.usedGX?.join(',');
      const afterGx=after.usedGX.join(',');
      if(observed||beforeGx!==afterGx) {
        const seat=before?.activePlayer??null;
        timeline.push({
          action:type,attack:type==='AttackAction'?action.name:null,
          selected,prompt:promptName,promptId:pending?.id??null,
          actor:seat,before,after,
          choiceNames:promptName==='ChooseAttackPrompt'?
            pending.cards.flatMap(c=>c.attacks.map(a=>a.name)):null
        });
      }
    }
    return result;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{return {match:run(),timeline};}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}

/** Exact rank10 source deck in both engine slots, archived source seed with active GX choices. */
function main(){
  const manifest=resolveManifestFile(path.resolve(
    __dirname,'../../results/aichi-2026/full-decklists.json'
  ),{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const deck=manifest.decks.find(d=>d.rank===10);
  assert.ok(deck?.playableUnderEngine);
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const seed=3245590697;
  const x=withSourceGxTimeline(Store,()=>runMatch({
    deckA:deck.cardIds,deckB:deck.cardIds,
    seed,maxActions:350,
    label:'rank10-mirror-current-v4-gx-usage-source-audit',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,
    doubleDragonRecovery:true,
    isolatePolicyRandomness:true,
    postSuperAliasRepairIsolation:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  }));
  assert.equal(x.match.firstTurnSlot,0);
  return {
    schema:'rank10-mirror-authentic-root-gx-timeline-v1',
    exactFieldOpponentRank:10,seed,
    game:{finished:x.match.finished,winner:x.match.winner,
      turns:x.match.turns,actions:x.match.actions,
      firstTurnSlot:x.match.firstTurnSlot,
      prizesRemaining:x.match.prizesRemaining},
    timeline:x.timeline,
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module) {
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
}
module.exports={withSourceGxTimeline,main};
