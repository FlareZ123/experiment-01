'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {specialFundsImmediateAttack}=
  require('../simulation/twinleaf/agent41-energy-attachment-contest.cjs');
const {buildActorCardCatalog}=require(
  '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));

/** Real source-rank15 Guzma switch with source Bunnelby and Mega Lopunny. */
function runSeat(seat,attachment,attackName){
  const manager=initializeCards();
  const cardBySource=(name,set,number)=>{
    const found=manager.getAllCards().filter(c=>
      c.name===name&&c.set===set&&String(c.setNumber)===number);
    assert.equal(found.length,1,'source printing '+name+' '+set+' '+number);
    return found[0].fullName;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {Format,Stage,EnergyType,CardType,SpecialCondition}=
    native('game/store/card/card-types');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,
    SpecialCondition
  });
  let id=97500;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,name);c.id=id++;return c;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=971;opponent.id=972;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.turn=4;state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings=new GameSettings();
  state.gameSettings.format=Format.EXPANDED;
  state.rules=state.gameSettings.rules;
  for(const p of [owner,opponent]){
    for(let i=0;i<5;i++)p.bench.push(new PokemonCardList());
    for(let i=0;i<12;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  owner.active.cards.push(card('Bunnelby PRC'));
  owner.bench[0].cards.push(
    card(cardBySource('Buneary','PFL','83')),
    card(cardBySource('Mega Lopunny ex','PFL','84'))
  );
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.bench[0].cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  owner.hand.cards.push(card('Guzma BUS'),card('Grass Energy MEE'),
    card('Double Colorless Energy SUM'));
  assert.equal(owner.active.getPokemonCard()?.name,'Bunnelby');
  assert.equal(owner.bench[0].getPokemonCard()?.name,'Mega Lopunny ex');

  // Printed Guzma BUS belongs to original rank15. Its native action
  // actually moves Mega Lopunny from Bench to Active this same turn.
  store.dispatch(new PlayCardAction(owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompts=[];
  for(let step=0;step<12;step++){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    const name=pending.constructor.name;
    prompts.push(name);
    if(name==='ChoosePokemonPrompt'){
      const target=prompts.filter(p=>p==='ChoosePokemonPrompt').length===1?
        opponent.bench[0]:owner.bench[0];
      assert.equal(pending.validate([target],state),true);
      store.dispatch(new ResolvePromptAction(pending.id,[target]));
    }else if(name==='WaitPrompt'){
      store.dispatch(new ResolvePromptAction(pending.id,null));
    }else assert.fail('Unexpected Guzma prompt '+name);
  }
  assert.equal(owner.active.getPokemonCard()?.name,'Mega Lopunny ex');
  assert.equal(opponent.active.getPokemonCard()?.name,'Shadow Rider Calyrex VMAX');
  assert.equal(owner.bench[0].getPokemonCard()?.name,'Bunnelby');
  const visible=actorObservation(state,seat);
  const allHeld=visible.ownHand;
  assert.ok(allHeld.includes(attachment));
  const early=specialFundsImmediateAttack(visible,catalog);
  const index=owner.hand.cards.findIndex(c=>c.fullName===attachment);
  assert.ok(index>=0);
  store.dispatch(new PlayCardAction(owner.id,index,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.ok(owner.active.energies.cards.some(c=>c.fullName===attachment));
  const before=opponent.active.damage;
  store.dispatch(new AttackAction(owner.id,attackName));
  for(let step=0;step<25&&state.turn===4;step++){
    const pending=state.prompts.find(p=>p.result===undefined);
    assert.ok(pending,'Unresolved native attack without prompt');
    assert.equal(pending.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  return {seat,attachment,attackName,guzmaPrompts:prompts,
    selectedEarlySpecial:early?.printing??null,
    damage:opponent.active.damage-before,
    nativeTurn:state.turn,
    active:owner.active.getPokemonCard()?.fullName??null,
    opponentActive:opponent.active.getPokemonCard()?.fullName??null,
    qualifications:{staged:true,competitiveGames:0}};
}

for(const seat of [0,1]){
  test('original rank15 Guzma makes Gale Thrust stronger than DCE attack, seat '+seat,()=>{
    const grass=runSeat(seat,'Grass Energy MEE','Gale Thrust');
    const dceSpiky=runSeat(seat,'Double Colorless Energy SUM','Spiky Hopper');
    const dceGale=runSeat(seat,'Double Colorless Energy SUM','Gale Thrust');
    console.log('NATIVE_RANK15_GUZMA_MOVEMENT_ATTACK_CHOICE',
      JSON.stringify({seat,grass,dceSpiky,dceGale}));
    assert.equal(grass.damage,230);
    assert.equal(dceSpiky.damage,160);
    // DCE also funds Gale: movement reverses which ATTACK is strongest.
    // It does not establish that Grass is a stronger attachment than DCE.
    assert.equal(dceGale.damage,230);
    assert.equal(grass.nativeTurn,5);
    assert.equal(dceSpiky.nativeTurn,5);
    assert.equal(dceGale.nativeTurn,5);
    assert.ok(grass.guzmaPrompts.filter(x=>x==='ChoosePokemonPrompt').length>=2);
  });
}
