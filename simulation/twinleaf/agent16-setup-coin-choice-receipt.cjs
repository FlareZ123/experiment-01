'use strict';

const assert=require('node:assert/strict');
const VERSION='agent16-accepted-native-setup-coin-and-first-choice-v1';

/**
 * Read-only record of setup coin and go-first choice resolutions actually
 * accepted by the original pinned Store. Never inspect hands, decks or
 * Prizes, and never feed this after-the-fact receipt to a playing policy.
 *
 * Capture only the FIRST setup epoch. Sudden-death restarts need independent
 * per-episode accounting before tournament-clock evidence can be claimed.
 * @param {{coinMessage:number,goFirstMessage:number,setupPhase:number}} cfg
 * @returns {object}
 */
function createSetupCoinChoiceReceipt(cfg){
  assert.ok(cfg&&typeof cfg==='object');
  const {coinMessage,goFirstMessage,setupPhase}=cfg;
  const seen={coin:null,choice:null,malformed:0};
  /**
   * Invoke only after a successful Store.dispatch of a prompt action.
   * Native classes are identified by class name and the exact pinned
   * GameMessage to avoid counting in-game attack coin flips or confirmations.
   * @param {{pending:object|null,action:object,ordinal:number,phaseBefore:number,turnBefore:number}} event
   */
  function onAccepted(event){
    const {pending,action,ordinal,phaseBefore,turnBefore}=event;
    if(!pending||phaseBefore!==setupPhase||turnBefore!==0||
       action?.constructor?.name!=='ResolvePromptAction')return;
    const isCoin=pending.constructor?.name==='CoinFlipPrompt'&&
      pending.message===coinMessage;
    const isChoice=pending.constructor?.name==='ConfirmPrompt'&&
      pending.message===goFirstMessage;
    if(!isCoin&&!isChoice)return;
    if(typeof action.result!=='boolean'){
      seen.malformed++;
      return;
    }
    if(isCoin&&seen.coin===null){
      seen.coin={
        ordinal,
        resolution:'accepted-native-prompt',
        heads:action.result,
        coinWinnerSeat:action.result?0:1
      };
    }
    if(isChoice&&seen.choice===null){
      seen.choice={
        ordinal,
        resolution:'accepted-native-prompt',
        choiceOwnerSeat:pending.playerId===101?0:
          pending.playerId===202?1:null,
        choseFirst:action.result
      };
    }
  }
  /**
   * This check is deliberately postgame and has no access to game cards.
   * @param {{firstTurnSlot:0|1|null,verifiedByDrawLog:boolean}} turnEvidence
   */
  function result(turnEvidence){
    assert.ok(turnEvidence&&typeof turnEvidence==='object');
    const {coin,choice}=seen;
    const complete=Boolean(coin&&choice);
    const expectedFirstSeat=complete?
      (choice.choseFirst?coin.coinWinnerSeat:1-coin.coinWinnerSeat):null;
    const nativeFirstSeat=[0,1].includes(turnEvidence.firstTurnSlot)?
      turnEvidence.firstTurnSlot:null;
    const verified=turnEvidence.verifiedByDrawLog===true&&
      nativeFirstSeat!==null;
    const ordered=complete&&choice.ordinal>coin.ordinal;
    const winnerMadeChoice=complete&&
      coin.coinWinnerSeat===choice.choiceOwnerSeat;
    const status=seen.malformed>0?'malformed-native-setup-action':
      !complete?'missing-accepted-native-setup-prompt':
      !ordered?'invalid-native-setup-order':
      !winnerMadeChoice?'coin-winner-choice-owner-mismatch':
      !verified?'native-first-draw-unverified':
      expectedFirstSeat!==nativeFirstSeat?'native-first-draw-contradiction':
      'consistent-accepted-native-setup-and-first-draw';
    return {
      version:VERSION,status,coin,choice,
      firstSeatFromAcceptedSetup:expectedFirstSeat,
      firstSeatFromVerifiedDraw:nativeFirstSeat,
      nativeFirstDrawVerified:verified,
      firstSetupOnly:true,
      malformedNativeSetupEvents:seen.malformed,
      fullGamePolicyCertified:false,
      officialCoinChoiceRuleCertified:false,
      competitiveGameQualified:false
    };
  }
  return {onAccepted,result};
}

module.exports={VERSION,createSetupCoinChoiceReceipt};
