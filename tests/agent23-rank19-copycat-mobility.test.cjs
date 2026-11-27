'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const mobility=require('../simulation/evaluation/2026-11/agent23-rank19-mobility.cjs');
const P="Psychic Energy MEE 13",D="Darkness Energy MEE 15",F="Fighting Energy MEE 14";
const mon=(printing,hp,energies=[],extra={})=>({printing,hp,damage:0,energies,tools:[],specialConditions:[],publicRestrictions:{},...extra});
function fixture(mim=true,our=5,their=2,gxUsed=false){
 const active=mon("Galarian Moltres V CRE 97",220,[D,D,F],{tools:["Float Stone BKT 137"]});
 const sandy=mon("Sandy Shocks ex PAR 108",220,[F,F,D]);
 const target=mon("Shadow Rider Calyrex VMAX CRE 75",320,[P,P,P]);
 const o={actorSeat:0,globalTurn:10,ownHand:[],ownTurnResources:{retreatedTurn:8,supporterPlayedTurn:8},ownPublic:{active,bench:[sandy],stadium:[],prizeCount:our,publicTurnRestrictions:{gxUsed}},opponentPublic:{active:target,bench:mim?[mon("Mimikyu GRI 58",70,[P])]:[mon("Girafarig LOT 94",90,[P])],stadium:["Dimension Valley PHF 93"],prizeCount:their,publicTurnRestrictions:{}}};
 return {role:"opponent",seat:0,observation:o,actionFrontier:{items:[{kind:"attack",token:"burn",actorPrinting:active.printing,attackName:"Aura Burn",publicMetadata:{attackCostPayable:true}},{kind:"retreat",token:"pivot",targetPrinting:sandy.printing,publicMetadata:{targetSeat:"actor",targetZone:"bench",targetIndex:0,benchIndex:0}}]}};
}
const caps={discard:false,attach:false};
const cases=[
 ["visible terminal Copycat changes mobility",fixture(),"pivot",1],
 ["no Mimikyu retains direct attack",fixture(false),null,500],
 ["candidate needs 3 prizes so Moltres counter is not terminal",fixture(true,5,3),null,500],
 ["source terminal attack takes precedence",fixture(true,3,2),null,10000],
 ["possible extra Prize terminal not demoted",fixture(true,4,2,true),null,500],
 ["unspent GX and 4 prizes allows demotion",fixture(true,4,2,false),"pivot",1]
];
for(const [name,r,expected,score] of cases)test(name,()=>{
 assert.equal(mobility.root(r,caps)?.token??null,expected);
 const direct=mobility.bestAttack(r.observation,r.observation.ownPublic,r.observation.opponentPublic.active,caps);
 assert.equal(direct.attackName,'Aura Burn');
 assert.equal(direct.score,score);
 assert.equal(Boolean(direct.copycatReply),score===1);
});
