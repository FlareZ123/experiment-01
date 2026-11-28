'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {buildSourcePrintingMap,projectSourcePrintings}=
  require('../../simulation/evaluation/2026-11/agent32-source-printing-bridge.cjs');

const source={cards:[
  {name:'Penny',count:1,printing:{set:'SVI',number:'183'}},
  {name:"Team Rocket's Handiwork",count:1,printing:{set:'FCO',number:'112'}},
  {name:'Psychic Energy',count:58,printing:{set:'SVE',number:'5'}}
]};
const ids=['Penny SVI',"Team Rocket's Handiwork FCO",
  ...Array(58).fill('Psychic Energy SVE')];

for(const seat of [0,1])test('source-60 projection actor seat '+seat,()=>{
  const verified=buildSourcePrintingMap(source,ids);
  const opponent=new Map();
  const maps=seat===0?[verified,opponent]:[opponent,verified];
  const view={actorSeat:seat,ownHand:['Penny SVI'],
    ownPublic:{active:{printing:'Psychic Energy SVE',
      evolutionPrintings:['Psychic Energy SVE'],energies:[],tools:[]},
      bench:[null],stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      prizeSlots:[{index:0}],publicHand:null},
    opponentPublic:{active:{printing:'Penny SVI',energies:[],tools:[]},
      bench:[null],stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      prizeSlots:[{index:1}],publicHand:null}};
  const frontier={schema:'fixture',items:[
    {token:'a',kind:'play-card',actorPrinting:'Penny SVI',
      targetPrinting:'Psychic Energy SVE',publicMetadata:{targetSeat:'actor'}},
    {token:'b',kind:'play-card',actorPrinting:'Penny SVI',
      targetPrinting:'Penny SVI',publicMetadata:{targetSeat:'opponent'}}]};
  const after=projectSourcePrintings(view,frontier,maps);
  assert.deepEqual(after.observation.ownHand,['Penny SVI 183']);
  assert.equal(after.observation.ownPublic.active.printing,'Psychic Energy SVE 5');
  assert.equal(after.observation.opponentPublic.active.printing,'Penny SVI');
  assert.equal(after.observation.ownPublic.prizeSlots[0].printing,undefined);
  assert.equal(after.observation.opponentPublic.prizeSlots[0].printing,undefined);
  assert.equal(after.actionFrontier.items[0].actorPrinting,'Penny SVI 183');
  assert.equal(after.actionFrontier.items[0].targetPrinting,'Psychic Energy SVE 5');
  assert.equal(after.actionFrontier.items[1].targetPrinting,'Penny SVI');
  assert.equal(after.actionFrontier.items[0].token,'a');
  assert.equal(view.ownHand[0],'Penny SVI');
  assert.equal(frontier.items[0].actorPrinting,'Penny SVI');
});

test('ambiguous or incomplete source mapping fails closed',()=>{
  assert.throws(()=>buildSourcePrintingMap({cards:source.cards.slice(0,2)},ids),/60/);
  const bad={cards:[
    {name:'Penny',count:1,printing:{set:'SVI',number:'183'}},
    {name:'Penny',count:59,printing:{set:'SVI',number:'999'}}]};
  assert.throws(()=>buildSourcePrintingMap(bad,Array(60).fill('Penny SVI')),
    /ambiguous source printings/);
  const view={actorSeat:0,ownHand:[],ownPublic:null,opponentPublic:null};
  assert.throws(()=>projectSourcePrintings(view,{items:[]},[
    new Map([['Penny SVI','Penny SVI 183']]),new Map()]),
    /nonempty source-printing map must be created/);
});


test('source-projected receipt, prompt and K1 stay shape-safe',()=>{
  const map=buildSourcePrintingMap(source,ids);
  const view={actorSeat:0,ownHand:['Penny SVI'],
    ownPublic:{active:{printing:'Penny SVI',energies:[],tools:[]},bench:[null]},
    opponentPublic:{active:{printing:'Penny SVI'},bench:[]},
    ownerK1:{epoch:2,exactMembershipKnown:true,invalidationReason:null,
      knownPrintings:[{printing:'Penny SVI',copies:1}]}};
  const receipt={ownerActive:{printing:'Penny SVI',knownAbilityUse:[]},
    ownerBench:[null],opponentLastTurnAttacks:null};
  const prompt={source:{sourcePrinting:'Penny SVI',effectName:'Penny',
    sourceKind:'card-effect'},choices:[{kind:'card',token:'a',printing:'Penny SVI',
      publicMetadata:{ownerSeat:'actor'}}],
    publicMetadata:{selectionType:'card-combination',ownerSeat:'actor'}};
  const frontier={schema:'fixture',items:[{kind:'play-card',token:'a',
    actorPrinting:'Penny SVI',publicMetadata:{cardType:'trainer'}}]};
  const projected=projectSourcePrintings(view,frontier,[map,new Map()],{
    prompt,publicEventReceipt:receipt});
  assert.equal(projected.observation.ownPublic.active.printing,
    projected.publicEventReceipt.ownerActive.printing);
  assert.equal(projected.observation.ownerK1.knownPrintings[0].printing,'Penny SVI 183');
  assert.equal(projected.prompt.source.sourcePrinting,'Penny SVI 183');
  assert.equal(projected.prompt.choices[0].printing,'Penny SVI 183');
  assert.equal(projected.actionFrontier.items[0].actorPrinting,'Penny SVI 183');
  assert.equal(Object.hasOwn(projected.publicEventReceipt,'opponentCopycatChoices'),false);
  assert.equal(Object.hasOwn(projected.prompt.source,'copiedSourcePrinting'),false);
  assert.equal(Object.hasOwn(projected.prompt.publicMetadata,'sourcePrinting'),false);
  assert.equal(Object.hasOwn(projected.prompt.choices[0].publicMetadata,'sourcePrinting'),false);
  assert.equal(Object.hasOwn(projected.actionFrontier.items[0].publicMetadata,'sourceCardFullName'),false);
  assert.equal(view.ownPublic.active.printing,'Penny SVI');
  assert.equal(receipt.ownerActive.printing,'Penny SVI');
  assert.equal(prompt.source.sourcePrinting,'Penny SVI');
});

test('ambiguous origin retains native identity and Night Watch fails closed',()=>{
  const map=buildSourcePrintingMap(source,ids);
  const otherSource={cards:[
    {name:'Penny',count:1,printing:{set:'SVI',number:'999'}},
    {name:'Psychic Energy',count:59,printing:{set:'SVE',number:'5'}}]};
  const otherMap=buildSourcePrintingMap(otherSource,
    ['Penny SVI',...Array(59).fill('Psychic Energy SVE')]);
  const view={actorSeat:0,ownHand:[],ownPublic:null,opponentPublic:null};
  const prompt={source:{sourcePrinting:'Penny SVI',effectName:'Penny',
    sourceKind:'card-effect'},choices:[],publicMetadata:{selectionType:'pokemon'}};
  const after=projectSourcePrintings(view,null,[map,otherMap],{prompt});
  assert.equal(after.prompt.source.sourcePrinting,'Penny SVI');
  const nightWatch={...prompt,source:{...prompt.source,
    sourcePrinting:'Trevenant & Dusknoir-GX SMP',effectName:'Night Watch'}};
  assert.throws(()=>projectSourcePrintings(view,null,[map,otherMap],
    {prompt:nightWatch}),/HOST_ONLY_PHYSICAL_PROMPT/);
});
