'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const { deepStrictEqual }=assert;

const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(OUTPUT,name));

/** @param {object} game @param {Function} ResolvePromptAction */
function settleWaitPrompts(game,ResolvePromptAction){
  let count=0;
  for(let i=0;i<12;i++){
    const p=game.state.prompts.find(x=>x.result===undefined);
    if(p?.constructor.name!=='WaitPrompt')break;
    game.dispatch(new ResolvePromptAction(p.id,null));
    count++;
  }
  return count;
}

/**
 * One authentic opponent-owner counterreply after the corrected GX and actual
 * Latias Skyliner Retreat into Girafarig. Uses only that owner's own hand,
 * own public discard, and ordinary public board to choose. This is a detached
 * native Store fork: the original opponent Retreat+Pass and source ledger
 * remain completely unchanged.
 *
 * @param {{state:object,ownerId:number,opponentId:number}} context
 * @param {{manualTarget?:'girafarig'|'latias'}} [options]
 * @returns {object} Physical opponent Supporter/evolution/Ability/attack receipt.
 */
function executeOpponentTulipRebuild(context,options={}){
  const {Store}=load('game/store/store');
  const {deepClone}=load('utils/utils');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {UseAbilityAction,AttackAction,PassTurnAction}=
    load('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const {installUnderworldDoorPsychicRecipientHook}=
    require('../underworld-door-psychic-recipient-hook.cjs');
  const {actorObservation}=
    require('../actor-observation-contract.cjs');
  const game=new Store({onStateChange(){}});
  game.state=deepClone(context.state);
  const opp=game.state.players.find(p=>p.id===context.opponentId);
  const source=game.state.players.find(p=>p.id===context.ownerId);
  assert.ok(opp&&source);
  const ownerSeat=game.state.players.indexOf(opp);
  const view=actorObservation(game.state,ownerSeat);
  const manualTarget=options.manualTarget??'girafarig';
  const psycho=()=>opp.hand.cards.filter(c=>c.fullName==='Psychic Energy MEE');
  const ownDiscardPsychic=()=>opp.discard.cards.filter(c=>
    c.fullName==='Psychic Energy MEE');
  const pending=()=>game.state.prompts.find(p=>p.result===undefined);
  const result={
    version:'agent11-original-rank1-owner-tulip-two-vmax-rebuild-v1',
    manualTarget,ownerId:opp.id,sourceId:source.id,sourceTurn:game.state.turn,
    sourceOriginalStoreUnchanged:true,opponentOwnerViewOnly:true,
    ownActiveBefore:view.ownPublic.active?.printing??null,
    ownHandBefore:view.ownHand,
    ownBasicPsychicInDiscardBefore:ownDiscardPsychic().length,
    ownBasicPsychicInHandBefore:psycho().length,
    ownVMAXHandBefore:opp.hand.cards.filter(c=>
      c.fullName==='Shadow Rider Calyrex VMAX CRE').length,
    ownBenchBefore:view.ownPublic.bench.filter(Boolean).map(p=>p.printing),
    ownActiveEnergyBefore:opp.active.energies.cards.length,
    tulipNativeAccepted:false,tulipCardsRecovered:0,
    evolutionsAccepted:[],underworldAbilities:[],
    normalAttachment:false,attacked:false,
    stage:'not-attempted',errors:[],remainingPromptKinds:[]
  };
  if(view.decisionKind!=='owner-root' ||
     view.ownPublic.active?.printing!=='Girafarig LOT' ||
     result.ownBasicPsychicInDiscardBefore<3 ||
     result.ownVMAXHandBefore<2 ||
     !view.ownHand.includes('Tulip PAR')){
    result.stage='preconditions-not-met';
    return result;
  }
  try{
    const tulip=opp.hand.cards.find(c=>c.fullName==='Tulip PAR');
    const index=opp.hand.cards.indexOf(tulip);
    game.dispatch(new PlayCardAction(opp.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    result.tulipNativeAccepted=true;
    result.tulipWaits=settleWaitPrompts(game,ResolvePromptAction);
    const choice=pending();
    result.tulipPrompt=choice?.constructor.name??null;
    if(choice?.constructor.name!=='ChooseCardsPrompt' ||
       choice.playerId!==opp.id ||choice.cards!==opp.discard){
      result.stage='native-tulip-recovery-prompt-missing';
      return result;
    }
    const recovered=ownDiscardPsychic().slice(0,3);
    result.tulipChoiceValid=choice.validate(recovered,game.state);
    if(!result.tulipChoiceValid){
      result.stage='native-tulip-three-energy-choice-invalid';
      return result;
    }
    game.dispatch(new ResolvePromptAction(choice.id,recovered));
    result.tulipResolveWaits=settleWaitPrompts(game,ResolvePromptAction);
    result.tulipCardsRecovered=recovered.filter(c=>
      opp.hand.cards.includes(c) && !opp.discard.cards.includes(c)).length;
    result.psyInHandAfterTulip=psycho().length;
    if(result.tulipCardsRecovered!==3 ||pending()){
      result.stage='tulip-physical-custody-not-settled';
      result.remainingPromptKinds=game.state.prompts.filter(p=>
        p.result===undefined).map(p=>p.constructor.name);
      return result;
    }

    const evolutionTargets=[1,4];
    for(const benchIndex of evolutionTargets){
      const benched=opp.bench[benchIndex];
      if(benched.getPokemonCard()?.fullName!=='Shadow Rider Calyrex V CRE'){
        result.stage='original-v-bench-position-unexpected';
        return result;
      }
      const vmax=opp.hand.cards.find(c=>
        c.fullName==='Shadow Rider Calyrex VMAX CRE');
      if(!vmax){
        result.stage='actual-vmax-no-longer-in-hand';
        return result;
      }
      game.dispatch(new PlayCardAction(opp.id,opp.hand.cards.indexOf(vmax),{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:benchIndex
      }));
      settleWaitPrompts(game,ResolvePromptAction);
      const evolved=benched.getPokemonCard()?.fullName;
      result.evolutionsAccepted.push({
        benchIndex,printing:evolved,
        physicalVMAXOnBench:benched.cards.includes(vmax)
      });
      if(evolved!=='Shadow Rider Calyrex VMAX CRE'||pending()){
        result.stage='native-evolution-unsettled';
        return result;
      }
    }

    const restoreUnderworld=installUnderworldDoorPsychicRecipientHook();
    try{
      for(const benchIndex of evolutionTargets){
        const card=opp.hand.cards.find(c=>
          c.fullName==='Psychic Energy MEE');
        if(!card){
          result.stage='underworld-no-physical-energy-in-own-hand';
          return result;
        }
        const target={
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
        };
        const abilityLocation={
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:benchIndex
        };
        const latiasBefore=opp.bench[0].energies.cards.length;
        const deckBefore=opp.deck.cards.length;
        game.dispatch(new UseAbilityAction(opp.id,'Underworld Door',
          abilityLocation));
        settleWaitPrompts(game,ResolvePromptAction);
        const attach=pending();
        const trace={
          usedBy:benchIndex,targetBench:0,
          prompt:attach?.constructor.name??null,
          physicallyHeldEnergy:opp.hand.cards.includes(card),
          valid:false,accepted:false,drawn:0
        };
        result.underworldAbilities.push(trace);
        if(attach?.constructor.name!=='AttachEnergyPrompt' ||
            attach.playerId!==opp.id){
          result.stage='native-underworld-attach-prompt-missing';
          return result;
        }
        const transfer=[{to:target,card}];
        trace.valid=attach.validate(transfer,game.state);
        if(!trace.valid){
          result.stage='native-underworld-psychic-target-invalid';
          return result;
        }
        game.dispatch(new ResolvePromptAction(attach.id,transfer));
        settleWaitPrompts(game,ResolvePromptAction);
        trace.accepted=opp.bench[0].energies.cards.includes(card) &&
          opp.bench[0].energies.cards.length===latiasBefore+1;
        trace.drawn=deckBefore-opp.deck.cards.length;
        if(!trace.accepted ||pending()){
          result.stage='native-underworld-physical-custody-unsettled';
          return result;
        }
      }
    }finally{
      restoreUnderworld();
    }
    result.latiasEnergyAfterUnderworld=opp.bench[0].energies.cards
      .map(c=>c.fullName);
    const normalCard=opp.hand.cards.find(c=>
      c.fullName==='Psychic Energy MEE');
    if(!normalCard){
      result.stage='native-normal-attachment-energy-absent';
      return result;
    }
    const to=manualTarget==='latias'
      ?{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0}
      :{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
    const normalIndex=opp.hand.cards.indexOf(normalCard);
    game.dispatch(new PlayCardAction(opp.id,normalIndex,to));
    settleWaitPrompts(game,ResolvePromptAction);
    const target=manualTarget==='latias'?opp.bench[0]:opp.active;
    result.normalAttachment=target.energies.cards.includes(normalCard);
    result.latiasEnergyAfterManual=opp.bench[0].energies.cards
      .map(c=>c.fullName);
    result.girafarigEnergyAfterManual=opp.active.energies.cards
      .map(c=>c.fullName);
    if(!result.normalAttachment||pending()){
      result.stage='native-normal-energy-attachment-failed';
      return result;
    }

    if(manualTarget==='girafarig'){
      const sourceBefore=source.lostzone.cards.length;
      const sourcePublicDiscard=source.discard.cards.slice(0,2);
      game.dispatch(new AttackAction(opp.id,'Get Lost'));
      result.attacked=true;
      settleWaitPrompts(game,ResolvePromptAction);
      const choice=pending();
      result.getLostPrompt=choice?.constructor.name??null;
      if(choice?.constructor.name==='ChooseCardsPrompt' &&
         choice.cards===source.discard && choice.playerId===opp.id &&
         sourcePublicDiscard.length===2 &&
         choice.validate(sourcePublicDiscard,game.state)){
        game.dispatch(new ResolvePromptAction(choice.id,sourcePublicDiscard));
        settleWaitPrompts(game,ResolvePromptAction);
        result.physicalSourceCardsBanished=sourcePublicDiscard.filter(c=>
          source.lostzone.cards.includes(c)&&
          !source.discard.cards.includes(c)).length;
        result.actualSourceLostZoneDelta=
          source.lostzone.cards.length-sourceBefore;
      }
      result.stage=result.physicalSourceCardsBanished===2?
        'native-tulip-vmax-underworld-girafarig-getlost-settled':
        'native-getlost-prompt-or-physical-choice-not-settled';
    }else{
      game.dispatch(new PassTurnAction(opp.id));
      settleWaitPrompts(game,ResolvePromptAction);
      result.stage='native-tulip-vmax-underworld-latias-recharged-and-pass';
    }
    result.ownerHandRemaining=opp.hand.cards.map(c=>c.fullName);
    result.remainingPromptKinds=game.state.prompts.filter(p=>
      p.result===undefined).map(p=>p.constructor.name);
    result.nextActorId=game.state.players[game.state.activePlayer]?.id??null;
    result.ownActiveAfter=opp.active.getPokemonCard()?.fullName??null;
    result.benchVMAXAfter=opp.bench.filter(slot=>
      slot.getPokemonCard()?.fullName==='Shadow Rider Calyrex VMAX CRE').length;
  }catch(error){
    result.stage='native-opponent-tulip-or-underworld-rejected';
    result.errors.push(String(error?.stack??error));
    result.remainingPromptKinds=game.state.prompts.filter(p=>
      p.result===undefined).map(p=>p.constructor.name);
  }
  return result;
}

module.exports={executeOpponentTulipRebuild};
