'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {
  SOURCE_PRIOR_KO,priorOpponentKOTrainerPrerequisite,
  screenOwnerPriorOpponentKOPrerequisites
}=require('../simulation/evaluation/agent30-prior-opponent-ko-trainer-necessary.cjs');

const root=path.resolve(__dirname,'..');
const specimens=[
  ['Raihan EVS','Supporter','swsh7-152',14,
    [1,10,12,13,14,18,19,20,21,27,30,32]],
  ['Teammates PRC','Supporter','xy5-141',5,[1,3,7]],
  ['Unfair Stamp TWM','Item','sv6-165',1,[1]]
];

/** @param {string[]} hand @param {number} globalTurn */
function owner(hand,globalTurn=1){
  return {decisionKind:'owner-root',actorSeat:0,globalTurn,
    ownHand:hand,ownPublic:{prizeCount:6},
    opponentPublic:{prizeCount:6}};
}
/** @param {number} index @param {string} printing @param {string} type */
const row=(index,printing,type)=>({handIndex:index,printing,type,
  nativeEnumeratorOffered:true,publicBlocker:null});

test('three exact printed prior-opponent-KO Trainer requirements are blocked on real first turn',()=>{
  for(const [printing,type,id] of specimens){
    const receipt=priorOpponentKOTrainerPrerequisite(
      owner([printing]),row(0,printing,type));
    assert.equal(SOURCE_PRIOR_KO[printing].sourceId,id);
    assert.equal(receipt.knownPrintedPriorKORequirement,true);
    assert.equal(receipt.firstGlobalPlayerTurn,true);
    assert.equal(receipt.status,'proved-no-opponent-prior-turn');
    assert.equal(receipt.blocked,true);
    assert.equal(receipt.paperPlayable,false);
  }
});

test('later turns remain UNKNOWN absent authenticated knockout history',()=>{
  for(const [printing,type] of specimens){
    for(const turn of [2,3,4,11]){
      const receipt=priorOpponentKOTrainerPrerequisite(
        owner([printing],turn),row(0,printing,type));
      assert.equal(receipt.blocked,false);
      assert.equal(receipt.paperPlayable,null);
      assert.equal(receipt.status,'no-authenticated-ko-history');
      assert.equal(receipt.noUnwitnessedOpponentKOInference,true);
    }
  }
});

test('genuine held hand copies and source unknown keep independent statuses',()=>{
  const v=owner(['Raihan EVS','Unfair Stamp TWM','Ultra Ball MEG']);
  const r=screenOwnerPriorOpponentKOPrerequisites(v,
    v.ownHand.map((printing,i)=>row(i,printing,
      printing==='Unfair Stamp TWM'||printing==='Ultra Ball MEG'?'Item':'Supporter')));
  assert.equal(r.heldTrainerCopies,3);
  assert.equal(r.exactPrintedPriorKORequirementsSeen,2);
  assert.equal(r.provenFirstGlobalTurnBlockedCopies,2);
  assert.deepEqual(r.rows.map(x=>x.paperPlayable),[false,false,null]);
  assert.equal(r.allPaperPlayableCertified,false);
  assert.equal(r.competitivelyQualifiedGames,0);
  assert.throws(()=>screenOwnerPriorOpponentKOPrerequisites(v,
    [row(0,'Raihan EVS','Supporter'),row(0,'Raihan EVS','Supporter')]),
  /Repeated physical owner hand index/);
});

test('category, card custody, and real owner root must match',()=>{
  const v=owner(['Unfair Stamp TWM']);
  assert.throws(()=>priorOpponentKOTrainerPrerequisite(
    {...v,decisionKind:'owner-prompt'},row(0,'Unfair Stamp TWM','Item')));
  assert.throws(()=>priorOpponentKOTrainerPrerequisite(
    v,row(0,'Unfair Stamp TWM','Supporter')));
  assert.throws(()=>priorOpponentKOTrainerPrerequisite(
    v,row(1,'Unfair Stamp TWM','Item')));
  assert.throws(()=>priorOpponentKOTrainerPrerequisite(
    v,row(0,'Teammates PRC','Supporter')));
  assert.throws(()=>priorOpponentKOTrainerPrerequisite(
    {...v,globalTurn:0},row(0,'Unfair Stamp TWM','Item')));
});

test('owner root proof is independent of opponent hidden state and irrelevant counters',()=>{
  const a=owner(['Raihan EVS'],1),b=owner(['Raihan EVS'],1);
  Object.defineProperty(b,'opponentHand',{get(){throw Error('concealed');}});
  b.opponentPublic.prizeCount=2;
  a.opponentPublic.prizeCount=6;
  assert.deepEqual(
    screenOwnerPriorOpponentKOPrerequisites(a,[row(0,'Raihan EVS','Supporter')]),
    screenOwnerPriorOpponentKOPrerequisites(b,[row(0,'Raihan EVS','Supporter')])
  );
});

test('original 29 exact 60s contain 20 prior-KO conditional copies over 14 ranks',()=>{
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  assert.equal(roster.decks.length,29);
  const union=new Set();
  let copySum=0;
  for(const [printing,type,id,expected,ranks] of specimens){
    const suffix=printing.lastIndexOf(' ');
    const name=printing.slice(0,suffix),set=printing.slice(suffix+1);
    const records=roster.decks.flatMap(deck=>deck.cards.filter(card=>
      card.category==='Trainer'&&card.name===name&&card.printing.set===set)
      .map(card=>({rank:Number(deck.rank),count:card.count})));
    assert.deepEqual(records.map(x=>x.rank).sort((a,b)=>a-b),ranks);
    assert.equal(records.reduce((sum,x)=>sum+x.count,0),expected);
    for(const r of records)union.add(r.rank);
    copySum+=expected;
    const [sourceSet]=id.split('-');
    const cards=JSON.parse(fs.readFileSync(
      path.join(root,'resources/cards/en',sourceSet+'.json'),'utf8'));
    const card=cards.find(x=>x.id===id);
    assert.ok(card,id);
    assert.equal(card.name,name);
    assert.equal(card.legalities.expanded,'Legal');
    assert.ok(card.subtypes.includes(type));
    assert.match(card.rules.join('\n'),/only if/);
    assert.match(card.rules.join('\n'),/during your opponent.s last turn/);
  }
  assert.equal(copySum,20);
  assert.deepEqual([...union].sort((a,b)=>a-b),
    [1,3,7,10,12,13,14,18,19,20,21,27,30,32]);
});
