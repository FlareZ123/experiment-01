'use strict';
// Pinned Twinleaf native CardType / Stage numbers and printed Weakness
// tested against the ACTUAL source worker (not simulator Store).
const test=require('node:test');
const assert=require('node:assert/strict');
const rank9=require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');
const DARK=7,PSYCHIC=5,COLORLESS=9,BASIC=2,STAGE1=3,VMAX=5;
const energy={
  prism:'Prism Energy ASC',
  darkness:'Darkness Energy MEE',
  psychic:'Psychic Energy SME'
};
function pokemon(printing,hp,stage,types){
  return {
    printing,hp,damage:0,printed:{
      stage,types,subtypes:[],weakness:[],resistance:[]
    },
    energies:[],tools:[],abilityDetails:[],abilitySuppressions:[],
    attacks:[]
  };
}
function source(){
  return {
    ...pokemon('Mega Absol ex M1L',280,BASIC,[DARK]),
    energies:[energy.prism,energy.prism,energy.darkness]
  };
}
function shadow(){
  return {
    ...pokemon('Shadow Rider Calyrex VMAX CRE',320,VMAX,[PSYCHIC]),
    printed:{
      stage:VMAX,types:[PSYCHIC],subtypes:[],
      weakness:[{type:DARK,value:null}],
      resistance:[{type:6,value:-30}]
    },
    attacks:[{name:'Max Geist',damage:10,cost:[COLORLESS,COLORLESS,COLORLESS]}]
  };
}
function o(seat,attacker=source(),defender=shadow(),ownPrizes=3){
  return {
    actorSeat:seat,globalTurn:4,phase:2,ownHand:[],
    ownPublic:{active:attacker,bench:[],stadium:[],prizeCount:ownPrizes,discard:[]},
    opponentPublic:{
      active:defender,
      bench:[pokemon('Shadow Rider Calyrex V CRE',210,BASIC,[PSYCHIC])],
      stadium:[],prizeCount:6
    },
    ownTurnResources:{
      energyPlayedTurn:true,supporterPlayedTurn:0,retreatedTurn:false
    }
  };
}
const claw={
  kind:'attack',attackName:'Claw of Darkness',token:'claw',
  publicMetadata:{attackCostPayable:true}
};
const pass={kind:'pass',token:'pass'};
function root(seat,view){
  const worker=rank9.createPolicy({
    role:'opponent',seat,policyVersion:rank9.POLICY_VERSION,config:{}
  });
  return worker.decide({
    role:'opponent',seat,observation:view,sequence:4,prompt:null,
    actionFrontier:{items:[claw,pass]}
  });
}
for(const seat of [0,1]) {
  test(`seat ${seat}: pinned Stage.BASIC = 2 and Prism supply both Darkness costs`,()=>{
    const p=source();
    assert.deepEqual(p.printed.subtypes,[]);
    assert.equal(p.printed.stage,BASIC);
    assert.equal(rank9.payable(p,['darkness','darkness','colorless']),true);
    assert.equal(rank9.payable(p,[DARK,DARK,COLORLESS]),true);
  });
  test(`seat ${seat}: Stage 1 has no Prism rainbow provision`,()=>{
    const p=source();p.printed.stage=STAGE1;
    assert.equal(rank9.payable(p,['darkness','darkness','colorless']),false);
    // Explicit Basic spelling is retained for source-only synthetic boards.
    p.printed.stage='Basic';
    assert.equal(rank9.payable(p,['darkness','darkness','colorless']),true);
  });
  test(`seat ${seat}: native null Weakness is x2, final 3-Prize VMAX Claw`,()=>{
    const view=o(seat);
    assert.equal(rank9.printedDamage(
      view,view.ownPublic.active,view.opponentPublic.active,'Claw of Darkness'
    ),400);
    assert.equal(rank9.rootAttack(claw,view),1002);
    assert.deepEqual(root(seat,view),{kind:'select-action',token:'claw'});
  });
  test(`seat ${seat}: legacy numeric +20 is additive, not x2`,()=>{
    const view=o(seat);
    view.opponentPublic.active.printed.weakness[0].value=20;
    assert.equal(rank9.printedDamage(
      view,view.ownPublic.active,view.opponentPublic.active,'Claw of Darkness'
    ),220);
    assert.ok(rank9.rootAttack(claw,view)<400);
  });
  test(`seat ${seat}: wrong native Weakness type does not multiply`,()=>{
    const view=o(seat);
    view.opponentPublic.active.printed.weakness[0].type=1;
    assert.equal(rank9.printedDamage(
      view,view.ownPublic.active,view.opponentPublic.active,'Claw of Darkness'
    ),200);
  });
  test(`seat ${seat}: unknown Weakness modifier remains closed`,()=>{
    const view=o(seat);
    view.opponentPublic.active.printed.weakness[0].value='mystery';
    assert.equal(rank9.printedDamage(
      view,view.ownPublic.active,view.opponentPublic.active,'Claw of Darkness'
    ),null);
  });
  test(`seat ${seat}: native numeric Max Geist attack is recognized as a live counter-threat`,()=>{
    const view=o(seat),vm=view.opponentPublic.active;
    vm.energies=[energy.psychic,energy.psychic,energy.psychic];
    view.opponentPublic.bench[0].energies=Array(9).fill(energy.psychic);
    assert.equal(rank9.payable(vm,vm.attacks[0].cost),true);
    const row={zone:'active',index:0,p:vm};
    const threat=rank9.denial(view,row);
    assert.ok(threat);
    assert.equal(threat.score,320);
    // With only two attached Energy to the attacker the native printed
    // attack becomes unpayable, even if Bench has enough Psychic.
    vm.energies.pop();
    assert.equal(rank9.payable(vm,vm.attacks[0].cost),false);
    assert.equal(rank9.denial(view,row),null);
  });
}
