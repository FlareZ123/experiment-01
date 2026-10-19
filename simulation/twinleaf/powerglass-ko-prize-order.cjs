'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative @returns {any} */
function engine(relative){return require(path.join(output,relative));}

/** @param {boolean} withPowerglass @returns {object} */
function runArm(withPowerglass){
  const manager=initializeCards();
  /** @param {string} name @returns {any} */
  const card=name=>{
    const match=manager.getCardByName(name);
    assert.ok(match,'Unavailable pinned printing: '+name);
    return match;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {GamePhase}=engine('game/store/state/state');
  const {EndTurnEffect}=engine('game/store/effects/game-phase-effects');
  const {CardList}=engine('game/store/state/card-list');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const player=new Player();
  const opponent=new Player();
  player.id=101;opponent.id=202;
  player.name='attacking-player';opponent.name='defending-player';
  state.players=[player,opponent];
  state.activePlayer=0;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;

  player.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  if(withPowerglass)player.active.tools.push(card('Powerglass SFA'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.damage=999;
  opponent.bench[0].cards.push(card('Mewtwo & Mew-GX UNM'));

  const basic=card('Psychic Energy MEE');
  player.discard.cards.push(basic);
  /** @returns {any} */
  const prize=()=>{
    const list=new CardList();
    list.cards.push(card('Psychic Energy MEE'));
    return list;
  };
  player.prizes=Array.from({length:6},prize);
  opponent.prizes=Array.from({length:6},prize);

  /** @returns {object} */
  function snapshot(){
    return {
      phase:state.phase,
      pendingPrompts:state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name),
      attackerPrizesLeft:player.prizes.filter(p=>p.cards.length>0).length,
      defenderPrizesLeft:opponent.prizes.filter(p=>p.cards.length>0).length,
      defenderActivePresent:opponent.active.getPokemonCard()!==undefined,
      defenderBenchPokemon:opponent.bench.filter(b=>b.getPokemonCard()).length,
      activeBasicEnergyAttached:player.active.energies.cards.includes(basic),
      basicEnergyStillDiscarded:player.discard.cards.includes(basic),
      gameEnded:state.phase===GamePhase.FINISHED
    };
  }

  const before=snapshot();
  assert.equal(before.attackerPrizesLeft,6);
  assert.equal(before.defenderActivePresent,true);
  assert.equal(before.basicEnergyStillDiscarded,true);

  store.reduceEffect(state,new EndTurnEffect(player));
  const afterEndTurnEffect=snapshot();

  let afterAttach=null;
  if(withPowerglass){
    const prompt=state.prompts.find(p=>
      p.result===undefined&&p.constructor.name==='AttachEnergyPrompt');
    assert.ok(prompt,'A Powerglass Basic-Energy prompt must exist');
    assert.equal(afterEndTurnEffect.attackerPrizesLeft,6,
      'Prize-taking already completed before Powerglass attachment');
    assert.equal(afterEndTurnEffect.activeBasicEnergyAttached,false);
    const result=[{
      card:basic,
      to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}
    }];
    assert.equal(prompt.validate(result,state),true);
    store.dispatch(new ResolvePromptAction(prompt.id,result));
    afterAttach=snapshot();
    assert.equal(afterAttach.activeBasicEnergyAttached,true,
      'Powerglass did not attach its legal Basic Energy');
  }

  return {
    mode:withPowerglass?'equipped-Powerglass':'unequipped-control',
    before,afterEndTurnEffect,afterAttach
  };
}

/** @returns {object} */
function run(){
  const equipped=runArm(true);
  const control=runArm(false);
  assert.equal(equipped.afterEndTurnEffect.attackerPrizesLeft,6);
  assert.ok(equipped.afterEndTurnEffect.pendingPrompts
    .includes('AttachEnergyPrompt'));
  assert.equal(equipped.afterEndTurnEffect.defenderActivePresent,false,
    'Lethal defender must be processed for KO before Energy prompt resolves');
  assert.equal(equipped.afterAttach.activeBasicEnergyAttached,true);
  assert.equal(equipped.afterAttach.attackerPrizesLeft,6,
    'Energy was attached only after Prize-taking, rejecting suspected bug');
  assert.ok(equipped.afterAttach.pendingPrompts.includes('ChoosePrizePrompt'),
    'KO Prize selection must be queued after legal Energy attachment');
  assert.ok(control.afterEndTurnEffect.pendingPrompts.includes('ChoosePrizePrompt'),
    'Unequipped control must immediately request KO Prize selection');
  return {
    schema:'pinned-powerglass-endturn-before-ko-prize-v1',
    originalEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    qualification:'staged Store mechanism, post-lethal-damage state only',
    preregistration:'results/twinleaf/powerglass-ko-prize-order-registration.md',
    equipped,control,
    independentGames:0,qualifiedForCompetitiveInference:false
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={run,runArm};
