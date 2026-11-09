'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {installUnderworldPsychicTargetGuard}=
  require('../../simulation/twinleaf/2026-11/agent46-underworld-paper-psychic-target-guard.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} */
const native=file=>require(path.join(OUTPUT,file));

/** @param {0|1} seat @returns {object} Genuine full native Store with Dragon+Psychic recipients. */
function fixture(seat){
  const manager=initializeCards();
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned card not found '+name);
    return c;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const store=new Store({onStateChange(){}});
  const owner=new Player();
  owner.id=seat===0?101:202;
  const opponent=new Player();
  opponent.id=seat===0?202:101;
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=5;
  owner.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const psychic=new PokemonCardList();
  psychic.cards.push(card('Mimikyu GRI'));
  owner.bench.push(psychic);
  const nonPsychic=new PokemonCardList();
  nonPsychic.cards.push(card('Dratini OBF'));
  owner.bench.push(nonPsychic);
  const vmax=new PokemonCardList();
  vmax.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  owner.bench.push(vmax);
  const energy=card('Psychic Energy SVE');
  owner.hand.cards.push(energy);
  for(let i=0;i<15;i++)owner.deck.cards.push(card('Psychic Energy SVE'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>
      CardList.fromList(['Psychic Energy SVE']));
  }
  const action=new UseAbilityAction(owner.id,'Underworld Door',
    {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:2});
  return {store,state,owner,psychic,nonPsychic,energy,card,
    action,PlayerType,SlotType,ResolvePromptAction};
}

/** @param {object} f @returns {object} Real activated card-specific prompt, after animation. */
function beginDoor(f){
  f.store.dispatch(f.action);
  const wait=f.store.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='WaitPrompt');
  assert.ok(wait,'Expected actual Underworld animation');
  f.store.dispatch(new f.ResolvePromptAction(wait.id,null));
  const prompt=f.store.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='AttachEnergyPrompt');
  assert.ok(prompt,'Expected actual card Underworld energy prompt');
  return prompt;
}

for(const seat of [0,1]){
  test('unmodified pinned engine accepts an illegal Dragon Underworld recipient, seat '+seat,()=>{
    const f=fixture(seat);
    const prompt=beginDoor(f);
    const to={player:f.PlayerType.BOTTOM_PLAYER,
      slot:f.SlotType.BENCH,index:1};
    const assignment=[{card:f.energy,to}];
    assert.equal(prompt.validate(assignment),true,
      'Pinned generic prompt does not enforce Psychic recipient');
    f.store.dispatch(new f.ResolvePromptAction(prompt.id,assignment));
    assert.ok(f.nonPsychic.energies.cards.includes(f.energy),
      'Unpatched native Store physically allowed non-Psychic Dratini');
  });

  test('research-owned Underworld guard rejects Dragon and accepts Psychic, seat '+seat,()=>{
    const f=fixture(seat);
    const restore=installUnderworldPsychicTargetGuard();
    try{
      assert.strictEqual(installUnderworldPsychicTargetGuard(),restore);
      const prompt=beginDoor(f);
      assert.ok(prompt.options.blockedTo.some(t=>t.index===1&&
        t.slot===f.SlotType.BENCH));
      const invalid=[{card:f.energy,to:{
        player:f.PlayerType.BOTTOM_PLAYER,slot:f.SlotType.BENCH,index:1}}];
      assert.equal(prompt.validate(invalid),false);
      assert.throws(()=>f.store.dispatch(
        new f.ResolvePromptAction(prompt.id,invalid)));
      assert.equal(f.nonPsychic.energies.cards.length,0);
      const valid=[{card:f.energy,to:{
        player:f.PlayerType.BOTTOM_PLAYER,slot:f.SlotType.BENCH,index:0}}];
      assert.equal(prompt.validate(valid),true);
      f.store.dispatch(new f.ResolvePromptAction(prompt.id,valid));
      assert.ok(f.psychic.energies.cards.includes(f.energy),
        'Owner physical Psychic Energy is actually attached to Mimikyu');
      assert.equal(f.owner.hand.cards.includes(f.energy),false);
    }finally{restore();}
  });
}
