/**
 * Independently audit original rank5/rank11 retrospective Twinleaf JSON archives.
 * Inputs: extracted agent11-owner-tutor-native-v2.json from CI 41704310656
 * (baseline) and CI 41706674107 (symmetric Mew capability).
 * Development-only: never score these as competitively qualified wins.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');

/** @param {string} path */
function load(path) {
  const bytes = fs.readFileSync(path);
  return { doc: JSON.parse(bytes.toString('utf8')),
    sha: createHash('sha256').update(bytes).digest('hex') };
}
/** @param {Record<string, any>} r */
function key(r) { return [r.seed, r.rank5Seat, r.mode].join(':'); }
/** @param {Record<string, any>} doc */
function index(doc) {
  const map = new Map();
  for (const r of doc.rows) {
    const k = key(r);
    assert(!map.has(k), 'duplicate arm ' + k);
    map.set(k, r);
  }
  return map;
}
/** @param {Record<string, any>} doc */
function byMode(doc) {
  const out = {};
  for (const mode of ['control', 'resource-tutor']) {
    const rows = doc.rows.filter(r => r.mode === mode);
    assert.equal(rows.length, 16);
    out[mode] = {
      terminals: rows.filter(r => r.nativeStatus === 'native-terminal').length,
      caps: rows.filter(r => r.nativeStatus === 'native-capped').length,
      rank5Wins: rows.filter(r => r.nativeStatus === 'native-terminal' && r.nativeWinner === r.rank5Seat).length,
      rank11Wins: rows.filter(r => r.nativeStatus === 'native-terminal' && r.nativeWinner === 1 - r.rank5Seat).length,
      rank5Attacks: rows.reduce((n,r) => n + r.publicAttackTransitions.filter(t => t.triggerPlayerSlot === r.rank5Seat).length,0),
      rank5Prizes: rows.reduce((n,r) => n + 6 - r.prizesRemaining[r.rank5Seat],0),
      rank11Prizes: rows.reduce((n,r) => n + 6 - r.prizesRemaining[1 - r.rank5Seat],0),
    };
  }
  return out;
}
/** @param {Record<string, any>} baseline @param {Record<string, any>} mew */
function audit(baseline,mew) {
  assert.equal(baseline.engine,mew.engine);
  for (const doc of [baseline,mew]) {
    assert.equal(doc.observedArms,32);
    assert.equal(doc.scheduledArms,32);
    assert.equal(doc.nativeErrors,0);
    assert.equal(doc.competitiveQualifiedGames,0);
    assert.equal(doc.sourcePhysicalParityMatched,16);
  }
  assert.equal(mew.experimentalSymmetricMewCompetence.commonBothPhysicalSeats,true);
  assert.equal(mew.selectedAcceptedItems,17);
  assert.equal(mew.selectedSettledPhysicalTargets,34);
  const oldRows=index(baseline),newRows=index(mew);
  assert.equal(oldRows.size,32);
  assert.equal(newRows.size,32);
  const changed=[],crossFusion=[];
  for (const [k,old] of oldRows) {
    const fresh=newRows.get(k);
    assert(fresh,'missing rerun arm '+k);
    assert.equal(old.initialFullPhysicalDealDigest,fresh.initialFullPhysicalDealDigest,'deal changed '+k);
    for (const field of ['acceptedItems','physicalTargetsSettled','selectedFamilyCounts','acceptedBySeat','examples']) {
      assert.deepEqual(old.tutorAudit?.[field],fresh.tutorAudit?.[field],'tutor changed '+k+'/'+field);
    }
    if (old.nativeStatus !== fresh.nativeStatus || old.nativeWinner !== fresh.nativeWinner) {
      changed.push({ arm:k, baselineStatus:old.nativeStatus,baselineWinner:old.nativeWinner,
        mewStatus:fresh.nativeStatus,mewWinner:fresh.nativeWinner });
    }
    for (const t of fresh.publicAttackTransitions) {
      if (t.triggerPlayerSlot!==fresh.rank5Seat || !t.declarations.some(d=>d.attackName==='Cross Fusion Strike')) continue;
      assert(t.settled,'unsettled Cross Fusion Strike '+k);
      const seat=fresh.rank5Seat,other=1-seat,att=t.before[seat].active;
      assert.equal(att?.name,'Mew VMAX');
      assert(att.energyCards.includes('Double Colorless Energy'));
      const benchedGenesectV=t.before[seat].bench.some(p=>p.name==='Genesect V');
      const target=t.before[other].active,resultTarget=t.settled.after[other].active;
      const prizes=t.beforePrizesRemaining[seat]-t.settled.prizesRemaining[seat];
      const delta=target && resultTarget && target.name===resultTarget.name ?
        resultTarget.damage-target.damage : null;
      if (!benchedGenesectV) {
        assert.equal(prizes,0);
        assert.equal(delta,0);
      }
      crossFusion.push({arm:k,actionOrdinal:t.actionOrdinal,benchedGenesectV,
        damageChangeSameTarget:delta,rank5PrizesTaken:prizes});
    }
  }
  const old=byMode(baseline),fresh=byMode(mew);
  assert.deepEqual([old.control.rank5Attacks,old['resource-tutor'].rank5Attacks],[0,0]);
  assert.deepEqual([fresh.control.rank5Attacks,fresh['resource-tutor'].rank5Attacks],[5,3]);
  assert.equal(fresh.control.rank5Wins,1);
  assert.equal(fresh['resource-tutor'].rank5Wins,0);
  assert.equal(changed.length,2);
  assert.equal(crossFusion.length,8);
  assert.equal(crossFusion.filter(t=>t.benchedGenesectV).length,3);
  assert.equal(crossFusion.reduce((n,t)=>n+t.rank5PrizesTaken,0),5);
  return {schema:'agent11-mew-competence-cross-archive-audit-v1',engine:mew.engine,
    baselineGitSha:baseline.runGitSha,mewGitSha:mew.runGitSha,
    identicalPhysicalDealsAcrossProfiles:32,identicalTutorReceiptsAcrossProfiles:32,
    baseline:old,mew:fresh,changed,crossFusion,qualifiedGames:0};
}
if (require.main === module) {
  assert.equal(process.argv.length,4,'usage: node audit.cjs baseline.json mew.json');
  const baseline=load(process.argv[2]),mew=load(process.argv[3]);
  assert.equal(baseline.sha,'c73786e611a7f74a78f4ee0de10f251119b94ab2ed55181f9ab38be706924c87');
  assert.equal(mew.sha,'7b9433550dbdae33e77905b832f865c162c2ab9d97a8bce2ab8de560d3f4eda6');
  process.stdout.write(JSON.stringify(audit(baseline.doc,mew.doc),null,2)+'\n');
}
module.exports={audit};
