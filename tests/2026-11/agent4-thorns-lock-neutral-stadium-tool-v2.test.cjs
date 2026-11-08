'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,classifyNeutralThornsVeto,withNeutralThornsUnderworldVeto
}=require('../../simulation/twinleaf/2026-11/agent4-thorns-lock-neutral-stadium-tool-v2.cjs');
const {
  classifyVisibleThornsVeto
}=require('../../simulation/twinleaf/agent4-underworld-visible-thorns-veto.cjs');
const proposer=require('../../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');
const intent={kind:'use-underworld-door',
  sourcePrinting:'Shadow Rider Calyrex VMAX CRE',
  position:'bench',benchIndex:0};
function view(){
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:32,
    ownPublic:{active:{printing:'Mewtwo & Mew-GX UNM'},
      bench:[{printing:'Shadow Rider Calyrex VMAX CRE',
        abilities:['Underworld Door'],tools:[]}],stadium:[]},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM',
      abilities:['Initialization']},stadium:[]}};
}
test('unmodified proven baseline remains eligible and v2 agrees',()=>{
  const v=view();
  assert.equal(classifyVisibleThornsVeto(v,intent).veto,true);
  assert.equal(classifyNeutralThornsVeto(v,intent).veto,true);
  assert.equal(VERSION,'agent4-thorns-public-neutral-stadium-tool-v2');
});
test('printed Ability-inert Stadium and retreat-only Tool extend the veto',()=>{
  const v=view();
  v.ownPublic.stadium=['Tropical Beach BWP 50'];
  v.ownPublic.bench[0].tools=['Float Stone BKT 137'];
  assert.equal(classifyVisibleThornsVeto(v,intent).veto,false);
  const result=classifyNeutralThornsVeto(v,intent);
  assert.equal(result.veto,true);
  assert.equal(result.reason,'known-ability-inert-stadium-tool-lock');
  assert.deepEqual(v.ownPublic.stadium,['Tropical Beach BWP 50']);
  assert.deepEqual(v.ownPublic.bench[0].tools,['Float Stone BKT 137']);
});
test('each audited print family is a narrow opt-in positive',()=>{
  const stadiums=['Tropical Beach BWP 28','Temple of Sinnoh ASR 155',
    'Dimension Valley PHF 93','Chaotic Swell CEC 187'];
  const tools=['Float Stone PLF 99','Air Balloon SSH 156'];
  for(const stadium of stadiums){
    const v=view();v.opponentPublic.stadium=[stadium];
    assert.equal(classifyNeutralThornsVeto(v,intent).veto,true,stadium);
  }
  for(const tool of tools){
    const v=view();v.ownPublic.bench[0].tools=[tool];
    assert.equal(classifyNeutralThornsVeto(v,intent).veto,true,tool);
  }
});
test('any uncertain or Ability-affecting card keeps the original abstention',()=>{
  for(const stadium of ['Path to the Peak CRE 148',
    'Silent Lab PRC 140','Tropical Beach UNKNOWN 5']){
    const v=view();v.ownPublic.stadium=[stadium];
    assert.equal(classifyNeutralThornsVeto(v,intent).veto,false,stadium);
  }
  for(const tool of ['Stealthy Hood UNB 186',
    'Float Stone UNVERIFIED 99']){
    const v=view();v.ownPublic.bench[0].tools=[tool];
    assert.equal(classifyNeutralThornsVeto(v,intent).veto,false,tool);
  }
  const mixed=view();
  mixed.ownPublic.stadium=['Temple of Sinnoh ASR 155'];
  mixed.opponentPublic.stadium=['Silent Lab PRC 140'];
  assert.equal(classifyNeutralThornsVeto(mixed,intent).veto,false);
});
test('no visible active lock, no intent, or wrong Pokémon cannot be vetoed',()=>{
  const noLock=view();
  noLock.opponentPublic.active.printing='Iron Hands ex PAR';
  assert.equal(classifyNeutralThornsVeto(noLock,intent).veto,false);
  const wrong=view();wrong.ownPublic.bench[0].printing='Dedenne-GX UNB';
  assert.equal(classifyNeutralThornsVeto(wrong,intent).veto,false);
  assert.equal(classifyNeutralThornsVeto(view(),null).veto,false);
});
test('native wrapper vetoes proposed blocked Ability and reliably restores chooser',()=>{
  const old=proposer.chooseUnderworldDoorRoot;
  proposer.chooseUnderworldDoorRoot=()=>intent;
  try{
    const stub=proposer.chooseUnderworldDoorRoot;
    const wrapped=withNeutralThornsUnderworldVeto(()=>{
      const expanded=view();
      expanded.ownPublic.stadium=['Chaotic Swell CEC 187'];
      const blocked=proposer.chooseUnderworldDoorRoot(expanded,{},{});
      assert.equal(blocked,null);
      const hood=view();
      hood.ownPublic.bench[0].tools=['Stealthy Hood UNB 186'];
      assert.deepEqual(proposer.chooseUnderworldDoorRoot(hood,{},{}),intent);
      return 'native-run';
    });
    assert.equal(wrapped.result,'native-run');
    assert.equal(wrapped.audit.provenVetoes,1);
    assert.equal(wrapped.audit.expandedKnownNeutralVetoes,1);
    assert.equal(proposer.chooseUnderworldDoorRoot,stub);
  }finally{proposer.chooseUnderworldDoorRoot=old;}
});
test('original chooser is restored after real native runner failure',()=>{
  const before=proposer.chooseUnderworldDoorRoot;
  assert.throws(()=>withNeutralThornsUnderworldVeto(()=>{
    throw Error('native-error');
  }),/native-error/);
  assert.equal(proposer.chooseUnderworldDoorRoot,before);
});
