'use strict';

// Negative source-printed Ghost Eye payment controls with real native Store.
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const out=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(out,name));

/**
 * @param {0|1} sourceSeat Native physical seat controlled by source.
 * @param {3|7} rank Original published PAL Mimikyu-containing source 60.
 * @param {boolean} offListPsychic Positive control outside that source 60.
 * @returns {object} Actual Store action and physical damage receipt.
 */
function paymentArm(sourceSeat,rank,offListPsychic){
  assert.ok(rank===3||rank===7);
  const manager=initializeCards();
  let cid=0;
  const make=fullName=>{
    const c=manager.getCardByName(fullName);
    assert.ok(c,'Missing pinned printed card: '+fullName);
    c.id=++cid;
    return c;
  };
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {Store}=load('game/store/store');
  const {GameSettings}=load('game/core/game-settings');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const source=new Player();
  source.id=101;
  source.name='Rank '+rank+' printed source';
  const mimikyu=make('Mimikyu PAL');
  source.active.cards.push(mimikyu);
  const exactPair=rank===3?
    ['Capture Energy RCL','Water Energy MEE']:
    ['Capture Energy RCL','Jet Energy PAL'];
  const installed=offListPsychic?
    ['Psychic Energy MEE','Capture Energy RCL']:exactPair;
  for(const printing of installed){
    const c=make(printing);
    source.active.cards.push(c);
    source.active.energies.cards.push(c);
  }
  const opponent=new Player();
  opponent.id=202;
  opponent.name='Reference opponent';
  opponent.active.cards.push(make('Tapu Lele-GX GRI'));
  for(const p of [source,opponent]){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(make('Psychic Energy MEE'));
      p.prizes.push(prize);
    }
    for(let i=0;i<6;i++)p.deck.cards.push(make('Psychic Energy MEE'));
  }
  const state=new State();
  state.players=sourceSeat===0?[source,opponent]:[opponent,source];
  state.activePlayer=sourceSeat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  const settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;
  const attackerBefore=source.active.cards.slice();
  const prizeBefore=source.prizes.filter(x=>x.cards.length>0).length;
  const damageBefore=opponent.active.damage;

  let rejectedError=null;
  try{
    store.dispatch(new AttackAction(source.id,'Ghost Eye'));
  }catch(error){
    rejectedError={name:error.name,message:String(error.message)};
  }
  if(!offListPsychic){
    assert.ok(rejectedError,
      'Capture/Water/Jet cannot fund Ghost Eye Psychic required symbol');
    assert.equal(opponent.active.damage,damageBefore,
      'Rejecting an unpaid attack must not put damage counters');
    assert.deepEqual(source.active.cards,attackerBefore,
      'Failed owner attack must preserve original source energy cards');
    assert.equal(source.prizes.filter(x=>x.cards.length>0).length,prizeBefore);
    return {sourceSeat,rank,offListPsychic:false,
      sourceEnergyPrintings:exactPair,
      nativeAttackRejected:true,error:rejectedError,
      candidateDamageCounters:opponent.active.damage/10,
      sourcePrizesTaken:0};
  }
  assert.equal(rejectedError,null,
    'Artificial Psychic-positive control must be payable');
  const prompts=[];
  for(let i=0;i<12;i++){
    const pending=store.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    assert.equal(pending.constructor.name,'WaitPrompt',
      'Ghost Eye positive control should only require native effect waits');
    store.dispatch(new ResolvePromptAction(pending.id,null));
    prompts.push('WaitPrompt');
  }
  assert.deepEqual(store.state.prompts.filter(p=>p.result===undefined),[]);
  assert.equal(opponent.active.damage-damageBefore,70,
    'Seven counters require successfully funded Ghost Eye');
  assert.equal(source.prizes.filter(x=>x.cards.length>0).length,prizeBefore);
  return {sourceSeat,rank,offListPsychic:true,
    sourceEnergyPrintings:installed,nativeAttackRejected:false,
    candidateDamageCounters:opponent.active.damage/10,
    nativePromptTypes:prompts,sourcePrizesTaken:0};
}

function run(){
  const rows=[];
  for(const sourceSeat of [0,1])for(const rank of [3,7]){
    rows.push(paymentArm(sourceSeat,rank,false));
    rows.push(paymentArm(sourceSeat,rank,true));
  }
  assert.equal(rows.length,8);
  return {schema:'agent21-pal-mimikyu-source-ghost-eye-payment-native-v1',
    pin:PIN,rows,originalSource60Played:false,
    sourceEnergyListFrozen:true,sourceGhostEyeSelfPayable:false,
    positiveControlOffSource:true,competitiveQualifiedGames:0};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,paymentArm};
