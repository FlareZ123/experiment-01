'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName @returns {any} */
const native=moduleName=>require(path.join(output,moduleName));

/**
 * Actual pinned Store demonstration of printed Wally ROS first-person-turn
 * evolution onto a same-turn Trubbish with an already attached real Tool.
 * The opponent is a staged public fixture; this is not a random original 60.
 * @param {0|1} [seat]
 * @returns {object}
 */
function probeWallyFirstTurnGarbotoxin(seat=0){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  f.state.turn=2;
  f.source.bench[0].cards.push(f.card('Trubbish PAR'));
  f.source.bench[0].pokemonPlayedTurn=2;
  const tool=f.card('Float Stone BKT');
  const wally=f.card('Wally ROS');
  const garbodor=f.card('Garbodor LTR');
  f.source.hand.cards.push(tool,wally);
  f.source.deck.cards.push(garbodor);
  const target={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const before={
    turn:f.state.turn,
    target:f.source.bench[0].getPokemonCard()?.fullName??null,
    playedThisTurn:f.source.bench[0].pokemonPlayedTurn,
    supporterTurn:f.source.supporterTurn,
    toolHeld:f.source.hand.cards.includes(tool),
    wallyHeld:f.source.hand.cards.includes(wally),
    garbodorInDeck:f.source.deck.cards.includes(garbodor)
  };
  let toolError=null,wallyError=null,firstSearch=null,targetPrompt=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,
      f.source.hand.cards.indexOf(tool),target));
  }catch(error){toolError=String(error?.message??error);}
  if(!toolError){
    try{
      f.store.dispatch(new PlayCardAction(f.source.id,
        f.source.hand.cards.indexOf(wally),board));
    }catch(error){wallyError=String(error?.message??error);}
  }
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  const prompt=pending();
  if(prompt?.constructor?.name==='ChooseCardsPrompt'){
    const valid=prompt.validate([garbodor],f.state);
    let error=null;
    try{f.store.dispatch(new ResolvePromptAction(prompt.id,[garbodor]));}
    catch(e){error=String(e?.message??e);}
    firstSearch={type:prompt.constructor.name,message:prompt.message,
      sourceCard:prompt.sourceCard?.fullName??null,
      ownerDeck:prompt.cards===f.source.deck,nativeValidated:valid,error};
  }
  const evolve=pending();
  if(evolve?.constructor?.name==='ChoosePokemonPrompt'){
    const selection=[f.source.bench[0]];
    const valid=evolve.validate(selection,f.state);
    let error=null;
    try{f.store.dispatch(new ResolvePromptAction(evolve.id,selection));}
    catch(e){error=String(e?.message??e);}
    targetPrompt={type:evolve.constructor.name,message:evolve.message,
      nativeValidated:valid,error};
  }
  const tail=[];
  for(let i=0;i<4;i++){
    const p=pending();
    if(!p)break;
    let reply=null;
    if(p.constructor.name==='ShuffleDeckPrompt'){
      reply=Array.from({length:f.source.deck.cards.length},(_,k)=>k);
    }else if(p.constructor.name==='WaitPrompt'){
      reply=null;
    }else break;
    let error=null;
    try{f.store.dispatch(new ResolvePromptAction(p.id,reply));}
    catch(e){error=String(e?.message??e);}
    tail.push({type:p.constructor.name,error});
    if(error)break;
  }
  return {seat,printing:{
    wally:wally.fullName,tool:tool.fullName,garbodor:garbodor.fullName
  },before,toolError,wallyError,firstSearch,targetPrompt,tail,
    after:{
      nowGarbodor:f.source.bench[0].getPokemonCard()===garbodor,
      toolAttached:f.source.bench[0].tools.includes(tool),
      garbodorLeftDeck:!f.source.deck.cards.includes(garbodor),
      trubbishStillUnderGarbodor:
        f.source.bench[0].cards.some(c=>c.name==='Trubbish'),
      supporterSpent:f.source.supporterTurn>0,
      remainingPending:f.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)
    },
    qualification:'Real native printed first-turn Wally and Garbodor Tool fixture, not source-dealt game'};
}
module.exports={probeWallyFirstTurnGarbotoxin};
