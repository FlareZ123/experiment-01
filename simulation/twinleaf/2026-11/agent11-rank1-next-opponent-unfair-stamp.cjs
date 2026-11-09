'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const load=p=>require(path.join(OUTPUT,p));

/**
 * Original opposing owner t21 response after the authentic native t20
 * Girafarig Night Watch Knock Out and one source Prize. The opponent
 * physically owns the ACE SPEC in its original hand if it survived Night
 * Watch's required uniformly random pair. Choose the visible own Item only.
 *
 * @param {{state:object,ownerId:number,opponentId:number}} context
 */
function respondWithOwnedUnfairStamp(context){
  const {Store}=load('game/store/store');
  const {deepClone}=load('utils/utils');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const {sampleUniformPositions}=
    require('../agent12-nightwatch-paper-random-chooser.cjs');
  const {actorObservation}=
    require('../actor-observation-contract.cjs');
  const game=new Store({onStateChange(){}});
  game.state=deepClone(context.state);
  const owner=game.state.players.find(p=>p.id===context.opponentId);
  const source=game.state.players.find(p=>p.id===context.ownerId);
  assert.ok(owner&&source);
  const observed=actorObservation(game.state,game.state.players.indexOf(owner));
  const beforeSourceHand=source.hand.cards.slice();
  const beforeOwnerHand=owner.hand.cards.slice();
  const item=owner.hand.cards.find(c=>c.fullName==='Unfair Stamp TWM');
  const result={
    version:'agent11-original-rank1-owner-t21-unfair-stamp-native-v1',
    originalSourcePreserved:true,ownerInfoOnly:true,opponentActorId:owner.id,
    sourceActorId:source.id,turn:game.state.turn,
    beforeOwnerHandPrintings:observed.ownHand,
    beforeOwnerHandCount:beforeOwnerHand.length,
    beforeSourceHandCount:beforeSourceHand.length,
    hasPhysicallyHeldStamp:Boolean(item),
    ownerRemainingPrizes:owner.prizes.reduce((n,p)=>n+p.cards.length,0),
    sourceRemainingPrizes:source.prizes.reduce((n,p)=>n+p.cards.length,0),
    stampNativeAccepted:false,shuffleOwnerIds:[],
    errors:[],stage:'unattempted',promptTrace:[]
  };
  if(observed.decisionKind!=='owner-root' ||
     observed.ownPublic.active?.printing!=='Latias ex SSP' ||
     !item){
    result.stage='physical-opponent-stamp-preconditions-not-met';
    return result;
  }
  try{
    game.dispatch(new PlayCardAction(owner.id,owner.hand.cards.indexOf(item),{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    result.stampNativeAccepted=true;
    for(let i=0;i<24;i++){
      const p=game.state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      const kind=p.constructor.name;
      const event={kind,actorId:p.playerId??null};
      if(kind==='WaitPrompt'||kind==='ShowCardsPrompt'){
        game.dispatch(new ResolvePromptAction(p.id,null));
      }else if(kind==='ShuffleDeckPrompt'){
        const shuffler=game.state.players.find(x=>x.id===p.playerId);
        assert.ok(shuffler);
        const n=shuffler.deck.cards.length;
        const perm=sampleUniformPositions(n,n,
          'agent11-rank1-opponent-unfair-stamp-t21-shuffle-v1',
          JSON.stringify([game.state.turn,p.playerId,String(p.id)]));
        event.valid=p.validate(perm,game.state);
        if(!event.valid){
          result.stage='native-stamp-shuffle-choice-invalid';
          result.promptTrace.push(event);
          return result;
        }
        event.deckSize=n;
        result.shuffleOwnerIds.push(p.playerId);
        game.dispatch(new ResolvePromptAction(p.id,perm));
      }else{
        event.unresolved=true;
        result.promptTrace.push(event);
        break;
      }
      event.resolved=true;
      result.promptTrace.push(event);
    }
    result.ownerHandCountAfter=owner.hand.cards.length;
    result.sourceHandCountAfter=source.hand.cards.length;
    result.ownerHandAfter=owner.hand.cards.map(c=>c.fullName);
    result.sourceOriginalCardsStillPhysicallyHeld=
      beforeSourceHand.filter(c=>source.hand.cards.includes(c)).length;
    result.stampDiscardedPhysical=owner.discard.cards.includes(item);
    result.remainingPromptKinds=game.state.prompts.filter(p=>
      p.result===undefined).map(p=>p.constructor.name);
    result.nextActorId=game.state.players[game.state.activePlayer]?.id??null;
    result.stage=result.stampNativeAccepted &&
      result.stampDiscardedPhysical&&
      result.ownerHandCountAfter===5 &&result.sourceHandCountAfter===2 &&
      result.remainingPromptKinds.length===0
        ?'native-owned-unfair-stamp-five-versus-two-settled'
        :'native-owned-unfair-stamp-unsettled';
  }catch(error){
    result.stage='native-owned-unfair-stamp-rejected';
    result.errors.push(String(error?.stack??error));
    result.remainingPromptKinds=game.state.prompts.filter(p=>
      p.result===undefined).map(p=>p.constructor.name);
  }
  return result;
}

module.exports={respondWithOwnedUnfairStamp};
