'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {withRadiantZeroGateHook} = require('./agent1-radiant-zero-gate-hook.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native = name => require(path.join(output,name));

/**
 * Genuine pinned native Store source-Ability prompt/reducer fixture, not a
 * shuffled original tournament game. Keep the same physical board across
 * the empty and one-VMAX selection arms, and both player seats.
 *
 * @param {0|1} seat
 * @param {0|1} selectedCount
 * @param {{repaired?:boolean,useAbility?:boolean,reverseShuffle?:boolean}} [options]
 * @returns {object}
 */
function probeZeroClimacticGate(seat,selectedCount,options={}){
  const execute=()=>{
  assert.ok(seat===0||seat===1);
  assert.ok(selectedCount===0||selectedCount===1);
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {PlayPokemonEffect}=native('game/store/effects/play-card-effects');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const manager=initializeCards();
  /** @param {string} name @returns {any} */
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Missing pinned physical printing '+name);
    return result;
  };
  const state=new State(),actor=new Player(),other=new Player();
  actor.id=801;other.id=802;
  state.players=seat===0?[actor,other]:[other,actor];
  state.turn=4;
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  actor.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  other.active.cards.push(card('Regidrago V SIT'));
  actor.bench=Array.from({length:5},()=>new PokemonCardList());
  other.bench=Array.from({length:5},()=>new PokemonCardList());
  for(const p of state.players){
    p.deck.cards.push(card('Psychic Energy SVE'),card('Psychic Energy SVE'),
      card('Psychic Energy SVE'));
    p.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }
  const vmax=card('Shadow Rider Calyrex VMAX CRE');
  actor.deck.cards.push(vmax);
  const radiant=card('Radiant Eternatus CRZ');
  actor.hand.cards.push(radiant);
  const store=new Store({onStateChange(){}});
  store.state=state;
  const before={phase:state.phase,turn:state.turn,activePlayer:state.activePlayer};
  store.reduceEffect(state,new PlayPokemonEffect(actor,radiant,actor.bench[0]));
  const events=[];
  let shuffledBefore=null;
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  for(let i=0;i<18;i++){
    const p=pending();
    if(!p)break;
    let answer;
    if(p.constructor.name==='ConfirmPrompt')answer=options.useAbility!==false;
    else if(p.constructor.name==='ChooseCardsPrompt'&&
      p.message==='CHOOSE_CARD_TO_PUT_ONTO_BENCH')
      answer=selectedCount?[vmax]:[];
    else if(p.constructor.name==='ShuffleDeckPrompt'){
      shuffledBefore=[...actor.deck.cards];
      answer=Array.from({length:actor.deck.cards.length},(_,j)=>j);
      if(options.reverseShuffle)answer.reverse();
    }
    else if(p.constructor.name==='WaitPrompt')answer=null;
    else if(p.constructor.name==='ShowCardsPrompt')answer=true;
    else{
      events.push({prompt:p.constructor.name,message:p.message??null,
        unexpected:true});
      break;
    }
    const valid=p.validate(answer,state);
    let error=null;
    try{store.dispatch(new ResolvePromptAction(p.id,answer));}
    catch(e){error=String(e?.message??e);}
    events.push({prompt:p.constructor.name,message:p.message??null,
      validated:valid,error,answerCount:Array.isArray(answer)?answer.length:null,
      phaseAfter:state.phase,turnAfter:state.turn,
      actorActiveAfter:state.activePlayer});
    if(error)break;
  }
  return {
    seat,selectedCount,useAbility:options.useAbility!==false,before,after:{
      phase:state.phase,turn:state.turn,activePlayer:state.activePlayer},
    radiantBenched:actor.bench[0].getPokemonCard()===radiant,
    vmaxBenched:actor.bench.some(slot=>slot.getPokemonCard()===vmax),
    vmaxInDeck:actor.deck.cards.includes(vmax),
    pendingPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>({type:p.constructor.name,message:p.message??null})),
    shuffleChangedPhysicalOrder:shuffledBefore===null?null:
      shuffledBefore.some((c,i)=>actor.deck.cards[i]!==c),
    events,gameQualified:false
  };
  };
  if(options.repaired){
    const {result,audit}=withRadiantZeroGateHook(execute);
    return {...result,repaired:true,hookAudit:audit};
  }
  return {...execute(),repaired:false,hookAudit:null};
}

if(require.main===module)
  for(const seat of [0,1])for(const selected of [0,1])
    console.log('AGENT1_CLIMACTIC_GATE_ZERO '+JSON.stringify(
      probeZeroClimacticGate(seat,selected)));
module.exports={probeZeroClimacticGate};
