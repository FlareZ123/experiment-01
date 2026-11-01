'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createSetupCoinChoiceReceipt}=require(
  '../simulation/twinleaf/agent16-setup-coin-choice-receipt.cjs');

class CoinFlipPrompt {
  constructor(playerId,message){this.playerId=playerId;this.message=message;}
}
class ConfirmPrompt {
  constructor(playerId,message){this.playerId=playerId;this.message=message;}
}
class ResolvePromptAction{
  constructor(result){this.result=result;}
}
const cfg={coinMessage:17,goFirstMessage:27,setupPhase:2};
const recorder=()=>createSetupCoinChoiceReceipt(cfg);
function accept(r,pending,value,ordinal){
  r.onAccepted({pending,action:new ResolvePromptAction(value),ordinal,
    phaseBefore:cfg.setupPhase,turnBefore:0});
}
function completed(heads,choseFirst,winnerSeat=heads?0:1){
  const r=recorder();
  accept(r,new CoinFlipPrompt(101,17),heads,0);
  accept(r,new ConfirmPrompt(winnerSeat===0?101:202,27),choseFirst,1);
  return r;
}

test('each native coin winner and go-first selection produce a distinct verified start',()=>{
  for(const heads of [true,false])for(const choseFirst of [true,false]){
    const r=completed(heads,choseFirst);
    const winner=heads?0:1;
    const first=choseFirst?winner:1-winner;
    const packet=r.result({firstTurnSlot:first,verifiedByDrawLog:true});
    assert.equal(packet.status,'consistent-accepted-native-setup-and-first-draw');
    assert.equal(packet.coin.coinWinnerSeat,winner);
    assert.equal(packet.choice.choiceOwnerSeat,winner);
    assert.equal(packet.firstSeatFromAcceptedSetup,first);
    assert.equal(packet.firstSeatFromVerifiedDraw,first);
    assert.equal(packet.officialCoinChoiceRuleCertified,false);
  }
});

test('first draw contradiction cannot pass even with accepted native events',()=>{
  const r=completed(true,false);
  const packet=r.result({firstTurnSlot:0,verifiedByDrawLog:true});
  assert.equal(packet.status,'native-first-draw-contradiction');
});

test('an invalid coin winner selecting first cannot be certified',()=>{
  const r=completed(true,false,1);
  const packet=r.result({firstTurnSlot:1,verifiedByDrawLog:true});
  assert.equal(packet.status,'coin-winner-choice-owner-mismatch');
});

test('missing draw proof stays unverified despite full native prompt sequence',()=>{
  const r=completed(false,false);
  assert.equal(r.result({firstTurnSlot:0,verifiedByDrawLog:false}).status,
    'native-first-draw-unverified');
});

test('missing or malformed native setup action remains unqualified',()=>{
  const r=recorder();
  accept(r,new CoinFlipPrompt(101,17),'not a coin',0);
  accept(r,new ConfirmPrompt(101,27),false,1);
  const packet=r.result({firstTurnSlot:1,verifiedByDrawLog:true});
  assert.equal(packet.status,'malformed-native-setup-action');
  assert.equal(packet.malformedNativeSetupEvents,1);
  const empty=recorder();
  assert.equal(empty.result({firstTurnSlot:null,verifiedByDrawLog:false})
    .status,'missing-accepted-native-setup-prompt');
});

test('first-epoch receipt ignores later coincidental flips and concealment entirely',()=>{
  const r=completed(true,false);
  accept(r,new CoinFlipPrompt(101,17),false,20);
  accept(r,new ConfirmPrompt(202,27),true,21);
  r.onAccepted({pending:new CoinFlipPrompt(101,17),
    action:new ResolvePromptAction(false),ordinal:22,phaseBefore:999,
    turnBefore:0});
  r.onAccepted({pending:new CoinFlipPrompt(101,17),
    action:new ResolvePromptAction(false),ordinal:23,
    phaseBefore:2,turnBefore:3});
  const packet=r.result({firstTurnSlot:1,verifiedByDrawLog:true});
  assert.equal(packet.status,'consistent-accepted-native-setup-and-first-draw');
  assert.equal(packet.coin.heads,true);
  assert.equal(packet.choice.choseFirst,false);
  assert.equal(JSON.stringify(packet).includes('hidden'),false);
  assert.equal(packet.firstSetupOnly,true);
});

test('out-of-order accepted GO_FIRST is rejected without inventing native state',()=>{
  const r=recorder();
  accept(r,new ConfirmPrompt(101,27),false,0);
  accept(r,new CoinFlipPrompt(101,17),true,1);
  assert.equal(r.result({firstTurnSlot:1,verifiedByDrawLog:true}).status,
    'invalid-native-setup-order');
});
