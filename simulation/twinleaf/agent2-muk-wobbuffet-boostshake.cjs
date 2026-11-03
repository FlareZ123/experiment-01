'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const VERSION='agent2-boostshake-muk-wobbuffet-original-print-native-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} pathName @returns {object} */
const engine=pathName=>require(path.join(output,pathName));

/**
 * Stage valid card identities, then actually dispatch owner Boost Shake,
 * answer real owner deck and evolution target prompts, and inspect resulting
 * official Wobbuffet/Muk and self Basic Ability lock effects.
 * The Grimer has been put into play during this same turn, which a normal
 * Stage1 hand play cannot evolve. Boost Shake text is the exception.
 *
 * @param {{seat:0|1,wobbuffetActive:boolean}} input
 * @returns {object}
 */
function runCase(input){
  const {Store}=engine('game/store/store');
  const {State,GamePhase}=engine('game/store/state/state');
  const {Player}=engine('game/store/state/player');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {GameSettings}=engine('game/core/game-settings');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {CheckPokemonPowersEffect}=
    engine('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=engine('game/store/prefabs/prefabs');

  const manager=initializeCards();
  let nextId=500;
  /** @param {string} name */
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Pinned native class not found: '+name);
    found.id=nextId++;
    return found;
  };
  const owner=new Player(),source=new Player();
  owner.id=101;source.id=202;
  owner.name='Apex Alchemy staged challenger';
  source.name='Original rank7 Wobbuffet source printing';
  owner.active.cards.push(card('Regidrago V SIT'));
  const grimer=card('Alolan Grimer SUM'),muk=card('Alolan Muk SUM');
  const grimerSlot=new PokemonCardList();
  grimerSlot.cards.push(grimer);
  grimerSlot.pokemonPlayedTurn=3; // This Basic entered play this same turn.
  owner.bench.push(grimerSlot);
  const vstar=card('Regidrago VSTAR SIT');
  const evolvedVstar=new PokemonCardList();
  evolvedVstar.cards.push(card('Regidrago V SIT'),vstar);
  evolvedVstar.pokemonPlayedTurn=1;
  owner.bench.push(evolvedVstar);
  const latias=card('Latias ex SSP');
  const latiasSlot=new PokemonCardList();
  latiasSlot.cards.push(latias);
  owner.bench.push(latiasSlot);
  const shake=card('Boost Shake EVS');
  owner.hand.cards.push(shake);
  owner.deck.cards.push(muk,card('Psychic Energy SVE'));

  const wob=card('Wobbuffet PHF');
  if(input.wobbuffetActive)source.active.cards.push(wob);
  else{
    source.active.cards.push(card('Regidrago V SIT'));
    const wobSlot=new PokemonCardList();
    wobSlot.cards.push(wob);
    source.bench.push(wobSlot);
  }
  for(const player of [owner,source]){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State(),settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=input.seat;
  state.players=input.seat===0?[owner,source]:[source,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;

  /** @param {object} p @param {object} pokemon @param {string} name */
  const observedPower=(p,pokemon,name)=>{
    const power=pokemon.powers.find(x=>x.name===name);
    assert.ok(power,'Pinned Ability absent '+pokemon.fullName+'/'+name);
    const check=new CheckPokemonPowersEffect(p,pokemon);
    store.reduceEffect(state,check);
    return {
      blocked:Boolean(IS_ABILITY_BLOCKED(store,state,p,pokemon,power)),
      visible:check.powers.some(x=>x.name===name)
    };
  };
  const before={
    wob:observedPower(source,wob,'Bide Barricade'),
    legacy:observedPower(owner,vstar,'Legacy Star'),
    latias:observedPower(owner,latias,'Skyliner')
  };
  const actions=[];
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  store.dispatch(new PlayCardAction(owner.id,0,board));
  actions.push('actual-Boost-Shake-PlayCardAction');
  const search=state.prompts.find(p=>p.result===undefined);
  assert.equal(search?.constructor.name,'ChooseCardsPrompt');
  assert.equal(search.playerId,owner.id);
  assert.strictEqual(search.cards,owner.deck);
  assert.equal(search.validate([muk],state),true);
  store.dispatch(new ResolvePromptAction(search.id,[muk]));
  actions.push('owner-deck-Muk-search-prompt');
  const target=state.prompts.find(p=>p.result===undefined);
  assert.equal(target?.constructor.name,'ChoosePokemonPrompt');
  assert.equal(target.playerId,owner.id);
  assert.equal(target.validate([grimerSlot],state),true);
  store.dispatch(new ResolvePromptAction(target.id,[grimerSlot]));
  actions.push('real-Grimer-Boost-Shake-evolution-prompt');
  const shuffle=state.prompts.find(p=>p.result===undefined);
  assert.equal(shuffle?.constructor.name,'ShuffleDeckPrompt');
  const sequence=owner.deck.cards.map((_,i)=>i);
  assert.equal(shuffle.validate(sequence,state),true);
  store.dispatch(new ResolvePromptAction(shuffle.id,sequence));
  actions.push('owner-shuffle-resolved');
  // Boost Shake ends the turn. Native phase transitions expose silent WaitPrompts;
  // settle them so the Item's deferred cleanup completes before custody checks.
  for(let i=0;i<4;i++){
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    assert.equal(pending.constructor.name,'WaitPrompt');
    assert.equal(pending.validate(null,state),true);
    store.dispatch(new ResolvePromptAction(pending.id,null));
    actions.push('phase-transition-wait-resolved');
  }

  const after={
    wob:observedPower(source,wob,'Bide Barricade'),
    legacy:observedPower(owner,vstar,'Legacy Star'),
    latias:observedPower(owner,latias,'Skyliner'),
    muk:observedPower(owner,muk,'Power of Alchemy')
  };
  const expected={
    before:{
      legacy:{blocked:input.wobbuffetActive,visible:!input.wobbuffetActive},
      latias:{blocked:false,visible:true}
    },
    after:{
      wob:{blocked:true,visible:false},
      legacy:{blocked:false,visible:true},
      latias:{blocked:true,visible:false},
      muk:{blocked:false,visible:true}
    }
  };
  if(input.wobbuffetActive)
    expected.before.wob={blocked:false,visible:true};
  const mismatches=[];
  for(const [phase,fields] of Object.entries(expected)){
    for(const [key,pair] of Object.entries(fields)){
      for(const metric of ['blocked','visible']){
        const actual=(phase==='before'?before:after)[key][metric];
        if(actual!==pair[metric])
          mismatches.push({phase,key,metric,expected:pair[metric],observed:actual});
      }
    }
  }
  return {
    ...input,pin:PIN,method:'genuine-native-Boost-Shake-from-hand-deck-search',
    grimerPlayedTurn:3,turnAtStart:3,turnAfter:state.turn,
    activeSeatAfter:state.activePlayer,phaseAfter:state.phase,
    actions,ownerHandShakeDiscarded:!owner.hand.cards.includes(shake),
    pendingPromptTypes:state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name),
    shakeOwnerHand:owner.hand.cards.includes(shake),
    shakeOwnerDeck:owner.deck.cards.includes(shake),
    shakeInDiscard:owner.discard.cards.includes(shake),
    mukLeftDeck:!owner.deck.cards.includes(muk),
    evolvedActualGrimer:grimerSlot.getPokemonCard()===muk,
    before,after,expected,mismatches,
    actualNativePaperMatch:mismatches.length===0&&
      grimerSlot.getPokemonCard()===muk&&!owner.deck.cards.includes(muk),
    stagedGamePosition:true,fullMatch:false,competitiveGames:0
  };
}

/** @returns {object} */
function run(){
  const manager=initializeCards();
  const names=[
    'Alolan Grimer SUM','Alolan Muk SUM','Boost Shake EVS',
    'Wobbuffet PHF','Regidrago V SIT','Regidrago VSTAR SIT',
    'Latias ex SSP'
  ];
  const missing=names.filter(x=>!manager.getCardByName(x));
  if(missing.length)return {
    version:VERSION,status:'PINNED_NATIVE_PRINT_MISSING',missing,
    competitiveQualifiedGames:0
  };
  const rows=[];
  for(const seat of [0,1]){
    for(const wobbuffetActive of [true,false]){
      rows.push(runCase({seat,wobbuffetActive}));
    }
  }
  return {
    version:VERSION,pin:PIN,
    status:rows.every(x=>x.actualNativePaperMatch)?
      'STAGED_NATIVE_SHAKE_PAPER_MATCH':'STAGED_NATIVE_SHAKE_PAPER_MISMATCH',
    attempts:rows.length,passed:rows.filter(x=>x.actualNativePaperMatch).length,
    rows,competitiveQualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={PIN,VERSION,run,runCase};
