'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  wasCardAdded,acceptedBasicBenchAttachment,
  acceptedPromptBenchAdditions,auditOneNativeGame
}=require('../simulation/evaluation/agent31-rank1-recipient-physical-postprocess.cjs');

const slot=(name,energies)=>({
  pokemon:name,energies,tools:[]
});
const changed=(before,after,position='bench',seat=1)=>({
  seat,position,index:0,
  before:slot('Shadow Rider Calyrex VMAX CRE',before),
  after:slot('Shadow Rider Calyrex VMAX CRE',after)
});

test('one added matching Basic is needed; count preserved repeated copies',()=>{
  assert.equal(wasCardAdded(['Psychic Energy MEE'],
    ['Psychic Energy MEE','Psychic Energy MEE'],
    'Psychic Energy MEE'),true);
  assert.equal(wasCardAdded(['Psychic Energy MEE'],
    ['Psychic Energy MEE','Darkness Energy MEE'],
    'Psychic Energy MEE'),false);
  assert.equal(wasCardAdded(['Psychic Energy MEE'],
    ['Psychic Energy MEE'],'Psychic Energy MEE'),false);
});

test('accepted physical hand Basic play must increase owner Bench with exact card',()=>{
  const native={
    action:'PlayCardAction',storeAccepted:true,
    playerSlot:1,turnBefore:11,actionOrdinal:91,
    visibility:'public-after-dispatch',
    declared:{ownerHandPrinting:'Psychic Energy MEE'},
    publicBoardChanges:[changed([],
      ['Psychic Energy MEE'])]
  };
  assert.deepEqual(acceptedBasicBenchAttachment(native),{
    seat:1,benchIndex:0,printing:'Psychic Energy MEE',
    targetPokemon:'Shadow Rider Calyrex VMAX CRE',
    nativeDispatchOrdinal:91,rootActionOrdinal:null,turnBefore:11
  });
  assert.equal(acceptedBasicBenchAttachment({
    ...native,playerSlot:0
  }),null);
  assert.equal(acceptedBasicBenchAttachment({
    ...native,publicBoardChanges:[changed([],['Psychic Energy MEE'],
      'active')]
  }),null);
});

test('special energy and non-mutating Store acceptance do not count',()=>{
  const original={
    action:'PlayCardAction',storeAccepted:true,playerSlot:1,
    visibility:'public-after-dispatch',
    declared:{ownerHandPrinting:'Double Colorless Energy PHF'},
    publicBoardChanges:[changed([],['Double Colorless Energy PHF'])]
  };
  assert.equal(acceptedBasicBenchAttachment(original),null);
  assert.equal(acceptedBasicBenchAttachment({
    ...original,declared:{ownerHandPrinting:'Psychic Energy MEE'},
    publicBoardChanges:[]}),null);
});

test('native AttachEnergyPrompt captures genuine public Bench addition',()=>{
  const e={
    action:'ResolvePromptAction',nativeDispatchAccepted:true,
    publicAfterDispatch:true,turnBefore:12,dispatchOrdinal:67,
    publicChanges:[changed(['Psychic Energy MEE'],
      ['Psychic Energy MEE','Psychic Energy MEE'])]
  };
  const actions=acceptedPromptBenchAdditions(e);
  assert.equal(actions.length,1);
  assert.equal(actions[0].printing,'Psychic Energy MEE');
  assert.equal(actions[0].seat,1);
  assert.equal(acceptedPromptBenchAdditions({
    ...e,publicChanges:[changed([],['Psychic Energy MEE'],'active')]
  }).length,0);
});

test('censored trial with absent sidecars is unobserved, never zero-certified',()=>{
  const row={
    trial:{id:'1:0:A:champion-reference'},sourceSeat:1,
    status:'capped',rootActionLedger:null
  };
  const a=auditOneNativeGame(row);
  assert.equal(a.acceptedTargetsPresent,false);
  assert.equal(a.acceptedEnergyPromptsPresent,false);
  assert.equal(a.sourceDirectBasicBenchAttachments,null);
  assert.equal(a.sourcePromptBasicBenchAdditions,null);
  assert.equal(a.sourceUnderworldDoorActionRoots,null);
});
