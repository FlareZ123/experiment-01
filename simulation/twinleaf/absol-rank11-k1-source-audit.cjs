'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {inspect}=require('./absol-rank11-firstturn-ownhand.cjs');
const {withRank11K1SearchAudit}=require('./absol-rank11-k1-search-observer.cjs');

/** @returns {object} Deterministic actual first-search K1 evidence. */
function main(){
  initializeCards();
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(root,'game/store/store'));
  const observed=withRank11K1SearchAudit(Store,inspect);
  assert.equal(observed.result.sameActualGameUnderObserverChange,true);
  assert.equal(observed.result.seed,1244180408);
  assert(observed.searches.length>=2,'Expected Back Order and Secret Box own-deck searches');
  assert(observed.searches.some(x=>x.selected.some(card=>card?.startsWith('Forest Seal Stone'))));
  assert(observed.searches.some(x=>x.selected.some(card=>card?.startsWith('Shopping Center'))));
  return {
    study:'rank11 actual first-turn own deck K1, no policy intervention',
    original:observed.result,
    searches:observed.searches,
    qualifiedForCompetitiveInference:false,
    caveat:'Only acting-player-owned deck at genuine source search; no hidden opponent identities supplied. Recorded search catalog counts establish physical availability, not best-play feasibility or active paid lines.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
