'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {probe}=require('./agent25-cape-paid-opening-native.cjs');
const {prepareRank1}=require('./agent25-cape-source-paid-maxgeist-reply-native.cjs');
const {nativeSinglePokemonChoices}=
  require('../agent8-actor-only-choose-pokemon.cjs');
const {withPendingEndTurnSwitchCleanup}=
  require('../pending-end-turn-switch-cleanup.cjs');
const OUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));
const PSY='Psychic Energy';
const VMAX='Shadow Rider Calyrex VMAX CRE';
const TREVDUSK='Trevenant & Dusknoir-GX SMP';

/** Printed physical object partition: energies are also in PokemonCardList.cards. */
function custody(player){
  const cards=[...player.active.cards,...player.active.tools,
    ...player.bench.flatMap(b=>[...b.cards,...b.tools]),
    ...player.hand.cards,...player.deck.cards,...player.discard.cards,
    ...player.lostzone.cards,...player.supporter.cards,...player.stadium.cards,
    ...player.prizes.flatMap(z=>z.cards)];
  assert.equal(cards.length,60);
  assert.equal(new Set(cards.map(c=>c.id)).size,60);
  return cards;
}

/** Two V + prior Energy, plus a third real Benched Basic attacker. */
function prepare(x){
  prepareRank1(x);
  const opp=x.f.defender,owner=x.owner;
  const before=custody(opp).map(c=>c.fullName).sort();
  // The original third Basic may be one of the six face-down Prizes in
  // base staging. Rearrange physical deal before first-turn action only.
  let index=opp.deck.cards.findIndex(c=>c.fullName===TREVDUSK);
  let gx;
  if(index>=0) gx=opp.deck.cards.splice(index,1)[0];
  else {
    const prize=opp.prizes.find(p=>p.cards[0]?.fullName===TREVDUSK);
    assert.ok(prize,'Original rank1 has a physical TREVDUSK');
    const filler=opp.deck.cards.pop();
    assert.ok(filler);
    gx=prize.cards.splice(0,1,filler)[0];
  }
  assert.equal(opp.bench[1].cards.length,0);
  opp.bench[1].cards.push(gx);
  opp.bench[1].pokemonPlayedTurn=1;
  assert.deepEqual(custody(opp).map(c=>c.fullName).sort(),before);
  // Same candidate 60 for both control and rescue. One separately held
  // Jet is a conditioned draw, physically replacing Pidgey in the deck.
  const pidgey=owner.hand.cards.find(c=>c.fullName==='Pidgey MEW');
  const jet=owner.deck.cards.find(c=>c.fullName==='Jet Energy PAL');
  assert.ok(pidgey&&jet);
  const handIndex=owner.hand.cards.indexOf(pidgey);
  const deckIndex=owner.deck.cards.indexOf(jet);
  owner.hand.cards.splice(handIndex,1,jet);
  owner.deck.cards.splice(deckIndex,1,pidgey);
  custody(owner);
}

