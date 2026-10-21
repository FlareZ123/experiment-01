'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const pinned=name=>require(path.join(OUTPUT,name));

/**
 * Staged genuine pinned Store boundary for paper rulebook E-21.
 * A zero-Energy Active Mewtwo receives a held Powerglass as a normal Tool
 * play, ends its turn without an attack, then accepts the resulting optional
 * owner-discard Basic Psychic Energy prompt. This does not use policy wrappers
 * or hidden opponent information and establishes no matchup outcome.
 *
 * @returns {object} Exact native action/zone receipt.
 */
function powerglassAfterPassNative(){
  const cards=initializeCards();
  let nextId=4100;
  const card=printing=>{
    const c=cards.getCardByName(printing);
    assert.ok(c,'Missing pinned card '+printing);
    c.id=nextId++;
    return c;
  };
  const {Store}=pinned('game/store/store');
  const {Player}=pinned('game/store/state/player');
  const {CardList}=pinned('game/store/state/card-list');
  const {GamePhase}=pinned('game/store/state/state');
  const {Format}=pinned('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    pinned('game/store/actions/play-card-action');
  const {PassTurnAction}=pinned('game/store/actions/game-actions');
  const {ResolvePromptAction}=pinned('game/store/actions/resolve-prompt-action');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const me=new Player(),opponent=new Player();
  me.id=101;me.name='owner Powerglass after-pass contract';
  opponent.id=202;opponent.name='opponent';
  state.players=[me,opponent];
  state.activePlayer=0;
  state.turn=42;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;

  const mewtwo=card('Mewtwo & Mew-GX UNM');
  const gengar=card('Gengar & Mimikyu-GX TEU');
  const tool=card('Powerglass SFA');
  const psychic=card('Psychic Energy MEE');
  me.active.cards.push(mewtwo);
  me.bench[0].cards.push(gengar);
  me.hand.cards.push(tool);
  me.discard.cards.push(psychic);
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of [me,opponent]){
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  assert.equal(me.active.energies.cards.length,0);
  assert.equal(me.active.tools.length,0);
  store.dispatch(new PlayCardAction(me.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.ok(me.active.tools.includes(tool),
    'Genuine PlayCardAction did not equip Powerglass');
  assert.ok(!me.hand.cards.includes(tool),
    'Held Powerglass remained in hand after native Tool play');
  assert.equal(me.active.energies.cards.length,0);
  store.dispatch(new PassTurnAction(me.id));

  const seen=[];
  let prompt=null;
  for(let i=0;i<16;i++){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    seen.push(pending.constructor.name);
    if(pending.constructor.name==='AttachEnergyPrompt'){
      prompt=pending;
      break;
    }
    assert.equal(pending.constructor.name,'WaitPrompt',
      'Unexpected pending prompt after end turn without attack');
    store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.ok(prompt,'Passing without an attack did not trigger Powerglass');
  assert.strictEqual(prompt.cardList,me.discard,
    'Powerglass prompt must expose only the owner's discard');
  assert.equal(prompt.options.min,0);
  assert.equal(prompt.options.max,1);
  const assignment=[{
    card:psychic,
    to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}
  }];
  assert.equal(prompt.validate(assignment),true,
    'Exact owner Basic Psychic assignment rejected');
  store.dispatch(new ResolvePromptAction(prompt.id,assignment));
  assert.ok(me.active.energies.cards.includes(psychic),
    'Genuine Powerglass attachment not present on Active Mewtwo');
  assert.ok(!me.discard.cards.includes(psychic),
    'Genuine Basic Energy remains in owner discard after accepted prompt');
  return {
    engine:'pinned Twinleaf source, staged genuine Store',
    source:{active:mewtwo.fullName,copyDonor:gengar.fullName,
      tool:tool.fullName,energy:psychic.fullName},
    rootActions:['PlayCardAction','PassTurnAction','ResolvePromptAction'],
    observedPrompts:seen,
    after:{
      activeToolCount:me.active.tools.length,
      activeEnergyCount:me.active.energies.cards.length,
      ownDiscardPsychicRemaining:me.discard.cards.includes(psychic),
      usedGX:me.usedGX
    },
    paperRule:'Advanced Player Rulebook v3.4 E-21',
    qualification:'staged mechanic only; no autonomous response or competitive game'
  };
}

if(require.main===module)
  console.log(JSON.stringify(powerglassAfterPassNative(),null,2));
module.exports={powerglassAfterPassNative};
