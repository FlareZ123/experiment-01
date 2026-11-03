'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperThortonSwap}=
  require('./agent12-thorton-paper-swap-hook.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(OUTPUT,p));
const VERSION='agent12-thorton-adp-to-regv-evolution-native-v1';

/**
 * Real pinned Store transaction: Active ADP -> Thorton to discard Regidrago V
 * -> an actual VSTAR hand evolution on the original ADP's played-turn clock.
 * Strictly a constructed board and actual native actions, no real deals.
 * @param {0|1} seat Source owner physical seat.
 * @param {boolean} guarded True for reversible paper-correct Thorton.
 * @param {1|3} enteredTurn Original Active ADP's played turn (Store is turn 3).
 * @returns {object} Actual Store zones and evolution outcome.
 */
function probe(seat,guarded,enteredTurn=1){
  if(guarded){
    const receipt=withPaperThortonSwap(()=>probe(seat,false,enteredTurn));
    return {...receipt,guarded:true};
  }
  assert.ok(seat===0||seat===1);
  assert.ok(enteredTurn===1||enteredTurn===3);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  const adp=f.card('Arceus & Dialga & Palkia GX CEC');
  const regV=f.card('Regidrago V SIT');
  const vstar=f.card('Regidrago VSTAR SIT');
  const dde=f.card('Double Dragon Energy ROS');
  const supporter=f.card('Thorton LOR');
  f.source.active.cards.splice(0,1,adp);
  f.source.active.cards.push(dde);
  f.source.active.energies.cards.push(dde);
  f.source.active.pokemonPlayedTurn=enteredTurn;
  f.source.active.damage=40;
  f.source.discard.cards.push(regV);
  f.source.hand.cards.push(supporter,vstar);

  const pending=kind=>f.store.state.prompts.find(p=>
    p.result===undefined&&p.constructor.name===kind);
  const receipts=[];
  const reply=(kind,result)=>{
    const p=pending(kind);
    assert.ok(p,'Expected actual '+kind+' from pinned Thorton');
    const accepted=p.validate(result,f.state);
    assert.equal(accepted,true,'Paper-paid native prompt '+kind);
    f.store.dispatch(new ResolvePromptAction(p.id,result));
    receipts.push({kind,accepted,promptOwner:p.playerId,settled:p.result!==undefined});
  };
  f.store.dispatch(new PlayCardAction(f.source.id,
    f.source.hand.cards.indexOf(supporter),{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  reply('ChoosePokemonPrompt',[f.source.active]);
  reply('ChooseCardsPrompt',[regV]);
  const swapped={
    active:f.source.active.getPokemonCard()?.fullName,
    attachedEnergy:f.source.active.energies.cards.map(c=>c.fullName),
    originalPlayedTurn:f.source.active.pokemonPlayedTurn,
    damage:f.source.active.damage,
    adpInDiscard:f.source.discard.cards.includes(adp),
    regVOnBoard:f.source.active.cards.includes(regV),
    supporterInDiscard:f.source.discard.cards.includes(supporter)
  };
  let evolveError=null;
  try{
    f.store.dispatch(new PlayCardAction(f.source.id,
      f.source.hand.cards.indexOf(vstar),{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      }));
  }catch(error){evolveError=String(error?.message??error);}
  const after={
    active:f.source.active.getPokemonCard()?.fullName,
    pokemonStack:f.source.active.getPokemons().map(c=>c.fullName),
    attachedEnergy:f.source.active.energies.cards.map(c=>c.fullName),
    playedTurn:f.source.active.pokemonPlayedTurn,
    damage:f.source.active.damage,
    vstarFromHand:f.source.active.cards.includes(vstar),
    vstarStillHeld:f.source.hand.cards.includes(vstar)
  };
  return {version:VERSION,seat,guarded:false,enteredTurn,receipts,
    swapped,after,evolveError,pinnedRevision:
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    constructedStore:true,qualifiedGames:0};
}
module.exports={VERSION,probe};
if(require.main===module){
  for(const seat of [0,1]){
    for(const guarded of [false,true])
      console.log(JSON.stringify(probe(seat,guarded,1)));
  }
}
