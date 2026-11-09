'use strict';

const fs=require('node:fs');
const assert=require('node:assert/strict');
const {save}=require('../agent43-guzma-original-source-pair.cjs');

const VERSION='agent3-hood-all29-original-source-native-directional-audit-v1';
function analyze(raw){
  assert.equal(raw.schema,
    'agent3-full29-hood-shield-vs-shadow-rider-native-prospective-v1');
  const rows=raw.comparison.comparisonRows;
  assert.equal(rows.length,58);
  const contrasted=rows.filter(x=>x.winnerContrasts);
  const full=rows.filter(x=>x.matched&&x.terminal);
  const directional=contrasted.map(r=>({
    key:r.sourceGroup,rank:r.rank,seat:r.candidateSlot,
    exactSourceMatched:r.matched,
    championWin:r.champion.nativeCandidateWin,
    hoodWin:r.hood.nativeCandidateWin,
    favored:r.favored,
    championRootCount:r.champion.roots,
    hoodRootCount:r.hood.roots
  }));
  const errors=rows.flatMap(r=>[
    {id:r.champion.trialId,rank:r.rank,actor:'champion',error:r.champion.error},
    {id:r.hood.trialId,rank:r.rank,actor:'hood',error:r.hood.error}
  ].filter(x=>x.error));
  const summary={
    originalMatched:rows.filter(x=>x.matched).length,
    bothTerminalMatched:full.length,compared:rows.length,
    contrasts:directional.length,
    hoodFavored:directional.filter(x=>x.favored==='hood-shield-v1').length,
    championFavored:directional.filter(x=>x.favored==='champion-reference').length,
    unpaired:rows.filter(x=>!x.matched).map(x=>({key:x.sourceGroup,rank:x.rank})),
    errors:errors.length,
    sourceRanksWithHoodWin:rows.filter(x=>x.hood.nativeCandidateWin).map(x=>x.rank),
    paperQualifiedGames:0
  };
  assert.equal(summary.originalMatched,55);
  assert.equal(summary.bothTerminalMatched,41);
  assert.equal(summary.hoodFavored,6);
  assert.equal(summary.championFavored,3);
  return {schema:VERSION,sourceNativeRun:42578010606,
    summary,directional,errors,originalPerRank:raw.comparison.perRank,
    developmentOnly:true,competitivelyQualifiedGames:0,
    finalSelection:'not proven'};
}
if(require.main===module){
  const input=process.env.AGENT3_HOOD_AUDIT_INPUT;
  assert.ok(input,'An actual archived native output is required');
  const report=analyze(JSON.parse(fs.readFileSync(input,'utf8')));
  if(process.env.AGENT3_HOOD_AUDIT_OUTPUT)
    save(process.env.AGENT3_HOOD_AUDIT_OUTPUT,report);
  process.stdout.write('AGENT3_HOOD_ALL29_NATIVE_AUDIT '+
    JSON.stringify(report)+'\n');
}
module.exports={VERSION,analyze};
