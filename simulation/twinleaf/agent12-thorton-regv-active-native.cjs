'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(ROOT,name));
const PRINT='Thorton LOR';
const VERSION='agent12-thorton-active-regidrago-paper-stage-v1';

/**
 * Pinned Store actual Thorton PlayCardAction -> ChoosePokemonPrompt ->
 * ChooseCardsPrompt. Source seat and source Pokemon are actual native cards,
 * while their initial game state is constructed and explicitly unqualified.
 * @param {0|1} seat Source seat.
 * @param {'basic'|'evolved'} mode Source current Active stage.
 * @returns {object} Native root, prompt, card-zone and Supporter receipts.
 */
function probeSwap(seat,mode='basic'){
  assert.ok(seat===0||seat===1);
  assert.ok(['basic','evolved'].includes(mode));
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const regV=f.card('Regidrago V SIT');
  const regVStar=mode==='evolved'?f.card('Regidrago VSTAR SIT'):null;
  const adp=f.card('Arceus & Dialga & Palkia GX CEC');
  const dde=f.card('Double Dragon Energy ROS');
  const thorton=f.card(PRINT);
  f.source.active.cards.splice(0,1,regV);
  if(regVStar)f.source.active.cards.push(regVStar);
  f.source.active.cards.push(dde);
  f.source.active.energies.cards.push(dde);
  f.source.discard.cards.push(adp);
  f.source.hand.cards.push(thorton);

  const before={
    active:f.source.active.getPokemonCard()?.fullName,
    activeCards:f.source.active.cards.map(c=>c.fullName),
    activeAttachedEnergy:f.source.active.energies.cards.map(c=>c.fullName),
    sourceSupporterTurn:f.source.supporterTurn,
    supporterZone:f.source.supporter.cards.map(c=>c.fullName),
    hand:f.source.hand.cards.map(c=>c.fullName),
    discard:f.source.discard.cards.map(c=>c.fullName)
  };

  let playError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,
      f.source.hand.cards.indexOf(thorton),{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
  }catch(error){playError=String(error?.message??error);}

  const pending=type=>f.state.prompts.find(p=>
    p.result===undefined&&p.constructor.name===type);
  const receipts=[];
  const resolve=(prompt,value)=>{
    if(!prompt)return null;
    let validatorAccepted=false,error=null;
    try{validatorAccepted=prompt.validate(value,f.state);}
    catch(e){error='validate: '+String(e?.message??e);}
    if(error===null){
      try{f.store.dispatch(new ResolvePromptAction(prompt.id,value));}
      catch(e){error='dispatch: '+String(e?.message??e);}
    }
    const receipt={kind:prompt.constructor.name,
      ownerId:prompt.playerId,
      validatorAccepted,error,settled:prompt.result!==undefined};
    receipts.push(receipt);
    return receipt;
  };

  const targetPrompt=pending('ChoosePokemonPrompt');
  const targetChoice=targetPrompt?
    resolve(targetPrompt,[f.source.active]):null;
  const cardPrompt=pending('ChooseCardsPrompt');
  const cardChoice=cardPrompt?
    resolve(cardPrompt,[adp]):null;

  const after={
    active:f.source.active.getPokemonCard()?.fullName,
    activeCards:f.source.active.cards.map(c=>c.fullName),
    activeAttachedEnergy:f.source.active.energies.cards.map(c=>c.fullName),
    sourceSupporterTurn:f.source.supporterTurn,
    supporterZone:f.source.supporter.cards.map(c=>c.fullName),
    hand:f.source.hand.cards.map(c=>c.fullName),
    discard:f.source.discard.cards.map(c=>c.fullName),
    thortonInSupporter:f.source.supporter.cards.includes(thorton),
    thortonInDiscard:f.source.discard.cards.includes(thorton),
    regVInDiscard:f.source.discard.cards.includes(regV),
    adpActive:f.source.active.getPokemonCard()===adp,
    ddeRemains:f.source.active.energies.cards.includes(dde)
  };
  return {
    version:VERSION,seat,mode,
    nativePinnedRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    constructedState:true,qualifiedPaperGame:false,
    paperTargetAllowed:mode==='basic',
    before,after,playError,
    targetPromptFound:Boolean(targetPrompt),
    cardPromptFound:Boolean(cardPrompt),
    targetChoice,cardChoice,receipts,
    pending:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
}

function run(){return {
  version:VERSION,
  rows:[probeSwap(0,'basic'),probeSwap(1,'basic'),
    probeSwap(0,'evolved'),probeSwap(1,'evolved')],
  qualifiedPaperGames:0
};}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={VERSION,probeSwap,run};
