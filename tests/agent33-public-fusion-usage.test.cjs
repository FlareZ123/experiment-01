'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {publicFusionUsageAtRoot,MARKER,VERSION}=
  require('../simulation/twinleaf/agent33-public-fusion-usage.cjs');

/** @param {object|null} card */
const slot=card=>({getPokemonCard:()=>card});
/**
 * Synthetic exact-object marker state. Only owner-public slots and announced
 * use markers may be read; every concealed opponent field throws if read.
 * @param {0|1} seat
 */
function staged(seat=0){
  const one={fullName:'Genesect V FST',physical:1};
  const two={fullName:'Genesect V FST',physical:2};
  const unshown={fullName:'Genesect V FST',physical:3};
  const owner={
    active:slot(one),
    bench:[slot({fullName:'Dratini OBF'}),slot(two)],
    marker:{
      used:new Set([one,unshown]),
      hasMarker(name,source){
        assert.equal(name,MARKER);
        return this.used.has(source);
      }
    },
    hand:{cards:['owner secret']},
    deck:{cards:['owner secret']}
  };
  const opponent=new Proxy({},{
    get(_target,field){throw new Error('Forbidden opponent access: '+String(field));}
  });
  const state={turn:7,phase:2,prompts:[],activePlayer:seat,
    players:seat===0?[owner,opponent]:[opponent,owner]};
  return {state,owner,one,two,unshown};
}

for(const seat of [0,1]){
 test('one physical Genesect use does not mark another identical printing seat '+seat,()=>{
  const {state}=staged(seat);
  assert.deepEqual(publicFusionUsageAtRoot(state,seat),{
    schema:VERSION,actorSeat:seat,globalTurn:7,
    faceUpGenesectCount:2,usedCount:1,unspentCount:1,
    faceUp:[
      {location:'active',benchIndex:null,
        printing:'Genesect V FST',usedThisTurn:true},
      {location:'bench',benchIndex:1,
        printing:'Genesect V FST',usedThisTurn:false}
    ],
    observable:'announced public Ability use only',
    ownerHiddenCardsInspected:false,opponentHiddenCardsInspected:false,
    competitiveQualified:false
  });
 });
}
test('cleared announced markers reset the used count',()=>{
 const {state,owner}=staged();
 owner.marker.used.clear();
 const result=publicFusionUsageAtRoot(state,0);
 assert.equal(result.usedCount,0);
 assert.equal(result.unspentCount,2);
});
test('a stale physical source outside visible slots is not counted',()=>{
 const {state,owner,one,two,unshown}=staged();
 owner.marker.used=new Set([unshown]);
 assert.equal(publicFusionUsageAtRoot(state,0).faceUpGenesectCount,2);
 assert.equal(publicFusionUsageAtRoot(state,0).usedCount,0);
 assert.notEqual(one,two);
});
test('observer refuses an unauthenticated actor root and malformed public ledger',()=>{
 const {state,owner}=staged();
 assert.throws(()=>publicFusionUsageAtRoot(state,1),/own-turn root/);
 owner.marker={};
 assert.throws(()=>publicFusionUsageAtRoot(state,0),/function/);
});
