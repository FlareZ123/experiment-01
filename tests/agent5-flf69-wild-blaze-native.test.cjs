'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(root,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {GamePhase}=native('game/store/state/state');
const {Format}=native('game/store/card/card-types');
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');

const variants=[
  {name:'M Charizard EX FLF',own:10,other:5},
  {name:'M Charizard-EX FLF 69',own:5,other:10}
];

/**
 * An actual pinned native Store attack, staged at the attack window.
 * The complete five-Energy cost and all target and deck zones exist physically.
 * This deliberately excludes initial-deal probabilities, normal evolution,
 * opponent policy, and competitive outcomes.
 *
 * @param {0|1} seat
 * @param {string} printing
 * @returns {object}
 */
function attack(seat,printing){
  const cards=initializeCards();
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.gameSettings.format=Format.EXPANDED;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;owner.name='FLF69 owner';
  opponent.id=202;opponent.name='FLF69 opponent';
  state.players=seat===0?[owner,opponent]:[opponent,owner];

  /** @param {string} fullName */
  const get=fullName=>{
    const result=cards.getCardByName(fullName);
    assert.ok(result,'Missing exact native printing '+fullName);
    return result;
  };
  const mega=get(printing);
  assert.equal(mega.name,'M Charizard-EX');
  assert.equal(mega.set,'FLF');
  assert.equal(String(mega.setNumber),'69');
  assert.equal(mega.attacks[0].name,'Wild Blaze');
  assert.equal(mega.attacks[0].damage,300);
  owner.active.cards.push(mega);
  const fire=cards.getAllCards().find(c=>c.name==='Fire Energy');
  const dark=cards.getAllCards().find(c=>c.name==='Darkness Energy');
  assert.ok(fire&&dark,'Real printed basic Energy is required for payment');
  // Two Fire, one Darkness and two additional Fire satisfy FF D CC.
  for(const fullName of [fire.fullName,fire.fullName,dark.fullName,
    fire.fullName,fire.fullName]){
    const energy=get(fullName);
    owner.active.cards.push(energy);
    owner.active.energies.cards.push(energy);
  }
  opponent.active.cards.push(get('Shadow Rider Calyrex VMAX CRE'));
  assert.ok(opponent.active.getPokemonCard().hp>300,
    'Target must survive so no unrelated Prize prompt obscures the deck effect');
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(get('Exeggcute PLF'));
      return prize;
    });
    for(let i=0;i<10;i++)player.deck.cards.push(get('Exeggcute PLF'));
  }
  assert.equal(owner.deck.cards.length,10);
  assert.equal(opponent.deck.cards.length,10);
  store.dispatch(new AttackAction(owner.id,'Wild Blaze'));
  for(let step=0;step<30 && store.hasPrompts();step++){
    const pending=state.prompts.find(p=>p.result===undefined);
    assert.ok(pending,'Unresolved native prompt without a selectable object');
    assert.equal(pending.constructor.name,'WaitPrompt',
      'Unexpected non-wait prompt: '+pending.constructor.name);
    store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(store.hasPrompts(),false,'Native attack did not settle');
  return {
    seat,printing,ownerDeck:owner.deck.cards.length,
    opponentDeck:opponent.deck.cards.length,
    ownerDiscard:owner.discard.cards.length,
    opponentDiscard:opponent.discard.cards.length,
    damage:opponent.active.damage,
    turn:state.turn,
    competitiveQualified:false
  };
}

for(const v of variants){
  for(const seat of [0,1]){
    test('FLF69 real native Wild Blaze '+v.name+' seat '+seat,()=>{
      const r=attack(seat,v.name);
      assert.equal(r.damage,300,'Both variants must settle the actual 300 damage');
      assert.equal(r.ownerDeck,v.own,'Actual native owner deck transition');
      assert.equal(r.opponentDeck,v.other-1,
        'Opponent draws exactly one card at the start of its next turn');
      assert.equal(r.ownerDiscard,10-v.own,'Exact own top-five discard count');
      assert.equal(r.opponentDiscard,10-v.other,'Exact opponent top-five discard count');
      assert.equal(r.turn,5,'Native attack ends the attacking turn');
      console.log('AGENT5_FLF69_NATIVE_ATTACK',JSON.stringify(r));
    });
  }
}
