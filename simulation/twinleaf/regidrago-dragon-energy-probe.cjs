'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root,name));

/**
 * Trace the actual pinned Store's Regidrago VSTAR copy-discard handling.
 * Source-deck inventory, paper printings, and engine semantics are separate.
 * This staged board intentionally excludes all realistic search/policy stages.
 *
 * @param {'dragon-impact'|'ryuno-glide'} scenario
 * @param {'double-dragon'|'basic'} energyPlan
 * @returns {object}
 */
function probe(scenario='dragon-impact',energyPlan='double-dragon') {
  const manager=initializeCards();
  let serial=1;
  const make = name => {
    const card=manager.getCardByName(name);
    assert.ok(card,'Missing pinned engine card '+name);
    card.id=serial++;
    return card;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {CheckProvidedEnergyEffect}=load('game/store/effects/check-effects');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const opponent=new Player(); opponent.id=101;opponent.name='controlled-opponent';
  opponent.active.cards.push(make('Shadow Rider Calyrex VMAX CRE'));
  const mine=new Player();mine.id=202;mine.name='controlled-attacker';
  mine.active.cards.push(make('Regidrago VSTAR SIT'));
  const payload=scenario==='ryuno-glide' ? 'Mega Dragonite ex ASC' : 'Salamence ex JTG';
  const attackName=scenario==='ryuno-glide' ? 'Ryuno Glide' : 'Dragon Impact';
  const dragon=make(payload);
  mine.discard.cards.push(dragon);
  if(energyPlan==='double-dragon') {
    mine.active.energies.cards.push(make('Double Dragon Energy ROS'));
    mine.active.energies.cards.push(make('Double Dragon Energy ROS'));
  } else {
    mine.active.energies.cards.push(make('Grass Energy SVE'));
    mine.active.energies.cards.push(make('Grass Energy SVE'));
    mine.active.energies.cards.push(make('Fire Energy SVE'));
  }
  for(const player of [opponent,mine]){
    player.deck.cards.push(make('Psychic Energy SVE'),make('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();prize.cards.push(make('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  state.players=[opponent,mine];state.turn=2;state.activePlayer=1;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const logIndex=state.logs.length;
  const check=new CheckProvidedEnergyEffect(mine,mine.active);
  store.reduceEffect(state,check);
  const before={
    effectiveEnergy:check.energyMap.map(x=>({
      card:x.card.fullName,provided:x.provides
    })),
    energyPlan,
    attackerEnergyCards:mine.active.energies.cards.map(c=>c.fullName),
    opponentDamage:opponent.active.damage,
    opponentHp:opponent.active.getPokemonCard()?.hp
  };
  let dispatchError=null;
  try {
    store.dispatch(new AttackAction(mine.id,'Apex Dragon'));
  } catch(error) {
    dispatchError=String(error.message||error);
  }
  const steps=[];
  let stoppedAt=null;
  for(let i=0;i<10;i++){
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(!prompt) break;
    const name=prompt.constructor.name;
    const entry={
      prompt:name,
      choices: Array.isArray(prompt.cards) ? prompt.cards.map(c=>c.fullName) : null,
      keys:Object.keys(prompt).filter(k=>/count|energy|min|max|card/i.test(k)).slice(0,12)
    };
    steps.push(entry);
    if(name==='WaitPrompt'){
      store.dispatch(new ResolvePromptAction(prompt.id,true));
      continue;
    }
    if(name==='ChooseAttackPrompt'){
      const card=prompt.cards.find(c=>c.fullName===dragon.fullName);
      if(!card){stoppedAt='copy-source-unavailable';break;}
      const attack=card.attacks.find(a=>a.name===attackName);
      if(!attack){stoppedAt='printed-attack-unavailable';break;}
      entry.valid=prompt.validate(attack);
      if(!entry.valid){stoppedAt='copied-attack-invalid';break;}
      store.dispatch(new ResolvePromptAction(prompt.id,attack));
      continue;
    }
    stoppedAt='unresolved-'+name;
    break;
  }
  const pending=state.prompts.filter(p=>p.result===undefined)
    .map(p=>p.constructor.name);
  const after={
    attackerEnergyCards:mine.active.energies.cards.map(c=>c.fullName),
    attackerDiscardCards:mine.discard.cards.map(c=>c.fullName),
    opponentDamage:opponent.active.damage,
    opponentHp:opponent.active.getPokemonCard()?.hp,
    logTail:state.logs.slice(logIndex).map(l=>String(l.message||l.text||l)).slice(-25)
  };
  return {scenario,energyPlan,dispatchError,engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    payload,attackName,before,steps,stoppedAt,pending,after,
    stagedNotQualified:true};
}

if(require.main===module){
  const cases=[];
  for(const [scenario,energyPlan] of [
    ['dragon-impact','basic'],['dragon-impact','double-dragon'],
    ['ryuno-glide','basic'],['ryuno-glide','double-dragon']
  ]){
    try{
      cases.push(probe(scenario,energyPlan));
    }catch(error){
      if(!String(error.message||error).includes('Missing pinned engine card')) throw error;
      cases.push({scenario,energyPlan,
        missingEngineCard:String(error.message||error),
        stagedNotQualified:true});
    }
  }
  process.stdout.write(JSON.stringify({
    schema:'regidrago-copy-energy-discard-staged-v1',
    cases
  },null,2)+'\n');
}
module.exports={probe};
