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
