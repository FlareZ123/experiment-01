'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {underworldOpportunity,installUnderworldMimikyuFocus}=
  require('../../simulation/twinleaf/2026-11/agent46-underworld-mimikyu-energy-focus.cjs');
const {mimikyuCopycatReadiness}=
  require('../../simulation/twinleaf/agent50-mimikyu-copycat-readiness.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} */
const native=file=>require(path.join(OUTPUT,file));

/** @param {0|1} seat @returns {object} Native pre-evolved Underworld Door fixture. */
function fixture(seat){
  const manager=initializeCards();
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned card missing: '+name);
    return c;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {UseAbilityTactic}=native('simple-bot/simple-tactics/use-ability-tactic');
  const {AttachEnergyPromptResolver}=
    native('simple-bot/prompt-resolver/attach-energy-prompt-resolver');
  const d=native('simple-bot/simple-bot-definitions');
  const options={
    tactics:d.allSimpleTactics,promptResolvers:d.allPromptResolvers,
    scores:d.defaultStateScores,arbiter:d.defaultArbiterOptions
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const candidate=new Player();
  candidate.id=seat===0?101:202;
  const opponent=new Player();
  opponent.id=seat===0?202:101;
  state.players=seat===0?[candidate,opponent]:[opponent,candidate];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=5;
  candidate.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const mimikyu=new PokemonCardList();
  mimikyu.cards.push(card('Mimikyu GRI'));
  candidate.bench.push(mimikyu);
  const calyrex=new PokemonCardList();
  calyrex.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  candidate.bench.push(calyrex);
  const energy=card('Psychic Energy SVE');
  candidate.hand.cards.push(energy);
  for(let i=0;i<15;i++)candidate.deck.cards.push(card('Psychic Energy SVE'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for(const p of state.players){
    p.prizes=Array.from({length:6},()=>
      CardList.fromList(['Psychic Energy SVE']));
  }
  return {store,state,candidate,opponent,mimikyu,calyrex,energy,card,seat,
    ability:new UseAbilityTactic(options),
    resolver:new AttachEnergyPromptResolver(options)};
}

for(const seat of [0,1]){
  test('real Underworld Door physically attaches owner Psychic to Mimikyu, seat '+seat,()=>{
    const x=fixture(seat),events=[];
    const prior=underworldOpportunity(x.state,x.candidate,seat);
    assert.equal(prior.mimikyuIndex,0);
    assert.equal(prior.vmarks.length,1);
    const restore=installUnderworldMimikyuFocus({seat,onEvent:e=>events.push(e)});
    try{
      assert.strictEqual(installUnderworldMimikyuFocus({seat}),restore);
      const proposal=x.ability.useTactic(x.state,x.candidate);
      assert.equal(proposal?.constructor?.name,'UseAbilityAction');
      assert.equal(proposal.name,'Underworld Door');
      x.store.dispatch(proposal);
      // Native UsePowerEffect displays a WaitPrompt for the Ability animation
      // before the card-specific Underworld Door attachment prompt exists.
      const wait=x.store.state.prompts.find(prompt=>
        prompt.result===undefined&&prompt.constructor.name==='WaitPrompt');
      assert.ok(wait,'Pinned native Ability should open its animation WaitPrompt');
      const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
      x.store.dispatch(new ResolvePromptAction(wait.id,null));
      const attach=x.store.state.prompts.find(prompt=>
        prompt.result===undefined&&prompt.constructor.name==='AttachEnergyPrompt');
      assert.ok(attach,'Real Underworld Door must create actual physical attach prompt');
      assert.equal(attach.message,'ATTACH_ENERGY_TO_BENCH');
      const answer=x.resolver.resolvePrompt(x.store.state,x.candidate,attach);
      assert.equal(answer?.constructor?.name,'ResolvePromptAction');
      assert.equal(answer.result.length,1);
      assert.strictEqual(answer.result[0].card,x.energy);
      assert.equal(answer.result[0].to.slot,2);
      assert.equal(answer.result[0].to.index,0);
      assert.equal(attach.validate(answer.result),true);
      x.store.dispatch(answer);
      assert.ok(x.mimikyu.energies.cards.includes(x.energy),
        'Native Store must attach actual owned physical Psychic card to Mimikyu');
      assert.equal(x.candidate.hand.cards.includes(x.energy),false);
      assert.equal(x.candidate.marker.hasMarker('UNDERWORLD_DOOR_MARKER',
        x.calyrex.getPokemonCard()),true);
      assert.ok(events.some(e=>e.kind==='proposed-underworld-door'));
      assert.ok(events.some(e=>e.kind==='proposed-physical-underworld-to-mimikyu'));
    }finally{restore();}
    // Idempotent restoration leaves the native printed action method intact.
    assert.equal(underworldOpportunity(x.store.state,x.candidate,seat),null,
      'The once-per-turn Underworld Door has been spent');
  });

  test('opponent and unrelated public boards never trigger energy emphasis, seat '+seat,()=>{
    const x=fixture(seat);
    const restore=installUnderworldMimikyuFocus({seat});
    try{
      assert.equal(underworldOpportunity(x.state,x.opponent,seat),null);
      x.opponent.active.cards.length=0;
      x.opponent.active.cards.push(x.card('Dratini OBF'));
      assert.equal(underworldOpportunity(x.state,x.candidate,seat),null);
      assert.throws(()=>installUnderworldMimikyuFocus({seat:1-seat}),
        /Conflicting Underworld owner/);
    }finally{restore();}
  });

  test('Dimension Valley makes one Psychic sufficient; Underworld does not overfund Mimikyu, seat '+seat,()=>{
    const x=fixture(seat);
    x.mimikyu.energies.cards.push(x.card('Psychic Energy SVE'));
    x.candidate.stadium.cards.push(x.card('Dimension Valley PHF'));
    const readiness=mimikyuCopycatReadiness(x.state,x.candidate,seat,
      {slot:'bench',index:0});
    assert.equal(readiness.status,'payable');
    assert.equal(readiness.required,1);
    assert.equal(readiness.attached,1);
    assert.deepEqual(readiness.costSymbols,['P']);
    assert.equal(underworldOpportunity(x.state,x.candidate,seat),null,
      'Underworld Door must not spend another Psychic on an already payable Copycat');
  });

  test('one Psychic without Dimension Valley remains underfunded, seat '+seat,()=>{
    const x=fixture(seat);
    x.mimikyu.energies.cards.push(x.card('Psychic Energy SVE'));
    const readiness=mimikyuCopycatReadiness(x.state,x.candidate,seat,
      {slot:'bench',index:0});
    assert.equal(readiness.status,'not-payable');
    assert.equal(readiness.required,2);
    assert.equal(underworldOpportunity(x.state,x.candidate,seat)?.mimikyuIndex,0);
  });

}
