'use strict';

// Exact original rank15 printed fixed-damage surface, including Grass/Dragon
// Weakness and Colorless-only PCE. No native Store/game claims.
const test=require('node:test');
const assert=require('node:assert/strict');
const {printedDamage,rootDecision}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const E='Grass Energy BLW 105', PCE='Powerful Colorless Energy DAA 176';
const BELT='Choice Belt PAL 176',V='Shadow Rider Calyrex V CRE 74';
const card=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:210,damage:0,printed:{stage:'BASIC'},...extra
});
function req(seat,own,opp=card(V),stadium=['Artazon PAL 171'],bench=[card('Oddish UNB 5')]){
  return {role:'opponent',seat,prompt:null,observation:{
    actorSeat:seat,globalTurn:8,ownHand:[],
    ownPublic:{active:own,bench,stadium,prizeCount:2},
    opponentPublic:{active:opp,bench:[card('Fan Rotom SCR 118')],stadium:[],prizeCount:2}
  }};
}
const fixed=[
  ['Oddish UNB 5','Seed Bomb',20,'Grass'],
  ['Gloom UNB 7','Drool',30,'Grass'],
  ['Vileplume AOR 3','Solar Beam',70,'Grass'],
  ['Vileplume BUS 6','Downer Shock',60,'Grass'],
  ['Buneary PFL 83','Kick',20,'Colorless'],
  ['Pidgeotto TEU 123','Gust',30,'Colorless'],
  ['Pidgeotto MEW 17','Flap',20,'Colorless'],
  ['Fan Rotom SCR 118','Assault Landing',70,'Colorless'],
  ['Budew ASC 16','Itchy Pollen',10,'Grass'],
  ['Eldegoss V RCL 19','Float Up',50,'Grass'],
  ['Tatsugiri TWM 131','Surf',50,'Dragon']
];
for(const seat of [0,1]){
  for(const [attacker,attack,base,type] of fixed){
    test('seat '+seat+': '+attacker+' '+attack+' printed damage',()=>{
      const r=req(seat,card(attacker,[],[E]));
      assert.equal(printedDamage({kind:'attack',attackName:attack},r),base);
    });
    test('seat '+seat+': '+attacker+' '+attack+' correct typed Weakness',()=>{
      const opp=card(V,[],[],{printed:{weakness:[{type,value:'×2'}]}});
      const r=req(seat,card(attacker,[],[E]),opp);
      assert.equal(printedDamage({kind:'attack',attackName:attack},r),2*base);
    });
  }
  test('seat '+seat+': nonmatching Grass Weakness does not double Colorless',()=>{
    const r=req(seat,card('Fan Rotom SCR 118',[],[E]),
      card(V,[],[],{printed:{weakness:[{type:'Grass',value:'×2'}]}}));
    assert.equal(printedDamage({kind:'attack',attackName:'Assault Landing'},r),70);
  });
  test('seat '+seat+': nonmatching Colorless Resistance does not reduce Grass',()=>{
    const r=req(seat,card('Oddish UNB 5',[],[E]),
      card(V,[],[],{printed:{resistance:[{type:'Colorless',value:'-30'}]}}));
    assert.equal(printedDamage({kind:'attack',attackName:'Seed Bomb'},r),20);
  });
  test('seat '+seat+': Powerful Colorless only boosts printed Colorless',()=>{
    const own=card('Fan Rotom SCR 118',[],[PCE]);
    assert.equal(printedDamage({kind:'attack',attackName:'Assault Landing'},req(seat,own)),90);
    const grass=card('Budew ASC 16',[],[PCE]);
    assert.equal(printedDamage({kind:'attack',attackName:'Itchy Pollen'},req(seat,grass)),10);
  });
  test('seat '+seat+': Choice Belt boosts printed Grass source into V',()=>{
    const r=req(seat,card('Budew ASC 16',[BELT],[E]));
    assert.equal(printedDamage({kind:'attack',attackName:'Itchy Pollen'},r),40);
  });
  test('seat '+seat+': Choice Belt does not boost against opponent ex',()=>{
    const r=req(seat,card('Budew ASC 16',[BELT],[E]),card('Mew ex MEW 151'));
    assert.equal(printedDamage({kind:'attack',attackName:'Itchy Pollen'},r),10);
  });
  test('seat '+seat+': Fan Rotom no Stadium attack does nothing despite PCE/Belt',()=>{
    const r=req(seat,card('Fan Rotom SCR 118',[BELT],[PCE]),card(V),[]);
    assert.equal(printedDamage({kind:'attack',attackName:'Assault Landing'},r),0);
  });
  test('seat '+seat+': Fan Rotom with Stadium live has all applicable bonuses',()=>{
    const r=req(seat,card('Fan Rotom SCR 118',[BELT],[PCE]));
    assert.equal(printedDamage({kind:'attack',attackName:'Assault Landing'},r),120);
  });
  test('seat '+seat+': a muted Stadium still exists for Assault Landing',()=>{
    const r=req(seat,card('Fan Rotom SCR 118',[],[E]),card(V),['Jamming Tower TWM 153']);
    r.observation.ownPublic.publicTurnRestrictions={stadiumAndToolHaveNoEffectTurnsRemaining:1};
    assert.equal(printedDamage({kind:'attack',attackName:'Assault Landing'},r),70);
  });
  test('seat '+seat+': no invented damage for original non-damaging Stun Spore',()=>{
    const r=req(seat,card('Oddish UNB 5',[],[E]));
    assert.equal(printedDamage({kind:'attack',attackName:'Stun Spore'},r),null);
  });
  for(const [bench,expected] of [
    [[], 'bench-oddish'], [[card('Oddish UNB 5')], 'float-up']
  ]){
    test('seat '+seat+': Eldegoss Float Up 2-Prize terminal with bench '+bench.length,()=>{
      const r=req(seat,card('Eldegoss V RCL 19',[],[E]),
        card(V,[],[],{hp:210,damage:160}),['Artazon PAL 171'],bench);
      r.observation.ownHand=['Oddish UNB 5'];
      r.actionFrontier={items:[
        {kind:'attack',attackName:'Float Up',token:'float-up'},
        {kind:'play-card',actorPrinting:'Oddish UNB 5',token:'bench-oddish'}
      ]};
      assert.deepEqual(rootDecision(r),{kind:'select-action',token:expected});
    });
  }
}


