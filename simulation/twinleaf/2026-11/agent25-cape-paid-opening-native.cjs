'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../headless.cjs');
const SRC=require('../../../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json');
const CAPE=require('../../../results/aichi-2026/2026-11/agent25-cape-sentinel-v1.json');
const {planAichi}=require('../../evaluation/aichi-pilot.cjs');
const OUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));

/**
 * Reuses the already-passing Agent28 original-60 first-turn native source
 * fixture, but replaces exactly one held real Stealthy Hood in the original
 * physical 60 with the Cape 60's real Luxurious Cape. Reusing their helper
 * runs its test registrations as a side effect, so this is an opt-in CI probe.
 * All actual owner card action, search, mandatory discard, Tool, Stadium,
 * Energy attach, double attack and source defender's paid Guzma actions
 * remain genuine pinned Store dispatches.
 */
function probe(seat,hooks={}){
  assert.ok(seat===0||seat===1);
  const old=require('../../../tests/agent28-sentinel-direct-artazon-native.test.cjs');
  const x=old.stage(seat);
  const manager=initializeCards();
  const sourcePlan=planAichi(SRC,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const capePlan=planAichi(CAPE,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  assert.equal(sourcePlan.candidate.cards.length,60);
  assert.equal(capePlan.candidate.cards.length,60);
  assert.equal(x.sourceSixty.length,60);

  const oldHood=x.owner.hand.cards.findIndex(c=>
    c.fullName==='Stealthy Hood UNB');
  assert.ok(oldHood>=0,'Conditioned Agent28 opening holds a Hood');
  const cape=manager.getCardByName('Luxurious Cape PAR');
  assert.ok(cape,'Native pinned vendor must contain actual printed Cape');
  cape.id=990000+seat;
  const hood=x.owner.hand.cards.splice(oldHood,1,cape)[0];
  assert.equal(hood.fullName,'Stealthy Hood UNB');
  const sourceHood=x.sourceSixty.indexOf('Stealthy Hood UNB');
  assert.ok(sourceHood>=0);
  x.sourceSixty[sourceHood]='Luxurious Cape PAR';
  assert.deepEqual(x.sourceSixty.slice().sort(),
    capePlan.candidate.cards.slice().sort());

  const physical=()=>{
    const owner=x.f.store.state.players[seat];
    return [
      ...owner.active.cards,...owner.active.tools,
      ...owner.bench.flatMap(b=>[...b.cards,...b.tools]),
      ...owner.hand.cards,...owner.deck.cards,
      ...owner.discard.cards,...owner.lostzone.cards,
      ...owner.supporter.cards,...owner.stadium.cards,
      ...owner.prizes.flatMap(z=>z.cards)
    ];
  };
  const verify=()=>{
    const cards=physical();
    assert.equal(cards.length,60,'Every original source 60 must remain in zones');
    assert.equal(new Set(cards.map(c=>c.id)).size,60);
    assert.deepEqual(cards.map(c=>c.fullName).sort(),
      capePlan.candidate.cards.slice().sort());
  };
  verify();
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const held=x.owner.hand.cards.findIndex(c=>
    c.fullName==='Luxurious Cape PAR');
  assert.ok(held>=0);
  assert.equal(x.owner.active.getPokemonCard()?.fullName,'Oddish UNB');
  x.f.store.dispatch(new PlayCardAction(x.owner.id,held,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(x.owner.active.tools[0]?.fullName,'Luxurious Cape PAR',
    'A genuine preattack Tool attachment to starter Oddish');
  assert.equal(x.state.prompts.filter(p=>p.result===undefined).length,0);
  verify();

  if(hooks.prepareOpponent)hooks.prepareOpponent(x);
  const line=old.establishSentinelLock(x);
  assert.equal(line.two.attackCount,2);
  const vile=x.owner.bench.find(b=>
    b.getPokemonCard()?.fullName==='Vileplume AOR');
  assert.ok(vile,'Real first-turn double attack must evolve Vileplume');
  assert.equal(vile.tools[0]?.fullName,'Luxurious Cape PAR',
    'Originally attached Cape must persist through both native evolutions');
  const {CheckHpEffect}=native('game/store/effects/check-effects');
  const hp=new CheckHpEffect(x.owner,vile);
  x.f.store.reduceEffect(x.state,hp);
  assert.equal(hp.hp,230);
  verify();
  const before={sourceTurn:x.state.turn,sourceVileplumeBenched:true,
    sourceCapeAttached:true,sourceVileplumeEffectiveHp:hp.hp,
    sourceTMDeclaredAttacks:line.two.attackCount,sourceSupporterPlayed:
      x.owner.supporterTurn>0};
  const reply=hooks.resolveReply?
    hooks.resolveReply(x):old.resolveRank1Guzma(x);
  const shielded=x.f.store.state.players[seat].active;
  assert.equal(shielded.getPokemonCard()?.fullName,'Vileplume AOR');
  assert.equal(shielded.tools[0]?.fullName,'Luxurious Cape PAR');
  const afterHp=new CheckHpEffect(x.f.store.state.players[seat],shielded);
  x.f.store.reduceEffect(x.f.store.state,afterHp);
  assert.equal(afterHp.hp,230);
  verify();
  return {seat,printedCape:true,actualFirstTurnPaidCape:true,
    actualFirstTurnPaidGuzmaHala:true,actualFirstTurnDoubleTmEvolution:true,
    actualOpponentGuzmaPaid:true,originalSourcePhysicalSixty:true,
    originalRank1PhysicalSixty:true,before,
    after:{sourceVileplumeActive:true,sourceCapeAttached:true,
      sourceVileplumeEffectiveHp:afterHp.hp,
      opponentUsedGuzma:x.f.store.state.players[1-seat].supporterTurn>0},
    conditionedOriginalOpposingGuzma:true,
    reply,
    actualMaxGeistTestedSeparately:true,
    competitivelyQualifiedGames:0};
}
function run(){
  const rows=[probe(0),probe(1)];
  return {enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    printedSourceSixty:'agent25-cape-sentinel-v1',
    genuineSourceFirstTurnAndOpponentGuzma:true,
    preciseNaturalOpeningProbabilityUnmeasured:true,
    rows,competitivelyQualifiedGames:0};
}
module.exports={probe,run};
if(require.main===module)
  process.stdout.write('AGENT25_CAPE_PAID_FIRSTTURN_NATIVE '+JSON.stringify(run())+'\n');
