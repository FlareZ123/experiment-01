'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {firstRootDifference}=require('./aichi-actual-root-policy-diff.cjs');

/** @param {object} off @param {object} on @returns {object} */
function comparePanels(off,on){
  assert.equal(off.enginePin,on.enginePin);
  assert.equal(off.attempted,4);
  assert.equal(on.attempted,4);
  assert.equal(off.rank6K1AlternativeEnergyOptIn,false);
  assert.equal(on.rank6K1AlternativeEnergyOptIn,true);
  const treatment=new Map(on.rows.map(row=>[row.trial.id,row]));
  return {schema:'rank6-k1-alternative-development-v1',qualifiedGames:0,
    pairs:off.rows.map(a=>{
      const b=treatment.get(a.trial.id);
      assert.ok(b);
      const dealA=a.sourceDealEpochs?.deals?.[0]?.fullPhysicalDealDigestSha256;
      const dealB=b.sourceDealEpochs?.deals?.[0]?.fullPhysicalDealDigestSha256;
      if(dealA&&dealB)assert.equal(dealA,dealB);
      if(a.sourceDealFingerprint&&b.sourceDealFingerprint)
        assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
      const rootDiff=Array.isArray(a.rootActionLedger)&&
        Array.isArray(b.rootActionLedger)?
        firstRootDifference(a.rootActionLedger,b.rootActionLedger):null;
      const summary=row=>({status:row.status??null,
        error:row.error??null,sourceAudit:row.sourceAudit??null,
        roots:row.rootActionLedger?.length??null,
        winnerUnqualified:row.winner??null,
        printedAttacks:row.attackDeclarations??null});
      return {id:a.trial.id,rank:a.trial.rank,
        sameFullDeal:Boolean(dealA&&dealA===dealB),
        firstDeal:dealA??null,rootDiff,
        baseline:summary(a),treatment:summary(b),qualified:false};
    })};
}

if(require.main===module){
  const off=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const on=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(comparePanels(off,on),null,2)+'\n');
}
module.exports={comparePanels};
