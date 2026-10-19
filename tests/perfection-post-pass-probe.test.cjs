'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {probePostPassPerfection,detachedPerfectionAttempt}=require(
  '../simulation/twinleaf/perfection-post-pass-probe.cjs');

test('owner-visible gating only probes a passing active Mewtwo & Mew-GX',()=>{
  const active={name:'Mewtwo & Mew-GX'};
  const state={prompts:[],players:[{
    id:202,active:{getPokemonCard:()=>active}
  }]};
  let observed=0;
  const attempt=(_state,id)=>{
    assert.equal(id,202);
    observed++;
    return {activationAccepted:true,choicePromptObserved:true,
      validAttackSources:[{source:'Gengar & Mimikyu-GX',attack:'Horror House-GX'}],
      validAttackNames:['Horror House-GX']};
  };
  assert.equal(probePostPassPerfection(state,101,attempt),null);
  active.name='Pidgey';
  assert.equal(probePostPassPerfection(state,202,attempt),null);
  active.name='Mewtwo & Mew-GX';
  state.prompts.push({result:undefined});
  assert.equal(probePostPassPerfection(state,202,attempt),null);
  state.prompts.pop();
  const result=probePostPassPerfection(state,202,attempt);
  assert.equal(observed,1);
  assert.equal(result.playerId,202);
  assert.equal(result.activePokemon,'Mewtwo & Mew-GX');
  assert.deepEqual(result.validAttackNames,['Horror House-GX']);
  assert.deepEqual(result.publicCopySourceInventory,{bench:[],discard:[]});
  assert.equal(result.evidenceType,'post-choice-cloned-perfection-attack-menu-v1');
});

test('pinned Store clone may expose a paid Horror House-GX Perfection choice',t=>{
  const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  if(!fs.existsSync(root))return t.skip('Compile pinned Twinleaf first');
  const load=name=>require(path.join(root,name));
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const cards=initializeCards();
  let id=1;
  const make=fullName=>{
    const card=cards.getCardByName(fullName);
    assert.ok(card,'Pinned card missing: '+fullName);
    card.id=id++;
    return card;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const defending=new Player();
  defending.id=101;
  defending.name='defender';
  defending.active.cards.push(make('Pidgey MEW'));
  const attacker=new Player();
  attacker.id=202;
  attacker.name='candidate';
  attacker.active.cards.push(make('Mewtwo & Mew-GX UNM'));
  attacker.active.energies.cards.push(make('Psychic Energy SVE'));
  attacker.discard.cards.push(make('Gengar & Mimikyu-GX TEU'));
  for(const player of [defending,attacker]){
    player.deck.cards.push(make('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(make('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=store.state;
  state.players=[defending,attacker];
  state.turn=2;
  state.activePlayer=1;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const before={
    sourceDiscard:attacker.discard.cards.map(x=>x.fullName),
    sourceEnergy:attacker.active.energies.cards.map(x=>x.fullName),
    logCount:state.logs.length,pending:state.prompts.length,
    usedGX:attacker.usedGX
  };
  const previousRandom=Math.random;
  const result=probePostPassPerfection(state,attacker.id);
  assert.equal(Math.random,previousRandom);
  assert.equal(result.activationAccepted,true);
  assert.equal(result.choicePromptObserved,true);
  assert.ok(result.publicCopySourceInventory.discard.some(card=>
    card.printing==='Gengar & Mimikyu-GX TEU' &&
    card.attacks.includes('Horror House-GX')));
  assert.deepEqual(result.publicCopySourceInventory.bench,[]);
  assert.ok(result.validAttackNames.includes('Horror House-GX'),
    'One Psychic attached should make Gengar copy Horror House-GX selectable');
  assert.deepEqual({
    sourceDiscard:attacker.discard.cards.map(x=>x.fullName),
    sourceEnergy:attacker.active.energies.cards.map(x=>x.fullName),
    logCount:state.logs.length,pending:state.prompts.length,
    usedGX:attacker.usedGX
  },before,'Read-only detached probe must not mutate the real Source or GX state');
  assert.equal(state.activePlayer,1);
});

test('negative menu is a diagnostic and cannot be promoted to a game outcome',()=>{
  const state={prompts:[],players:[{
    id:202,active:{getPokemonCard:()=>({name:'Mewtwo & Mew-GX'})}
  }]};
  const out=probePostPassPerfection(state,202,()=>({
    activationAccepted:false,choicePromptObserved:false,
    validAttackNames:[],validAttackSources:[]
  }));
  assert.equal(out.activationAccepted,false);
  assert.equal(out.choicePromptObserved,false);
  assert.equal(out.validAttackNames.length,0);
  assert.match(out.scope,/without competitive/);
});
