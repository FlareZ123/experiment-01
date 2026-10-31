'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {plumeriaOwnerOpportunity,visibleEnergyTargets}=
  require('../simulation/twinleaf/agent4-plumeria-opportunity.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=modulePath=>require(path.join(output,modulePath));

/**
 * A native real-Store instant with two legal Basic Actives, one original
 * Plumeria, two discardable original-source-neutral hand cards, and an
 * opposing physically attached Energy in both core board and Energy zones.
 * @param {0|1} seat
 * @returns {object}
 */
function nativePlumeriaRoot(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let nextId=74000;
  const card=printing=>{
    const instance=manager.getCardByName(printing);
    assert.ok(instance,'Unavailable pinned printing: '+printing);
    instance.id=nextId++;
    return instance;
  };
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=371;opponent.id=527;
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Bunnelby PRC'));
  opponent.active.cards.push(card('Bunnelby PRC'));
  const attached=card('Psychic Energy SVE');
  opponent.active.cards.push(attached);
  opponent.active.energies.cards.push(attached);
  owner.hand.cards.push(card('Plumeria BUS'),
    card('Psychic Energy SVE'),card('Psychic Energy SVE'));
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,attached,seat};
}

test('pinned Plumeria native canPlay distinguishes real attached Energy, quota and discard costs for both seats',()=>{
  for(const seat of [0,1]){
    const {store,state,owner,opponent}=nativePlumeriaRoot(seat);
    const initial=plumeriaOwnerOpportunity(store,state,seat);
    assert.equal(initial.heldCopies,1);
    assert.equal(initial.paperScreenedCopies,1);
    assert.equal(initial.nativePlayableCopies,1);
    assert.deepEqual(initial.opponentEnergyTargets.map(p=>p.slot),['active']);
    assert.equal(visibleEnergyTargets(opponent)[0].energies.length,1);
    owner.supporterTurn=1;
    assert.equal(plumeriaOwnerOpportunity(store,state,seat).nativePlayableCopies,0);
    owner.supporterTurn=0;
    owner.hand.cards.pop();
    assert.equal(plumeriaOwnerOpportunity(store,state,seat).nativePlayableCopies,0);
    const replacement=owner.deck.cards.pop();
    owner.hand.cards.push(replacement);
    assert.equal(plumeriaOwnerOpportunity(store,state,seat).nativePlayableCopies,1);
    opponent.active.energies.cards=[];
    opponent.active.cards=opponent.active.cards.filter(
      c=>c.superType!==native('game/store/card/card-types').SuperType.ENERGY);
    assert.equal(plumeriaOwnerOpportunity(store,state,seat).nativePlayableCopies,0);
  }
});

test('genuine pinned Store Plumeria resolves physical two-hand discard and one opponent Energy discard',()=>{
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const {store,state,owner,opponent}=nativePlumeriaRoot(seat);
    const before=plumeriaOwnerOpportunity(store,state,seat);
    assert.equal(before.nativePlayableCopies,1);
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const pending=()=>state.prompts.find(p=>p.result===undefined);
    const first=pending();
    assert.equal(first?.constructor?.name,'ChooseCardsPrompt');
    const two=owner.hand.cards.slice(0,2);
    assert.equal(first.validate(two),true);
    store.dispatch(new ResolvePromptAction(first.id,two));
    const second=pending();
    assert.equal(second?.constructor?.name,'ChoosePokemonPrompt');
    assert.equal(second.validate([opponent.active],state),true);
    store.dispatch(new ResolvePromptAction(second.id,[opponent.active]));
    const third=pending();
    assert.equal(third?.constructor?.name,'ChooseCardsPrompt');
    assert.equal(third.validate([opponent.active.energies.cards[0]]),true);
    const energy=opponent.active.energies.cards[0];
    store.dispatch(new ResolvePromptAction(third.id,[energy]));
    assert.equal(opponent.active.energies.cards.includes(energy),false);
    assert.equal(opponent.discard.cards.includes(energy),true);
    assert.ok(two.every(c=>owner.discard.cards.includes(c)));
    assert.equal(state.prompts.some(p=>p.result===undefined),false);
  }
});

// The after-Pass research fork currently requires an explicit manual opt-in.
// Its normal actor-first composition does not expose the baseline Pass to
// the external wrapper; do not obstruct unrelated pinned native regressions.
if(process.env.AGENT4_PLUMERIA_AFTERPASS_NATIVE_DEV==='true')
  require('./agent4-plumeria-native-intervention.test.cjs');


