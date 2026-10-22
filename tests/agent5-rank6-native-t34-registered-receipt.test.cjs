'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyRegisteredT34}=require('../scripts/agent5-articuno-powerglass-native-audit.cjs');

function valid(){
  return {
    observedArms:4,allNonTargetActionLedgersUnchanged:true,
    competitiveQualifiedGames:0,
    selectedFork:{
      id:'6:retrospective-sourcefirst:0:B:new-moon-lockbreaker-v1',
      sourceFirstControl:true,sourceFirstTreatment:true,
      sourceDeal:'14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de',
      control:{
        rootsSha:'20203d34d1f9149f7229b147a4906e8a4a80b7192e129a293d68cdc69bfcb419',
        candidateAttacks:[52,54,56].map(turn=>({turn,attack:'Psyray'})),
        finished:true,winner:0,prizes:[0,4]
      },
      treatment:{
        rootsSha:'94c1b4d0f812fb8be68f65fff0529331c23d0dc28df83d961cfb0b446a36ee34',
        candidateAttacks:[38,40,42].map(turn=>({turn,attack:'Psyray'})),
        finished:true,winner:0,prizes:[0,4]
      },
      nativePolicyAudit:{
        nativeRoots:2,searchPrompts:1,toolRoots:1,
        energyPrompts:2,accepted:5,confirmed:5,unconfirmed:0,
        events:[
          {kind:'compressor',turn:34,physicallyConfirmed:true},
          {kind:'search',turn:34,physicallyConfirmed:true,
            selected:['Psychic Energy MEE','Psychic Energy MEE']},
          {kind:'tool',turn:34,physicallyConfirmed:true},
          {kind:'endturn-energy',turn:34,physicallyConfirmed:true},
          {kind:'endturn-energy',turn:36,physicallyConfirmed:true}
        ]
      }
    }
  };
}

test('frozen native receipt captures exact T38 attack without claiming win',()=>{
  const actual=verifyRegisteredT34(valid());
  assert.equal(actual.firstPsyrayGlobalTurnControl,52);
  assert.equal(actual.firstPsyrayGlobalTurnTreatment,38);
  assert.equal(actual.terminalReversal,false);
  assert.equal(actual.competitiveQualifiedGames,0);
  assert.equal(actual.nativeActionsPhysicallyConfirmed,5);
});

test('same source-deal but different owner root code is rejected',()=>{
  const a=valid();
  a.selectedFork.control.rootsSha='4736b5e12922f5ab19933dbdf9f2368097133f441ace630f3bd813f88b46fbd0';
  assert.throws(()=>verifyRegisteredT34(a),
    /Original archived T34 control trajectory not reproduced/);
});

test('untriggered native opportunity is rejected despite green full-game comparison',()=>{
  const a=valid();a.selectedFork.treatment.rootsSha=a.selectedFork.control.rootsSha;
  assert.throws(()=>verifyRegisteredT34(a),
    /Actor policy proposed nothing/);
});

test('search-only, nonphysical, opponent contamination and wrong source reply fail',()=>{
  const a=valid();a.selectedFork.nativePolicyAudit.confirmed=4;
  assert.throws(()=>verifyRegisteredT34(a),/Native Compressor Powerglass receipt incomplete/);
  const b=valid();b.selectedFork.nativePolicyAudit.events[1].selected=['Psychic Energy MEE'];
  assert.throws(()=>verifyRegisteredT34(b),/Two genuine native owner-deck Basics not selected/);
  const c=valid();c.allNonTargetActionLedgersUnchanged=false;
  assert.throws(()=>verifyRegisteredT34(c),/Non-target root ledger changed/);
  const d=valid();d.selectedFork.treatment.candidateAttacks[0].turn=50;
  assert.throws(()=>verifyRegisteredT34(d));
  const e=valid();e.selectedFork.treatment.winner=1;
  assert.throws(()=>verifyRegisteredT34(e));
});
