'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {verifiedBasicRecipient,pairGroup,summarizeGroups}=
  require('../simulation/evaluation/agent6-rank1-rank3-energy-recipient-aba.cjs');

const SOURCE='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const REF='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';

function event({seat=0,position='bench',after=true,kind='play-card'}={}){
  return {
    storeAccepted:true,action:'PlayCardAction',visibility:'public-after-dispatch',
    playerSlot:seat,turnBefore:3,rootActionOrdinal:18,
    declared:{kind,status:'captured',ownerHandPrinting:'Psychic Energy MEE',
      target:{player:0,slot:position==='bench'?2:1,index:0}},
    publicBoardChanges:[{
      seat,position,index:0,
      before:{pokemon:'Shadow Rider Calyrex V CRE',energies:[]},
      after:{pokemon:'Shadow Rider Calyrex V CRE',
        energies:after?['Psychic Energy MEE']:[]}
    }]
  };
}

test('only real accepted matching Basic Energy change receives certification',()=>{
  const x=verifiedBasicRecipient(event());
  assert.equal(x?.position,'bench');
  assert.equal(x?.ownerHandPrinting,'Psychic Energy MEE');
  assert.equal(x?.actorSeat,0);
  assert.equal(verifiedBasicRecipient(event({position:'active'}))?.position,'active');
  assert.equal(verifiedBasicRecipient(event({after:false})),null);
  assert.equal(verifiedBasicRecipient(event({kind:'other'})),null);
  assert.equal(verifiedBasicRecipient({...event(),storeAccepted:false}),null);
  const foreign=event();
  foreign.publicBoardChanges[0].seat=1;
  assert.equal(verifiedBasicRecipient(foreign),null);
  const wrong=event();
  wrong.publicBoardChanges[0].after.energies=['Darkness Energy MEE'];
  assert.equal(verifiedBasicRecipient(wrong),null);
});

function arm({id='control',recipient=false,initial='full',root='same',
    attack=0,bench=0}={}){
  const nativeEvent=recipient?event():event({position:'active'});
  const finalBoard=[
    {active:{name:'Dialga-GX',energyCards:Array(9).fill('Psychic Energy')},
      bench:[{name:'Shadow Rider Calyrex V',
        energyCards:Array(bench).fill('Psychic Energy')}]},
    {active:{name:'Snorlax',energyCards:[]},bench:[]}
  ];
  return {
    id,seed:3565472974,rank3Seat:1,rank1Seat:0,status:'native-terminal',
    originalSource60Hash:SOURCE,originalReference60Hash:REF,
    nativeVerifiedStartByDraw:true,actualFirstSeat:1,
    fullDealSha256:initial,rank3DealSha256:'source',
    rootLedgerSha256:root,globalTurns:65,actions:200,winner:1,
    rank1AttackCount:attack,rank3AttackCount:1,
    rootCount:200,finalPublicBoard:finalBoard,
    nativeAcceptedTargetSidecar:{
      schema:'actual-store-declared-target-sidecar-v1',
      rootOrdinalLinked:true,observedTargetActions:1,events:[nativeEvent]
    }
  };
}

test('same physical seed plus repeated controls permits target-different treatment',()=>{
  const g=pairGroup([
    arm(),arm({id:'treatment',recipient:true,bench:1,attack:2,root:'changed'}),
    arm({id:'control-repeat'})
  ]);
  assert.equal(g.matchedAuthenticInitialPhysicalDeal,true);
  assert.equal(g.exactControlRepeat,true);
  assert.equal(g.classification,'paired-development');
  assert.equal(g.selectivePhysicalTargetDifference.status,'different');
  assert.equal(g.treatment.rank1NativeBasicAttachments[0].position,'bench');
  const total=summarizeGroups([g]);
  assert.equal(total.control.rank1BenchedBasicAttachments,0);
  assert.equal(total.treatment.rank1BenchedBasicAttachments,1);
  assert.equal(total.treatment.rank1NativeAttacks,2);
  assert.equal(total.control.rank1ZeroAttackNinePsychicDialga,1);
});

test('different source physical deal fails closed despite identical root skeleton',()=>{
  const g=pairGroup([arm(),arm({id:'treatment',initial:'different'}),
    arm({id:'control-repeat'})]);
  assert.equal(g.matchedAuthenticInitialPhysicalDeal,false);
  assert.equal(g.classification,'unverified-or-nonreproducible');
});
