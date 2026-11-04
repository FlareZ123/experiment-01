'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename */
const engine=filename=>require(path.join(output,filename));
const {Store}=engine('game/store/store');
const {Player}=engine('game/store/state/player');
const {State,GamePhase}=engine('game/store/state/state');
const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
const {CardList}=engine('game/store/state/card-list');
const {GameSettings}=engine('game/core/game-settings');
const {Format}=engine('game/store/card/card-types');
const {StateScore}=engine('simple-bot/state-score/state-score');
const {defaultStateScores}=engine('simple-bot/simple-bot-definitions');
const {PlayCardAction,SlotType,PlayerType}=
  engine('game/store/actions/play-card-action');
const {AttackAction}=engine('game/store/actions/game-actions');
const {ResolvePromptAction}=
  engine('game/store/actions/resolve-prompt-action');

/** All printed identities are in the authenticated rank11 original 60. */
const held=['Forest Seal Stone SIT','Float Stone BKT','Muscle Band XY'];

/** @param {0|1} seat */
function stage(seat){
  const manager=initializeCards();
  let id=53000000+seat*100000;
  /** @param {string} printing */
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Unknown original source printing '+printing);
    c.id=id++;return c;
  };
  const owner=new Player(),foe=new Player();
  owner.id=seat===0?101:202;
  foe.id=seat===0?202:101;
  owner.active.cards.push(card('Mega Absol ex M1L'));
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.bench[0].cards.push(card('Latias ex SSP'));
  for(let n=0;n<3;n++){
    const e=card('Darkness Energy MEE');
    owner.active.cards.push(e);owner.active.energies.cards.push(e);
  }
  owner.hand.cards.push(...held.map(card));
  foe.active.cards.push(card('Mega Absol ex M1L'));
  foe.bench=Array.from({length:5},()=>new PokemonCardList());
  foe.bench[0].cards.push(card('Oranguru V ASR'));
  for(const p of [owner,foe]){
    for(let n=0;n<8;n++)p.deck.cards.push(card('Darkness Energy MEE'));
    for(let n=0;n<6;n++){
      const prize=new CardList();
      prize.cards.push(card('Darkness Energy MEE'));
      p.prizes.push(prize);
    }
  }
  const state=new State(),settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;state.rules=settings.rules;
  state.players=seat===0?[owner,foe]:[foe,owner];
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=7;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {state,owner,foe,store,seat};
}

/** @param {object} fixture @param {number} index */
function attachAndAttack(fixture,index){
  const {store,state,owner,foe}=fixture;
  store.dispatch(new PlayCardAction(owner.id,index,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  const cardAttached=owner.active.tools[0]?.fullName;
  const initialDamage=foe.active.damage;
  store.dispatch(new AttackAction(owner.id,'Claw of Darkness'));
  const prompts=[];
  for(let j=0;j<8;j++){
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(!prompt)break;
    prompts.push(prompt.constructor.name);
    assert.equal(prompt.constructor.name,'WaitPrompt',
      'Unknown pending prompt cannot be silently settled');
    store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.equal(store.hasPrompts(),false);
  return {cardAttached,dealt:foe.active.damage-initialDamage,prompts};
}
for(const seat of [0,1]){
  test('native scoring ignores Tool printing though paper attacks differ seat '+seat,()=>{
    const x=stage(seat);
    const stateScore=new StateScore({scores:defaultStateScores});
    const base=stateScore.getScore(x.state,x.owner.id);
    const nativeHypothetical=[];
    for(const tool of x.owner.hand.cards){
      x.owner.active.tools.push(tool);
      nativeHypothetical.push(stateScore.getScore(x.state,x.owner.id));
      assert.equal(x.owner.active.tools.pop(),tool);
    }
    assert.equal(x.owner.active.tools.length,0);
    assert.equal(new Set(nativeHypothetical).size,1,
      'Pin has changed: native StateScore distinguishes Tool identities');
    assert.ok(nativeHypothetical[0]>base,
      'Native all-tools hypothesis must look attractive by generic location');

    const floatArm=stage(seat),muscleArm=stage(seat);
    const float=attachAndAttack(floatArm,1);
    const muscle=attachAndAttack(muscleArm,2);
    assert.equal(float.cardAttached,'Float Stone BKT');
    assert.equal(muscle.cardAttached,'Muscle Band XY');
    assert.equal(float.dealt,200);
    assert.equal(muscle.dealt,220);
    assert.deepEqual(float.prompts,muscle.prompts);
    console.log('AGENT2_TOOL_SCORE_IDENTITY_NATIVE',JSON.stringify({
      seat,authenticOriginalRank:11,
      printedToolOrder:held,
      nativeToolScores:nativeHypothetical,
      baselineScore:base,
      floatDamage:float.dealt,muscleDamage:muscle.dealt,
      differential:muscle.dealt-float.dealt,
      actualStoreActionsAccepted:true,
      cardScoreEffectAwareness:false,
      simulatedCompetitiveGames:0
    }));
  });
}
