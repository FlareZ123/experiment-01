'use strict';

const path=require('node:path');
const assert=require('node:assert/strict');
const {loadExactPrintIndex,screenManifest}=
  require('../simulation/twinleaf/agent9-jp-expanded-structure.cjs');

function run(){
  const source=require('../results/aichi-2026/full-decklists.json');
  const index=loadExactPrintIndex(path.resolve(__dirname,'../resources'));
  const report=screenManifest(source,index);
  const concise={
    version:report.version,
    officialJapaneseSource:report.officialJapaneseSource,
    officialRuleUpdated:report.officialRuleUpdated,
    eventDate:report.eventDate,
    authenticatedDeckRows:report.authenticatedDeckRows,
    missingOriginalDecks:report.missingOriginalDecks,
    observedDefiniteViolationDecks:report.observedDefiniteViolationDecks,
    observedUnresolvedMetadataDecks:report.observedUnresolvedMetadataDecks,
    paperLegalityCertifiedDecks:0,
    observedViolations:report.rows.filter(r=>r.violations.length)
      .map(r=>({rank:r.rank,violations:r.violations})),
    unknownEnglishProxyExamples:report.rows
      .filter(r=>r.uncertainties.length).slice(0,12)
      .map(r=>({rank:r.rank,unknownCopies:r.unmatchedEnglishProxyCopies,
        examples:r.uncertainties.slice(0,4)})),
    perRank:report.rows.map(r=>({
      rank:r.rank,originalCopies:r.sourcePhysicalCopies,
      EnglishProxyMatched:r.matchedEnglishProxyCopies,
      unknownEnglishProxyCopies:r.unmatchedEnglishProxyCopies,
      knownAceSpecCopies:r.knownAceSpecCopies,
      knownRadiantCopies:r.knownRadiantCopies,
      knownBasicCopies:r.knownBasicCopies,
      violations:r.violations.length,uncertainties:r.uncertainties.length
    })),
    disclaimer:'Necessary-condition negative screen only; original Japanese print equivalence, event date, timing, card text and full 32 remain unverified. Zero qualified games.',
    competitiveQualifiedGames:0
  };
  assert.equal(report.authenticatedDeckRows,29,
    'Changed opponent roster requires a separately reviewed benchmark revision');
  assert.deepEqual(report.missingOriginalDecks,[23,25,28]);
  return concise;
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={run};
