'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {
  publicNativeCardIdentifier,buildBundledExactPublicMetadata,
  loadBundledExactPublicMetadata,assessExactPublicDiscardTargets
}=require('../simulation/twinleaf/planning/owner-public-exact-print-identity.cjs');

const resourceRoot=path.join(__dirname,'../resources');
const exact=loadBundledExactPublicMetadata(resourceRoot);
const pub=(printing,number,set='BLW',name='Bouffalant')=>({
  fullName:printing,set,setNumber:number,name
});
const view=discard=>({
  decisionKind:'owner-root',actorSeat:0,
  ownPublic:{discard},
  opponentPublic:{hiddenHand:Object.freeze(['inaccessible-opponent'])}
});

test('name+set collision resolves to opposite public Rescue Carrier eligibility',()=>{
  const x=assessExactPublicDiscardTargets(
    view(['Bouffalant BLW','Bouffalant BLW']),[
      pub('Bouffalant BLW','90'),
      pub('Bouffalant BLW','91')
    ],exact,'pokemon-hp-90');
  assert.deepEqual(x.publicDiscardCards.map(r=>r.exactMetadataKey),
    ['BLW/90','BLW/91']);
  assert.deepEqual(x.publicDiscardCards.map(r=>r.categoryMatchesTarget),
    [true,false]);
  assert.ok(x.publicDiscardCards.every(r=>r.namesAgree===true));
  assert.equal(x.paperLegalPlayCertified,false);
});

test('missing or mismatched public native print identity remains unresolved',()=>{
  const x=assessExactPublicDiscardTargets(view(['Bouffalant BLW']),[
    pub('Bouffalant BLW','nonexistent')
  ],exact,'pokemon-hp-90');
  assert.equal(x.publicDiscardCards[0].categoryMatchesTarget,null);
  assert.equal(x.publicDiscardCards[0].namesAgree,false);
  assert.equal(x.publicDiscardCards[0].exactMetadataKey,
    'BLW/nonexistent');
  const y=assessExactPublicDiscardTargets(view(['Bouffalant BLW']),[
    pub('Bouffalant BLW','90','BLW','Incorrect Pokémon Name')
  ],exact,'pokemon-hp-90');
  assert.equal(y.publicDiscardCards[0].categoryMatchesTarget,null);
  assert.equal(y.publicDiscardCards[0].namesAgree,false);
});

test('native identifier is a catalogue key, not a physical collector-number proof',()=>{
  const x=publicNativeCardIdentifier({
    fullName:'Palace Book SMP',name:'Palace Book',
    set:'SMP',setNumber:'NAN25'
  });
  assert.equal(x.nativeSet,'SMP');
  assert.equal(x.nativeSetNumber,'NAN25');
  assert.equal(x.catalogueNumberIsPhysicalPrintCertified,false);
});

test('source class index conservatively preserves conflicting same-id target metadata',()=>{
  const index=buildBundledExactPublicMetadata(
    [{id:'set1',ptcgoCode:'ABC'}],[{setId:'set1',cards:[
      {name:'Target',number:'50',supertype:'Pokémon',
        subtypes:['Basic'],hp:'80'},
      {name:'Target',number:'50',supertype:'Pokémon',
        subtypes:['Basic'],hp:'120'}
    ]}]);
  const r=assessExactPublicDiscardTargets(view(['Target ABC']),[
    pub('Target ABC','50','ABC','Target')
  ],index,'pokemon-hp-90');
  assert.equal(r.publicDiscardCards[0].exactCandidateVariants,2);
  assert.equal(r.publicDiscardCards[0].categoryMatchesTarget,null);
});

test('detached public names and genuine native discard must align',()=>{
  assert.throws(()=>assessExactPublicDiscardTargets(
    view(['Bouffalant BLW']),[pub('Different BLW','90')],
    exact,'pokemon-hp-90'),/must match/);
  assert.throws(()=>assessExactPublicDiscardTargets(
    view([]),[pub('Bouffalant BLW','90')],exact,'pokemon-hp-90'));
});

test('opponent concealed data is never consulted by exact target overlay',()=>{
  const v=view(['Bouffalant BLW']);
  Object.defineProperty(v.opponentPublic,'hiddenHand',{get(){
    throw new Error('Opponent concealed data cannot be read');
  }});
  const r=assessExactPublicDiscardTargets(v,[pub('Bouffalant BLW','90')],
    exact,'pokemon-hp-90');
  assert.equal(r.publicDiscardCards[0].categoryMatchesTarget,true);
  assert.equal(JSON.stringify(r).includes('inaccessible-opponent'),false);
});
