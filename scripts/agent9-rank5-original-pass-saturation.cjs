'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');

const ARCHIVE_SCHEMA = 'agent9-owner-mail-paired-original-source-v1';
const RESULT_SCHEMA = 'agent9-rank5-original-source-pass-saturation-v1';
const sha = value => crypto.createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Summarize actual native source actions from one immutable historical
 * A/B/A archive. Repeated A controls verify the exact projected actions,
 * but only the four distinct physical source deals count as independent
 * inputs. Prompt resolutions are kept distinct from true player roots.
 *
 * @param {object} archive Genuine decoded original Store artifact.
 * @returns {object} Four source-deal rows and pooled dependent counts.
 */
function summarizeRank5OriginalPasses(archive) {
  assert.equal(archive.schema, ARCHIVE_SCHEMA);
  assert.deepEqual(archive.sourceOriginalRanks, [5,11]);
  assert.equal(archive.physicalGroups, 4);
  assert.equal(archive.attempts, 12);
  assert.equal(archive.allMatchedDeals, true);
  assert.equal(archive.allRepeatedControlsMatch, true);
  assert.equal(archive.errors.length, 0);

  const rows = archive.cases.map(group => {
    assert.equal(group.equalPhysicalDeal, true);
    assert.equal(group.repeatedControlEqual, true);
    const [a,b,c] = group.results;
    assert.deepEqual([a.mail,b.mail,c.mail], [false,true,false]);
    assert.deepEqual(a.game,c.game);
    assert.ok(a.game && b.game);
    const seat = group.rank5Seat;
    const root = a.game.rootActionLedger;
    const ownerRoots = root.filter(entry => entry.playerSlot === seat);
    const opposingRoots = root.filter(entry => entry.playerSlot === 1-seat);
    const pass = a.game.decisionTrace.filter(entry =>
      entry.playerSlot === seat &&
      entry.action === 'PassTurnAction' &&
      Array.isArray(entry.decisionHandBefore?.ownHandPrintings));
    const handSizes = pass.map(entry =>
      entry.decisionHandBefore.ownHandPrintings.length);
    assert.equal(ownerRoots.filter(x=>x.action==='PassTurnAction').length,
      pass.length, 'Every owner Pass must have its source-hand snapshot');
    assert.ok(pass.every(entry => entry.prizesAfter[seat]===6));
    assert.ok(handSizes.every(n => n>=0 && Number.isSafeInteger(n)));
    const count = (roots,action) =>
      roots.filter(entry=>entry.action===action).length;
    return {
      seed:group.seed, rank5PhysicalSeat:seat,
      startingPhysicalSeat:a.game.firstTurnSlot,
      capturedFullDealSha256:a.game.fullDealSha256,
      controlStatus:a.runStatus, selectedStatus:b.runStatus,
      sourceBotWinnerNativeOnly:a.game.winner,
      sourceOwnerPasses:pass.length,
      sourcePassHandMin:Math.min(...handSizes),
      sourcePassHandMax:Math.max(...handSizes),
      sourcePassHandAtLeast10:handSizes.filter(n=>n>=10).length,
      sourcePassHandAtLeast12:handSizes.filter(n=>n>=12).length,
      sourcePassHandAtLeast14:handSizes.filter(n=>n>=14).length,
      sourceOrdinaryAttacks:count(ownerRoots,'AttackAction'),
      sourceRootAbilities:count(ownerRoots,'UseAbilityAction'),
      sourceCardPlays:count(ownerRoots,'PlayCardAction'),
      sourcePromptResolutions:count(ownerRoots,'ResolvePromptAction'),
      sourceAllActionClasses:Object.fromEntries(
        [...new Set(ownerRoots.map(x=>x.action))].sort().map(action=>
          [action,count(ownerRoots,action)])),
      opposingOrdinaryAttacks:count(opposingRoots,'AttackAction'),
      repeatedControlProjectionSha256:sha(a.game),
      withinGroupFullDealMatch:group.equalPhysicalDeal,
      repeatedControlProjectionEqual:group.repeatedControlEqual
    };
  });

  assert.equal(new Set(rows.map(x=>x.seed)).size,4);
  assert.deepEqual(rows.map(x=>x.rank5PhysicalSeat),[0,1,0,1]);
  const sum = key => rows.reduce((acc,row)=>acc+row[key],0);
  const summary={
    distinctPhysicalSourceGroups:rows.length,
    trueOriginalSourceSeat0Groups:rows.filter(x=>
      x.rank5PhysicalSeat===0).length,
    trueOriginalSourceSeat1Groups:rows.filter(x=>
      x.rank5PhysicalSeat===1).length,
    nativeActionCappedControlGames:rows.filter(x=>
      x.controlStatus==='action-capped').length,
    nativeTerminalControlGames:rows.filter(x=>
      x.controlStatus==='native-terminal').length,
    sourceOwnerPasses:sum('sourceOwnerPasses'),
    sourcePassHandAtLeast10:sum('sourcePassHandAtLeast10'),
    sourcePassHandAtLeast12:sum('sourcePassHandAtLeast12'),
    sourcePassHandAtLeast14:sum('sourcePassHandAtLeast14'),
    sourceOrdinaryAttacks:sum('sourceOrdinaryAttacks'),
    sourceRootAbilities:sum('sourceRootAbilities'),
    sourceCardPlays:sum('sourceCardPlays'),
    opposingOrdinaryAttacks:sum('opposingOrdinaryAttacks'),
    repeatedControlPairEquality:rows.every(x=>
      x.repeatedControlProjectionEqual),
    inGroupInitialPhysicalParity:rows.every(x=>
      x.withinGroupFullDealMatch)
  };
  return {
    schema:RESULT_SCHEMA,
    parentArchiveSchema:ARCHIVE_SCHEMA,
    sourceOriginalRank:5, opposingOriginalRank:11,
    sampleClassification:'four reused source deals, correlated owner roots',
    controlsSelectedPerDeal:[false,true,false],
    assertions:summary, rows,
    limitations:{
      separateSourceDeckSearchOrAbilityAudit:false,
      engineCopiedAttackDeclarationCoverage:false,
      gamePaperCertified:false,
      officialMatchClockCertified:false,
      competitivelyQualifiedGames:0,
      fieldWinRate:null
    }
  };
}

if(require.main===module) {
  const filename=process.argv[2];
  assert.ok(filename, 'Supply original archived JSON path for read-only analysis');
  const archive=JSON.parse(fs.readFileSync(filename,'utf8'));
  process.stdout.write(JSON.stringify(
    summarizeRank5OriginalPasses(archive),null,2)+'\n');
}

module.exports={ARCHIVE_SCHEMA,RESULT_SCHEMA,summarizeRank5OriginalPasses};