test('live pinned Store actor observation preserves original Plumeria payment-menu choices on both seats',()=>{
  const {actorObservation} =
    require('../simulation/twinleaf/actor-observation-contract.cjs');
  const {collectOwnerPlumeriaPaymentMenu} =
    require('../simulation/twinleaf/agent4-plumeria-payment-menu.cjs');
  const {PlayCardAction,PlayerType,SlotType} =
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const f=nativePlumeriaRoot(seat);
    const view=actorObservation(f.state,seat);
    const originalHand=view.ownHand.slice();
    const originalOppEnergy=view.opponentPublic.active.energies.slice();
    const menu=collectOwnerPlumeriaPaymentMenu(view);
    assert.equal(menu.reason,'paper-structural-necessary-opportunity');
    assert.equal(menu.offers.length,1);
    assert.equal(menu.totalPaymentPairs,1);
    assert.deepEqual(menu.offers[0].paymentPairs[0].handIndices,[1,2]);
    assert.deepEqual(menu.offers[0].paymentPairs[0].printings,
      ['Psychic Energy SVE','Psychic Energy SVE']);
    assert.equal(menu.targets.length,1);
    assert.deepEqual([menu.targets[0].slot,menu.targets[0].index,
      menu.targets[0].energyIndex,menu.targets[0].energyPrinting],
      ['active',0,0,'Psychic Energy SVE']);
    assert.equal(plumeriaOwnerOpportunity(f.store,f.state,seat)
      .nativePlayableCopies,1,'Genuine native canPlay positive');
    assert.deepEqual(view.ownHand,originalHand);
    assert.deepEqual(view.opponentPublic.active.energies,originalOppEnergy);
    f.store.dispatch(new PlayCardAction(f.owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const pending=()=>f.state.prompts.find(p=>p.result===undefined);
    let prompt=pending();
    assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
    const payment=f.owner.hand.cards.slice(0,2);
    assert.deepEqual(payment.map(c=>c.fullName),
      menu.offers[0].paymentPairs[0].printings);
    assert.equal(prompt.validate(payment),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,payment));
    prompt=pending();
    assert.equal(prompt?.constructor.name,'ChoosePokemonPrompt');
    assert.equal(prompt.validate([f.opponent.active],f.state),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,[f.opponent.active]));
    prompt=pending();
    assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
    const target=f.opponent.active.energies.cards[0];
    assert.equal(target.fullName,menu.targets[0].energyPrinting);
    assert.equal(prompt.validate([target]),true);
    f.store.dispatch(new ResolvePromptAction(prompt.id,[target]));
    assert.equal(f.opponent.discard.cards.includes(target),true);
    assert.equal(payment.every(c=>f.owner.discard.cards.includes(c)),true);
    assert.equal(pending(),undefined);
  }
});


