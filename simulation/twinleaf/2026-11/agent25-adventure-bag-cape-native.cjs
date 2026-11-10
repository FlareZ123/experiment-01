'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../headless.cjs');
const {planAichi}=require('../../evaluation/aichi-pilot.cjs');
const old=require('../../../tests/agent28-sentinel-direct-artazon-native.test.cjs');
const fixed=require('../../../results/aichi-2026/2026-11/agent25-adventure-bag-cape-sentinel-v1.json');
const {prepareRank1,resolveRank1}=
  require('./agent25-cape-source-paid-maxgeist-reply-native.cjs');
const {withNumericShufflePromptValidation}=
  require('../agent33-shuffle-prompt-numeric-validation.cjs');
const OUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));
const BAG='Adventure Bag LOT',CAPE='Luxurious Cape PAR';
const ART='Artazon PAL',BUN='Bunnelby PRC';
const TM='Technical Machine: Evolution PAR',JET='Jet Energy PAL';
const HOOD='Stealthy Hood UNB';

function custody(p){
  const cards=[...p.active.cards,...p.active.tools,
    ...p.bench.flatMap(b=>[...b.cards,...b.tools]),
    ...p.hand.cards,...p.deck.cards,...p.discard.cards,
    ...p.lostzone.cards,...p.supporter.cards,...p.stadium.cards,
    ...p.prizes.flatMap(z=>z.cards)];
  assert.equal(cards.length,60);
  assert.equal(new Set(cards.map(c=>c.id)).size,60);
  return cards;
}

