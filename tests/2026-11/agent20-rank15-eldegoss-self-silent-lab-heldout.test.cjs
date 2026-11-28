'use strict';

// Original rank15 carries both Silent Lab and Eldegoss V. Happy Match cannot
// trigger from hand under live Silent Lab or Path to the Peak.
const test=require('node:test');
const assert=require('node:assert/strict');
const {eldCanBench,rootDecision}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const E='Eldegoss V RCL 19',GUZMA='Guzma BUS 115';
const LAB='Silent Lab PRC 140',PEAK='Path to the Peak CRE 148';
const card=printing=>({printing,tools:[],energies:[],printed:{stage:'BASIC'}});
function request(seat,stadium=[],muted=false) {
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:8,ownHand:[E],
      ownPublic:{active:card('Fan Rotom SCR 118'),
        bench:[card('Oddish UNB 5')],discard:[GUZMA],
        stadium,prizeCount:3,publicTurnRestrictions:muted?
          {stadiumAndToolHaveNoEffectTurnsRemaining:1}:{}
      },
      opponentPublic:{active:card('Shadow Rider Calyrex V CRE 74'),
        bench:[],stadium:[]}
    },
    actionFrontier:{items:[{
      kind:'play-card',token:'eldegoss',actorPrinting:E
    }]}
  };
}
for(const seat of [0,1]){
  for(const [stadium,muted,expected] of [
    [[],false,true],
    [[LAB],false,false],
    [[PEAK],false,false],
    [[LAB],true,true],
    [[PEAK],true,true]
  ]){
    test('seat '+seat+' live-Stadium '+stadium+' effects-muted '+muted,()=>{
      const r=request(seat,stadium,muted);
      assert.equal(eldCanBench(r.observation),expected);
      assert.deepEqual(rootDecision(r),expected?
        {kind:'select-action',token:'eldegoss'}:
        {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
    });
  }
}