test('native two-seat Plumeria versus Team Flare same-root Active-Energy contrast settles distinct paid costs',()=>{
  const {actorObservation}=
    require('../simulation/twinleaf/actor-observation-contract.cjs');
  const {compareOwnerEnergyDenialSupporters}=
    require('../simulation/twinleaf/agent4-supporter-energy-denial-contest.cjs');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');

  for(const seat of [0,1]){
    function replay(mode){
      const f=nativePlumeriaRoot(seat);
      const flare=initializeCards().getCardByName('Team Flare Grunt XY');
      assert.ok(flare);
      flare.id=992100+seat;
      f.owner.hand.cards.push(flare);
      const before=actorObservation(f.state,seat);
      const contrast=compareOwnerEnergyDenialSupporters(before);
      assert.equal(contrast.flare.length,1);
      assert.equal(contrast.plumeriaPhysicalPaymentPairs,3);
      assert.equal(contrast.plumeriaPairsConsumingFlare,2);
      assert.equal(contrast.plumeriaPairsPreservingFlare,1);
      assert.equal(contrast.sharedActiveEnergyTargets.length,1);
      assert.equal(f.opponent.active.energies.cards.length,1);
      const supporterIndex=mode==='plumeria'?0:3;
      const held=f.owner.hand.cards[supporterIndex];
      assert.equal(held.canPlay(f.store,f.state,f.owner),true);
      f.store.dispatch(new PlayCardAction(f.owner.id,supporterIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      const pending=()=>f.state.prompts.find(p=>p.result===undefined);
      const payment=[];
      if(mode==='plumeria'){
        let p=pending();
        assert.equal(p?.constructor.name,'ChooseCardsPrompt');
        const cards=f.owner.hand.cards.filter(c=>c.fullName==='Psychic Energy SVE')
          .slice(0,2);
        assert.equal(cards.length,2);
        assert.equal(p.validate(cards),true);
        payment.push(...cards);
        f.store.dispatch(new ResolvePromptAction(p.id,cards));
        p=pending();
        assert.equal(p?.constructor.name,'ChoosePokemonPrompt');
        assert.equal(p.validate([f.opponent.active],f.state),true);
        f.store.dispatch(new ResolvePromptAction(p.id,[f.opponent.active]));
      }
      const target=f.attached;
      const p=pending();
      if(p){
        assert.equal(p.constructor.name,'ChooseCardsPrompt');
        assert.equal(p.validate([target]),true);
        f.store.dispatch(new ResolvePromptAction(p.id,[target]));
      }
      assert.equal(pending(),undefined);
      assert.equal(f.opponent.active.energies.cards.includes(target),false);
      assert.equal(f.opponent.discard.cards.includes(target),true);
      assert.equal(f.owner.hand.cards.includes(held),false);
      assert.equal(payment.every(c=>f.owner.discard.cards.includes(c)),true);
      return {before,contrast,handAfter:f.owner.hand.cards.map(c=>c.fullName),
        paid:payment.map(c=>c.fullName),
        ownerDiscard:f.owner.discard.cards.map(c=>c.fullName),
        targetDiscard:f.opponent.discard.cards.map(c=>c.fullName)};
    }
    const plumeria=replay('plumeria');
    const flare=replay('flare');
    assert.deepEqual(plumeria.before,flare.before,
      'Both separate original Store variants must begin from the same actor view');
    assert.deepEqual(plumeria.targetDiscard,flare.targetDiscard,
      'Both original Supporters discard the same Active Energy');
    assert.deepEqual(plumeria.paid,
      ['Psychic Energy SVE','Psychic Energy SVE']);
    assert.deepEqual(flare.paid,[]);
    assert.deepEqual(plumeria.handAfter,['Team Flare Grunt XY']);
    assert.deepEqual(flare.handAfter,
      ['Plumeria BUS','Psychic Energy SVE','Psychic Energy SVE']);
  }
});

test('native two-seat Plumeria can remove Benched Energy while held Team Flare has only Active target',()=>{
  const {actorObservation}=
    require('../simulation/twinleaf/actor-observation-contract.cjs');
  const {compareOwnerEnergyDenialSupporters}=
    require('../simulation/twinleaf/agent4-supporter-energy-denial-contest.cjs');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(const seat of [0,1]){
    const f=nativePlumeriaRoot(seat);
    const manager=initializeCards();
    const flare=manager.getCardByName('Team Flare Grunt XY');
    const benchPokemon=manager.getCardByName('Bunnelby PRC');
    const benchEnergy=manager.getCardByName('Psychic Energy SVE');
    assert.ok(flare&&benchPokemon&&benchEnergy);
    [flare,benchPokemon,benchEnergy].forEach((card,i)=>{
      card.id=992200+seat*10+i;
    });
    f.owner.hand.cards.push(flare);
    const bench=f.opponent.bench[0];
    bench.cards.push(benchPokemon,benchEnergy);
    bench.energies.cards.push(benchEnergy);
    const view=actorObservation(f.state,seat);
    const contrast=compareOwnerEnergyDenialSupporters(view);
    assert.equal(contrast.sharedActiveEnergyTargets.length,1);
    assert.equal(contrast.plumeriaExclusiveBenchEnergyTargets.length,1);
    assert.equal(contrast.flare[0].publicTargets.length,1);
    const originalActiveEnergy=f.attached;
    f.store.dispatch(new PlayCardAction(f.owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const pending=()=>f.state.prompts.find(p=>p.result===undefined);
    let p=pending();
    assert.equal(p?.constructor.name,'ChooseCardsPrompt');
    const payment=f.owner.hand.cards.filter(c=>c.fullName==='Psychic Energy SVE')
      .slice(0,2);
    assert.equal(p.validate(payment),true);
    f.store.dispatch(new ResolvePromptAction(p.id,payment));
    p=pending();
    assert.equal(p?.constructor.name,'ChoosePokemonPrompt');
    assert.equal(p.validate([bench],f.state),true);
    f.store.dispatch(new ResolvePromptAction(p.id,[bench]));
    p=pending();
    assert.equal(p?.constructor.name,'ChooseCardsPrompt');
    assert.equal(p.validate([benchEnergy]),true);
    f.store.dispatch(new ResolvePromptAction(p.id,[benchEnergy]));
    assert.equal(pending(),undefined);
    assert.equal(bench.energies.cards.includes(benchEnergy),false);
    assert.equal(f.opponent.discard.cards.includes(benchEnergy),true);
    assert.equal(f.opponent.active.energies.cards.includes(originalActiveEnergy),true);
    assert.equal(f.owner.hand.cards.includes(flare),true);
  }
});
