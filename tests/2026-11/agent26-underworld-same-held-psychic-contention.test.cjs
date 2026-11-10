'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {collectOwnerContention,newOwnerContentionAudit,recordOwnerContention}=
  require('../../simulation/twinleaf/agent16-owner-priority-contention.cjs');

function view(){
  return {
    decisionKind:'owner-root',globalTurn:14,
    ownHand:['Psychic Energy MEE'],
    ownTurnResources:{energyPlayLocked:false,energyPlayedTurn:0},
    ownPublic:{active:{printing:'Shadow Rider Calyrex VMAX CRE'},bench:[]},
    opponentPublic:{active:{printing:'Wobbuffet PHF'},bench:[]}
  };
}
const selected={
  kind:'attach-basic-energy',printing:'Psychic Energy MEE',
  handIndex:0,slot:'active',index:0,
  singleHeldPsychicContestedByUnderworld:true,
  sourceAbility:'Underworld Door'
};

test('real displaced Underworld Door records same physical held Energy cost',()=>{
  const receipt=collectOwnerContention(view(),{}, {},selected,[]);
  assert.equal(receipt.unknownPriority,false);
  assert.deepEqual(receipt.alternatives,[{
    probe:'coheld-psychic-underworld-door',kind:'use-underworld-door',
    attackName:null,printing:'Psychic Energy MEE',handIndex:0,
    slot:'bench',index:null,
    reason:'same-held-psychic-alternative-root',
    nativePlayability:'unverified'
  }]);
  const audit=newOwnerContentionAudit();
  recordOwnerContention(audit,0,14,receipt);
  assert.equal(audit.contentionRoots,1);
  assert.equal(audit.reasons['same-held-psychic-alternative-root'],1);
});
test('uncontested or forged missing held Energy does not invent Underworld candidate',()=>{
  assert.deepEqual(collectOwnerContention(view(),{}, {},{
    ...selected,singleHeldPsychicContestedByUnderworld:false
  },[]).alternatives,[]);
  assert.deepEqual(collectOwnerContention(view(),{}, {},{
    ...selected,printing:'Psychic Energy OTHER'
  },[]).alternatives,[]);
  assert.deepEqual(collectOwnerContention(view(),{}, {},{
    ...selected,sourceAbility:'Other Ability'
  },[]).alternatives,[]);
});
test('concealed opposing zones cannot change diagnostic contention evidence',()=>{
  const v=view();
  Object.defineProperties(v,{
    opponentHand:{get(){throw Error('unavailable hidden hand');}},
    opponentPrizes:{get(){throw Error('unavailable Prize truth');}}
  });
  assert.equal(collectOwnerContention(v,{}, {},selected,[]).alternatives.length,1);
});
