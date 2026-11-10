'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../headless.cjs');
const {planAichi}=require('../../evaluation/aichi-pilot.cjs');
const printed=require('../../../results/aichi-2026/2026-11/agent25-townstore-cape-sentinel-v1.json');
const previous=require('../../../tests/agent28-sentinel-direct-artazon-native.test.cjs');
const {prepareRank1,resolveRank1}=
  require('./agent25-cape-source-paid-maxgeist-reply-native.cjs');
const OUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));
const TOWN='Town Store OBF',CAPE='Luxurious Cape PAR';
const TM='Technical Machine: Evolution PAR',JET='Jet Energy PAL';
const BUN='Bunnelby PRC';

/** Owned physical cards, with attached energy present in the zone's cards. */
function custody(player){
  const a=[...player.active.cards,...player.active.tools,
    ...player.bench.flatMap(b=>[...b.cards,...b.tools]),
    ...player.hand.cards,...player.deck.cards,...player.discard.cards,
    ...player.lostzone.cards,...player.supporter.cards,
    ...player.stadium.cards,...player.prizes.flatMap(z=>z.cards)];
  assert.equal(a.length,60,'all 60 physical cards must be in exactly one zone');
  assert.equal(new Set(a.map(c=>c.id)).size,60);
  return a;
}

/**
 * Stage the fixed 60 by exactly two one-slot substitutions against Sentinel
 * v1: -Hood +Cape, -Temple +Town. The possible opening starts with Oddish
 * Active and held original Bunnelby, G&H, two disposable cards, and no Cape.
 * @param {0|1} seat
 */
