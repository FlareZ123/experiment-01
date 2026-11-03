'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditNativeUnderworldConversion}=require(
  '../simulation/evaluation/agent34-underworld-native-attack-conversion-audit.cjs');

function fixture(){
  const control=[],treatment=[],rows=[],matching=[];
  for(let i=0;i<16;i++){
    const slot=i<8?'A':'B';
    const candidateId=i%2?'new-moon-lockbreaker-v1':'champion-reference';
    const trial={id:['1',Math.floor(i%8/2),slot,candidateId].join(':'),
      rank:1,seed:i+100,candidateSlot:slot,candidateId};
    const seat=slot==='A'?1:0;
    const root=(action,ability)=>({playerSlot:seat,action,
      ...(ability?{ability}:{})});
    const a={trial,finished:true,winner:seat,
      rootActionLedger:[root('AttackAction')]};
    const b={trial,finished:true,winner:seat,
      rootActionLedger:[root('UseAbilityAction','Underworld Door'),
        root('AttackAction')]};
    control.push(a);treatment.push(b);
    rows.push({trialId:trial.id,sourceSeat:seat,fullPhysicalAndStartMatched:true,
      authenticatedUnderworldRoots:1,physicallyCompletedUnderworldEffects:1});
    matching.push({id:trial.id,sameSeed:true,sameSourceDeal:true,
      sameFullDeal:true,sameStart:true});
  }
  return {schema:'agent34-rank1-owner-typed-underworld-posthoc-development-v1',
    originalRank:1,retrospective:true,prospectivelyRegistered:false,
    actorTypedEnergyPromptBothArms:true,competitivelyQualifiedGames:0,
    summary:{attempted:32,sourceParity:16,qualifiedPaperGames:0,
      sourceNativeUnderworldRoots:16,physicalUnderworldEffects:16,
      typedOwnerPromptNativeAccepted:16,nativeTreatmentErrors:0},
    control:{rows:control},treatment:{rows:treatment},rows,
    retrospectiveMatching:matching};
}

test('native terminal is explicitly not a competitive paper-game win',()=>{
  const r=auditNativeUnderworldConversion(fixture());
  assert.equal(r.summary.controlSourceAttackRoots,16);
  assert.equal(r.summary.treatmentSourceAttackRoots,16);
  assert.equal(r.summary.fullBilateralInitialDealAndStarterMatched,16);
  assert.equal(r.summary.fullySettledSourceDoorEffects,16);
  assert.equal(r.summary.controlOutcomes['source-native-terminal'],16);
  assert.equal(r.summary.competitivePaperGames,0);
  assert.equal(r.outputDoesNotEstimateStrength,true);
});

test('source native termination to censorship and zero attacks are preserved',()=>{
  const a=fixture();
  const b=a.treatment.rows[0];
  b.finished=false;b.winner=null;b.rootActionLedger=[
    {playerSlot:1,action:'UseAbilityAction',ability:'Underworld Door'}];
  const r=auditNativeUnderworldConversion(a);
  assert.equal(r.summary.sourceNativeTerminalToCensored,1);
  assert.equal(r.summary.pairsWithFewerSourceAttackRoots,1);
  assert.equal(r.rows[0].sourceAttackRootDelta,-1);
  assert.equal(r.summary.sourceUnderworldRoots,16);
  assert.equal(r.summary.competitivePaperGames,0);
});

test('candidate native terminal to original source native terminal is only native evidence',()=>{
  const a=fixture();
  a.control.rows[4].winner=0;
  const r=auditNativeUnderworldConversion(a);
  assert.equal(r.summary.candidateNativeTerminalToSourceNativeTerminal,1);
  assert.equal(r.rows[4].controlOutcome,'candidate-native-terminal');
  assert.equal(r.rows[4].treatmentOutcome,'source-native-terminal');
  assert.equal(r.summary.competitivePaperGames,0);
});

test('missing complete original physical pair fails closed',()=>{
  const a=fixture();
  a.retrospectiveMatching[3].sameFullDeal=false;
  a.rows[3].fullPhysicalAndStartMatched=false;
  assert.throws(()=>auditNativeUnderworldConversion(a),
    /complete physical pairs/);
});

test('duplicate IDs, mismatched root counts and fake settlement are rejected',()=>{
  const a=fixture();
  a.rows[2].physicallyCompletedUnderworldEffects=2;
  assert.throws(()=>auditNativeUnderworldConversion(a));
  const b=fixture();b.control.rows[1].trial.id=b.control.rows[0].trial.id;
  assert.throws(()=>auditNativeUnderworldConversion(b));
  const c=fixture();c.rows[7].authenticatedUnderworldRoots=2;
  assert.throws(()=>auditNativeUnderworldConversion(c));
});
