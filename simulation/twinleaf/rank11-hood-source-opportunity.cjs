'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const candidate=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const mod=name=>require(path.join(output,name));

/** Read only public boards plus the candidate's own cards, never opponent hidden zones. */
function observe(execute){
  const {Store}=mod('game/store/store');
  const {GamePhase}=mod('game/store/state/state');
  const {IS_ABILITY_BLOCKED}=mod('game/store/prefabs/prefabs');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const events=[],seen=new Set();
  let root;
  function dispatch(action,...rest){
    if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root){
      const state=this.state;
      if(state?.phase===GamePhase.PLAYER_TURN&&state.activePlayer===1){
        const own=state.players[1],enemy=state.players[0];
        if(own&&enemy){
          const equip=[enemy.active,...enemy.bench].filter(s=>
            s.getPokemonCard()?.name==='Garbodor'&&s.tools.length);
          const vm=[own.active,...own.bench].filter(s=>
            s.getPokemonCard()?.name==='Shadow Rider Calyrex VMAX');
          const rows=vm.map(s=>{
            const card=s.getPokemonCard();
            const power=card.powers.find(p=>p.name==='Underworld Door');
            return {hood:s.tools.some(t=>t.name==='Stealthy Hood'),
              blocked:IS_ABILITY_BLOCKED(this,state,own,card,power)};
          });
          const key=JSON.stringify([state.turn,equip.length,rows]);
          if(!seen.has(key)){
            seen.add(key);
            events.push({turn:state.turn,garbodorTools:equip.length,
              vmax:rows,ownHeldHood:own.hand.cards.some(c=>c.name==='Stealthy Hood'),
              ownHeldArven:own.hand.cards.some(c=>c.name==='Arven'),
              ownHeldBlower:own.hand.cards.some(c=>c.name==='Field Blower')});
          }
        }
      }
    }
    return descriptor.value.call(this,action,...rest);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{return {game:execute(),events};}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}

function run(){
  const plan=planAichi(candidate,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const source=plan.opponents.find(o=>o.rank===11);
  assert.equal(source?.status,'ready');
  const request={deckA:source.cards,deckB:plan.candidate.cards,
    rank11SourceSeat:0,seed:1244180408,maxActions:450,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'rank11-hood-source-natural-opportunity'};
  const play=()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const baseline=play(),sample=observe(play);
  const game=sample.game;
  assert.deepEqual(game.decisionTrace,baseline.decisionTrace);
  assert.deepEqual(game.deckHashes,baseline.deckHashes);
  assert.equal(game.verifiedByDrawLog,true);
  return {seed:request.seed,engine:plan.engineRevision,
    actualFirstSlot:game.firstTurnSlot,sourceOpener:game.rank11AutonomousPolicy,
    candidateFirstTurn:game.decisionTrace.filter(e=>
      e.playerSlot===1&&e.turnBefore===2).slice(0,35).map(e=>({
        ordinal:e.actionOrdinal,action:e.action,card:e.card??null,
        hand:e.decisionHandBefore?.ownHandPrintings??null})),
    observed:sample.events,baselineReplayEqual:true,
    competitiveGamesQualified:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,observe};
