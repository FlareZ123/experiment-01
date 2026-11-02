'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {save}=require('./agent43-guzma-original-source-pair.cjs');

const VERSION='agent31-rank1-original-public-native-recipient-physical-postprocess-v1';
const BASIC=/^(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy [A-Z0-9]/;

/** Public before-after card-multiset exact one-card addition. */
function wasCardAdded(before,after,printing){
  if(!Array.isArray(before)||!Array.isArray(after)||
     typeof printing!=='string'||after.length!==before.length+1)
    return false;
  const left=new Map();
  for(const name of before)left.set(name,(left.get(name)??0)+1);
  for(const name of after)left.set(name,(left.get(name)??0)-1);
  const extras=[...left.entries()].filter(([,difference])=>
    difference!==0);
  return extras.length===1&&extras[0][0]===printing&&
    extras[0][1]===-1;
}

/**
 * A genuinely accepted hand Basic Energy PlayCardAction must physically
 * mutate one public owner Bench slot by adding that exact printing.
 * No hidden card, native action target inference or root skeleton needed.
 *
 * @param {object} event Native accepted target witness.
 * @returns {object|null} Exact target if witnessed.
 */
function acceptedBasicBenchAttachment(event){
  if(event?.action!=='PlayCardAction'||
      event?.storeAccepted!==true||
      event?.visibility!=='public-after-dispatch'||
      !Number.isSafeInteger(event.playerSlot)||
      !BASIC.test(event.declared?.ownerHandPrinting??''))return null;
  for(const delta of event.publicBoardChanges??[]){
    if(delta.seat!==event.playerSlot||
       delta.position!=='bench'||delta.before?.pokemon===null||
       delta.after?.pokemon===null)continue;
    if(!wasCardAdded(delta.before?.energies,delta.after?.energies,
      event.declared.ownerHandPrinting))continue;
    return {
      seat:delta.seat,benchIndex:delta.index,
      printing:event.declared.ownerHandPrinting,
      targetPokemon:delta.after.pokemon,
      nativeDispatchOrdinal:event.actionOrdinal,
      rootActionOrdinal:event.rootActionOrdinal??null,
      turnBefore:event.turnBefore
    };
  }
  return null;
}

/**
 * Witness native accepted AttachEnergyPrompt deltas separately.
 * This can include delayed Ability attachments when they settle during
 * the actual prompt. It never attributes one to a particular Ability.
 *
 * @param {object} event Public AttachEnergyPrompt after-dispatch sidecar.
 * @returns {object[]} Visible Basic Energy Bench additions.
 */
function acceptedPromptBenchAdditions(event){
  if(event?.nativeDispatchAccepted!==true||
      event?.publicAfterDispatch!==true)return [];
  const additions=[];
  for(const delta of event.publicChanges??[]){
    if(delta.position!=='bench'||delta.before?.pokemon===null||
       delta.after?.pokemon===null)continue;
    const before=delta.before?.energies,after=delta.after?.energies;
    if(!Array.isArray(before)||!Array.isArray(after)||
       after.length!==before.length+1)continue;
    const extra=[...new Set(after)].filter(printing=>
      BASIC.test(printing)&&wasCardAdded(before,after,printing));
    if(extra.length!==1)continue;
    additions.push({
      seat:delta.seat,benchIndex:delta.index,
      printing:extra[0],targetPokemon:delta.after.pokemon,
      turnBefore:event.turnBefore,
      nativeDispatchOrdinal:event.dispatchOrdinal
    });
  }
  return additions;
}

/** @param {object} row Single real original-source game attempt. */
function auditOneNativeGame(row){
  const seat=row.sourceSeat;
  assert.ok(seat===0||seat===1);
  const cards=row.nativeAcceptedTargetSidecar;
  const prompts=row.nativeAcceptedEnergyPromptSidecar;
  const roots=row.rootActionLedger;
  const allAccepted=cards?.events;
  const allPrompts=prompts?.events;
  const direct=Array.isArray(allAccepted)?
    allAccepted.map(acceptedBasicBenchAttachment).filter(Boolean):null;
  const abilityPrompt=Array.isArray(allPrompts)?
    allPrompts.flatMap(acceptedPromptBenchAdditions):null;
  const underworld=Array.isArray(roots)?
    roots.filter(action=>
      action.action==='UseAbilityAction'&&
      action.ability==='Underworld Door'&&
      action.playerSlot===seat):null;
  const attackLabels=Array.isArray(roots)?
    roots.filter(action=>
      action.action==='AttackAction'&&
      action.playerSlot===seat).map(action=>({
        turn:action.turnBefore,attack:action.attack??null,
        printing:action.card??null
      })):null;
  const sourcePlayedCards=Array.isArray(roots)?
    roots.filter(action=>action.action==='PlayCardAction'&&
      action.playerSlot===seat).map(action=>action.card??null):null;
  const sourceAbilityNames=Array.isArray(roots)?
    roots.filter(action=>action.action==='UseAbilityAction'&&
      action.playerSlot===seat).map(action=>action.ability??null):null;
  const candidateAbilityNames=Array.isArray(roots)?
    roots.filter(action=>action.action==='UseAbilityAction'&&
      action.playerSlot!==seat).map(action=>action.ability??null):null;
  return {
    id:row.trial?.id??null,
    sourceSeat:seat,
    candidateSeat:1-seat,
    sourceOriginalRank:1,
    status:row.status??(row.finished===true?'terminal':'censored'),
    originalSourcePhysicalDeal:row.sourceDealFingerprint??null,
    completePhysicalDeal:row.fullPhysicalDealFingerprint??null,
    rootLedgerSha256:row.rootActionLedgerSha256??null,
    acceptedTargetsPresent:Array.isArray(allAccepted),
    acceptedTargetOrdinalLinked:cards?.rootOrdinalLinked??null,
    acceptedEnergyPromptsPresent:Array.isArray(allPrompts),
    nativeRootLedgerPresent:Array.isArray(roots),
    sourceDirectBasicBenchAttachments:direct?.filter(e=>e.seat===seat)??null,
    candidateDirectBasicBenchAttachments:direct?.filter(e=>e.seat!==seat)??null,
    sourcePromptBasicBenchAdditions:
      abilityPrompt?.filter(e=>e.seat===seat)??null,
    candidatePromptBasicBenchAdditions:
      abilityPrompt?.filter(e=>e.seat!==seat)??null,
    sourceUnderworldDoorActionRoots:underworld?.length??null,
    candidateUnderworldDoorActionRoots:
      candidateAbilityNames?.filter(x=>x==='Underworld Door').length??null,
    sourceDirectlyPlayedShadowRiderVMAX:
      sourcePlayedCards?.filter(x=>x==='Shadow Rider Calyrex VMAX').length??null,
    sourceDirectlyPlayedShadowRiderV:
      sourcePlayedCards?.filter(x=>x==='Shadow Rider Calyrex V').length??null,
    sourceUseAbilityActionNames:sourceAbilityNames,
    candidateUseAbilityActionNames:candidateAbilityNames,
    sourceDeclaredAttacks:attackLabels??null,
    evidenceLimit:'Distinct direct Basic PlayCardAction and AttachEnergyPrompt physical deltas, not yet a full Underworld Door causal-link proof'
  };
}

/** Aggregate failure-inclusive exact original rank1 paired results. */
function summarizeArtifact(raw){
  assert.equal(raw?.sourceRank,1);
  assert.equal(raw?.attemptsTotal,32);
  const groups={control:raw.control?.rows,treatment:raw.treatment?.rows};
  const details={};
  for(const [key,rows] of Object.entries(groups)){
    assert.ok(Array.isArray(rows)&&rows.length===16);
    details[key]=rows.map(auditOneNativeGame);
  }
  const reduce=rows=>{
    const sum={
      nativeGameAttempts:rows.length,
      nonterminal:rows.filter(r=>r.status!=='terminal').length,
      nativeTargetSidecarsPresent:rows.filter(r=>
        r.acceptedTargetsPresent).length,
      nativePromptSidecarsPresent:rows.filter(r=>
        r.acceptedEnergyPromptsPresent).length,
      sourceDirectBasicBenchAttachments:0,
      candidateDirectBasicBenchAttachments:0,
      sourcePromptBasicBenchAdditions:0,
      candidatePromptBasicBenchAdditions:0,
      sourceUnderworldDoorActionRoots:0,
      candidateUnderworldDoorActionRoots:0,
      sourceDirectlyPlayedShadowRiderVMAX:0,
      sourceDirectlyPlayedShadowRiderV:0,
      sourceAllUseAbilityActionRoots:0,
      candidateAllUseAbilityActionRoots:0,
      sourceAttackDeclarations:0
    };
    for(const row of rows){
      sum.sourceDirectBasicBenchAttachments+=
        row.sourceDirectBasicBenchAttachments?.length??0;
      sum.candidateDirectBasicBenchAttachments+=
        row.candidateDirectBasicBenchAttachments?.length??0;
      sum.sourcePromptBasicBenchAdditions+=
        row.sourcePromptBasicBenchAdditions?.length??0;
      sum.candidatePromptBasicBenchAdditions+=
        row.candidatePromptBasicBenchAdditions?.length??0;
      sum.sourceUnderworldDoorActionRoots+=
        row.sourceUnderworldDoorActionRoots??0;
      sum.candidateUnderworldDoorActionRoots+=
        row.candidateUnderworldDoorActionRoots??0;
      sum.sourceDirectlyPlayedShadowRiderVMAX+=
        row.sourceDirectlyPlayedShadowRiderVMAX??0;
      sum.sourceDirectlyPlayedShadowRiderV+=
        row.sourceDirectlyPlayedShadowRiderV??0;
      sum.sourceAllUseAbilityActionRoots+=
        row.sourceUseAbilityActionNames?.length??0;
      sum.candidateAllUseAbilityActionRoots+=
        row.candidateUseAbilityActionNames?.length??0;
      sum.sourceAttackDeclarations+=
        row.sourceDeclaredAttacks?.length??0;
    }
    return sum;
  };
  return {
    schema:VERSION,pairedRegistration:raw.registrationGitBlobSha,
    originalSourceRank:1,originalRoster:raw.rosterGitBlobSha,
    nativeTwinleafRevision:raw.pinnedNativeRevision,
    originalSourcePhysicalMatched:
      raw.comparisonAudit?.allPhysicalMatched??false,
    control:reduce(details.control),
    treatment:reduce(details.treatment),
    exactOriginalGameDetails:details,
    competitiveQualifiedGames:0,
    qualifications:[
      'Missing native sidecar is explicitly counted; do not normalize to complete-case denominators',
      'Native accepted direct Basic Energy PlayCardAction public board deltas are physical, but cannot prove overall paper legality or strategy',
      'Prompt Bench delta may be an Underworld Door effect or another native effect; no per-prompt causal attribution asserted',
      'Repeated attacks and prompts within a native game are correlated',
      'Native terminal game outcomes are developmental and never counted as qualified Aichi wins'
    ]
  };
}

if(require.main===module){
  const file=process.argv[2];
  assert.ok(file,'Supply an already archived original rank1 native JSON artifact file');
  const raw=JSON.parse(fs.readFileSync(file,'utf8'));
  const result=summarizeArtifact(raw);
  if(process.env.AGENT31_RANK1_PHYSICAL_SUMMARY_OUTPUT)
    save(process.env.AGENT31_RANK1_PHYSICAL_SUMMARY_OUTPUT,result);
  process.stdout.write('AGENT31_RANK1_RECIPIENT_PHYSICAL_SUMMARY '+
    JSON.stringify({
      rank:result.originalSourceRank,
      pairedPhysicalMatch:result.originalSourcePhysicalMatched,
      control:result.control,treatment:result.treatment,
      qualifiedGames:0
    })+'\n');
}
module.exports={
  VERSION,wasCardAdded,
  acceptedBasicBenchAttachment,
  acceptedPromptBenchAdditions,
  auditOneNativeGame,summarizeArtifact
};
