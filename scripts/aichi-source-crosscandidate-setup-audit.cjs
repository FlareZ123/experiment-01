'use strict';

const fs=require('node:fs');

const SOURCE_SCHEMA='aichi-actual-source-postsetup-paired-sampler-v1';
const ARMS=Object.freeze([
  ['champion-reference','source-row-order-v1'],
  ['hood-shield-v1','source-row-order-v1'],
  ['hood-shield-v1','reference-aligned-v1'],
  ['temple-v1','source-row-order-v1'],
  ['temple-v1','reference-aligned-v1']
]);
const ARM_KEYS=new Set(ARMS.map(parts=>JSON.stringify(parts)));
const SHA256=/^[a-f0-9]{64}$/;

/**
 * Compare source post-setup zone digests across all five arms of each frozen
 * seed/physical-seat block. Digest equality covers the observed source hand,
 * Active, Bench, Prizes and remaining deck length, but NOT remaining deck order.
 * This read-only researcher audit is not a completed-game or win-rate metric.
 *
 * @param {object} archive Original 120-row setup-only JSON artifact.
 * @returns {object} Descriptive source-zone parity by opponent and arm.
 */
function auditCrossCandidateSourceZones(archive){
  if(archive?.schema!==SOURCE_SCHEMA ||
     archive.status!=='initial-setup-only-not-games' ||
     archive.qualifiedCompetitiveGames!==0 ||
     archive.sourceAndCandidate60Unchanged!==true ||
     archive.stopsBeforeNormalTurnDecisions!==true ||
     !Array.isArray(archive.samples) || archive.samples.length===0){
    throw new Error('Expected frozen, uncertified setup-only source archive');
  }
  const blocks=new Map();
  for(const row of archive.samples){
    if(!Number.isInteger(row?.rank) || row.rank<1 || row.rank>32 ||
       !Number.isInteger(row.repeat) || row.repeat<0 ||
       !Number.isInteger(row.seed) ||
       !['A','B'].includes(row.physicalSlot) ||
       row.stoppedAtFirstTurn!==true ||
       row.openingInventoriesVerified!==true ||
       row.error!==null ||
       !SHA256.test(row.actualPostSetup?.opponentDigest) ||
       typeof row.actualPostSetup?.firstTurn!=='boolean'){
      throw new Error('Incomplete or unverified source opening observation');
    }
    const armKey=JSON.stringify([row.candidateId,row.inputOrderProtocol]);
    if(!ARM_KEYS.has(armKey)){
      throw new Error('Unexpected frozen sample arm');
    }
    const blockKey=JSON.stringify([
      row.rank,row.repeat,row.seed,row.physicalSlot
    ]);
    if(!blocks.has(blockKey))blocks.set(blockKey,new Map());
    const block=blocks.get(blockKey);
    if(block.has(armKey))throw new Error('Duplicate source setup arm');
    block.set(armKey,row);
  }
  const comparisons=[];
  for(const [blockKey,arms] of blocks){
    if(arms.size!==ARMS.length ||
       ARMS.some(parts=>!arms.has(JSON.stringify(parts)))){
      throw new Error('Incomplete source setup block: '+blockKey);
    }
    const [rank,repeat,seed,physicalSlot]=JSON.parse(blockKey);
    const reference=arms.get(JSON.stringify(ARMS[0]));
    for(const parts of ARMS.slice(1)){
      const row=arms.get(JSON.stringify(parts));
      comparisons.push({
        rank,repeat,seed,physicalSlot,
        candidateId:parts[0],inputOrderProtocol:parts[1],
        sourcePostsetupEqual:
          row.actualPostSetup.opponentDigest===
          reference.actualPostSetup.opponentDigest,
        actualFirstTurnEqual:
          row.actualPostSetup.firstTurn===
          reference.actualPostSetup.firstTurn
      });
    }
  }
  const byRank=[...new Set(comparisons.map(x=>x.rank))].sort((a,b)=>a-b)
    .map(rank=>{
      const rows=comparisons.filter(row=>row.rank===rank);
      return {
        rank,comparisons:rows.length,
        sameSourcePostsetup:rows.filter(row=>row.sourcePostsetupEqual).length,
        sameActualFirstTurn:rows.filter(row=>row.actualFirstTurnEqual).length
      };
    });
  return {
    auditSchema:'frozen-cross-candidate-source-postsetup-parity-v1',
    sourceArchiveSchema:SOURCE_SCHEMA,
    setupBlocks:blocks.size,
    setupArms:archive.samples.length,
    comparisons:comparisons.length,
    sameSourcePostsetup:comparisons.filter(x=>x.sourcePostsetupEqual).length,
    differentSourcePostsetup:comparisons.filter(x=>!x.sourcePostsetupEqual).length,
    sameActualFirstTurn:comparisons.filter(x=>x.actualFirstTurnEqual).length,
    byRank,
    mismatches:comparisons.filter(x=>
      !x.sourcePostsetupEqual || !x.actualFirstTurnEqual)
  };
}

if(require.main===module){
  if(!process.argv[2])throw new Error('Supply an extracted setup-only JSON path');
  const archive=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(auditCrossCandidateSourceZones(archive),null,2)+'\n');
}

module.exports={auditCrossCandidateSourceZones};
