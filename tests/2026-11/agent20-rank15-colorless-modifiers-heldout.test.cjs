'use strict';

// The original rank15 source includes printed Colorless Pidgey and Pidgeot ex,
// not only Mega Lopunny. Powerful Colorless and Choice Belt must apply when live.
const test=require('node:test');
const assert=require('node:assert/strict');
const {printedDamage}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const PCE='Powerful Colorless Energy DAA 176';
const BELT='Choice Belt PAL 176';
const OPP='Shadow Rider Calyrex V CRE 74';
const card=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:210,damage:0,
  printed:{stage:'BASIC'},...extra
});
function request(seat,attacker,stadium=[],globallyMuted=false) {
  return {role:'opponent',seat,prompt:null,
    observation:{
      actorSeat:seat,globalTurn:8,
      ownPublic:{
        active:card(attacker,[BELT],[PCE]),bench:[],stadium,
        publicTurnRestrictions:globallyMuted?
          {stadiumAndToolHaveNoEffectTurnsRemaining:1}:{}
      },
      opponentPublic:{active:card(OPP),bench:[],stadium:[]}
    }
  };
}

for(const seat of [0,1]){
  for(const [attacker,attack,stadium,muted,damage] of [
    ['Pidgey FLF 75','Peck Off',[],false,60],
    ['Pidgeot ex OBF 164','Blustery Wind',[],false,170],
    ['Pidgeot ex OBF 164','Blustery Wind',['Jamming Tower TWM 153'],false,140],
    ['Pidgeot ex OBF 164','Blustery Wind',['Temple of Sinnoh ASR 155'],false,150],
    ['Pidgeot ex OBF 164','Blustery Wind',['Jamming Tower TWM 153'],true,140],
    ['Pidgeot ex OBF 164','Blustery Wind',['Temple of Sinnoh ASR 155'],true,140]
  ]){
    test('seat '+seat+': '+attacker+' '+attack+' stadium '+stadium+' muted '+muted,()=>{
      assert.equal(printedDamage(
        {kind:'attack',attackName:attack},request(seat,attacker,stadium,muted)
      ),damage);
    });
  }
}