for(const seat of [0,1]){
  for(const [stadium,expected] of [
    [['Artazon PAL 171'],'pidgeot-ko'],
    [['Temple of Sinnoh ASR 155'],'bench-oddish'],
    [['Jamming Tower TWM 153'],'bench-oddish']
  ]){
    test('seat '+seat+': Pidgeot ex terminal under source boost and Stadium '+stadium,()=>{
      const r=req(seat,
        card('Pidgeot ex OBF 164',[BELT],[PCE]),
        card(V,[],[],{hp:210,damage:40}),stadium,[]);
      r.observation.ownHand=['Oddish UNB 5'];
      r.actionFrontier={items:[
        {kind:'attack',attackName:'Blustery Wind',token:'pidgeot-ko'},
        {kind:'play-card',actorPrinting:'Oddish UNB 5',token:'bench-oddish'}
      ]};
      assert.deepEqual(rootDecision(r),{kind:'select-action',token:expected});
    });
  }
  for(const [tool,expected] of [
    [[BELT],'budew-ko'],[[],'bench-oddish']
  ]){
    test('seat '+seat+': Budew Itchy Pollen immediate Prize vs development setup',()=>{
      const r=req(seat,card('Budew ASC 16',tool,[]),
        card(V,[],[],{hp:210,damage:180}),[],[]);
      r.observation.ownHand=['Oddish UNB 5'];
      r.actionFrontier={items:[
        {kind:'attack',attackName:'Itchy Pollen',token:'budew-ko'},
        {kind:'play-card',actorPrinting:'Oddish UNB 5',token:'bench-oddish'}
      ]};
      assert.deepEqual(rootDecision(r),{kind:'select-action',token:expected});
    });
  }
  for(const [stadium,expected] of [
    [['Artazon PAL 171'],'fan-ko'],[[],'bench-oddish']
  ]){
    test('seat '+seat+': Fan Rotom Assault Landing immediate Prize requires Stadium',()=>{
      const r=req(seat,card('Fan Rotom SCR 118',[BELT],[PCE]),
        card(V,[],[],{hp:210,damage:110}),stadium,[]);
      r.observation.ownHand=['Oddish UNB 5'];
      r.actionFrontier={items:[
        {kind:'attack',attackName:'Assault Landing',token:'fan-ko'},
        {kind:'play-card',actorPrinting:'Oddish UNB 5',token:'bench-oddish'}
      ]};
      assert.deepEqual(rootDecision(r),{kind:'select-action',token:expected});
    });
  }
}