function stage(seat){
  const x=previous.stage(seat);
  const owner=x.owner,manager=initializeCards();
  const plan=planAichi(printed,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const heldHood=owner.hand.cards.findIndex(c=>
    c.fullName==='Stealthy Hood UNB');
  const firstB=owner.deck.cards.findIndex(c=>c.fullName===BUN);
  assert.ok(heldHood>=0&&firstB>=0);
  const swappedB=owner.deck.cards[firstB];
  const hood=owner.hand.cards[heldHood];
  owner.hand.cards.splice(heldHood,1,swappedB);
  owner.deck.cards.splice(firstB,1,hood);
  // A separate physical Hood is replaced by the fixed roster's single Cape.
  const hoodDeck=owner.deck.cards.findIndex(c=>
    c.fullName==='Stealthy Hood UNB');
  assert.ok(hoodDeck>=0);
  const cape=manager.getCardByName(CAPE);
  assert.ok(cape);
  cape.id=990100+seat;
  owner.deck.cards.splice(hoodDeck,1,cape);
  const templeDeck=owner.deck.cards.findIndex(c=>
    c.fullName==='Temple of Sinnoh ASR');
  assert.ok(templeDeck>=0);
  const town=manager.getCardByName(TOWN);
  assert.ok(town,'Pinned vendor must implement the real Town Store');
  town.id=990110+seat;
  owner.deck.cards.splice(templeDeck,1,town);
  x.sourceSixty[x.sourceSixty.indexOf('Stealthy Hood UNB')]=CAPE;
  x.sourceSixty[x.sourceSixty.indexOf('Temple of Sinnoh ASR')]=TOWN;
  const names=custody(owner).map(c=>c.fullName).sort();
  assert.deepEqual(names,plan.candidate.cards.slice().sort());
  assert.deepEqual(x.sourceSixty.slice().sort(),names);
  assert.equal(owner.hand.cards.some(c=>c.fullName===CAPE),false);
  assert.equal(owner.hand.cards.some(c=>c.fullName===BUN),true);
  assert.equal(owner.deck.cards.some(c=>c.fullName===TOWN),true);
  assert.equal(owner.deck.cards.some(c=>c.fullName===CAPE),true);
  return x;
}

function solve(x){
  const store=x.f.store,owner=x.owner,state=x.state;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {UseStadiumAction}=native('game/store/actions/game-actions');
  const prompts=[];
  const pending=()=>state.prompts.find(q=>q.result===undefined);
  const choose=(names,zone)=>{
    const p=pending();
    assert.equal(p?.constructor.name,'ChooseCardsPrompt');
    assert.equal(p.cards,zone);
    const selected=names.map(name=>{
      const c=zone.cards.find(c=>c.fullName===name);
      assert.ok(c,'Requested card physically unavailable '+name);
      return c;
    });
    assert.equal(p.validate(selected,state),true);
    prompts.push('ChooseCardsPrompt');
    store.dispatch(new ResolvePromptAction(p.id,selected));
  };
  const settle=()=>{
    for(let n=0;n<24;n++){
      const p=pending();
      if(!p)return;
      const kind=p.constructor.name;
      const answer=kind==='WaitPrompt'?null:
        kind==='ShowCardsPrompt'?true:
        kind==='ShuffleDeckPrompt'?
          owner.deck.cards.map((_,i)=>i):undefined;
      assert.notEqual(answer,undefined,'Unhandled Town turn prompt '+kind);
      assert.equal(p.validate(answer,state),true);
      prompts.push(kind);
      store.dispatch(new ResolvePromptAction(p.id,answer));
    }
    assert.fail('Town source prompt overflow');
  };
  const play=(name,target)=>{
    const i=owner.hand.cards.findIndex(c=>c.fullName===name);
    assert.ok(i>=0,'Played physical card must be held: '+name);
    store.dispatch(new PlayCardAction(owner.id,i,target));
  };
  // G&H searches Town Store, TM Evolution and Jet Energy. Cape is not held
  // and is not the Supporter's single Tool choice.
  play('Guzma & Hala CEC',{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  });
  let p=pending();
  assert.equal(p?.constructor.name,'SelectOptionPrompt');
  assert.equal(p.validate(1,state),true);
  store.dispatch(new ResolvePromptAction(p.id,1));
  p=pending();
  assert.equal(p?.constructor.name,'ChooseCardsPrompt');
  assert.equal(p.cards,owner.hand);
  const discards=['Guzma BUS','Karen XYP'].map(name=>{
    const c=owner.hand.cards.find(c=>c.fullName===name);
    assert.ok(c);return c;
  });
  assert.equal(p.validate(discards,state),true);
  store.dispatch(new ResolvePromptAction(p.id,discards));
  choose([TOWN,TM,JET],owner.deck);
  settle();
  for(const c of discards)assert.ok(owner.discard.cards.includes(c));
  assert.equal(owner.supporterTurn>0,true);
  assert.equal(owner.hand.cards.some(c=>c.fullName===CAPE),false);
  play(TOWN,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  settle();
  store.dispatch(new UseStadiumAction(owner.id));
  choose([CAPE],owner.deck);
  settle();
  assert.equal(owner.hand.cards.some(c=>c.fullName===CAPE),true);
  // Unlike original Artazon, Town does not search Bunnelby. In this
  // conditioned original opening, one of the actual original two Bunnelby
  // was instead held, so benching it is a genuine native PlayCardAction.
  const benchIndex=owner.bench.findIndex(b=>b.cards.length===0);
  assert.ok(benchIndex>=0);
  play(BUN,{player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index:benchIndex});
  settle();
  assert.equal(owner.bench[benchIndex].getPokemonCard()?.fullName,BUN);
  assert.equal(owner.active.getPokemonCard()?.fullName,'Oddish UNB');
  play(CAPE,{player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.ACTIVE,index:0});
  settle();
  assert.equal(owner.active.tools[0]?.fullName,CAPE);
  play(TM,{player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index:benchIndex});
  settle();
  assert.equal(owner.bench[benchIndex].tools[0]?.fullName,TM);
  play(JET,{player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index:benchIndex});
  settle();
  assert.equal(owner.active.getPokemonCard()?.fullName,BUN);
  assert.equal(owner.active.tools[0]?.fullName,TM);
  assert.equal(owner.active.energies.cards.length,1);
  const evolved=previous.evolveTwice(x);
  assert.equal(evolved.attackCount,2);
  const vile=owner.bench.find(b=>
    b.getPokemonCard()?.fullName==='Vileplume AOR');
  assert.ok(vile);
  assert.equal(vile.tools[0]?.fullName,CAPE);
  const {CheckHpEffect}=native('game/store/effects/check-effects');
  const hp=new CheckHpEffect(owner,vile);
  store.reduceEffect(state,hp);
  assert.equal(hp.hp,230);
  assert.equal(state.activePlayer,1-x.seat);
  custody(owner);
  return {genuineSupporterSearch:[TOWN,TM,JET],
    townOwnerToolSearch:CAPE,capeNeverInitiallyHeld:true,
    basicBunnelbyFromHand:true,
    genuineJetPromotesBunnelby:true,
    realTwoEvolutionAttacks:2,
    sourceBenchedVileplume230HP:true,
    prompts};
}

/** Firstturn Town Store line and original rank1 actual accelerated Max Geist. */
function probe(seat){
  const x=stage(seat);
  prepareRank1(x);
  const opening=solve(x);
  const reply=resolveRank1(x);
  assert.equal(reply.actualDamageToCapedVileplume,130);
  assert.equal(reply.actualOpponentPrizeGain,0);
  assert.equal(x.owner.active.getPokemonCard()?.fullName,'Vileplume AOR');
  assert.equal(x.owner.active.tools[0]?.fullName,CAPE);
  custody(x.owner);custody(x.f.defender);
  return {seat,originalPrintedSixties:true,opening,reply,
    competitivelyQualifiedGames:0};
}
function run(){
  const rows=[probe(0),probe(1)];
  return {candidate:'Town Store Cape Sentinel v1',
    exactOriginalRank1Sixty:true,
    candidateSixty60:true,
    firstTurnPaperLineConditioned:true,
    eligibleCompetitiveGames:0,rows};
}
module.exports={stage,solve,probe,run};
if(require.main===module)
  process.stdout.write('AGENT25_TOWN_CAPE_NATIVE '+JSON.stringify(run())+'\n');
