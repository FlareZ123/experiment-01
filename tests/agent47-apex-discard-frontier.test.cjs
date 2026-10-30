'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {directlyReadyApex,proposeApexPayloadDiscard} =
  require('../simulation/twinleaf/agent47-apex-discard-frontier.cjs');
const payloads = new Set(['Dragapult ex TWM','Dialga-GX UPR',
  'Mega Dragonite ex ASC','Noivern ex PAL','Kyurem SFA','Regidrago V SIT']);
const make = () => {
 const ownHand=['Dragapult ex TWM','Megaton Blower SSP',
   'Grass Energy MEE','Grass Energy MEE'];
 const menu=[];
 for(let i=0;i<ownHand.length;i++)
  for(let j=i+1;j<ownHand.length;j++){
   const row=[ownHand[i],ownHand[j]].sort();
   if(!menu.some(x=>JSON.stringify(x)===JSON.stringify(row)))menu.push(row);
  }
 menu.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'en'));
 return {actor:{decisionKind:'owner-prompt',globalTurn:4,ownHand,
   ownPublic:{active:{printing:'Regidrago VSTAR SIT',
     attacks:[{name:'Apex Dragon'}],
     energies:['Double Dragon Energy ROS','Double Dragon Energy ROS'],
     specialConditions:[],publicRestrictions:{}},discard:[],stadium:[],
     publicTurnRestrictions:{attackLockTurnsRemaining:0}},
   opponentPublic:{stadium:[]}},prompt:{menu}};
};

test('rank20 exact printed Apex payload alternative closes immediate discard-zone gap',()=>{
 const v=make();
 const x=proposeApexPayloadDiscard(v,payloads);
 assert.equal(directlyReadyApex(v.actor),true);
 assert.deepEqual(x.baseline,['Grass Energy MEE','Grass Energy MEE']);
 assert.equal(x.reason,'first-copyable-apex-payload-opportunity');
 assert.equal(x.changed,true);
 assert.ok(x.proposal.includes('Dragapult ex TWM'));
 assert.ok(v.prompt.menu.some(menu=>JSON.stringify(menu)===JSON.stringify(x.proposal)));
 assert.equal(v.actor.ownPublic.discard.length,0);
});

test('public Temple negates the 2-DDE direct-Apex proof and holds',()=>{
 const v=make();v.actor.opponentPublic.stadium=['Temple of Sinnoh ASR'];
 const x=proposeApexPayloadDiscard(v,payloads);
 assert.equal(directlyReadyApex(v.actor),false);
 assert.equal(x.changed,false);
 assert.equal(x.reason,'apex-not-directly-confirmed-ready');
});

test('already discarded payload, other Active and no prompted payload all hold',()=>{
 const already=make();already.actor.ownPublic.discard=['Dialga-GX UPR'];
 assert.equal(proposeApexPayloadDiscard(already,payloads).changed,false);
 const inactive=make();inactive.actor.ownPublic.active.printing='Regidrago V SIT';
 assert.equal(proposeApexPayloadDiscard(inactive,payloads).changed,false);
 const noMenu=make();noMenu.prompt.menu=[['Grass Energy MEE','Grass Energy MEE']];
 assert.equal(proposeApexPayloadDiscard(noMenu,payloads).changed,false);
});

test('first-player turn one cannot use the otherwise payable Apex attack',()=>{
 const v=make();v.actor.globalTurn=1;
 assert.equal(directlyReadyApex(v.actor),false);
 assert.equal(proposeApexPayloadDiscard(v,payloads).changed,false);
});

test('rank20 source six attacked Dragon printings all have copyable printed attacks',()=>{
 const {decks}=require('../results/aichi-2026/full-decklists.json');
 const source=decks.find(x=>x.rank===20);
 const roster=[
  ['Dragapult ex','TWM','130','../resources/cards/en/sv6.json'],
  ['Dialga-GX','UPR','100','../resources/cards/en/sm5.json'],
  ['Mega Dragonite ex','ASC','152','../resources/cards/en/me2pt5.json'],
  ['Noivern ex','PAL','153','../resources/cards/en/sv2.json'],
  ['Kyurem','SFA','47','../resources/cards/en/sv6pt5.json'],
  ['Regidrago V','SIT','135','../resources/cards/en/swsh12.json']
 ];
 assert.equal(roster.length,payloads.size);
 for(const [name,set,number,file] of roster) {
   const sourceCard=source.cards.find(c=>c.name===name&&c.printing.set===set);
   assert.ok(sourceCard);
   assert.equal(sourceCard.printing.number,number);
   const printed=require(file).find(c=>c.number===number&&c.name===name);
   assert.ok(printed);
   assert.ok(printed.types.includes('Dragon'));
   assert.ok(printed.attacks.length>0);
   assert.ok(payloads.has(name+' '+set));
 }
 const v=make();v.actor.ownPublic.discard=['Mega Dragonite ex ASC'];
 assert.equal(proposeApexPayloadDiscard(v,payloads).changed,false);
});

test('public basic 2-Grass + 1-Fire proof survives Temple; hidden cards have no role',()=>{
 const v=make();v.actor.ownPublic.active.energies=[
   'Grass Energy MEE','Grass Energy MEE','Fire Energy MEE'];
 v.actor.opponentPublic.stadium=['Temple of Sinnoh ASR'];
 assert.equal(directlyReadyApex(v.actor),true);
 const a=proposeApexPayloadDiscard(v,payloads);
 const changed=structuredClone(v);changed.actor.opponentPrivate={hand:['unseen']};
 changed.actor.unseenDeck=['opponent unknown'];
 assert.deepEqual(proposeApexPayloadDiscard(changed,payloads),a);
});

test('source rank20 contains the printed Ultra Ball, payload, Energy and ACE SPEC',()=>{
 const {decks}=require('../results/aichi-2026/full-decklists.json');
 const rank20=decks.find(deck=>deck.rank===20);
 const count=(name,set)=>rank20.cards.filter(c=>c.name===name&&c.printing.set===set)
   .reduce((n,c)=>n+c.count,0);
 for(const [name,set,required] of [
  ['Ultra Ball','MEG',2],['Dragapult ex','TWM',1],
  ['Megaton Blower','SSP',1],['Grass Energy','MEE',4],
  ['Double Dragon Energy','ROS',4]])
   assert.equal(count(name,set),required);
 const regidrago=require('../resources/cards/en/swsh12.json')
   .find(c=>c.name==='Regidrago VSTAR'&&c.number==='136');
 assert.match(regidrago.attacks.find(a=>a.name==='Apex Dragon').text,
   /Dragon Pokémon in your discard pile/);
 const dragon=require('../resources/cards/en/sv6.json')
   .find(c=>c.name==='Dragapult ex'&&c.number==='130');
 assert.ok(dragon.types.includes('Dragon'));
});
