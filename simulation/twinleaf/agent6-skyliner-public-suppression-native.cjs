'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseOwnerSkylinerRondoRetreat}=require(
  './agent6-owner-public-skyliner-rondo-frontier.cjs');
const {publicSkylinerSuppressionReason,
  choosePublicLockGuardedSkylinerRondoRetreat}=require(
    './agent6-skyliner-ability-suppression-guard.cjs');

const {chooseSkylinerOrFloatStoneRondoRetreat}=require(
  './agent6-skyliner-or-floatstone-mobility.cjs');
const {withToolJammerFloatStoneRetreatRepair}=require(
  './agent6-tool-jammer-floatstone-retreat-hook.cjs');
const {withActiveToolJammerToolEffectGuard}=require(
  './agent6-tool-jammer-tool-effect-guard.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=relative=>require(path.join(output,relative));
const VERSION='agent6-skyliner-pinned-store-public-ability-retreat-v2-floatstone';
const MODES=['baseline','path','silent','klefki','thorns',
  'garbotoxin','muk','weezing','wobbuffet',
  'path-float','path-float-jammer','thorns-float',
  'thorns-float-jammer','garbotoxin-float','garbotoxin-float-jamming'];

/**
 * A staged genuine pinned Store exposes printed Skyliner and actual
 * CheckRetreatCostEffect in the same state. Both physical seats checked.
 * This bypasses natural opening/setup and is never a competitive game.
 *
 * @param {'baseline'|'path'|'silent'|'klefki'|'thorns'|'garbotoxin'|'muk'|'weezing'|'wobbuffet'} mode
 * @param {0|1} sourceSeat
 * @returns {object} Actual native reduction and dispatch receipt.
 */
function probe(mode,sourceSeat,{repair=false,effectRepair=false}={}){
  assert.ok(!(repair&&effectRepair));
  assert.ok(MODES.includes(mode));
  assert.ok(sourceSeat===0||sourceSeat===1);
  const baseMode=mode.split('-float')[0];
  const equippedFloatStone=mode.includes('-float');
  const opponentToolJammer=mode.endsWith('-jammer');
  const stadiumToolJamming=mode.endsWith('-jamming');
  const manager=initializeCards();
  let id=1;
  const card=printed=>{
    const actual=manager.getCardByName(printed);
    assert.ok(actual,'Missing pinned card '+printed);
    actual.id=id++;
    return actual;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format,CardType,SpecialCondition}=
    load('game/store/card/card-types');
  const {RetreatAction}=load('game/store/actions/game-actions');
  const {CheckRetreatCostEffect}=load('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=load('game/store/prefabs/prefabs');

  const store=new Store({onStateChange(){}});
  const state=store.state,mine=new Player(),enemy=new Player();
  mine.id=101;enemy.id=202;
  state.players=sourceSeat===0?[mine,enemy]:[enemy,mine];
  state.activePlayer=sourceSeat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  // Genuine setup zones for RetreatAction's full Store preconditions.
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      return prize;
    });
    for(let i=0;i<7;i++)player.deck.cards.push(card('Psychic Energy MEE'));
  }
  const latias=card('Latias ex SSP');
  mine.active.cards.push(latias);
  if(equippedFloatStone)mine.active.tools.push(card('Float Stone BKT'));
  const addBench=(owner,printed)=>{
    const slot=new PokemonCardList();
    slot.cards.push(card(printed));
    owner.bench.push(slot);
    return slot;
  };
  const clefairy=addBench(mine,"Lillie's Clefairy ex JTG");
  clefairy.energies.cards.push(card('Psychic Energy MEE'));
  clefairy.energies.cards.push(card('Psychic Energy MEE'));
  for(let i=0;i<4;i++)addBench(mine,'Pidgey MEW');
  let enemyActive='Duskull VIV';
  if(baseMode==='klefki')enemyActive='Klefki SVI';
  if(baseMode==='thorns')enemyActive='Iron Thorns ex TWM';
  if(baseMode==='weezing')enemyActive='Galarian Weezing RCL';
  if(baseMode==='wobbuffet')enemyActive='Wobbuffet PHF';
  enemy.active.cards.push(card(enemyActive));
  if(baseMode==='thorns')enemy.active.damage=20;
  if(opponentToolJammer)enemy.active.tools.push(card('Tool Jammer BST'));
  if(baseMode==='garbotoxin'){
    const slot=addBench(enemy,'Garbodor BKP');
    slot.tools.push(card('Float Stone BKT'));
  }else if(baseMode==='muk')addBench(enemy,'Alolan Muk SUM');
  else addBench(enemy,'Pidgey MEW');
  for(let i=0;i<4;i++)addBench(enemy,'Pidgey MEW');
  if(baseMode==='path')enemy.stadium.cards.push(card('Path to the Peak CRE'));
  if(baseMode==='silent')enemy.stadium.cards.push(card('Silent Lab PRC'));
  if(stadiumToolJamming)enemy.stadium.cards.push(card('Jamming Tower TWM'));

  const view=actorObservation(state,sourceSeat);
  const catalog={
    basicEnergies:new Set(['Psychic Energy MEE']),
    basicEnergyTypes:{Psychic:CardType.PSYCHIC},
    colorlessEnergyType:CardType.COLORLESS,
    specialConditions:{ASLEEP:SpecialCondition.ASLEEP,
      PARALYZED:SpecialCondition.PARALYZED}
  };
  const original=chooseOwnerSkylinerRondoRetreat(view,catalog);
  const guarded=choosePublicLockGuardedSkylinerRondoRetreat(view,catalog);
  const floatStoneGuard=chooseSkylinerOrFloatStoneRondoRetreat(view,catalog);
  const reason=publicSkylinerSuppressionReason(view);
  const livePower=latias.powers.find(power=>power.name==='Skyliner');
  assert.ok(livePower);
  const nativeBlocked=Boolean(IS_ABILITY_BLOCKED(
    store,state,mine,latias,livePower));
  const executeNative=()=>{
    const nativeCost=new CheckRetreatCostEffect(mine);
    store.reduceEffect(state,nativeCost);
    const nativeRetreatCost=nativeCost.cost.length;
    let nativeRetreatError=null;
    try{store.dispatch(new RetreatAction(mine.id,0));}
    catch(error){nativeRetreatError=String(error?.message??error);}
    const promoted=store.state.players[sourceSeat].active.getPokemonCard()?.fullName;
    return {nativeRetreatCost,nativeRetreatError,promoted,
      nativeRetreatAccepted:promoted==="Lillie's Clefairy ex JTG"};
  };
  const receipt=effectRepair?
    withActiveToolJammerToolEffectGuard(store,mine,enemy,executeNative):
    repair?withToolJammerFloatStoneRetreatRepair(store,mine,enemy,executeNative):
    {result:executeNative(),patches:[]};
  const {nativeRetreatCost,nativeRetreatError,promoted,nativeRetreatAccepted}=
    receipt.result;
  const expectedSuppressed=!['baseline','wobbuffet'].includes(baseMode);
  const expectedFree=!expectedSuppressed||
    (equippedFloatStone&&!opponentToolJammer&&!stadiumToolJamming);
  const checks={
    printedRootPresent:Boolean(original),
    nativeAbilityBlockAsPaper:nativeBlocked===expectedSuppressed,
    nativeRetreatCostAsPaper:nativeRetreatCost===(expectedFree?0:2),
    publicGuardAsPaper:Boolean(guarded)===!expectedSuppressed,
    floatStoneGuardAsPaper:Boolean(floatStoneGuard)===expectedFree,
    nativePhysicalRetreatAsPaper:nativeRetreatAccepted===expectedFree,
    paperHookApplied:!(repair||effectRepair)||receipt.patches.length>0
  };
  return {mode,sourceSeat,repairApplied:repair||effectRepair,
    repairKind:effectRepair?'tool-effect':(repair?'retreat-cost':'none'),
    repairPatches:receipt.patches,
    activeBefore:latias.fullName,printedPower:livePower.name,
    ownerPrintedPowerVisible:view.ownPublic.active.abilities.includes('Skyliner'),
    originalRootWouldSelect:original?.kind??null,
    guardedRootWouldSelect:guarded?.kind??null,
    floatStoneRootWouldSelect:floatStoneGuard?.kind??null,
    suppressionReason:reason,nativeAbilityBlocked:nativeBlocked,
    nativeRetreatCost,
    nativeRetreatAccepted,nativeRetreatError,activeAfter:promoted,
    expectedRetreatAccepted:expectedFree,checks,
    competitiveQualified:false};
}

