'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {firstRootDivergence,compareHistoricalSupporterQuota}=
  require('../scripts/agent41-paper-supporter-paired-replay.cjs');

test('first changed real root is preserved rather than merely comparing hashes',()=>{
  const same={actionOrdinal:10,turnBefore:2,playerSlot:1,action:'PlayCardAction',card:'Cynthia & Caitlin'};
  const second={actionOrdinal:12,turnBefore:2,playerSlot:1,action:'PlayCardAction',card:'Sidney'};
  const safe={actionOrdinal:12,turnBefore:2,playerSlot:1,action:'PassTurnAction',card:null};
  assert.deepEqual(firstRootDivergence([same,second],[same,safe]),{
    status:'first-root-divergence',index:1,baseline:second,guarded:safe
  });
  assert.equal(firstRootDivergence([same],[same]).status,'same-visible-root-sequence');
  assert.equal(firstRootDivergence([same],[]).status,'first-root-divergence');
  assert.equal(firstRootDivergence(undefined,[]).status,'root-sequence-not-recorded');
});

test('only four matching historical identities qualify for developmental comparison',()=>{
  const base={paperSupporterQuotaOptIn:false,paperSupporterComparisonTraceOptIn:true,
    competitiveQualifiedGames:0,enginePin:'a9905a76',
    candidatePolicy:'base',rows:[]};
  const guarded={...base,paperSupporterQuotaOptIn:true,
    candidatePolicy:'base+guard',nativeSupporterQuotaQualified:true,rows:[]};
  for(let n=0;n<4;n++){
    const trial={id:'fixture-'+n,seed:n,candidateId:'c',candidateSlot:'B'};
    const row={trial,paperSupporterComparisonTrace:[],sourceDealFingerprint:'same',
      actualStarterSeat:1,rootActionLedgerSha256:'digest',actionCount:2};
    base.rows.push(row);
    guarded.rows.push({...row,nativeSupporterQuotaQualified:true});
  }
  const c=compareHistoricalSupporterQuota(base,guarded);
  assert.equal(c.pairedRows.length,4);
  assert.equal(c.pairedRows.every(row=>row.sourceDealIdentity===true),true);
  assert.equal(c.competitiveQualifiedGames,0);
  guarded.rows[1].trial={...guarded.rows[1].trial,seed:99};
  assert.throws(()=>compareHistoricalSupporterQuota(base,guarded));
});