/** Authentic native VMAX abilities, Guzma, then direct Pale Moon-GX. */
function reply(x){
  const p=x.f.defender,store=x.f.store,state=x.state;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {UseAbilityAction,AttackAction}=
    native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const prompts=[];
  const settle=()=>{
    for(let n=0;n<28;n++){
      const q=state.prompts.find(z=>z.result===undefined);
      if(!q)return;
      const kind=q.constructor.name;
      const answer=kind==='WaitPrompt'?null:
        kind==='ShowCardsPrompt'?true:
        kind==='ShuffleDeckPrompt'?
          state.players.find(z=>z.id===q.playerId).deck.cards.map((_,i)=>i):
          undefined;
      assert.notEqual(answer,undefined,'Unresolved source '+kind);
      assert.equal(q.validate(answer,state),true);
      prompts.push(kind);
      store.dispatch(new ResolvePromptAction(q.id,answer));
    }
    assert.fail('Unbounded source turn prompts');
  };
  for(const [slot,index] of [[SlotType.ACTIVE,0],[SlotType.BENCH,0]]){
    const held=p.hand.cards.findIndex(c=>c.fullName===VMAX);
    assert.ok(held>=0);
    store.dispatch(new PlayCardAction(p.id,held,{
      player:PlayerType.BOTTOM_PLAYER,slot,index
    }));
  }
  assert.equal(p.bench[1].getPokemonCard()?.fullName,TREVDUSK);
  for(const slot of [SlotType.ACTIVE,SlotType.BENCH]){
    store.dispatch(new UseAbilityAction(p.id,'Underworld Door',{
      player:PlayerType.BOTTOM_PLAYER,slot,index:0
    }));
    for(let j=0;j<8;j++){
      const q=state.prompts.find(z=>z.result===undefined);
      if(q?.constructor.name!=='WaitPrompt')break;
      store.dispatch(new ResolvePromptAction(q.id,null));
      prompts.push('WaitPrompt');
    }
    const q=state.prompts.find(z=>z.result===undefined);
    assert.equal(q?.constructor.name,'AttachEnergyPrompt');
    const energy=p.hand.cards.find(c=>c.name===PSY);
    assert.ok(energy);
    const assignment=[{to:{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
    },card:energy}];
    assert.equal(q.validate(assignment,state),true);
    store.dispatch(new ResolvePromptAction(q.id,assignment));
    prompts.push('AttachEnergyPrompt');
    settle();
  }
  assert.equal(p.bench[1].energies.cards.length,2);
  const beforeGuzma=p.hand.cards.findIndex(c=>c.fullName==='Guzma BUS');
  assert.ok(beforeGuzma>=0);
  store.dispatch(new PlayCardAction(p.id,beforeGuzma,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  let q=state.prompts.find(z=>z.result===undefined);
  assert.equal(q?.constructor.name,'ChoosePokemonPrompt');
  const vile=nativeSinglePokemonChoices(state,q).find(z=>
    z.seat===x.seat&&z.physical.getPokemonCard()?.fullName==='Vileplume AOR');
  assert.ok(vile);
  assert.equal(q.validate([vile.physical],state),true);
  store.dispatch(new ResolvePromptAction(q.id,[vile.physical]));
  prompts.push('ChoosePokemonPrompt');
  q=state.prompts.find(z=>z.result===undefined);
  assert.equal(q?.constructor.name,'ChoosePokemonPrompt');
  const gx=nativeSinglePokemonChoices(state,q).find(z=>
    z.seat===1-x.seat&&z.physical.getPokemonCard()?.fullName===TREVDUSK);
  assert.ok(gx);
  assert.equal(q.validate([gx.physical],state),true);
  store.dispatch(new ResolvePromptAction(q.id,[gx.physical]));
  prompts.push('ChoosePokemonPrompt');
  assert.equal(p.supporterTurn,1);
  assert.equal(p.active.getPokemonCard()?.fullName,TREVDUSK);
  assert.equal(p.active.energies.cards.length,2);
  const defendingVile=x.owner.active;
  assert.equal(defendingVile.getPokemonCard()?.fullName,'Vileplume AOR');
  store.dispatch(new AttackAction(p.id,'Pale Moon-GX'));
  settle();
  assert.equal(p.usedGX,true);
  assert.equal(x.owner.pendingEndOfTurnEffects.length,1);
  assert.strictEqual(x.owner.pendingEndOfTurnEffects[0].target,defendingVile);
  assert.equal(x.owner.pendingEndOfTurnEffects[0].type,'knock_out');
  assert.equal(defendingVile.damage,0,'This GX queues an effect, not attack damage');
  custody(p);custody(x.owner);
  return {sourceUsedPhysicalTrevDusk:true,sourceTwoPaidUnderworldDoors:true,
    sourceTwoPhysicalPsychicOnGX:true,sourceGuzmaPaid:true,
    sourceNativeGXUsed:true,queuedDelayedKO:1,sourceUsedGX:true,
    ownerActiveVileplume:true,promptTypes:prompts,qualifiedGames:0};
}

/** A legal actual spare-Jet switch cancels the delayed attack effect. */
function afterReply(x,{sourceNativeGXUsed},useJet){
  assert.equal(sourceNativeGXUsed,true);
  const owner=x.owner,opp=x.f.defender,store=x.f.store,state=x.state;
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {PassTurnAction}=native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  assert.equal(state.activePlayer,x.seat);
  assert.equal(owner.active.getPokemonCard()?.fullName,'Vileplume AOR');
  assert.equal(owner.pendingEndOfTurnEffects.length,1);
  const paidJet=owner.hand.cards.findIndex(c=>c.fullName==='Jet Energy PAL');
  assert.ok(paidJet>=0,'Both arms physically hold the same spare Jet');
  const prizesBefore=opp.getPrizeLeft();
  let effectsRemoved=0;
  if(useJet){
    const benchIndex=owner.bench.findIndex(b=>
      b.getPokemonCard()?.fullName==='Bunnelby PRC');
    assert.ok(benchIndex>=0);
    const {Store}=native('game/store/store');
    const {Player}=native('game/store/state/player');
    const audited=withPendingEndTurnSwitchCleanup({Store,Player},()=>{
      store.dispatch(new PlayCardAction(owner.id,paidJet,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:benchIndex
      }));
      assert.equal(owner.active.getPokemonCard()?.fullName,'Bunnelby PRC');
      assert.equal(owner.pendingEndOfTurnEffects.length,0);
    });
    effectsRemoved=audited.removedFromSimulatedStores;
    assert.equal(effectsRemoved,1);
    assert.ok(owner.bench.some(b=>
      b.getPokemonCard()?.fullName==='Vileplume AOR' &&
      b.tools[0]?.fullName==='Luxurious Cape PAR'));
  }
  store.dispatch(new PassTurnAction(owner.id));
  for(let n=0;n<30;n++){
    const q=state.prompts.find(z=>z.result===undefined);
    if(!q)break;
    const kind=q.constructor.name;
    let answer;
    if(kind==='WaitPrompt')answer=null;
    else if(kind==='ShowCardsPrompt')answer=true;
    else if(kind==='ShuffleDeckPrompt'){
      const player=state.players.find(z=>z.id===q.playerId);
      answer=player.deck.cards.map((_,i)=>i);
    }else if(kind==='ChoosePokemonPrompt'){
      const options=nativeSinglePokemonChoices(state,q);
      const selected=options.find(z=>z.seat===x.seat&&
        z.physical.getPokemonCard()?.fullName==='Bunnelby PRC');
      assert.ok(selected,'KO must promote actual Benched Bunnelby');
      answer=[selected.physical];
    }else if(kind==='ChoosePrizePrompt'){
      const prizeOwner=state.players.find(z=>z.id===q.playerId);
      assert.equal(prizeOwner.id,opp.id);
      answer=prizeOwner.prizes.filter(z=>z.cards.length>0).slice(0,1);
    }
    assert.notEqual(answer,undefined,'Unknown delayed end-turn '+kind);
    assert.equal(q.validate(answer,state),true,kind);
    store.dispatch(new ResolvePromptAction(q.id,answer));
  }
  assert.equal(store.hasPrompts(),false);
  const oppPrizeGain=prizesBefore-opp.getPrizeLeft();
  const vileDiscard=owner.discard.cards.some(c=>
    c.fullName==='Vileplume AOR');
  if(useJet){
    assert.equal(oppPrizeGain,0);
    assert.equal(vileDiscard,false);
    assert.equal(owner.pendingEndOfTurnEffects.length,0);
  }else{
    assert.equal(oppPrizeGain,1);
    assert.equal(vileDiscard,true);
  }
  custody(owner);custody(opp);
  return {useJet,actualSourcePaleMoonGX:true,
    ownerNativePassAfterGX:true,ownerPaperSwitchCleanup:useJet,
    cleanupEventCount:effectsRemoved,
    opponentActualPrizeGain:oppPrizeGain,
    capedVileplumeKnockedOut:vileDiscard,
    exactOriginalSixties:true,qualifiedGames:0};
}
function run(){
  const rows=[];
  for(const seat of [0,1]){
    for(const useJet of [false,true]){
      rows.push(probe(seat,{
        prepareOpponent:prepare,
        resolveReply:reply,
        afterReply:(x,r)=>afterReply(x,r,useJet)
      }));
    }
  }
  for(const r of rows){
    assert.equal(r.reply.sourceNativeGXUsed,true);
    assert.equal(r.postReply.capedVileplumeKnockedOut,!r.postReply.useJet);
  }
  return {scenario:'Source Pale Moon-GX after paid candidate first-turn Cape lock',
    allFourConditionedPhysicalArms:true,
    sourceOriginalPrintedSixty:true,
    candidateCapePrintedSixty:true,
    originalStoreFidelityCorrection:'reversible pending-end-of-turn switch cleanup only',
    competitiveGames:0,rows};
}
module.exports={prepare,reply,afterReply,run};
if(require.main===module)
  process.stdout.write('AGENT25_CAPE_PALEMOON_COUNTERREPLY '+JSON.stringify(run())+'\n');
