'use strict';

// Physical-object identity negatives for source-rank-15 policy.
// Development-only actor observations; not a pinned Store or match test.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision}=require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const B='Bunnelby PRC 121';
const TM='Technical Machine: Evolution PAR 178';
const O='Oddish UNB 5';
const FAN='Fan Rotom SCR 118';
const AOR='Vileplume AOR 3';
const BUS='Vileplume BUS 6';
const JET='Jet Energy PAL 190';
const HOOD='Stealthy Hood UNB 186';
const card=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:100,damage:0,printed:{stage:'BASIC'},...extra
});
function request(seat,active,bench,items,opp=card('Shadow Rider Calyrex V CRE 74')) {
  return {role:'opponent',seat,prompt:null,observation:{
    actorSeat:seat,globalTurn:7,ownHand:[],
    ownPublic:{active,bench,stadium:[],prizeCount:3},
    opponentPublic:{active:opp,bench:[],stadium:[],prizeCount:3}
  },actionFrontier:{items}};
}
const play=(token,actorPrinting,zone,index,targetPrinting,seat='actor')=>({
  kind:'play-card',token,actorPrinting,targetPrinting,
  publicMetadata:{targetSeat:seat,targetZone:zone,
    ...(zone==='bench'?{targetIndex:index}:{})}
});
const selected=req=>{
  const r=rootDecision(req);
  return r.kind==='select-action'?r.token:null;
};

for(const seat of [0,1]){
  test('seat '+seat+': Jet to the exact TM-equipped Benched Bunnelby, not first bare copy',()=>{
    const r=request(seat,card(FAN),[card(B,[TM]),card(B),card(O)],[
      play('bare',JET,'bench',1,B),play('equipped',JET,'bench',0,B)
    ]);
    assert.equal(selected(r),'equipped');
  });
  test('seat '+seat+': same-printing TM should equip ready Active before empty Bench',()=>{
    const r=request(seat,card(B,[],['Grass Energy BLW 105']),[card(B),card(O)],[
      play('bench',TM,'bench',0,B),play('active',TM,'active',null,B)
    ]);
    assert.equal(selected(r),'active');
  });
  test('seat '+seat+': Hood only on physically suppressed AOR Vileplume',()=>{
    const suppressed=card(AOR,[],[],{abilitySuppressions:[{
      abilityName:'Irritating Pollen',suppressed:true,sourcePrinting:'Garbodor BKP 57'
    }]});
    const r=request(seat,card(FAN),[card(AOR),suppressed,card(O)],[
      play('unsuppressed',HOOD,'bench',0,AOR),
      play('suppressed',HOOD,'bench',1,AOR)
    ]);
    assert.equal(selected(r),'suppressed');
  });
  test('seat '+seat+': do not waste Hood on unsuppressed same-printing copies',()=>{
    const r=request(seat,card(FAN),[card(AOR),card(AOR),card(O)],[
      play('first',HOOD,'bench',0,AOR),play('second',HOOD,'bench',1,AOR)
    ]);
    assert.equal(selected(r),null);
  });
  test('seat '+seat+': generic retreat token cannot beat actual BUS destination',()=>{
    const r=request(seat,card(B,[],['Grass Energy BLW 105']),[
      card(FAN),card(BUS,[],[],{printed:{stage:'STAGE_2'}})
    ],[
      {kind:'retreat',token:'ambiguous'},
      {kind:'retreat',token:'bus',targetPrinting:BUS,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1,benchIndex:1}}
    ],card('Mew V FST 113'));
    assert.equal(selected(r),'bus');
  });
}
