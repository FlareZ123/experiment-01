'use strict';
const assert=require('node:assert/strict');
const {compareSafely}=require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {auditedSourceDigest}=require('./agent34-fresh-underworld-abort-pair-audit.cjs');
const P=require('./agent31-floatstone-heldout-provenance.cjs');
function summarizeRows(trials,control,treatment){
 const match=compareSafely(control.rows,treatment.rows);
 assert.equal(match.length,trials.length);
 return trials.map((t,i)=>{
 const a=control.rows[i],b=treatment.rows[i],m=match[i],seat=t.candidateSlot==='A'?1:0;
 const da=auditedSourceDigest(a,seat),db=auditedSourceDigest(b,seat);
 const audit=b.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
 return {id:t.id,seat,seed:t.seed,physicalMatch:m.sameSeed&&m.sameSourceDeal&&m.sameFullDeal&&m.sameStart,
 sourceMatch:da.digest!==null&&da.digest===db.digest,
 controlAttacks:P.roots(a,seat,'AttackAction').length,rescueAttacks:P.roots(b,seat,'AttackAction').length,
 controlMaxGeist:P.maxGeist(a,seat),rescueMaxGeist:P.maxGeist(b,seat),
 physicalToolAttack:P.completeSourceToolAttackChains(b,seat),
 allSeatRescueSelected:audit.fundedVmaxFloatStoneRootSelected??0,
 controlStatus:P.nativeStatus(a,seat),rescueStatus:P.nativeStatus(b,seat),
 controlSHA:a.rootActionLedgerSha256,rescueSHA:b.rootActionLedgerSha256,paperQualified:false};
 });
}
module.exports={summarizeRows};
