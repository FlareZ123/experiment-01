'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent47-apex-ultraball-original-store.cjs');
const {actorHandDiscardInput,chooseActorHandDiscard,resolvePhysicalHandCards}=
  require('./agent47-actor-hand-discard.cjs');
const {proposeApexPayloadDiscard}=require('./agent47-apex-discard-frontier.cjs');
const {installNumericShuffleOrderHook}=
  require('./shuffle-deck-numeric-order-hook.cjs');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(ROOT,p));
const PAYLOADS=new Set([
  'Dragapult ex TWM','Dialga-GX UPR','Mega Dragonite ex ASC',
  'Noivern ex PAL','Kyurem SFA','Regidrago V SIT'
]);

/**
 * Count each owner's physical source card exactly once after engine moves.
 * Attached Energy is included in the PokemonCardList.cards canonical zone;
 * energies.cards is an index and must not be counted again.
 */
function assertSource60Conserved(owner){
  const all=[
    ...owner.active.cards,
    ...owner.bench.flatMap(slot=>slot.cards),
    ...owner.hand.cards,...owner.deck.cards,...owner.discard.cards,
    ...owner.prizes.flatMap(slot=>slot.cards),
    ...owner.lostzone.cards,...owner.stadium.cards,
    ...owner.supporter.cards
  ];
  assert.equal(all.length,60,'Original source physical sixty was not conserved');
  assert.equal(new Set(all.map(card=>card.id)).size,60,
    'Source physical card IDs must be unique after prompts and attack');
  return true;
}

function settleAfterPhysicalDiscard(x,ResolvePromptAction) {
  const actions=[],searched=[];
  const restoreNumeric=installNumericShuffleOrderHook();
  try {
    for(let i=0;i<24;i++){
      const pending=x.state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      const kind=pending.constructor.name;
      if(kind==='WaitPrompt'||kind==='ShowCardsPrompt'){
        x.store.dispatch(new ResolvePromptAction(pending.id,null));
        actions.push(kind);
        continue;
      }
      if(kind==='ChooseCardsPrompt'){
        assert.ok(pending.cards?.cards?.every(c=>x.owner.deck.cards.includes(c)),
          'Only owner-authenticated Ultra Ball deck search may be resolved');
        const order=[...pending.cards.cards].sort((a,b)=>
          (a.fullName==='Regidrago VSTAR SIT'?0:1)-
          (b.fullName==='Regidrago VSTAR SIT'?0:1));
        const chosen=order.find(card=>pending.validate([card],x.state));
        assert.ok(chosen,'Ultra Ball did not offer a legal source deck Pokémon');
        x.store.dispatch(new ResolvePromptAction(pending.id,[chosen]));
        actions.push(kind);
        searched.push(chosen.fullName);
        continue;
      }
      if(kind==='ShuffleDeckPrompt'){
        const permutation=Array.from({length:x.owner.deck.cards.length},(_,i)=>i);
        assert.equal(pending.validate(permutation,x.state),true);
        x.store.dispatch(new ResolvePromptAction(pending.id,permutation));
        actions.push(kind);
        continue;
      }
      throw Error('Unrecognized real Ultra Ball pending prompt: '+kind);
    }
  }finally{restoreNumeric();}
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false,
    'Ultra Ball did not settle all its actual prompts');
  assert.equal(searched.length,1);
  assert.ok(x.owner.hand.cards.some(c=>c.fullName===searched[0]));
  return {actions,searched};
}

