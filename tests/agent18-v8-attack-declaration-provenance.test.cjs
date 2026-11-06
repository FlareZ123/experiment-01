'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const registration=require('../results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json');
const {inspect,ARCHIVE}=
  require('../simulation/evaluation/agent36-v8-original-field-archive-audit.cjs');

/** @param {string|Buffer} value @returns {string} */
function sha256(value){
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Construct a synthetic, stamped 8-arm archive with Store-origin-shaped
 * declarations that need not arise from an AttackAction root.
 * @param {{corruptRoot?:boolean}} [options]
 * @returns {{bytes:Buffer,sidecar:string}}
 */
function fixture(options={}){
  const {corruptRoot=false}=options;
  const expected=registration.trials.map(t=>t.id);
  const attempts=registration.trials.map((t,index)=>{
    const owner=t.candidateSlot==='A'?1:0;
    let roots=[];
    let attacks=[];
    let status='capped';
    if(index===0){
      // Perfection-like copied attack: the log records the actual
      // declaration from a ResolvePromptAction, never AttackAction.
      roots=[
        {actionOrdinal:0,playerSlot:owner,action:'UseAbilityAction',turnBefore:2},
        {actionOrdinal:1,playerSlot:owner,action:'ResolvePromptAction',turnBefore:2}
      ];
      attacks=[{actionOrdinal:1,attackName:'Night Watch',
        triggerAction:'ResolvePromptAction',turnBefore:2,
        settledPromptChain:true,prizesBefore:[6,6],prizesAfter:[6,6]}];
    } else if(index===1){
      roots=[
        {actionOrdinal:0,playerSlot:owner,action:'AttackAction',
          turnBefore:2,attack:'Volt Cyclone'},
        {actionOrdinal:1,playerSlot:owner,action:'ResolvePromptAction',turnBefore:2}
      ];
      attacks=[{actionOrdinal:0,attackName:'Volt Cyclone',
        triggerAction:'AttackAction',turnBefore:2,
        settledPromptChain:false}];
    } else if(index===2){
      roots=[{actionOrdinal:0,playerSlot:owner,
        action:'PlayCardAction',turnBefore:2}];
      status='engine-error';
    }
    return {
      id:t.id,originalSourceSeat:owner,rawDisposition:status,
      publicRootActions:roots,publicRootActionsTruncated:false,
      publicRootActionCount:roots.length,
      publicRootLedgerSha256Computed:
        corruptRoot&&index===0?'invalid-digest':sha256(JSON.stringify(roots)),
      actualSourceAttackSettlement:status==='engine-error'?null:{attacks},
      nativeFailure:status==='engine-error'?'synthetic-decoder-error':null
    };
  });
  const value={
    actuallyExecutingManifest:{
      version:'agent36-issue25-broader-four-rank-prospective-v8-128root',
      nativeRootActionLimit:128,releaseQualified:false,
      competitiveGamesQualified:0
    },
    qualifiedCompetitiveGames:0,
    registration:{
      exactJoinedByTrialId:true,
      registeredReconciliation:{exactUniqueMatch:true},
      expectedIds:expected
    },
    attempts
  };
  const bytes=Buffer.from(JSON.stringify(value));
  return {bytes,sidecar:sha256(bytes)+'  '+ARCHIVE+'\n'};
}

test('source attack declarations count Store events independent of root action class',()=>{
  const f=fixture();
  const audit=inspect(f.bytes,f.sidecar);
  assert.equal(audit.registeredAttempts,8);
  assert.equal(audit.allNativeRootLedgersDigestVerified,true);
  assert.equal(audit.sourceAcceptedAttackActionRoots,1);
  assert.equal(audit.sourceRealStoreAttackDeclarationsKnown,2);
  assert.equal(audit.sourceRealStoreAttackDeclarationsUnknownRows,1);
  assert.equal(audit.sourceSettledAttacksKnown,1);
  assert.equal(audit.sourceSettledAttacksUnknownInAborted,1);
  assert.equal(audit.rows[0].sourceAttackRoots.length,0);
  assert.deepEqual(audit.rows[0].sourceStoreAttackDeclarations,[{
    originatingActionOrdinal:1,
    originatingRootAction:'ResolvePromptAction',
    attack:'Night Watch',
    source:'real-Store attackDeclarationTrace',
    settledPromptChain:true
  }]);
  assert.equal(audit.rows[1].sourceAttackRoots.length,1);
  assert.equal(audit.rows[1].sourceStoreAttackDeclarations[0].settledPromptChain,false);
  assert.equal(audit.rows[2].sourceStoreAttackDeclarations,null);
  assert.equal(audit.competitiveGameQualifiedCount,0);
});

test('archive counter refuses even one falsified accepted root digest',()=>{
  const f=fixture({corruptRoot:true});
  assert.throws(()=>inspect(f.bytes,f.sidecar),
    /assert|false|true/i);
});

test('declaration origin check rejects a fake trigger despite valid public-root SHA',()=>{
  const f=fixture();
  const j=JSON.parse(f.bytes.toString('utf8'));
  j.attempts[0].actualSourceAttackSettlement.attacks[0].triggerAction=
    'AttackAction';
  const bytes=Buffer.from(JSON.stringify(j));
  assert.throws(()=>inspect(bytes,sha256(bytes)+'  '+ARCHIVE+'\n'),
    /trigger differs from accepted root/);
});

test('declaration origin check rejects a false acting physical seat',()=>{
  const f=fixture();
  const j=JSON.parse(f.bytes.toString('utf8'));
  j.attempts[0].actualSourceAttackSettlement.attacks[0].actionOrdinal=0;
  j.attempts[0].publicRootActions[0].playerSlot=
    1-j.attempts[0].originalSourceSeat;
  j.attempts[0].publicRootLedgerSha256Computed=
    sha256(JSON.stringify(j.attempts[0].publicRootActions));
  const bytes=Buffer.from(JSON.stringify(j));
  assert.throws(()=>inspect(bytes,sha256(bytes)+'  '+ARCHIVE+'\n'),
    /wrong physical seat/);
});
