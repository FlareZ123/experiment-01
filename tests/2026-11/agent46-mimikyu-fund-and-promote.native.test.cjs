'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {ownedMimikyu,lastOpponentApex,installMimikyuFundAndPromote}=
  require('../../simulation/twinleaf/2026-11/agent46-mimikyu-fund-and-promote.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} */
const native=file=>require(path.join(OUTPUT,file));

/** @param {0|1} seat @returns {object} Source-printed native State/Store fixture. */
function fixture(seat){
  const manager=initializeCards();
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned native '+name);
    return c;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {AttachEnergyTactic}=
    native('simple-bot/simple-tactics/attach-energy-tactic');
  const {ChoosePokemonPromptResolver}=
    native('simple-bot/prompt-resolver/choose-pokemon-prompt-resolver');
  const {RetreatTactic}=native('simple-bot/simple-tactics/retreat-tactic');
  const {ChoosePokemonPrompt}=
    native('game/store/prompts/choose-pokemon-prompt');
  const {GameMessage}=native('game/game-message');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const d=native('simple-bot/simple-bot-definitions');
  const opts={tactics:d.allSimpleTactics,promptResolvers:d.allPromptResolvers,
    scores:d.defaultStateScores,arbiter:d.defaultArbiterOptions};
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player();
  owner.id=seat===0?101:202;
  const opponent=new Player();
  opponent.id=seat===0?202:101;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=5;
  owner.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const mimikyu=new PokemonCardList();
  mimikyu.cards.push(card('Mimikyu GRI'));
  owner.bench.push(mimikyu);
  owner.bench.push(new PokemonCardList());
  const energy1=card('Psychic Energy SVE');
  const energy2=card('Psychic Energy SVE');
  owner.hand.cards.push(energy1,energy2);
  for(let i=0;i<12;i++)owner.deck.cards.push(card('Psychic Energy SVE'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for(const p of state.players){
    p.prizes=Array.from({length:6},()=>
      CardList.fromList(['Psychic Energy SVE']));
  }
  return {store,state,owner,opponent,mimikyu,energy1,energy2,card,seat,
    attach:new AttachEnergyTactic(opts),
    choose:new ChoosePokemonPromptResolver(opts),
    retreat:new RetreatTactic(opts),
    ChoosePokemonPrompt,GameMessage,PlayerType,SlotType};
}

for(const seat of [0,1]){
  test('owner manual Psychic is physically attached to Mimikyu in seat '+seat,()=>{
    const f=fixture(seat),events=[];
    const restore=installMimikyuFundAndPromote({seat,
      onEvent:e=>events.push(e)});
    try{
      assert.equal(ownedMimikyu(f.state,f.owner,seat).index,0);
      const action=f.attach.useTactic(f.state,f.owner);
      assert.equal(action.type,'PLAY_CARD_ACTION');
      assert.equal(action.handIndex,0);
      assert.equal(action.target.slot,f.SlotType.BENCH);
      assert.equal(action.target.index,0);
      f.store.dispatch(action);
      assert.ok(f.mimikyu.energies.cards.includes(f.energy1),
        'Native Store must move owner physical Psychic from hand to Mimikyu');
      assert.ok(events.some(e=>e.kind==='proposed-manual-psychic-to-mimikyu'));
      assert.equal(f.attach.useTactic(f.store.state,f.store.state.players[seat]),
        undefined,'Owner cannot attach a second manual Energy same turn');
    }finally{restore();}
  });

  test('owner funded Mimikyu is selected for native post-Apex Active prompt, seat '+seat,()=>{
    const f=fixture(seat),events=[];
    f.mimikyu.energies.cards.push(f.energy1,f.energy2);
    f.owner.hand.cards.length=0;
    f.state.playerLastAttack[f.opponent.id]={
      attack:{name:'Apex Dragon'},sourceCard:f.card('Regidrago VSTAR SIT')
    };
    assert.equal(lastOpponentApex(f.state,f.owner),true);
    const prompt=new f.ChoosePokemonPrompt(f.owner.id,
      f.GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
      f.PlayerType.BOTTOM_PLAYER,[f.SlotType.BENCH],
      {min:1,max:1,allowCancel:false});
    const restore=installMimikyuFundAndPromote({seat,
      onEvent:e=>events.push(e)});
    try{
      assert.equal(prompt.validate([f.mimikyu],f.state),true);
      const action=f.choose.resolvePrompt(f.state,f.owner,prompt);
      assert.equal(action?.constructor.name,'ResolvePromptAction');
      assert.deepEqual(action.result,[f.mimikyu]);
      assert.ok(events.some(e=>
        e.kind==='proposed-funded-mimikyu-ko-promotion'));
      f.state.playerLastAttack[f.opponent.id]=null;
      assert.equal(lastOpponentApex(f.state,f.owner),false);
    }finally{restore();}
  });

  test('opponent owner boundary and non-Regidrago board turn off promotion, seat '+seat,()=>{
    const f=fixture(seat);
    assert.equal(ownedMimikyu(f.state,f.opponent,seat),null);
    const restore=installMimikyuFundAndPromote({seat});
    try{
      f.opponent.active.cards.length=0;
      f.opponent.active.cards.push(f.card('Dratini OBF'));
      assert.equal(ownedMimikyu(f.state,f.owner,seat),null);
      const fallback=f.attach.useTactic(f.state,f.owner);
      assert.ok(fallback===undefined||fallback.type==='PLAY_CARD_ACTION');
      assert.throws(()=>installMimikyuFundAndPromote({seat:1-seat}),
        /Conflicting Mimikyu fund owner/);
    }finally{restore();}
  });

  test('one Psychic plus Dimension Valley makes Mimikyu eligible for post-Apex promotion, seat '+seat,()=>{
    const f=fixture(seat),events=[];
    f.owner.hand.cards.splice(f.owner.hand.cards.indexOf(f.energy1),1);
    f.mimikyu.energies.cards.push(f.energy1);
    f.owner.stadium.cards.push(f.card('Dimension Valley PHF'));
    f.state.playerLastAttack[f.opponent.id]={
      attack:{name:'Apex Dragon'},sourceCard:f.card('Regidrago VSTAR SIT')
    };
    const prompt=new f.ChoosePokemonPrompt(f.owner.id,
      f.GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
      f.PlayerType.BOTTOM_PLAYER,[f.SlotType.BENCH],
      {min:1,max:1,allowCancel:false});
    const restore=installMimikyuFundAndPromote({seat,
      onEvent:e=>events.push(e)});
    try{
      const action=f.choose.resolvePrompt(f.state,f.owner,prompt);
      assert.equal(action?.constructor.name,'ResolvePromptAction');
      assert.deepEqual(action.result,[f.mimikyu]);
      assert.ok(events.some(e=>e.kind==='proposed-funded-mimikyu-ko-promotion'));
    }finally{restore();}
  });

  test('manual funding does not attach a second Psychic when Dimension Valley already pays Copycat, seat '+seat,()=>{
    const f=fixture(seat),events=[];
    f.owner.hand.cards.splice(f.owner.hand.cards.indexOf(f.energy1),1);
    f.mimikyu.energies.cards.push(f.energy1);
    f.owner.stadium.cards.push(f.card('Dimension Valley PHF'));
    const restore=installMimikyuFundAndPromote({seat,
      onEvent:e=>events.push(e)});
    try{
      f.attach.useTactic(f.state,f.owner);
      assert.equal(events.some(e=>e.kind==='proposed-manual-psychic-to-mimikyu'),false);
    }finally{restore();}
  });

}
