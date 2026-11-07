'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name Native compiled pinned module path. */
const native=name=>require(path.join(OUTPUT,name));
const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));
const rank10=roster.decks.find(row=>row.rank===10);
assert.ok(rank10,'Authenticated original rank 10 source is required');
for(const [name,count] of [
  ['Regidrago V',4],['Regidrago VSTAR',3],
  ['Double Dragon Energy',4],['Grass Energy',4],['Fire Energy',2],
  ['Parallel City',1],['Dragapult ex',1]
]){
  assert.equal(rank10.cards.find(row=>row.name===name)?.count,count,
    'Original source printed inventory drifted: '+name);
}

/**
 * Construct an original rank10 printed attacker/card microstate with
 * preattached Energy. Two native physical seats and four payment scenarios.
 * No legal-opening probability, full-game outcome or correct opponent policy
 * is implied by the manually staged hand, discard and Active board.
 *
 * @param {0|1} seat
 * @param {'dde-fire'|'basic-ggf'} funding
 * @param {boolean} temple
 * @param {boolean} parallelCounter
 * @returns {object}
 */
function probe(seat,funding,temple,parallelCounter){
  assert.ok(seat===0||seat===1);
  assert.ok(funding==='dde-fire'||funding==='basic-ggf');
  assert.ok(!parallelCounter||(temple&&funding==='dde-fire'));
  const scene=stage(seat),manager=initializeCards();
  const {AttackAction}=native('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {CheckProvidedEnergyEffect}=
    native('game/store/effects/check-effects');
  const {CardType}=native('game/store/card/card-types');
  let id=390000+seat*1000+Number(temple)*100+
    Number(parallelCounter)*10+(funding==='basic-ggf'?1:0);
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing compiled native printing '+name);
    c.id=id++;
    return c;
  };
  const owner=scene.owner,opponent=scene.opponent,state=scene.store.state;
  owner.active.cards.length=0;
  owner.active.energies.cards.length=0;
  owner.active.cards.push(card('Regidrago V SIT'),card('Regidrago VSTAR SIT'));
  owner.active.pokemonPlayedTurn=1;
  const energyNames=funding==='dde-fire'?
    ['Double Dragon Energy ROS','Fire Energy SVE']:
    ['Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  const attached=energyNames.map(card);
  for(const energy of attached){
    owner.active.cards.push(energy);
    owner.active.energies.cards.push(energy);
  }
  owner.discard.cards.push(card('Dragapult ex TWM'));
  if(temple)opponent.stadium.cards.push(card('Temple of Sinnoh ASR'));
  if(parallelCounter){
    owner.hand.cards.unshift(card('Parallel City BKT'));
    scene.store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const stadiumDirection=state.prompts.find(p=>p.result===undefined);
    assert.ok(stadiumDirection,'Parallel City needs native facing choice');
    assert.equal(stadiumDirection.constructor.name,'SelectPrompt');
    assert.equal(stadiumDirection.values.length,2);
    scene.store.dispatch(new ResolvePromptAction(stadiumDirection.id,0));
    for(let i=0;i<12;i++){
      const pending=state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      assert.equal(pending.constructor.name,'WaitPrompt');
      scene.store.dispatch(new ResolvePromptAction(pending.id,null));
    }
    assert.equal(state.prompts.some(p=>p.result===undefined),false,
      'Parallel facing and mandatory animation must settle before attack');
    assert.equal(opponent.stadium.cards.some(x=>
      x.fullName==='Temple of Sinnoh ASR'),false);
    assert.equal(owner.stadium.cards.some(x=>
      x.fullName==='Parallel City BKT'),true);
  }
  const nativeEnergy=new CheckProvidedEnergyEffect(owner);
  scene.store.reduceEffect(state,nativeEnergy);
  const physicalUnits=attached.map(e=>{
    const entry=nativeEnergy.energyMap.find(row=>row.card===e);
    assert.ok(entry,'Expected exact attached Energy object in native map');
    return {name:e.fullName,provides:entry.provides};
  });
  const ddeUnits=physicalUnits.find(row=>
    row.name==='Double Dragon Energy ROS')?.provides??null;
  if(funding==='dde-fire'){
    assert.ok(ddeUnits);
    assert.equal(ddeUnits.length,temple&&!parallelCounter?1:2);
    if(temple&&!parallelCounter)
      assert.deepEqual(ddeUnits,[CardType.COLORLESS]);
  }else{
    assert.equal(ddeUnits,null);
    assert.deepEqual(physicalUnits.map(row=>row.provides.length),[1,1,1]);
  }
  const expectedAttackAvailable=!temple||parallelCounter||
    funding==='basic-ggf';
  let rejection=null;
  if(expectedAttackAvailable){
    scene.store.dispatch(new AttackAction(owner.id,'Apex Dragon'));
  }else{
    assert.throws(()=>scene.store.dispatch(
      new AttackAction(owner.id,'Apex Dragon')
    ),error=>{
      rejection=String(error?.message??error);
      return /ENERGY|ATTACK|CANNOT/i.test(rejection);
    },'Temple must prevent DDE + Fire funding Apex Dragon');
    assert.equal(state.phase,scene.GamePhase.PLAYER_TURN);
  }
  return {seat,originalSourceRank:10,funding,temple,parallelCounter,
    expectedAttackAvailable,energyMapUnits:physicalUnits.map(x=>({
      printing:x.name,units:x.provides.length
    })),nativeAttackAttempted:true,
    nativeAttackRejected:rejection!==null,
    sourceStadium:owner.stadium.cards.map(c=>c.fullName),
    opponentStadium:opponent.stadium.cards.map(c=>c.fullName),
    queuedPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    exactOriginalPrinting:true,manuallyStaged:true,
    competitiveQualifiedGames:0};
}

for(const seat of [0,1]){
  for(const [funding,temple,parallelCounter] of [
    ['dde-fire',false,false],['dde-fire',true,false],
    ['dde-fire',true,true],['basic-ggf',true,false]
  ]){
    test('rank10 native Regidrago Apex Dragon Temple funding seat '+seat+
      ' '+funding+' Temple '+temple+' Parallel '+parallelCounter,()=>{
      const result=probe(seat,funding,temple,parallelCounter);
      console.log('AGENT39_RANK10_TEMPLE_APEX',JSON.stringify(result));
      assert.equal(result.nativeAttackRejected,!result.expectedAttackAvailable);
    });
  }
}
module.exports={probe};
