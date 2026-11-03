'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const source=require(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'));
const {PRINTING,sourceMailTargetBounds,planOwnerMailAfterPass}=
  require('../simulation/twinleaf/agent9-owner-mail-after-pass-planner.cjs');

const source5=source.decks.find(row=>row.rank===5);
assert.ok(source5);
const printed60=source5.cards.flatMap(row=>
  Array(row.count).fill(row.name+' '+row.printing.set));
assert.equal(printed60.length,60);
const catalog=new Map(source5.cards.filter(row=>row.category==='Trainer')
  .map(row=>{
    const name=row.name;
    const type=/^(Sky Field|Path to the Peak)$/.test(name)?
      'Stadium':name==="Trainers' Mail"?'Item':'Item';
    return [name+' '+row.printing.set,{name,type}];
  }));
assert.equal(catalog.get(PRINTING)?.type,'Item');

function view(overrides={}){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:4,
    ownHand:[PRINTING],
    ownTurnResources:{
      itemPlayLocked:false,toolPlayLocked:false,
      supporterPlayLocked:false,stadiumPlayLocked:false
    },
    ownPublic:{
      deckCount:52,active:{tools:[]},
      bench:[null,null,null,null,null],stadium:[]
    },
    opponentPublic:{stadium:[]},
    ...overrides
  };
}

test('exact rank5 original 60 source-count minimum is independent of hidden order',()=>{
  assert.equal(source5.category_counts.Trainer,42);
  assert.equal(printed60.filter(p=>p===PRINTING).length,3);
  const bounds=sourceMailTargetBounds(printed60,52,catalog);
  assert.deepStrictEqual(bounds,{
    registeredEligible:39,minimumInDeck:31,
    maximumInDeck:39,deckSize:52,topFourHitProven:false
  });
  const choice=planOwnerMailAfterPass(view(),catalog,printed60,{
    kind:'pass',reason:'no-supported-owner-visible-root'
  });
  assert.deepStrictEqual(choice.selected,{
    kind:'play-owner-mail',handIndex:0,printing:PRINTING
  });
  assert.equal(choice.ownerOnly,true);
  assert.equal(choice.promiseOfStrategicBenefit,false);
  assert.equal(choice.topFourSelectionUnresolved,true);
  assert.equal(choice.competitiveGamesQualified,0);
});

test('existing action, Item lock, empty deck and uncertain search target veto',()=>{
  const make=(v,intent={kind:'pass'})=>
    planOwnerMailAfterPass(v,catalog,printed60,intent);
  assert.equal(make(view(),{kind:'attack'}).opportunities[0].exclusion,
    'preserve-selected-nonpass');
  assert.equal(make(view({ownTurnResources:{itemPlayLocked:true}}))
    .opportunities[0].exclusion,'public-item-lock');
  assert.equal(make(view({ownPublic:{...view().ownPublic,deckCount:0}}))
    .opportunities[0].exclusion,'empty-deck');
  assert.equal(make(view({ownPublic:{...view().ownPublic,deckCount:10}}))
    .opportunities[0].exclusion,
    'source-count-does-not-guarantee-a-deck-target');
});

test('no Mail held produces no candidate and preserves all other options',()=>{
  const result=planOwnerMailAfterPass(view({ownHand:['Quick Ball FST']}),
    catalog,printed60,{kind:'pass'});
  assert.equal(result.selected,null);
  assert.deepStrictEqual(result.opportunities,[]);
});

test('top-four certainty is a strict counting result, without unseen order',()=>{
  const all=Array(58).fill('Trainer A X').concat([PRINTING,PRINTING]);
  const meta=new Map([
    ['Trainer A X',{name:'Trainer A',type:'Item'}],
    [PRINTING,{name:"Trainers' Mail",type:'Item'}]
  ]);
  const bound=sourceMailTargetBounds(all,60,meta);
  assert.equal(bound.minimumInDeck,58);
  assert.equal(bound.topFourHitProven,true);
  assert.equal(sourceMailTargetBounds(all,3,meta).topFourHitProven,false);
});