/** Physically possible original initial deal: Oranguru V Active, Oddish Bench. */
function stage(seat){
  const x=old.stage(seat),p=x.owner;
  const manager=initializeCards();
  const plan=planAichi(fixed,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const heldHood=p.hand.cards.findIndex(c=>c.fullName===HOOD);
  const templeIndex=p.deck.cards.findIndex(c=>
    c.fullName==='Temple of Sinnoh ASR');
  assert.ok(heldHood>=0&&templeIndex>=0);
  const bag=manager.getCardByName(BAG);
  assert.ok(bag,'Native printed Adventure Bag must exist');
  bag.id=992110+seat;
  const sourceHood=p.hand.cards.splice(heldHood,1,bag)[0];
  p.deck.cards.splice(templeIndex,1,sourceHood);
  const hoodIndex=p.deck.cards.findIndex(c=>c.fullName===HOOD);
  assert.ok(hoodIndex>=0);
  const cape=manager.getCardByName(CAPE);
  assert.ok(cape);
  cape.id=992100+seat;
  p.deck.cards.splice(hoodIndex,1,cape);
  x.sourceSixty[x.sourceSixty.indexOf(HOOD)]=CAPE;
  x.sourceSixty[x.sourceSixty.indexOf('Temple of Sinnoh ASR')]=BAG;
  assert.deepEqual(custody(p).map(c=>c.fullName).sort(),
    plan.candidate.cards.slice().sort());
  assert.deepEqual(x.sourceSixty.slice().sort(),
    plan.candidate.cards.slice().sort());
  assert.equal(p.hand.cards.some(c=>c.fullName===CAPE),false);
  assert.equal(p.hand.cards.some(c=>c.fullName===BAG),true);
  assert.equal(p.deck.cards.some(c=>c.fullName===CAPE),true);
  assert.equal(p.active.getPokemonCard()?.fullName,'Oddish UNB');
  return x;
}

/** Actual asym Adventure Bag searches two Tools before the lock. */
function solve(x){
  const p=x.owner,state=x.state,store=x.f.store;
  const {UseStadiumAction}=
    native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const observed=[];
  const pending=()=>state.prompts.find(q=>q.result===undefined);
  const waits=()=>{
    for(let i=0;i<16&&pending()?.constructor.name==='WaitPrompt';i++){
      const q=pending();
      store.dispatch(new ResolvePromptAction(q.id,null));
      observed.push('WaitPrompt');
    }
  };
  const settle=()=>{
    for(let i=0;i<24;i++){
      const q=pending();
      if(!q)return;
      const kind=q.constructor.name;
      const answer=kind==='WaitPrompt'?null:
        kind==='ShowCardsPrompt'?true:
        kind==='ShuffleDeckPrompt'?p.deck.cards.map((_,j)=>j):
        undefined;
      assert.notEqual(answer,undefined,'Unhandled Oranguru prompt '+kind);
      assert.equal(q.validate(answer,state),true,kind);
      store.dispatch(new ResolvePromptAction(q.id,answer));
      observed.push(kind);
    }
    assert.fail('Unbounded Oranguru search prompt');
  };
  const choice=(names,zone)=>{
    const q=pending();
    assert.equal(q?.constructor.name,'ChooseCardsPrompt');
    assert.equal(q.cards,zone);
    const selected=names.map(name=>{
      const card=zone.cards.find(c=>c.fullName===name);
      assert.ok(card,'Original card missing '+name);
      return card;
    });
    assert.equal(q.validate(selected,state),true);
    store.dispatch(new ResolvePromptAction(q.id,selected));
    observed.push('ChooseCardsPrompt');
  };
  const play=(name,target)=>{
    const i=p.hand.cards.findIndex(c=>c.fullName===name);
    assert.ok(i>=0,'No held actual '+name);
    store.dispatch(new PlayCardAction(p.id,i,target));
  };
  // Item search before Vileplume is in play: no post-lock Item exception.
  play(BAG,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  waits();
  choice([CAPE,TM],p.deck);
  settle();
  assert.ok(p.discard.cards.some(c=>c.fullName===BAG));
  assert.equal(p.hand.cards.some(c=>c.fullName===CAPE),true);
  assert.equal(p.hand.cards.some(c=>c.fullName===TM),true);
  play('Guzma & Hala CEC',{player:PlayerType.ANY,
    slot:SlotType.BOARD,index:0});
  let q=pending();
  assert.equal(q?.constructor.name,'SelectOptionPrompt');
  assert.equal(q.validate(1,state),true);
  store.dispatch(new ResolvePromptAction(q.id,1));
  q=pending();
  assert.equal(q?.constructor.name,'ChooseCardsPrompt');
  assert.equal(q.cards,p.hand);
  const discards=['Guzma BUS','Karen XYP'].map(name=>{
    const card=p.hand.cards.find(c=>c.fullName===name);
    assert.ok(card);return card;
  });
  assert.equal(q.validate(discards,state),true);
  store.dispatch(new ResolvePromptAction(q.id,discards));
  choice([ART,HOOD,JET],p.deck);
  settle();
  for(const c of discards)assert.ok(p.discard.cards.includes(c));
  play(ART,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  settle();
  store.dispatch(new UseStadiumAction(p.id));
  waits();
  choice([BUN],p.deck);
  settle();
  const benched=p.bench.findIndex(b=>b.getPokemonCard()?.fullName===BUN);
  assert.ok(benched>=0);
  assert.equal(p.active.getPokemonCard()?.fullName,'Oddish UNB');
  play(CAPE,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
  settle();
  assert.equal(p.bench[0].tools[0]?.fullName,CAPE);
  play(TM,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:benched});
  settle();
  play(JET,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:benched});
  settle();
  assert.equal(p.active.getPokemonCard()?.fullName,BUN);
  assert.equal(p.active.tools[0]?.fullName,TM);
  const evolved=old.evolveTwice(x);
  assert.equal(evolved.attackCount,2);
  const vile=p.bench.find(b=>b.getPokemonCard()?.fullName==='Vileplume AOR');
  assert.ok(vile);
  assert.equal(vile.tools[0]?.fullName,CAPE);
  assert.equal(p.bench.some(b=>b.getPokemonCard()?.fullName==='Vileplume AOR'),true);
  const {CheckHpEffect}=native('game/store/effects/check-effects');
  const hp=new CheckHpEffect(p,vile);
  store.reduceEffect(state,hp);
  assert.equal(hp.hp,230);
  assert.equal(state.activePlayer,1-x.seat);
  custody(p);
  return {sourcePaidAdventureBagTwoTools:[CAPE,TM],
    sourceGuzmaHala:[ART,HOOD,JET],sourceArtazonBunnelby:true,
    sourceJetIntoBunnelby:true,sourceTwoActualEvolutionAttacks:true,
    sourceCapeVileplume230:true,
    opponentWasNotGrantedTownStore:true,zeroExtraPokemonV:true,prompts:observed};
}
function probe(seat){
  const x=stage(seat);
  prepareRank1(x);
  const opening=solve(x);
  const reply=resolveRank1(x);
  assert.equal(reply.actualDamageToCapedVileplume,130);
  assert.equal(reply.actualOpponentPrizeGain,0);
  custody(x.owner);custody(x.f.defender);
  return {seat,originalSourceSixties:true,
    candidatePaidFirstTurn:true,opening,reply,qualifiedGames:0};
}
function run(){
  const checks=withNumericShufflePromptValidation(()=>[probe(0),probe(1)]);
  assert.ok(checks.audit.checked>=2);
  return {fixedCandidate:'Adventure Bag Cape Sentinel v1',
    asymmetricToolSearchWithoutTownStore:true,
    sourceFirstTurnConditioned:true,
    cost:'Adventure Bag must be accessible before own Item lock',
    originalPrintedSixties:true,
    nativePaperShuffleHook:checks.audit,
    rows:checks.result,competitiveGames:0};
}
module.exports={stage,solve,probe,run};
if(require.main===module)
  process.stdout.write('AGENT25_ADVENTURE_BAG_CAPE '+JSON.stringify(run())+'\n');
