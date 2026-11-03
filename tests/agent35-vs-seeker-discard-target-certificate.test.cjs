'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {
  VS_SEEKER,SOURCE_ID,publicSupporterPrintIndex,
  vsSeekerDiscardTargetCertificate,withVsSeekerDiscardTargetEvidence
}=require('../simulation/twinleaf/agent35-vs-seeker-discard-target-certificate.cjs');

class FakeTrainer {
  constructor(fullName,trainerType){
    this.fullName=fullName;
    this.trainerType=trainerType;
  }
}
const kinds={SUPPORTER:2,ITEM:1};
const known=new Map([
  [VS_SEEKER,'Other'],
  ['Guzma BUS','Supporter'],
  ['Raihan EVS','Supporter'],
  ['Psychic Energy MEE','Other'],
  ['Regidrago V EVS','Other']
]);
const row={handIndex:0,printing:VS_SEEKER};
const view=(discard=[],other={})=>({
  decisionKind:'owner-root',actorSeat:0,globalTurn:4,
  ownHand:[VS_SEEKER,'Psychic Energy MEE'],
  ownPublic:{discard},ownTurnResources:{
    itemPlayLocked:false,supporterPlayedTurn:0
  },
  ...other
});

test('public native full-name classifier covers all types and rejects conflicting aliases',()=>{
  const cards=[
    new FakeTrainer(VS_SEEKER,kinds.ITEM),
    new FakeTrainer('Guzma BUS',kinds.SUPPORTER),
    {fullName:'Psychic Energy MEE'},
    {fullName:'Regidrago V EVS'}
  ];
  const index=publicSupporterPrintIndex(cards,{
    TrainerCard:FakeTrainer,TrainerType:kinds});
  assert.deepEqual(index,known);
  assert.throws(()=>publicSupporterPrintIndex([
    ...cards,new FakeTrainer('Guzma BUS',kinds.ITEM)
  ],{TrainerCard:FakeTrainer,TrainerType:kinds}),/Conflicting/);
});

test('empty discard and fully classified non-Supporter discard are proven blocked',()=>{
  for(const discard of [[],['Psychic Energy MEE','Regidrago V EVS']]){
    const x=vsSeekerDiscardTargetCertificate(view(discard),row,known);
    assert.equal(x.sourceId,SOURCE_ID);
    assert.equal(x.printedRuleKnown,true);
    assert.equal(x.blocked,true);
    assert.equal(x.paperPlayable,false);
    assert.equal(x.status,'proven-no-public-supporter-target');
  }
});

test('public discarded Supporter is a target, even after Supporter quota was consumed',()=>{
  const x=vsSeekerDiscardTargetCertificate(view([
    'Psychic Energy MEE','Guzma BUS','Raihan EVS'
  ],{ownTurnResources:{itemPlayLocked:false,supporterPlayedTurn:4}}),row,known);
  assert.equal(x.blocked,false);
  assert.deepEqual(x.supporterTargets,['Guzma BUS','Raihan EVS']);
  assert.equal(x.supporterQuotaUnused,false);
  assert.equal(x.paperPlayable,null);
  assert.equal(x.recoveredSupporterPlayableThisTurnCertified,false);
});

test('unknown public discard classification cannot yield a false no-target block',()=>{
  const x=vsSeekerDiscardTargetCertificate(
    view(['Unclassified Pokémon PRM']),row,known);
  assert.equal(x.blocked,false);
  assert.equal(x.unclassifiedDiscardCopies,1);
  assert.equal(x.status,'unclassified-discard-cannot-exclude-supporter');
  const missing=vsSeekerDiscardTargetCertificate(view([],{
    ownPublic:{discard:null}
  }),row,known);
  assert.equal(missing.blocked,false);
  assert.equal(missing.status,'owner-public-discard-unavailable');
});

test('owner-only evidence never reads opponent concealed zones or own deck/Prizes',()=>{
  const v=view(['Guzma BUS']);
  Object.defineProperties(v,{
    opponentPublic:{get(){throw Error('opponent board unnecessary');}},
    opponentHand:{get(){throw Error('opponent hand prohibited');}},
    ownDeck:{get(){throw Error('own deck prohibited');}},
    ownPrizeCards:{get(){throw Error('owner Prize prohibited');}}
  });
  assert.equal(vsSeekerDiscardTargetCertificate(v,row,known).blocked,false);
  assert.throws(()=>vsSeekerDiscardTargetCertificate(v,
    {handIndex:1,printing:VS_SEEKER},known));
});

test('negative overlay preserves existing blocker and makes no selection',()=>{
  const root=view([]);
  const census={rows:[
    {...row,necessaryBlockers:[],paperPlayable:null},
    {handIndex:1,printing:'Psychic Energy MEE',
      necessaryBlockers:['some-earlier-blocker'],paperPlayable:false}
  ],provenNecessaryConditionFailures:1};
  const before=JSON.stringify(census);
  const result=withVsSeekerDiscardTargetEvidence(root,census,known);
  assert.equal(JSON.stringify(census),before);
  assert.equal(result.provenNecessaryConditionFailures,2);
  assert.equal(result.remainingUnresolvedCopies,0);
  assert.equal(result.rows[0].vsSeekerDiscardTargetCertificate.blocked,true);
  assert.deepEqual(result.rows[0].necessaryBlockers,[
    'printed-discard-target:vs-seeker-no-supporter'
  ]);
  assert.deepEqual(result.rows[1].necessaryBlockers,['some-earlier-blocker']);
  assert.equal(result.anyPaperPlayableTrainerCertified,false);
});

test('the source-authenticated 29 original 60s contain 59 VS Seeker PHF copies in 23 decks',()=>{
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  assert.equal(source.decks.length,29);
  const matches=source.decks.map(deck=>({
    rank:deck.rank,copies:deck.cards.filter(card=>
      card.category==='Trainer'&&
      card.name+' '+card.printing.set===VS_SEEKER)
      .reduce((n,c)=>n+c.count,0)
  })).filter(row=>row.copies>0);
  assert.equal(matches.length,23);
  assert.equal(matches.reduce((n,x)=>n+x.copies,0),59);
});
