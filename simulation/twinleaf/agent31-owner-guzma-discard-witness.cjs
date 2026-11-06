'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');

const VERSION = 'agent31-readonly-original-rank11-guzma-discard-witness-v1';
const SEAT = 1;
const TURN = 36;
const calcSha = entries => createHash('sha256')
  .update(JSON.stringify(entries)).digest('hex');

/**
 * Read precisely one authentic acting player's hand and public discard at a
 * previously verified Pass, without changing the bot's action or game state.
 * This observes the real native Store, independent of the headless report's
 * owner-hand/public-board Pass sidecar. No deck or Prize identities are read.
 *
 * @template T
 * @param {()=>T} execute Existing pinned native matched-source runner.
 * @param {{Store?:Function,GamePhase?:object}} [deps] Native class seam.
 * @returns {{result:T,audit:object}}
 */
function withRank11GuzmaDiscardWitness(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {GamePhase}=deps.GamePhase??require(path.join(base,'game/store/state/state'));
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const audit={version:VERSION,selectedPhysicalSeat:SEAT,
    selectedGlobalTurn:TURN,observerOnly:true,physicalGuzmaDiscardReads:0,
    candidateActualPassesObserved:0,matches:[],error:null,
    competitivePaperQualifiedGames:0};
  function observed(action,...args) {
    const state=this?.state;
    const actualPass=action?.constructor?.name==='PassTurnAction'&&
      state?.phase===GamePhase.PLAYER_TURN&&
      state.activePlayer===SEAT&&state.turn===TURN&&
      state.prompts?.every(prompt=>prompt.result!==undefined);
    if(!actualPass)return previous.value.call(this,action,...args);
    audit.candidateActualPassesObserved++;
    const owner=state.players[SEAT];
    const active=owner?.active?.getPokemonCard?.();
    const hand=owner?.hand?.cards?.map(card=>card.fullName)??[];
    const seekerHeld=hand.includes('VS Seeker PHF');
    const funded=owner?.bench?.some(slot=>
      slot?.getPokemonCard?.()?.fullName==='Shadow Rider Calyrex VMAX CRE'&&
      slot.energies?.cards?.filter(card=>
        /^Psychic Energy(?: |$)/.test(card.fullName)).length>=3);
    const source=state.players[1-SEAT];
    const garbodorOnOpposingBench=source?.bench?.some(slot=>
      slot?.getPokemonCard?.()?.fullName==='Garbodor BKP');
    const match=active?.fullName==='Dialga-GX UPR'&&
      seekerHeld&&funded===true&&garbodorOnOpposingBench===true;
    // This is the selected original-owner public-discard test only.
    // All enumerations are owner Hand/Discard or the public boards.
    const receipt=match?{
      globalTurn:state.turn,actorSeat:SEAT,activePrinting:active.fullName,
      ownerHandSha256:calcSha(hand),heldVsSeekerCopies:hand.filter(card=>
        card==='VS Seeker PHF').length,
      ownerDiscardCardCount:owner.discard?.cards?.length??null,
      ownerDiscardGuzmaPhysicalCards:owner.discard.cards.filter(card=>
        card.fullName==='Guzma BUS').length,
      ownSupporterPlayedTurn:owner.supporterTurn,
      ownCannotPlaySupporters:owner.cannotPlaySupporterCards===true,
      ownCannotPlayItems:owner.cannotPlayItemCards===true,
      ownerRetreatedTurn:owner.retreatedTurn,
      poweredBenchedVmax:true,sourceGarbodorBenchPresent:true,
      itemAndSupporterPlayStillRequiresNativeValidation:true,
      paperLegalityCertified:false
    }:null;
    const result=previous.value.call(this,action,...args);
    if(receipt){
      audit.physicalGuzmaDiscardReads++;
      audit.matches.push({...receipt,
        nativePassDispatchReturned:result!==false,
        note:'Owner-public physical discard read at authentic native Pass before dispatch; not an executed VS Seeker or Guzma line'});
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:observed});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,SEAT,TURN,withRank11GuzmaDiscardWitness};
