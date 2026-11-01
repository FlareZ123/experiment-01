'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Exact rank31 Radiant Alakazam SIT59 Ability in actual pinned Store, with
 * three public opposing Pokémon. Both first source Pokémon have 1 damage
 * counter, third is undamaged. No hidden information, source full-60 claim,
 * attacker policy, or competitive outcome is modeled.
 * @returns {object}
 */
function stagedPainfulSpoons(){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  let id=80000;
  const card=name=>{
    const instance=manager.getCardByName(name);
    assert.ok(instance,'Missing actual pinned card printing '+name);
    instance.id=id++;
    return instance;
  };
  const store=new Store({onStateChange(){}}),state=store.state;
  const source=new Player(),opponent=new Player();
  source.id=411;opponent.id=522;
  state.players=[source,opponent];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=0;
  state.turn=3;
  state.gameSettings.format=Format.EXPANDED;
  source.active.cards.push(card('Radiant Alakazam SIT'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<7;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  opponent.bench[0].cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.bench[1].cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.damage=10;
  opponent.bench[0].damage=10;
  return {store,state,source,opponent};
}

/**
 * Try a real native ability and two counters from two different opposing
 * source Pokémon to one destination. This is a negative paper-validity
 * fixture, not a recommendation to play the rejected line.
 * @returns {object}
 */
function probeTwoSourcePainfulSpoons(){
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const f=stagedPainfulSpoons();
  f.store.dispatch(new UseAbilityAction(f.source.id,'Painful Spoons',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  const prompt=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='MoveDamagePrompt');
  assert.ok(prompt,'Need actual pinned Painful Spoons MoveDamagePrompt');
  const active={player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0};
  const bench0={player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0};
  const bench1={player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1};
  const result=[
    {from:active,to:bench1},
    {from:bench0,to:bench1}
  ];
  const nativeValidated=prompt.validate(result,f.state);
  const before={
    active:f.opponent.active.damage,
    bench0:f.opponent.bench[0].damage,
    bench1:f.opponent.bench[1].damage
  };
  let error=null;
  try{f.store.dispatch(new ResolvePromptAction(prompt.id,result));}
  catch(e){error=String(e?.message??e);}
  return {
    source:'Authenticated rank31 Radiant Alakazam SIT59 Painful Spoons',
    originalPrintedSingleSource:true,
    nativeOptions:{...prompt.options},
    nativeValidatorAccepted:nativeValidated,
    nativeStoreError:error,
    nativePromptSettled:prompt.result!==undefined,
    before,
    after:{
      active:f.opponent.active.damage,
      bench0:f.opponent.bench[0].damage,
      bench1:f.opponent.bench[1].damage
    },
    scope:'True pinned native Store conditional-board prompt; not a source-dealt full game'
  };
}
if(require.main===module)
  console.log(JSON.stringify(probeTwoSourcePainfulSpoons(),null,2));
module.exports={stagedPainfulSpoons,probeTwoSourcePainfulSpoons};
