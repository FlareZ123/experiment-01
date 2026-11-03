'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {ownerTrainerOpportunity,trainerPrintCatalog,VERSION}=
  require('../simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs');

const ITEM='Battle Compressor PHF';
const SUPPORT='Carmine TWM';
const SECOND='Professor Sycamore XY';
const STADIUM='Silent Lab PRC';
const TOOL='Float Stone BKT';
const catalog=new Map([
  [ITEM,{name:'Battle Compressor',type:'Item'}],
  [SUPPORT,{name:'Carmine',type:'Supporter'}],
  [SECOND,{name:'Professor Sycamore',type:'Supporter'}],
  [STADIUM,{name:'Silent Lab',type:'Stadium'}],
  [TOOL,{name:'Float Stone',type:'Tool'}]
]);

/**
 * Pure detached actor root. Deliberately includes a non-actor concealed
 * property to prove the planner never references it.
 */
function view(overrides={}){
  return {
    actorSeat:0,globalTurn:2,decisionKind:'owner-root',
    ownHand:[ITEM,SUPPORT,SECOND,STADIUM,TOOL],
    ownPublic:{
      active:{printing:'Iron Thorns ex TWM',tools:[]},
      bench:[null,null,null,null,null],
      stadium:[],discard:[],lostZone:[]
    },
    opponentPublic:{
      active:{printing:'Shadow Rider Calyrex V CRE',tools:[]},
      bench:[null,null,null,null,null],stadium:[],
      concealedHand:['NEVER_LEAK_OPPONENT_SECRET']
    },
    ownTurnResources:{
      itemPlayLocked:false,toolPlayLocked:false,
      supporterPlayLocked:false,stadiumPlayLocked:false,
      supporterPlayedTurn:0,stadiumPlayedTurn:0
    },
    ...overrides
  };
}

test('catalog reads public Trainer class metadata and exact print names',()=>{
  class TrainerCard{
    constructor(fullName,name,trainerType){
      Object.assign(this,{fullName,name,trainerType});
    }
  }
  class PokemonCard{
    constructor(fullName){this.fullName=fullName;}
  }
  const types={TrainerCard,TrainerType:{
    ITEM:0,SUPPORTER:1,STADIUM:2,TOOL:3
  }};
  const list=[
    new TrainerCard(ITEM,'Battle Compressor',0),
    new TrainerCard(SUPPORT,'Carmine',1),
    new TrainerCard(STADIUM,'Silent Lab',2),
    new TrainerCard(TOOL,'Float Stone',3),
    new PokemonCard('Iron Thorns ex TWM')
  ];
  const result=trainerPrintCatalog(list,types);
  assert.equal(result.size,4);
  assert.deepEqual(result.get(TOOL),{
    name:'Float Stone',type:'Tool',firstTurnSupporterException:false});
  assert.equal(result.has('Iron Thorns ex TWM'),false);
});

test('generic frontier retains every coheld Supporter and all Trainer channels',()=>{
  const result=ownerTrainerOpportunity(view(),catalog,new Set([0,1,3]));
  assert.equal(result.version,VERSION);
  assert.equal(result.handTrainerCopies,5);
  assert.equal(result.unblockedGenericTrainerCopies,5);
  assert.deepEqual(result.channels['one-supporter'],{held:2,unblocked:2});
  assert.deepEqual(result.rows.map(row=>row.type),
    ['Item','Supporter','Supporter','Stadium','Tool']);
  assert.deepEqual(result.rows.map(row=>row.nativeEnumeratorOffered),
    [true,true,false,true,false]);
  assert.ok(result.rows.every(row=>
    row.paperEligibility==='unresolved-card-specific'&&
    row.paperPayment==='not-verified'));
  assert.equal(result.qualification.paperLegalPlayableSet,false);
  assert.equal(result.qualification.competitiveGameQualified,false);
});

test('public lock, consumed supporter and first-turn rules remain distinct',()=>{
  const r=view({globalTurn:1,
    ownTurnResources:{
      itemPlayLocked:true,toolPlayLocked:true,
      supporterPlayLocked:false,stadiumPlayLocked:false,
      supporterPlayedTurn:0,stadiumPlayedTurn:0
    }});
  const f=ownerTrainerOpportunity(r,catalog);
  assert.deepEqual(f.rows.map(x=>x.publicBlocker),
    ['public-item-lock','first-player-opening-supporter-rule',
      'first-player-opening-supporter-rule',null,'public-tool-lock']);
  r.globalTurn=4;
  r.ownTurnResources.itemPlayLocked=false;
  r.ownTurnResources.toolPlayLocked=false;
  r.ownTurnResources.supporterPlayedTurn=1;
  r.ownTurnResources.stadiumPlayedTurn=4;
  const f2=ownerTrainerOpportunity(r,catalog);
  assert.deepEqual(f2.rows.map(x=>x.publicBlocker),
    [null,'supporter-already-consumed','supporter-already-consumed',
      'stadium-already-played',null]);
});

test('stadium of same printed name and no Tool recipients are only visible blockers',()=>{
  const v=view();
  v.ownPublic.stadium=['Silent Lab PRC'];
  v.ownPublic.active.tools=['Float Stone BKT'];
  const f=ownerTrainerOpportunity(v,catalog);
  assert.equal(f.rows.find(x=>x.type==='Stadium').publicBlocker,
    'same-named-stadium-in-play');
  assert.equal(f.rows.find(x=>x.type==='Tool').publicBlocker,
    'no-public-open-tool-slot');
  assert.equal(f.rows.find(x=>x.type==='Item').publicBlocker,null);
});

test('opponent concealed contents and unknown nontrainer cards are never consulted',()=>{
  const a=view(),b=view({
    opponentPublic:{
      ...view().opponentPublic,
      concealedHand:['EVERY_SECRET_CHANGED'],
      deckIdentities:['SHOULD_NOT_BE_READ']
    },
    ownHand:[ITEM,'Pikachu SVI',SUPPORT,SECOND,STADIUM,TOOL]
  });
  const first=ownerTrainerOpportunity(a,catalog);
  const second=ownerTrainerOpportunity(b,catalog);
  assert.deepEqual(
    first.rows.map(x=>({printing:x.printing,blocker:x.publicBlocker})),
    second.rows.map(x=>({printing:x.printing,blocker:x.publicBlocker}))
  );
  assert.ok(!JSON.stringify(second).includes('EVERY_SECRET_CHANGED'));
  assert.ok(!JSON.stringify(second).includes('SHOULD_NOT_BE_READ'));
  assert.ok(second.rows.every(x=>x.printing!=='Pikachu SVI'));
});

test('frontier rejects prompt-state masquerading as owner root',()=>{
  assert.throws(()=>ownerTrainerOpportunity(view({decisionKind:'owner-prompt'}),
    catalog),/owner-root/);
});


test('printed first-turn Supporter exception overrides generic global-turn veto',()=>{
  const special=new Map(catalog);
  special.set(SUPPORT,{...catalog.get(SUPPORT),
    firstTurnSupporterException:true});
  const candidate=view({globalTurn:1});
  const f=ownerTrainerOpportunity(candidate,special);
  assert.equal(f.rows.find(row=>row.printing===SUPPORT).publicBlocker,null,
    'Carmine-style first-turn exception is not vetoed by ordinary rule');
  assert.equal(f.rows.find(row=>row.printing===SECOND).publicBlocker,
    'first-player-opening-supporter-rule');
  assert.equal(f.rows.find(row=>row.printing===SUPPORT).paperEligibility,
    'unresolved-card-specific',
    'No endorsement of payable Carmine hand discard without evaluating cards');
});
