'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-dual-fixed60-all29-actual-matched-winner-audit-v1';

/**
 * Analyze the completed registered native archive only. Exactly 116 native
 * attempts from 58 independently registered Aichi source groups are already
 * finished. This program does not replay deals, infer capped winners, invent
 * missing original lists, or upgrade native outcomes to paper qualification.
 *
 * @param {object} raw Source artifact from immutable run 42574658791.
 */
function analyze(raw){
  assert.equal(raw.schema,
    'agent3-dual-fixed60-all29-paperprofile-prospective-v1');
  assert.equal(raw.comparison.groups.length,58);
  assert.equal(raw.allNativeRows.length,116);
  const ids=['champion-reference','new-moon-lockbreaker-v1'];
  const groups=raw.comparison.groups;
  const lines=groups.filter(g=>g.comparableAtObservedOpening&&
    g.bothNativeTerminal&&g.terminalNativeWinnerDiffers)
    .map(g=>{
      const first=g.contenders[ids[0]];
      const second=g.contenders[ids[1]];
      const firstWin=first.nativeWinner===first.candidateSeat;
      const secondWin=second.nativeWinner===second.candidateSeat;
      assert.notEqual(firstWin,secondWin);
      return {sourceGroup:g.key,rank:g.rank,
        sourcePhysicallyMatched:true,bothNativeTerminal:true,
        favored:firstWin?ids[0]:ids[1],candidateSlot:g.candidateSlot,
        controlActualWinner:first.nativeWinner,
        challengerActualWinner:second.nativeWinner,
        firstActionRootCount:first.rootCount,
        secondActionRootCount:second.rootCount};
    });
  const failures=groups.flatMap(g=>ids.map(id=>{
    const row=g.contenders[id];
    return row.error?{rank:g.rank,group:g.key,candidate:id,
      error:row.error,rootCount:row.rootCount}:null;
  }).filter(Boolean));
  const paired=groups.filter(g=>g.comparableAtObservedOpening);
  const bothTerm=paired.filter(g=>g.bothNativeTerminal);
  const audit={schema:VERSION,
    sourceRun:42574658791,
    originalRanks:raw.registration.sourceRanks,
    missingOriginalRanks:raw.registration.missingSourceRanks,
    sourceGroups:58,nativeAttempts:116,
    sourcePhysicalMatched:paired.length,
    matchedBothTerminal:bothTerm.length,
    directionalWinnerContrasts:lines,
    contrastCounts:Object.fromEntries(ids.map(id=>[
      id,lines.filter(x=>x.favored===id).length])),
    unpairedSourceGroups:groups.filter(g=>
      !g.comparableAtObservedOpening).map(g=>({
      key:g.key,rank:g.rank,seed:g.seed,
      sourceMatched:g.sourceDeckOpeningPhysicallyMatched,
      actualStarterMatched:g.actualStarterMatched
    })),
    nativeErrorRecords:failures,
    perRank:raw.comparison.perRank,
    summary:raw.comparison.summary,
    gameQualification:'DEVELOPMENT_ONLY',
    competitivePaperQualifiedGames:0,
    publishedFixed60Selection:'none',
    verified995Percent:false
  };
  assert.equal(audit.directionalWinnerContrasts.length,
    raw.comparison.summary.observedMatchedTerminalWinnerContrasts);
  assert.equal(audit.nativeErrorRecords.length,
    raw.comparison.summary.errors);
  return audit;
}
if(require.main===module){
  const input=process.env.AGENT3_DUAL60_AUDIT_INPUT;
  assert.ok(input,'Set actual archived experiment input file');
  const audit=analyze(JSON.parse(fs.readFileSync(input,'utf8')));
  if(process.env.AGENT3_DUAL60_AUDIT_OUTPUT)
    save(process.env.AGENT3_DUAL60_AUDIT_OUTPUT,audit);
  process.stdout.write('AGENT3_DUAL60_ALL29_MATCHED_AUDIT '+JSON.stringify({
    direction:audit.contrastCounts,contrasts:audit.directionalWinnerContrasts,
    sourceMismatch:audit.unpairedSourceGroups,errors:audit.nativeErrorRecords,
    summary:audit.summary})+'\n');
}
module.exports={VERSION,analyze};
