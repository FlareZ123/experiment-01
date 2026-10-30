'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {actorHandDiscardInput,chooseActorHandDiscard,resolvePhysicalHandCards}=
  require('./agent47-actor-hand-discard.cjs');
const {proposeApexPayloadDiscard}=require('./agent47-apex-discard-frontier.cjs');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(ROOT,p));
const PAYLOADS=new Set(['Dragapult ex TWM','Dialga-GX UPR']);
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** An entire source-registered 60 in deterministic real physical zones. */
function stage(seat,temple=false){
  assert.ok(seat===0||seat===1);
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=field.decks.find(x=>x.rank===20);
  assert.ok(source?.playableUnderEngine);
  const original=[...source.cardIds];
  assert.equal(original.length,60);
  const take=name=>{
    const i=original.indexOf(name);
    assert.ok(i>=0,'Source rank20 cannot supply '+name);
    original.splice(i,1);
    return name;
  };
  const active=['Regidrago V SIT','Regidrago VSTAR SIT',
    take('Double Dragon Energy ROS'),take('Double Dragon Energy ROS')];
  for(const name of active.slice(0,2))take(name);
  const hand=[take('Ultra Ball MEG'),take('Dragapult ex TWM'),
    take('Megaton Blower SSP'),take('Grass Energy MEE'),
    take('Grass Energy MEE')];
  const prizes=original.splice(-6);
  assert.equal(original.length,45);
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  let id=1;
  const physical=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Unknown pinned printed card '+name);
    card.id=id++;
    return card;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  for(const name of active) {
    const card=physical(name);
    owner.active.cards.push(card);
    if(name==='Double Dragon Energy ROS')owner.active.energies.cards.push(card);
  }
  owner.active.pokemonPlayedTurn=1;
  owner.hand.cards=hand.map(physical);
  owner.deck.cards=original.map(physical);
  owner.prizes=prizes.map(name=>{
    const stack=new CardList();stack.cards.push(physical(name));return stack;
  });
  for(let i=0;i<5;i++)owner.bench.push(new PokemonCardList());
  opponent.active.cards.push(physical('Pidgey MEW'));
  if(temple)opponent.stadium.cards.push(physical('Temple of Sinnoh ASR'));
  for(let i=0;i<5;i++)opponent.bench.push(new PokemonCardList());
  for(let i=0;i<6;i++){
    const stack=new CardList();stack.cards.push(physical('Psychic Energy SVE'));
    opponent.prizes.push(stack);
  }
  for(let i=0;i<8;i++)opponent.deck.cards.push(physical('Psychic Energy SVE'));
  const ownerPhysical=[...owner.active.cards,...owner.hand.cards,
    ...owner.deck.cards,...owner.prizes.flatMap(p=>p.cards)];
  assert.equal(ownerPhysical.length,60);
  assert.equal(new Set(ownerPhysical.map(c=>c.id)).size,60);
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.turn=4;state.activePlayer=seat;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {seat,store,state,owner,GamePhase};
}

/**
 * Native Item play, mandatory two-card physical prompt, and fixed alternate.
 * Search and turn-ending actions are out of scope. Does not alter the bot.
 */
function runOne(seat,mode,temple=false){
  const x=stage(seat,temple);
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const item=x.owner.hand.cards.findIndex(c=>c.fullName==='Ultra Ball MEG');
  assert.ok(item>=0);
  x.store.dispatch(new PlayCardAction(x.owner.id,item,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const activePrompt=()=>{
    const p=x.state.prompts.find(p=>p.result===undefined);
    assert.ok(p,'Ultra Ball should leave a native mandatory discard prompt');
    return p;
  };
  for(let i=0;i<8&&activePrompt().constructor.name==='WaitPrompt';i++){
    const p=activePrompt();
    x.store.dispatch(new ResolvePromptAction(p.id,null));
  }
  const pending=activePrompt();
  assert.equal(pending.constructor.name,'ChooseCardsPrompt');
  assert.equal(pending.message,'CHOOSE_CARD_TO_DISCARD');
  const observed=actorHandDiscardInput(x.state,seat);
  assert.ok(observed,'Native owner prompt must admit actual owner-hand subset');
  assert.equal(observed.prompt.requiredCount,2);
  assert.equal(observed.actor.ownPublic.active.printing,'Regidrago VSTAR SIT');
  assert.deepEqual(observed.actor.ownPublic.active.energies,
    ['Double Dragon Energy ROS','Double Dragon Energy ROS']);
  const original=chooseActorHandDiscard(observed).printings;
  if(temple)assert.ok(observed.actor.opponentPublic.stadium.includes('Temple of Sinnoh ASR'));
  const proposal=proposeApexPayloadDiscard(observed,PAYLOADS);
  assert.deepEqual(proposal.baseline,original);
  const names=mode==='alternate'?proposal.proposal:original;
  if(!temple)assert.equal(proposal.changed,true);
  else assert.equal(proposal.changed,false);
  const physical=resolvePhysicalHandCards(pending,names);
  assert.ok(physical);
  assert.equal(pending.validate(physical),true);
  const before=x.owner.discard.cards.length;
  x.store.dispatch(new ResolvePromptAction(pending.id,physical));
  assert.equal(x.owner.discard.cards.length,before+2);
  assert.ok(physical.every(c=>x.owner.discard.cards.includes(c)));
  assert.equal(x.owner.hand.cards.some(c=>c.fullName==='Ultra Ball MEG'),false);
  const after=x.owner.discard.cards.map(c=>c.fullName);
  return {seat,mode,temple,initialPhysical60:true,baseline:original,
    proposal:proposal.proposal,proposalChanged:proposal.changed,
    submittedPhysicalNames:names,
    acceptedPhysicalDiscard:physical.every(c=>x.owner.discard.cards.includes(c)),
    nativePromptId:pending.id,
    nativeNextPromptKind:x.state.prompts.find(p=>p.result===undefined)
      ?.constructor.name??null,
    discardedDragonPayload:after.includes('Dragapult ex TWM'),
    remainingHand:x.owner.hand.cards.map(c=>c.fullName),
    qualifiedCompetitiveGames:0};
}

function main(){
  const rows=[];
  for(const seat of [0,1]){
    rows.push(runOne(seat,'baseline'));
    rows.push(runOne(seat,'alternate'));
    rows.push(runOne(seat,'baseline',true));
  }
  return {schema:'agent47-rank20-staged-native-ultraball-payment-v1',
    enginePin:PIN,exactSourceRank:20,stagedInitial60:true,
    naturalDealtGame:false,
    rows,qualifiedCompetitiveGames:0,
    caveat:'Staged original 60 in one side; native Store Item and physical cost only. The preexisting opponent and search/attack continuation are not competitively tested.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={stage,runOne,main};
