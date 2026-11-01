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
    trial:'x',turn:1,ordinal:2,seat:1,
    initiatingRootOrdinal:null,initiatingAction:null,initiatingName:null
  });
  assert.equal(c.inTurnChooseCardsWithInitiatingRoot,0);
  assert.equal(c.inTurnChooseCardsWithNamedInitiator,0);
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

test('retains source root action attribution without pretending exact printing',()=>{
  const rows=[
    {action:'PlayCardAction',actionOrdinal:1,turnBefore:1,
      card:'Fog Crystal',initiatingRootActionOrdinal:1},
    {...prompt(2,1,'ChooseCardsPrompt'),initiatingRootActionOrdinal:1},
    {action:'AttackAction',actionOrdinal:3,turnBefore:2,
      attack:'Get Lost',initiatingRootActionOrdinal:3},
    {...prompt(4,2,'ChooseCardsPrompt'),initiatingRootActionOrdinal:3}
  ];
  const c=censusNativePromptFamilies([arm(11,'native-names',rows)]);
  assert.equal(c.inTurnChooseCardsWithInitiatingRoot,2);
  assert.equal(c.inTurnChooseCardsWithNamedInitiator,2);
  assert.equal(c.byRank[0].inTurnChooseCardsByInitiatingAction[
    'PlayCardAction / Fog Crystal'],1);
  assert.equal(c.byRank[0].inTurnChooseCardsByInitiatingAction[
    'AttackAction / Get Lost'],1);
  assert.equal(c.sourcePrintedCardForEachPromptKnown,false);
});

test('joins archived separately captured physically selected prompt names',()=>{
  const trial=arm(11,'joined',[
    {action:'AttackAction',actionOrdinal:1,turnBefore:3,
      attack:'Night Watch'},
    {...prompt(2,3,'ChooseCardsPrompt',0),
      initiatingRootActionOrdinal:1}
  ]);
  trial.nativePromptChoices={events:[{
    ordinal:2,kind:'ChooseCardsPrompt',sourceZone:'hand',
    sourcePlayerSlot:1,selectedCards:['Energy EVS','Supporter PHF']
  }]};
  const c=censusNativePromptFamilies([trial]);
  assert.equal(c.inTurnChooseCardsWithSelectionReceipt,1);
  assert.equal(c.inTurnChooseCardsWithSelectedCardNames,1);
  assert.equal(c.byRank[0].inTurnChooseCardsSelectionZoneCounts.hand,1);
  assert.equal(c.byRank[0].inTurnChooseCardsByInitiatingAction[
    'AttackAction / Night Watch'],1);
  assert.equal(c.individuallyPaperVerifiedPromptCount,0);
});

test('missing private selected names cannot be treated as paper verified',()=>{
  const trial=arm(11,'lost-zone',[
    {action:'AttackAction',actionOrdinal:1,turnBefore:3,attack:'Get Lost'},
    {...prompt(2,3,'ChooseCardsPrompt'),initiatingRootActionOrdinal:1}
  ]);
  trial.nativePromptChoices={events:[{
    ordinal:2,kind:'ChooseCardsPrompt',sourceZone:'discard',
    sourcePlayerSlot:1,selectedCards:null
  }]};
  const c=censusNativePromptFamilies([trial]);
  assert.equal(c.inTurnChooseCardsWithSelectionReceipt,1);
  assert.equal(c.inTurnChooseCardsWithSelectedCardNames,0);
  assert.equal(c.byRank[0].inTurnChooseCardsSelectionZoneCounts.discard,1);
});
