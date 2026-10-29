'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorChooseAttackInput,chooseActorCopiedAttack,isPrintedGxAttack}=
  require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));

/**
 * Inject an explicit, paid printed Perfection attack opportunity into a
 * genuine pinned Store. An injected state is a mechanical fixture rather
 * than evidence of opening/setup reachability or policy game strength.
 */
function scene(){
  const manager=initializeCards();
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  let id=510000;
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Missing pinned printing: '+name);
    result.id=id++;
    return result;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const defender=new Player(),owner=new Player();
  defender.id=101;owner.id=202;
  defender.active.cards.push(card('Pidgey MEW'));
  owner.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  owner.discard.cards.push(card('Mewtwo & Mew-GX UNM'));
  owner.discard.cards.push(card('Gengar & Mimikyu-GX TEU'));
  for(let i=0;i<3;i++){
    const energy=card('Psychic Energy SVE');
    owner.active.cards.push(energy);
    owner.active.energies.cards.push(energy);
  }
  for(const player of [defender,owner]){
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  state.players=[defender,owner];
  state.turn=2;
  state.activePlayer=1;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  // Simulate a genuinely previously consumed public GX resource.
  owner.usedGX=true;
  return {store,state,owner};
}

test('pinned Perfection prompt excludes printed missing-flag GX after prior GX use',()=>{
  const {store,state,owner}=scene();
  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');

  const printed=owner.discard.cards.find(c=>c.fullName==='Mewtwo & Mew-GX UNM');
  const miraculous=printed.attacks.find(a=>a.name==='Miraculous Duo-GX');
  assert.ok(miraculous,'Pinned missing-flag printed GX card is absent');
  assert.notEqual(miraculous.gxAttack,true,
    'Pinned metadata alias has changed, revisit fixture');
  assert.equal(isPrintedGxAttack(miraculous),true);

  store.dispatch(new UseAbilityAction(owner.id,'Perfection',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  for(let i=0;pending()?.constructor.name==='WaitPrompt'&&i<10;i++)
    store.dispatch(new ResolvePromptAction(pending().id,true));
  const prompt=pending();
  assert.equal(prompt?.constructor.name,'ChooseAttackPrompt');
  const actor=actorChooseAttackInput(state,1);
  assert.equal(actor.actor.ownPublic.publicTurnRestrictions.gxUsed,true);
  const chosen=chooseActorCopiedAttack(actor);
  assert.ok(Number.isSafeInteger(chosen.sourceIndex));
  assert.ok(Number.isSafeInteger(chosen.attackIndex));
  const attack=prompt.cards[chosen.sourceIndex].attacks[chosen.attackIndex];
  assert.equal(isPrintedGxAttack(attack),false,
    'Spent GX attack cannot be selected from a native owner menu');
  assert.equal(attack.name,'Poltergeist');
  assert.equal(prompt.validate(attack),true,
    'Native prompt must validate the actor-selected paid non-GX attack');
  store.dispatch(new ResolvePromptAction(prompt.id,attack));
  assert.equal(state.players[1].usedGX,true,
    'Selected non-GX attack never resets a previously consumed GX quota');
});
