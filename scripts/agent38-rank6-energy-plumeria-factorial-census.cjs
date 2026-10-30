'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const ARMS=['base','plumeria','energy','energy+plumeria'];
const SOURCE_ENERGIES=new Set([
  'Speed Lightning Energy','Capture Energy',
  'Spiky Energy','Double Colorless Energy'
]);

/**
 * Count successful real native PlayCardAction printings from the original
 * source physical seat. Action label alone is insufficient to prove energy
 * remains attached, so report only attempted-to-dispatch named roots.
 * @param {object} row Complete native Store result.
 * @returns {number}
 */
function sourceEnergyPlayRoots(row){
  return (row.rootActionLedger??[]).filter(e=>
    e.action==='PlayCardAction'&&e.playerSlot===row.sourceSeat&&
    SOURCE_ENERGIES.has(e.card)).length;
}

/**
 * Failure-inclusive 2x2 for sixteen prior-random original rank6 game starts.
 * Every arm must retain its original physical cards, seed, source rank,
 * candidate identity and actual first player. Capped games are not ties.
 * @param {object[]} results Ordered four arm JSON documents.
 * @returns {object} Native mechanics and pairwise policy exposure only.
 */
function auditFactorial(results){
  assert.equal(results.length,4);
  const byName=new Map(results.map(x=>[x.frozenArm.id,x]));
  assert.deepEqual([...byName.keys()],ARMS);
  for(const name of ARMS){
    const x=byName.get(name);
    assert.equal(x.registeredAttempts,16);
    assert.equal(x.result.rows.length,16);
    assert.equal(x.competitiveQualifiedGames,0);
    assert.equal(x.result.competitiveQualifiedGames,0);
    assert.equal(x.registrationBlob,results[0].registrationBlob);
    assert.equal(x.priorRandomParentBlob,results[0].priorRandomParentBlob);
    assert.equal(x.result.sourceScopedSpecialEnergyRootOptIn,
      x.frozenArm.sourceScopedSpecialEnergyRoot);
    assert.equal(x.result.actorPlumeriaAfterPassOptIn,
      x.frozenArm.actorPlumeriaAfterPass);
  }
  const table=Object.fromEntries(ARMS.map(name=>[name,{
    attempts:16,sourceEnergyPlayRoots:0,sourceAttackDeclarations:0,
    candidateAttackDeclarations:0,engineTerminals:0,actionCaps:0,
    errors:0,plumeriaAccepted:0,plumeriaSettled:0,
    plumeriaAbandoned:0,physicalAuditPresent:0,
    exactEngineWinners:[],observedSourceFirst:0
  }]));
  const cells=[];
  let fullPhysicalMatches=0,unverifiableStarts=0,physicalMismatches=0;
  for(let i=0;i<16;i++){
    const rows=ARMS.map(name=>byName.get(name).result.rows[i]);
    const trial=rows[0].trial;
    assert.equal(trial.rank,6);
    assert.ok(['A','B'].includes(trial.candidateSlot));
    assert.ok(['champion-reference','new-moon-lockbreaker-v1']
      .includes(trial.candidateId));
    for(const row of rows){
      assert.equal(row.trial.id,trial.id);
      assert.equal(row.trial.seed,trial.seed);
      assert.equal(row.trial.candidateSlot,trial.candidateSlot);
      assert.equal(row.trial.candidateId,trial.candidateId);
      assert.equal(row.qualifiesForCompetitiveInference,false);
    }
    const hashes=rows.map(r=>r.fullPhysicalDealFingerprint);
    const sourceHashes=rows.map(r=>r.sourceDealFingerprint);
    const starts=rows.map(r=>r.actualStarterSeat);
    const hasStart=hashes.every(Boolean)&&sourceHashes.every(Boolean)&&
      starts.every(x=>x===0||x===1);
    const physicalMatch=hasStart&&
      hashes.every(x=>x===hashes[0])&&
      sourceHashes.every(x=>x===sourceHashes[0])&&
      starts.every(x=>x===starts[0]);
    if(!hasStart)unverifiableStarts++;
    else if(physicalMatch)fullPhysicalMatches++;
    else physicalMismatches++;
    const samples={};
    for(let j=0;j<ARMS.length;j++){
      const name=ARMS[j],row=rows[j],sum=table[name];
      const audit=row.actorOnlyDecisionCoverage?.ownerPlumeriaAfterPassAudit;
      sum.sourceEnergyPlayRoots+=sourceEnergyPlayRoots(row);
      sum.sourceAttackDeclarations+=row.attackDeclarations?.source??0;
      sum.candidateAttackDeclarations+=row.attackDeclarations?.candidate??0;
      sum.engineTerminals+=Number(row.status===undefined&&row.finished===true);
      sum.actionCaps+=Number(row.status===undefined&&row.finished!==true);
      sum.errors+=Number(row.status!==undefined);
      sum.observedSourceFirst+=Number(row.sourceActuallyFirst===true);
      if(audit){
        assert.equal(audit.anyGameCompetitivelyQualified,false);
        sum.physicalAuditPresent++;
        sum.plumeriaAccepted+=audit.acceptedPlumeria;
        sum.plumeriaSettled+=audit.settledEnergyDiscards;
        sum.plumeriaAbandoned+=audit.abandonedChains??0;
      }
      if(row.finished===true&&row.status===undefined)
        sum.exactEngineWinners.push(row.winner);
      samples[name]={
        status:row.status??row.endReason??null,
        sourceAttackDeclarations:row.attackDeclarations?.source??null,
        candidateAttackDeclarations:row.attackDeclarations?.candidate??null,
        nativeSourceEnergyRoots:sourceEnergyPlayRoots(row),
        plumeriaAccepted:audit?.acceptedPlumeria??null,
        plumeriaSettled:audit?.settledEnergyDiscards??null,
        abandonedChains:audit?.abandonedChains??null,
        finished:row.finished===true,
        winner:row.finished===true?row.winner:null,
        actionCount:row.actionCount??null,
        rootActionSha:row.rootActionLedgerSha256??null,
        nativePromptSha:row.nativePromptChoices?.sha256??null
      };
    }
    cells.push({id:trial.id,seed:trial.seed,candidateSlot:trial.candidateSlot,
      candidateId:trial.candidateId,actualSourceFirst:rows[0].sourceActuallyFirst,
      fullPhysicalStartMatch:physicalMatch,samples});
  }
  for(const name of ARMS){
    const s=table[name];
    assert.equal(s.engineTerminals+s.actionCaps+s.errors,16);
    s.nativeEngineTerminalWinnerCounts=Object.fromEntries(
      [...new Set(s.exactEngineWinners)].map(v=>[
        String(v),s.exactEngineWinners.filter(x=>x===v).length]));
    delete s.exactEngineWinners;
  }
  const energyStratum=table.energy, energyPlumeria=table['energy+plumeria'];
  return {
    schema:'agent38-registered-rank6-energy-plumeria-frozen-factorial-native-v1',
    frame:results[0].registrationPath,
    priorFrame:results[0].priorRandomParentFrame,
    registeredOriginalTrials:16,registeredNativeArms:64,
    fullPhysicalMatches,unverifiableStarts,physicalMismatches,
    sourceSpecialEnergyEffectOnAttackDeclarations:
      energyStratum.sourceAttackDeclarations-table.base.sourceAttackDeclarations,
    plumeriaConditionalPhysicalSettlementsWithSpecialEnergy:
      energyPlumeria.plumeriaSettled,
    table,cells,competitiveQualifiedGames:0,
    limitations:'Prior-registered rank6 starts, 2x2 source policy probes, no strong bot policy, no paper clock, native end-turn effects unverified; 260-action caps are censored, engine terminals do not imply paper match wins.'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,6);
  const four=process.argv.slice(2).map(p=>JSON.parse(
    fs.readFileSync(p,'utf8')));
  process.stdout.write(JSON.stringify(auditFactorial(four),null,2)+'\n');
}
module.exports={ARMS,sourceEnergyPlayRoots,auditFactorial};
