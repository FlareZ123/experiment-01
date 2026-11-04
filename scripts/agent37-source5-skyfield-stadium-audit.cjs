'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent37-original-source5-sky-field-stadium-context-v1';
const PRINTING='Sky Field ROS';

/**
 * Read-only interpretation of genuine owner/public Stadium telemetry from the
 * frozen rank5-versus-rank11 original-sixty A/B/A. The enumerator's omission
 * alone is not proof of legality, benefit, or the cause of a chosen Pass.
 * @param {object} archive Native observational A/B/A JSON.
 * @returns {object} Every physically held omitted Sky Field owner-root window.
 */
function auditSourceSkyField(archive){
  assert.deepEqual(archive.registeredOriginalRanks,[5,11]);
  assert.equal(archive.competitiveQualifiedGames,0);
  assert.equal(archive.rows.length,2);
  const findings=[];
  for(const group of archive.rows){
    assert.equal(group.fullDeckCounts[0],60);
    assert.equal(group.fullDeckCounts[1],60);
    assert.equal(group.sameSeedThreeArmParity.control,
      group.sameSeedThreeArmParity.observed);
    assert.equal(group.sameSeedThreeArmParity.control,
      group.sameSeedThreeArmParity.repeatedControl);
    for(const root of group.frontiers.roots){
      for(const row of root.trainers){
        if(row.printing!==PRINTING || row.nativeEnumeratorOffered!==false)
          continue;
        const s=root.ownerVisibleStadiumContext;
        assert.ok(s,'Actual owner/public Stadium snapshot must be enabled');
        const ownerCards=s.ownerStadium??[];
        const opposingCards=s.opponentStadium??[];
        assert.ok(ownerCards.length<=1&&opposingCards.length<=1,
          'Stadium zone ambiguity is outside this exact audit');
        const current=[...ownerCards,...opposingCards];
        assert.ok(current.length<=1,'Two simultaneous Stadiums require new model');
        const inPlay=current[0]??null;
        const sameName=inPlay===PRINTING;
        const ownStadium=ownerCards.length===1;
        const nativeOwnStadiumVetoSufficient=ownStadium&&
          s.ownerStadiumPlayedTurn!==root.turn&&
          s.ownerStadiumPlayLocked===false&&!sameName;
        findings.push({
          originalRank5PhysicalSeat:group.primaryRankSeat,seed:group.seed,
          seat:root.seat,rootOrdinal:root.ordinal,turn:root.turn,
          handIndex:row.handIndex,
          nativeEnumerated:false,chosenAction:root.chosen?.action??null,
          genericPublicBlocker:row.publicBlocker,
          ownerStadium:[...ownerCards],opponentStadium:[...opposingCards],
          currentStadium:inPlay,ownerStadiumPlayedTurn:s.ownerStadiumPlayedTurn,
          ownerStadiumPlayLocked:s.ownerStadiumPlayLocked,
          ownStadiumVetoIsSufficientSourceExplanation:
            nativeOwnStadiumVetoSufficient,
          selectedStorePlayCertified:false,
          paperStrategicBenefitCertified:false
        });
      }
    }
  }
  return {
    version:VERSION,
    nativeArchiveStatus:'real-original-source-observation-not-competition',
    exactSourceRanks:[5,11],matchedPhysicalReplays:2,
    missedSkyFieldCopyObservations:findings.length,
    missedWithOwnStadium:findings.filter(x=>
      x.ownStadiumVetoIsSufficientSourceExplanation).length,
    allOmissionsCausedByOwnStadium:findings.length>0&&
      findings.every(x=>x.ownStadiumVetoIsSufficientSourceExplanation),
    competitiveQualifiedGames:0,findings
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3,
    'One exact read-only archived original-source path is required');
  const archive=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const result=auditSourceSkyField(archive);
  process.stdout.write('AGENT37_SOURCE5_SKYFIELD_STADIUM '+JSON.stringify(result)+'\n');
}
module.exports={VERSION,auditSourceSkyField};