/** One source-registered 60, physical Item cost, deck search, and copied attack. */
function runOne(seat,mode='alternate'){
  assert.ok(mode==='alternate'||mode==='baseline');
  const x=stage(seat);
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {AttackAction}=load('game/store/actions/game-actions');
  const item=x.owner.hand.cards.findIndex(c=>c.fullName==='Ultra Ball MEG');
  assert.ok(item>=0);
  x.store.dispatch(new PlayCardAction(x.owner.id,item,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  for(let i=0;i<8;i++){
    const first=x.state.prompts.find(p=>p.result===undefined);
    if(first?.constructor.name!=='WaitPrompt')break;
    x.store.dispatch(new ResolvePromptAction(first.id,null));
  }
  const observed=actorHandDiscardInput(x.state,seat);
  assert.ok(observed);
  const proposal=proposeApexPayloadDiscard(observed,PAYLOADS);
  assert.equal(proposal.changed,true);
  assert.deepEqual(proposal.baseline,
    chooseActorHandDiscard(observed).printings);
  const mandatory=x.state.prompts.find(p=>p.id===observed.prompt.id);
  const submitted=mode==='baseline'?proposal.baseline:proposal.proposal;
  const selected=resolvePhysicalHandCards(mandatory,submitted);
  assert.ok(selected&&mandatory.validate(selected,x.state));
  x.store.dispatch(new ResolvePromptAction(mandatory.id,selected));
  assert.ok(selected.every(c=>x.owner.discard.cards.includes(c)));
  const itemFollowthrough=settleAfterPhysicalDiscard(x,ResolvePromptAction);
  assertSource60Conserved(x.owner);
  if(mode==='baseline'){
    assert.ok(!x.owner.discard.cards.some(c=>PAYLOADS.has(c.fullName)));
    return {seat,mode,noDragonPayload:true,itemFollowthrough,
      originalSource60Conserved:true,
      nativePhysicalDiscardAccepted:true,sourceOriginal60:true,
      qualifiedCompetitiveGames:0};
  }
  assert.ok(x.owner.discard.cards.some(c=>c.fullName==='Dragapult ex TWM'));
  assert.equal(x.state.activePlayer,seat);
  assert.equal(x.state.phase,x.GamePhase.PLAYER_TURN);
  x.store.dispatch(new AttackAction(x.owner.id,'Apex Dragon'));
  const attackPrompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(attackPrompt?.constructor.name,'ChooseAttackPrompt',
    'Apex Dragon with Dragapult in discard must offer genuine donor attacks');
  const donor=attackPrompt.cards.find(c=>c.fullName==='Dragapult ex TWM');
  assert.ok(donor,'Real Apex copied-attack chooser must offer discarded Dragapult');
  const jet=donor.attacks.find(a=>a.name==='Jet Headbutt');
  assert.ok(jet,'Expected printed non-GX one-copy attack');
  assert.equal(attackPrompt.validate(jet,x.state),true);
  x.store.dispatch(new ResolvePromptAction(attackPrompt.id,jet));
  const postPrompts=[];
  for(let i=0;i<24;i++){
    const prompt=x.state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    assert.equal(prompt.constructor.name,'WaitPrompt',
      'Plain Jet Headbutt should need no extra targeting');
    x.store.dispatch(new ResolvePromptAction(prompt.id,null));
    postPrompts.push('WaitPrompt');
  }
  assert.equal(x.state.prompts.some(p=>p.result===undefined),false);
  const opponent=x.state.players[1-seat];
  assert.ok(opponent.active.damage>0,'Apex copy must visibly damage opponent');
  assertSource60Conserved(x.owner);
  return {seat,mode,original60Actor:true,originalSource60Conserved:true,
    physicalSelected:proposal.proposal,
    nativeDiscardPhysicalAccepted:true,
    itemFollowthrough,copyPromptNative:true,
    donorPrinting:donor.fullName,chosenAttack:jet.name,
    damageToOpponentActive:opponent.active.damage,
    postPrompts,remainingNativePrompts:0,
    sourceOpponentPolicy:'scripted dummy, no reply',
    qualifiedCompetitiveGames:0};
}

function main(){
  return {schema:'agent47-source20-apex-ultraball-native-followthrough-v2',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registrations:'Original rank20 cards with deterministic staged physical deal',
    rows:[runOne(0,'baseline'),runOne(0,'alternate'),
      runOne(1,'baseline'),runOne(1,'alternate')],qualifiedCompetitiveGames:0,
    caveat:'Original Store Item/discard/search/copy-attack demonstration in a staged state; no naturally observed game, independent opponent response, or outcome inference.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={runOne,main,settleAfterPhysicalDiscard,assertSource60Conserved};
