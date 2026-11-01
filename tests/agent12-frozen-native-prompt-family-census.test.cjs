'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {censusNativePromptFamilies}=
  require('../simulation/evaluation/agent12-frozen-native-prompt-family-census.cjs');

const prompt=(ordinal,turn,name,seat=0)=>({
  actionOrdinal:ordinal,turnBefore:turn,action:'ResolvePromptAction',
  pendingPrompt:name,playerSlot:seat
});
function arm(rank,name,roots,finished=false){
  return {trial:{rank,id:name},rootActionLedger:roots,finished};
}

test('separates setup ChooseCards from in-turn source-relevant family',()=>{
  const c=censusNativePromptFamilies([arm(6,'x',[
    prompt(0,0,'CoinFlipPrompt'),
    prompt(1,0,'ChooseCardsPrompt'),
    prompt(2,1,'ChooseCardsPrompt',1),
    {action:'PlayCardAction',actionOrdinal:3,turnBefore:1},
    prompt(4,1,'WaitPrompt')
  ])]);
  assert.equal(c.totalPromptReplies,4);
  assert.equal(c.inTurnChooseCardsPromptCount,1);
  assert.equal(c.byRank[0].setupByFamily.ChooseCardsPrompt,1);
  assert.equal(c.byRank[0].inTurnByFamily.ChooseCardsPrompt,1);
  assert.deepEqual(c.byRank[0].firstInTurnChooseCardsPrompt,{
    trial:'x',turn:1,ordinal:2,seat:1
  });
});

test('retains every submitted root and every capped game',()=>{
  const c=censusNativePromptFamilies([
    arm(11,'a',[prompt(0,0,'ConfirmPrompt')]),
    arm(11,'b',[prompt(0,1,'ChooseCardsPrompt')],true)
  ]);
  assert.equal(c.byRank[0].cappedGames,1);
  assert.equal(c.byRank[0].engineTerminalGames,1);
  assert.equal(c.byRank[0].observedPromptReplyActions,2);
  assert.equal(c.individuallyPaperVerifiedPromptCount,0);
  assert.equal(c.paperEvidenceStatus,'PROMPT_PAPER_UNVERIFIED');
});

test('rejects reused trial IDs across fixed arm denominator',()=>{
  assert.throws(()=>censusNativePromptFamilies([
    arm(6,'duplicate',[]),arm(11,'duplicate',[])
  ]),/assert/i);
});

test('accepts other prompt-family roots without inventing card source',()=>{
  const c=censusNativePromptFamilies([
    arm(6,'x',[prompt(0,2,'PutDamagePrompt'),
      prompt(1,2,'ChoosePokemonPrompt'),
      prompt(2,2,'SelectOptionPrompt')])
  ]);
  assert.equal(c.inTurnChooseCardsPromptCount,0);
  assert.equal(c.byRank[0].inTurnByFamily.PutDamagePrompt,1);
  assert.equal(c.sourcePrintedCardForEachPromptKnown,false);
});
