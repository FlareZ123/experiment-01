'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,hasTurnBenchPlayAbility,printedResolver,
  openingBenchTriggerExposure,originalFieldBenchTriggerExposure
}=require('../simulation/evaluation/agent50-opening-bench-trigger-exposure.cjs');
const {chooseOwnedStartingBasics}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');

test('opening-loss exact combinatorics equal independent physical-hand enumeration',()=>{
  // Tiny deck: 2 trigger Basics, 2 other Basics, 4 other cards.
  const a=openingBenchTriggerExposure(4,2,{
    deckSize:8,handSize:3,maxSelected:2
  });
  let valid=0n,consumed=0n,avoidable=0n;
  for(let x=0;x<8;x++)for(let y=x+1;y<8;y++)for(let z=y+1;z<8;z++){
    const hand=[x,y,z];
    const t=hand.filter(i=>i<2).length;
    const r=hand.filter(i=>i>=2&&i<4).length;
    if(t+r===0)continue;
    valid++;
    if(t>=1&&t+r<=2)consumed++;
    if(t>=1&&r>=1&&t+r<=2)avoidable++;
  }
  assert.equal(valid,a.validOpenings);
  assert.equal(consumed,a.consumedTriggerOpenings);
  assert.equal(avoidable,a.avoidableTriggerOpenings);
  assert.equal(valid,52n);
  assert.equal(consumed,36n);
  assert.equal(avoidable,8n);
  console.log('AGENT50_OPENING_TINY_EXACT',{
    valid:String(valid),consumed:String(consumed),avoidable:String(avoidable)
  });
});

test('on-Bench trigger classification follows exact printed Ability, not name',()=>{
  const printed=printedResolver();
  const witnesses=[
    ['Articuno-GX','CES','31','Legendary Ascent'],
    ['Crobat V','DAA','104','Dark Asset'],
    ['Dedenne-GX','UNB','57','Dedechange'],
    ['Eldegoss V','RCL','19','Happy Match'],
    ['Radiant Eternatus','CRZ','105','Climactic Gate'],
    ['Tapu Lele-GX','GRI','60','Wonder Tag']
  ];
  for(const [name,set,number,ability] of witnesses){
    const {card,unknown}=printed({set,number},name);
    assert.equal(unknown,false);
    assert.equal(card.subtypes.includes('Basic'),true);
    assert.equal(hasTurnBenchPlayAbility(card),true,name);
    assert.ok(card.abilities.some(a=>a.name===ability));
  }
  const {card}=printed({set:'UNB',number:'81'},'Marshadow');
  assert.equal(hasTurnBenchPlayAbility(card),false,
    'Do not mistake Resetting Hole for a hand-to-Bench trigger');
  assert.equal(hasTurnBenchPlayAbility({abilities:[
    {text:'When you play this Pokémon from your hand to evolve, draw 2 cards.'}
  ]}),false);
});

test('selected greedy opening does consume eligible hand-to-Bench Basics',()=>{
  const cards=[
    {fullName:'Regidrago V SIT 135',stage:'Basic'},
    {fullName:'Tapu Lele-GX GRI 60',stage:'Basic'},
    {fullName:'Dedenne-GX UNB 57',stage:'Basic'},
    {fullName:'Ultra Ball',stage:'Trainer'}
  ];
  const owner={hand:{cards}};
  const prompt={cards:owner.hand,options:{max:6,blocked:[3]},
    validate(selection){
      return selection.length>=1&&selection.length<=6&&
        selection.every(c=>c.stage==='Basic');
    }};
  const selected=chooseOwnedStartingBasics(prompt,owner,
    {BASIC:'Basic'},{PLAY_DURING_SETUP:'PlayDuringSetup'});
  assert.deepEqual(selected,cards.slice(0,3),
    'The selected setup player benches both in-turn supports during setup');
  const alternative=[cards[0]];
  assert.equal(prompt.validate(alternative),true,
    'A legal owner-only Active choice can defer both supports');
});

test('all 29 actual printed originals give an exact bounded opening exposure',()=>{
  const d=originalFieldBenchTriggerExposure();
  assert.equal(d.schema,VERSION);
  assert.equal(d.authenticatedRanks,29);
  assert.deepEqual(d.missingRanks,[23,25,28]);
  assert.equal(d.knownTriggerBasicCopiesAcrossSourceSixties,62);
  assert.equal(d.ranksWithKnownTriggerBasics,23);
  const r4=d.rows.find(r=>r.rank===4);
  assert.equal(r4.basics,13);
  assert.equal(r4.knownTurnBenchTriggerBasics,6);
  assert.ok(Math.abs(r4.avoidableTriggerGivenValid-
    0.3645142060823631)<1e-12);
  const r11=d.rows.find(r=>r.rank===11);
  assert.equal(r11.basics,11);
  assert.equal(r11.knownTurnBenchTriggerBasics,2);
  assert.ok(Math.abs(r11.avoidableTriggerGivenValid-
    0.1853384671843887)<1e-4);
  const r6=d.rows.find(r=>r.rank===6);
  assert.equal(r6.knownTurnBenchTriggerBasics,0);
  assert.equal(r6.avoidableTriggerGivenValid,0);
  assert.ok(Math.abs(d.equalRankMeanConsumedOpportunity-
    0.2655866233551712)<1e-12);
  assert.ok(Math.abs(d.equalRankMeanAvoidableOpportunity-
    0.18437933878435123)<1e-12);
  assert.ok(d.rows.every(r=>r.avoidableTriggerGivenValid<=
    r.consumedTriggerGivenValid));
  assert.ok(d.rows.every(r=>r.unknownPromoText.every(p=>
    p.printing&&p.name&&p.count>=1)));
  console.log('AGENT50_ORIGINAL29_OPENING_BENCH_TRIGGER_EXPOSURE',JSON.stringify({
    schema:d.schema,sourceRanks:d.authenticatedRanks,
    triggerCopies:d.knownTriggerBasicCopiesAcrossSourceSixties,
    ranksWithTriggers:d.ranksWithKnownTriggerBasics,
    equalRankMeanConsumed:d.equalRankMeanConsumedOpportunity,
    equalRankMeanAvoidable:d.equalRankMeanAvoidableOpportunity,
    riskRows:d.rows.map(r=>({
      rank:r.rank,basics:r.basics,trigger:r.knownTurnBenchTriggerBasics,
      avoidable:r.avoidableTriggerGivenValid,
      unresolved:r.unknownPromoText.map(x=>x.name)
    }))
  }));
});
