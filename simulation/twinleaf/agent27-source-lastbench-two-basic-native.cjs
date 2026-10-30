'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('./agent5-owner-root-slice.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));

/** Stage full preserved exact printed sources with an artificial final Bench slot. */
function stage(seat){
  assert.ok(seat===0||seat===1);
  const permissions={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const ownPlan=planAichi(1,permissions),oppPlan=planAichi(10,permissions);
  assert.equal(ownPlan.candidate.cards.length,60);
  assert.equal(oppPlan.candidate.cards.length,60);
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  let id=1;
  const card=printing=>{const c=manager.getCardByName(printing);
    assert.ok(c,'Unsupported registered printing '+printing);c.id=id++;return c;};
  /** Physical source inventory; each selected printing is removed once. */
  const construct=(registered,active,bench,head)=>{
    const unused=registered.slice();
    const take=name=>{
      const i=unused.indexOf(name);
      assert.ok(i>=0,'Source-60 missing '+name);
      return unused.splice(i,1)[0];
    };
    const player=new Player();
    const actualActive=take(active);
    const benchCards=bench.map(take);
    const firstHand=head.map(take);
    const hand=[...firstHand,...unused.splice(0,7-firstHand.length)];
    const prizes=unused.splice(0,6);
    const deck=unused;
    assert.equal(1+benchCards.length+hand.length+prizes.length+deck.length,60);
    player.active.cards.push(card(actualActive));
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    benchCards.forEach((c,i)=>player.bench[i].cards.push(card(c)));
    player.hand.cards.push(...hand.map(card));
    for(const p of prizes){const slot=new CardList();slot.cards.push(card(p));player.prizes.push(slot);}
    player.deck.cards.push(...deck.map(card));
    return player;
  };
  const owner=construct(ownPlan.candidate.cards,
    'Shadow Rider Calyrex V CRE',
    ['Shadow Rider Calyrex V CRE','Shadow Rider Calyrex V CRE',
      "Lillie's Clefairy ex JTG",'Latias ex SSP'],
    ['Girafarig LOT','Tapu Lele-GX GRI']);
  const opponent=construct(oppPlan.candidate.cards,'Regidrago V SIT',[],[]);
  owner.id=101;opponent.id=202;
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const t={PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType};
  const catalog=buildActorCardCatalog(manager.getAllCards(),t);
  return {seat,owner,opponent,store,state,catalog,GamePhase,PlayCardAction,
    PlayerType,SlotType,sourceDigests:[ownPlan.candidateDigest,oppPlan.candidateDigest]};
}
/** One real native Bench decision, from matching source-frozen physical roots. */
function fork(seat){
  const a=stage(seat),b=stage(seat);
  const vA=actorObservation(a.state,seat),vB=actorObservation(b.state,seat);
  assert.deepEqual(vA,vB);
  assert.deepEqual(vA.ownPublic.bench.map(slot=>slot===null),
    [false,false,false,false,true]);
  assert.deepEqual(vA.ownHand.slice(0,2),['Girafarig LOT','Tapu Lele-GX GRI']);
  assert.ok(a.catalog.basics.has('Girafarig LOT'));
  assert.ok(a.catalog.basics.has('Tapu Lele-GX GRI'));
  const first=chooseActorRootIntent(vA,a.catalog,{});
  assert.deepEqual(first,{kind:'bench-basic',handIndex:0,benchIndex:4,
    printing:'Girafarig LOT'});
  const alternative={kind:'bench-basic',handIndex:1,benchSlot:4,
    printing:'Tapu Lele-GX GRI'};
  const baseline={...first,benchSlot:first.benchIndex};
  const actual=(x,intent)=>{
    const before=rootPhysicalSnapshot(x.state,seat,intent);
    const action=new x.PlayCardAction(x.owner.id,intent.handIndex,{
      player:x.PlayerType.BOTTOM_PLAYER,slot:x.SlotType.BENCH,index:4});
    x.store.dispatch(action);
    const after=rootPhysicalSnapshot(x.state,seat,intent);
    assert.equal(rootPhysicalWitness(intent,before,after,x.GamePhase),
      'confirmed-public-effect');
    assert.equal(x.owner.bench[4].getPokemonCard()?.fullName,intent.printing);
    assert.equal(x.owner.bench.filter(slot=>slot.getPokemonCard()).length,5);
    assert.equal(x.state.turn,2);
    return {nativeCardPlayed:intent.printing,ownerHandAfter:
      x.owner.hand.cards.slice(0,2).map(card=>card.fullName),
      pendingNativePrompts:x.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)};
  };
  const chosenResult=actual(a,baseline);
  const otherResult=actual(b,alternative);
  assert.ok(chosenResult.ownerHandAfter.includes('Tapu Lele-GX GRI'));
  assert.ok(otherResult.ownerHandAfter.includes('Girafarig LOT'));
  return {sourceRanks:[1,10],sourceDigests:a.sourceDigests,seat,
    ownerSameRegistered60:true,opponentSameRegistered60:true,
    controlledArtificialState:true,sameActorVisibleRoot:true,
    baseline:chosenResult,alternative:otherResult,
    basicAlternatives:2,onlyOneFreeBenchSlot:true,
    cardSelectionHasIrreversibleBenchCapacityEffect:true,
    nativeAfterAbilityPromptSettlementCertified:false,
    nativeOpponentReplyCertified:false,qualifiedCompetitiveGames:0};
}
function run(){return {schema:'agent27-source-registered-last-bench-basic-native-v1',
  enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  seats:[fork(0),fork(1)],qualifiedCompetitiveGames:0,
  limitation:'Controlled same-60 source card rearrangement, not naturally dealt, no ability-prompt, source-response or payoff qualification.'};}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stage,fork,run};
