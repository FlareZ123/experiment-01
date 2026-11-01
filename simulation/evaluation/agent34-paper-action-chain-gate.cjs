'use strict';
const assert=require('node:assert/strict');
const VERSION='agent34-paper-action-chain-gate-v1';
const PHASES=Object.freeze({
  ROOT_PAPER:['rule','root'],
  PROMPT_PAPER:['rule','prompt'],
  PAYMENT_PAPER:['rule','payment'],
  EFFECT_PAPER:['rule','effect'],
  RANDOMNESS_PAPER:['rule','randomness']
});
const statuses=new Set(['verified','invalid','unverified','not-encountered']);
const sha=/^[0-9a-f]{64}$/;

/** Structural receipt check only; rule correctness is audited separately.
 * @param {object} phase @param {object[]} witnesses
 * @param {object} root @param {string} storeId
 * @param {string[]} kinds @returns {object}
 */
function assessPhase(phase,witnesses,root,storeId,kinds){
  if(!statuses.has(phase?.status))
    return {status:'unverified',why:'missing-phase'};
  if(phase.status==='invalid'||phase.status==='unverified')
    return {status:phase.status,why:'reported-'+phase.status};
  if(phase.status==='not-encountered')
    return typeof phase.reason==='string'&&phase.reason.length>0&&
      Array.isArray(phase.witnessIds)&&phase.witnessIds.length===0?
      {status:'not-encountered'}:
      {status:'unverified',why:'nonencounter-not-grounded'};
  const ids=phase.witnessIds;
  if(!Array.isArray(ids)||new Set(ids).size!==ids.length)
    return {status:'unverified',why:'bad-witness-ids'};
  const selected=ids.map(id=>witnesses.find(w=>w.id===id));
  if(selected.some(w=>!w)||new Set(witnesses.map(w=>w.id)).size!==witnesses.length)
    return {status:'unverified',why:'missing-or-duplicate-witness'};
  if(selected.some(w=>w.storeId!==storeId||w.ordinal!==root.ordinal||
    w.seat!==root.seat||w.printing!==(root.printing??null)||
    !sha.test(w.sourceSha256??'')))
    return {status:'unverified',why:'provenance-mismatch'};
  if(kinds.some(kind=>!selected.some(w=>w.kind===kind)))
    return {status:'unverified',why:'required-witness-kind-missing'};
  return {status:'verified'};
}

/** Retain every accepted live-Store root and every paper phase.
 * @param {object} archive Frozen source-deal, owner-root and witness archive.
 * @returns {object} Conservative release diagnostic, never a win estimate.
 */
function auditActionChains(archive){
  assert.equal(archive?.schema,'paper-action-chains-v1');
  for(const key of ['trialId','enginePin','profilePin','liveStoreId'])
    assert.ok(typeof archive[key]==='string'&&archive[key].length,key);
  assert.ok(Array.isArray(archive.roots)&&Array.isArray(archive.chains));
  const roots=new Set(),chains=new Map(),extras=[];
  for(const root of archive.roots){
    assert.ok(Number.isSafeInteger(root.ordinal)&&root.ordinal>=0);
    assert.ok(root.seat===0||root.seat===1);
    assert.ok(typeof root.action==='string'&&root.action.length>0);
    assert.equal(root.storeId,archive.liveStoreId);
    assert.ok(!roots.has(root.ordinal),'duplicate-root');
    roots.add(root.ordinal);
  }
  for(const chain of archive.chains){
    if(!roots.has(chain.rootOrdinal)||chains.has(chain.rootOrdinal))
      extras.push({rootOrdinal:chain.rootOrdinal,reason:'extra-or-duplicate'});
    else chains.set(chain.rootOrdinal,chain);
  }
  const counts=Object.fromEntries(Object.keys(PHASES).map(p=>
    [p,{verified:0,invalid:0,unverified:0,'not-encountered':0}]));
  const rows=archive.roots.map(root=>{
    const c=chains.get(root.ordinal);
    const matched=c?.storeId===archive.liveStoreId&&
      c?.seat===root.seat&&c?.action===root.action&&
      typeof c?.chainId==='string'&&c.chainId.length>0&&
      c?.printing===(root.printing??null)&&
      typeof c?.executableLookup==='string'&&c.executableLookup.length>0;
    const phases={};
    for(const [name,kinds] of Object.entries(PHASES)){
      phases[name]=matched?assessPhase(c.phases?.[name],
        Array.isArray(c.witnesses)?c.witnesses:[],root,
        archive.liveStoreId,kinds):
        {status:'unverified',why:'no-matching-chain'};
      // Every accepted Store root exists, and its state transition must
      // be demonstrated. These two phases cannot be "not encountered".
      if((name==='ROOT_PAPER'||name==='EFFECT_PAPER')&&
        phases[name].status==='not-encountered')
        phases[name]={status:'unverified',why:'mandatory-phase-nonencounter'};
      counts[name][phases[name].status]++;
    }
    const states=Object.values(phases).map(x=>x.status);
    return {ordinal:root.ordinal,seat:root.seat,action:root.action,
      printing:root.printing??null,
      disposition:states.includes('invalid')?'PAPER_INVALID_REPORTED':
        states.includes('unverified')?'PAPER_UNVERIFIED':
        'REPORTED_PHASES_STRUCTURALLY_WITNESSED',phases};
  });
  return {schema:'paper-action-chain-audit-v1',version:VERSION,
    trialId:archive.trialId,enginePin:archive.enginePin,
    profilePin:archive.profilePin,liveStoreId:archive.liveStoreId,
    acceptedRootCount:archive.roots.length,reportedChainCount:archive.chains.length,
    extraOrDuplicateChains:extras,counts,rows,
    structurallyComplete:rows.length>0&&extras.length===0&&rows.every(r=>
      r.disposition==='REPORTED_PHASES_STRUCTURALLY_WITNESSED'),
    actionChainPaperVerified:false,competitiveGameQualified:false,
    boundary:'Witness metadata is not independent proof of printed legality or native effect correctness.'};
}
module.exports={VERSION,PHASES,assessPhase,auditActionChains};