/** @returns {object} Full staged native case archive, paper unqualified. */
function run(){
  const rows=[];
  for(const mode of MODES)for(const seat of [0,1])
    rows.push(probe(mode,seat));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,sourceSeat:row.sourceSeat,
      check,nativeRetreatError:row.nativeRetreatError})));
  return {version:VERSION,enginePin:
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    stagedNativeCases:rows.length,failedChecks:failures.length,
    failures,rows,qualifiedCompetitiveGames:0};
}

function runRepair(){
  const rows=['path-float-jammer','thorns-float-jammer']
    .flatMap(mode=>[0,1].map(seat=>probe(mode,seat,{repair:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  return {repairTest:true,version:VERSION,rows,failures,
    stagedNativeCases:rows.length,failedChecks:failures.length,
    qualifiedCompetitiveGames:0};
}
function runEffectRepair(){
  const rows=['path-float-jammer','thorns-float-jammer']
    .flatMap(mode=>[0,1].map(seat=>probe(mode,seat,{effectRepair:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  return {effectRepairTest:true,version:VERSION,rows,failures,
    stagedNativeCases:rows.length,failedChecks:failures.length,
    qualifiedCompetitiveGames:0};
}
if(require.main===module){
  const result=process.env.AGENT6_TOOL_JAMMER_EFFECT_REPAIR_DEV==='true'?
    runEffectRepair():process.env.AGENT6_TOOL_JAMMER_REPAIR_DEV==='true'?
    runRepair():run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.failedChecks>0)process.exitCode=1;
}
module.exports={VERSION,MODES,probe,run,runRepair,runEffectRepair};
