'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {actorObservation}=require(
  '../../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {VERSION}=
  require('../../simulation/twinleaf/2026-11/agent2-retreat-funding-bridge.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));
const ACTIVE='Dedenne GX UNB';
const TWO_UNIT_ACTIVE='Genesect V FST';
const BENCH='Dialga-GX UPR';
const BASIC='Psychic Energy SVE';
const METAL='Metal Energy SVE';

/**
 * Original printed cards in a genuine pinned native Store, with a deliberate
 * synthetic late-turn board. This is a mechanical witness, not an Aichi deal.
 * @param {0|1} seat
 * @param {1|2} feeUnits Printed Colorless Retreat fee.
 * @returns {object} Physical board and actor-only public catalog.
 */
function stage(seat,feeUnits){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {Stage,EnergyType,CardType,TrainerType,SpecialCondition,Format}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,TrainerCard,Stage,EnergyType,CardType,
    TrainerType,PowerType,SpecialCondition
  });
  const store=new Store({onStateChange(){}});
  const state=store.state,settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;state.rules=settings.rules;
  state.turn=47;state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='retreat-owner';opponent.name='retreat-opponent';
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  let id=982000+seat*1000;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing pinned printed card: '+printing);
    c.id=id++;
    return c;
  };
  const activePrinting=feeUnits===2?TWO_UNIT_ACTIVE:ACTIVE;
  owner.active.cards.push(card(activePrinting));
  owner.bench=Array.from({length:5},()=>new PokemonCardList());
  owner.bench[0].cards.push(card(BENCH));
  opponent.active.cards.push(card('Tapu Lele-GX GRI'));
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  const attach=(slot,printing)=>{
    const energy=card(printing);
    slot.cards.push(energy);
    slot.energies.cards.push(energy);
    return energy;
  };
  const existingPayment=feeUnits===2?attach(owner.active,BASIC):null;
  const benchEnergy=[
    attach(owner.bench[0],METAL),
    attach(owner.bench[0],BASIC),
    attach(owner.bench[0],BASIC)
  ];
  const payment=card(BASIC);
  owner.hand.cards.push(payment);
  for(const player of [owner,opponent]){
    for(let i=0;i<12;i++)player.deck.cards.push(card(BASIC));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card(BASIC));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,catalog,payment,existingPayment,
    benchEnergy,seat,feeUnits,activePrinting};
}

/** @param {object} staged Genuine Store and payment. */
function settleRetreatPrompts(staged){
  const {store,state,owner,payment}=staged;
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const encountered=[];
  for(let i=0;i<20;i++){
    const prompt=state.prompts.find(x=>x.result===undefined);
    if(!prompt)return encountered;
    encountered.push(prompt.constructor.name);
    assert.equal(prompt.playerId,owner.id,
      'Only the physical owner can choose retreat Energy payment');
    if(prompt.constructor.name==='WaitPrompt'){
      store.dispatch(new ResolvePromptAction(prompt.id,null));
    }else if(prompt.constructor.name==='ChooseCardsPrompt'){
      assert.ok(prompt.cards.cards.includes(payment),
        'Exact newly attached Basic must be the offered payment');
      const payments=staged.existingPayment?
        [staged.existingPayment,payment]:[payment];
      assert.equal(prompt.validate(payments),true);
      store.dispatch(new ResolvePromptAction(prompt.id,payments));
    }else assert.fail('Unexpected native retreat prompt '+prompt.constructor.name);
  }
  assert.fail('Retreat prompts failed to settle');
}
for(const feeUnits of [1,2])for(const seat of [0,1])
test('native two-action Basic retreat rescue fee '+feeUnits+' seat '+seat,()=>{
  const s=stage(seat,feeUnits),{store,state,owner,opponent,payment}=s;
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {RetreatAction,AttackAction}=
    native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const before=actorObservation(state,seat);
  const control=chooseActorRootIntent(before,s.catalog,{});
  assert.equal(control.kind,'attach-basic-energy');
  const first=chooseActorRootIntent(before,s.catalog,
    {retreatFundingBridge:true});
  assert.equal(first.kind,'attach-basic-energy');
  assert.equal(first.source,VERSION);
  assert.equal(first.slot,'active');
  assert.equal(first.printing,BASIC);
  store.dispatch(new PlayCardAction(owner.id,first.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.ok(owner.active.energies.cards.includes(payment));
  assert.equal(owner.hand.cards.includes(payment),false);
  const afterAttachment=actorObservation(state,seat);
  const second=chooseActorRootIntent(afterAttachment,s.catalog,
    {retreatFundingBridge:true});
  assert.equal(second.kind,'paid-retreat');
  assert.equal(second.source,VERSION);
  assert.equal(second.benchIndex,0);
  assert.equal(second.retreatCostUnits,feeUnits);
  store.dispatch(new RetreatAction(owner.id,second.benchIndex));
  const prompts=settleRetreatPrompts(s);
  assert.equal(owner.active.getPokemonCard().fullName,BENCH);
  assert.equal(owner.bench[0].getPokemonCard().fullName,s.activePrinting);
  assert.equal(owner.bench[0].energies.cards.length,0);
  assert.ok(owner.discard.cards.includes(payment),
    'Original held physical Basic must enter owner discard as paid Retreat');
  if(s.existingPayment)assert.ok(owner.discard.cards.includes(s.existingPayment),
    'Original pre-attached Basic must also enter owner discard at full fee');
  for(const energy of s.benchEnergy)
    assert.ok(owner.active.energies.cards.includes(energy),
      'Original funded Bench Energy must remain on new Active');
  const beforeDamage=opponent.active.damage;
  store.dispatch(new AttackAction(owner.id,'Shred'));
  for(let i=0;i<12;i++){
    const prompt=state.prompts.find(x=>x.result===undefined);
    if(!prompt)break;
    assert.equal(prompt.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.equal(store.hasPrompts(),false);
  assert.ok(opponent.active.damage>beforeDamage,
    'Native Store must settle the promoted paid Shred attack');
  console.log('AGENT2_RETREAT_FUNDING_NATIVE',JSON.stringify({
    seat,feeUnits,source:VERSION,attachmentAccepted:true,retreatPaid:true,
    attack:'Shred',damageDelta:opponent.active.damage-beforeDamage,
    retreatPromptTypes:prompts,originalPhysicalPayment:true,
    competitivelyQualifiedGame:false
  }));
});
