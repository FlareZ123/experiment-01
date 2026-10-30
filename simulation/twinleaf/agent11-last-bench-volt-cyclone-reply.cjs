'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');
const {stage}=require('./agent11-native-last-bench-locked-dedenne.cjs');
const {installEntryDrawLockHook}=require('./entry-draw-lock-hook.cjs');

const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(OUT,p));
const DRAW='Dedenne GX UNB',ATTACKER='Regidrago V SIT';

function prepare(x){
  const original=x.owner.active.cards[0];
  const attacker=x.owner.bench[0].cards[0];
  assert.equal(attacker.fullName,ATTACKER);
  x.owner.active.cards[0]=attacker;
  x.owner.bench[0].cards[0]=original;
  const manager=initializeCards();
  for(const [i,printing] of
    ['Speed Lightning Energy RCL','Double Colorless Energy SUM'].entries()){
    const energy=manager.getCardByName(printing);
    assert.ok(energy,'Missing original rank6 Special Energy '+printing);
    energy.id=4500+i;
    x.opponent.active.cards.push(energy);
    x.opponent.active.energies.cards.push(energy);
  }
  assert.equal(x.opponent.bench.filter(p=>p.cards.length>0).length,0);
  return x;
}

function settleWaits(x){
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const names=[];
  for(let i=0;i<20;i++){
    const pending=x.store.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    const kind=pending.constructor.name;
    assert.equal(kind,'WaitPrompt',
      'Unexpected optional target or missing real actor response: '+kind);
    names.push(kind);
    x.store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(x.store.hasPrompts(),false);
  return names;
}

/** @param {0|1} seat */
function replay(seat){
  const a=prepare(stage(seat));
  const b=prepare(stage(seat));
  const ownA=actorObservation(a.state,seat),
    ownB=actorObservation(b.state,seat);
  assert.deepEqual(ownA,ownB,'Matching physical branches must be actor-equivalent');
  const chosen=chooseActorRootIntent(ownA,a.catalog);
  assert.deepEqual(chosen,{kind:'bench-basic',handIndex:0,
    benchIndex:4,printing:DRAW});
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const target={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:4};
  a.store.dispatch(new PlayCardAction(a.owner.id,0,target));
  b.store.dispatch(new PlayCardAction(b.owner.id,1,target));
  assert.equal(a.owner.bench[4].getPokemonCard().fullName,DRAW);
  assert.equal(b.owner.bench[4].getPokemonCard().fullName,ATTACKER);
  assert.equal(a.owner.hand.cards.length,1);
  assert.equal(a.owner.hand.cards[0].fullName,ATTACKER);
  assert.equal(b.owner.hand.cards.length,1);
  assert.equal(b.owner.hand.cards[0].fullName,DRAW);
  assert.equal(a.owner.deck.cards.length,b.owner.deck.cards.length,
    'Dedenne entry draw must remain suppressed by Iron Thorns');
  const {PassTurnAction,AttackAction}=
    native('game/store/actions/game-actions');
  const responses=[];
  for(const x of [a,b]){
    x.store.dispatch(new PassTurnAction(x.owner.id));
    const passPrompts=settleWaits(x);
    assert.equal(x.store.state.activePlayer,1-seat,
      'Original rank6 Iron Thorns source turn must follow the choice');
    const oppCost=x.opponent.active.energies.cards.map(c=>c.fullName);
    assert.deepEqual(oppCost,
      ['Speed Lightning Energy RCL','Double Colorless Energy SUM']);
    const damageBefore=x.owner.active.damage;
    x.store.dispatch(new AttackAction(x.opponent.id,'Volt Cyclone'));
    const attackPrompts=settleWaits(x);
    assert.ok(x.owner.active.damage>damageBefore,
      'Native Volt Cyclone must damage the opposing Regidrago V');
    assert.equal(x.owner.active.getPokemonCard().fullName,ATTACKER);
    assert.equal(x.owner.bench.filter(p=>p.cards.length>0).length,5);
    responses.push({passPrompts,attackPrompts,
      damage:x.owner.active.damage-damageBefore,
      newActiveSeat:x.store.state.activePlayer,
      benchFinal:x.owner.bench[4].getPokemonCard().fullName});
  }
  assert.equal(responses[0].damage,responses[1].damage);
  assert.equal(responses[0].damage,140,
    'Exact printed Volt Cyclone base damage expected on this neutral target');
  return {seat,identicalOwnerVisibleInitialRoot:true,
    baselineChooses:DRAW,alternative:ATTACKER,
    opponentPrintedAttack:'Volt Cyclone',attackingEnergy:
      ['Speed Lightning Energy RCL','Double Colorless Energy SUM'],
    responses,sourceResponseScripted:true,competitiveQualified:false};
}
function run(){
  const restore=installEntryDrawLockHook();
  try{return {schema:'agent11-staged-locked-bench-native-response-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    records:[replay(0),replay(1)],
    competitiveQualifiedGames:0,
    caveat:'Two-seat native scripted source attack. No authentic original-60 deal, autonomous policies or competitive result.'};
  }finally{restore();}
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={prepare,settleWaits,replay,run};
