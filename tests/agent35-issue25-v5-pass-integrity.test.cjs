'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {audit,verifyAnchor,VERSION}=
  require('../scripts/agent35-issue25-v5-pass-integrity.cjs');
const hash=data=>createHash('sha256').update(data).digest('hex');

/** @returns {{trial:object,selected:object}} */
function fixture(){
  const selected={
    id:'6:101:B:champion-reference',sourceSeat:0,candidateSeat:1,
    actualFirstPlayer:1,turn:2,passRootOrdinal:1,
    sourceDealFingerprint:'source-physical',
    fullPhysicalDealFingerprint:'entire-physical',
    originalAcceptedRootLedgerSha256:'public-root-sha',
    priorOpponentRoot:{ordinal:0,action:'PassTurnAction',turn:1},
    observedFollowingOpponentRoot:{ordinal:2,action:'PlayCardAction',
      card:'Psychic Energy',turn:3}
  };
  const trial={
    id:selected.id,originalSourceSeat:0,candidateSeat:1,
    actualFirstPlayer:1,
    sourceDealFingerprint:selected.sourceDealFingerprint,
    fullPhysicalDealFingerprint:selected.fullPhysicalDealFingerprint,
    publicRootLedgerSha256Computed:selected.originalAcceptedRootLedgerSha256,
    publicRootActions:[
      {actionOrdinal:0,playerSlot:1,action:'PassTurnAction',turnBefore:1},
      {actionOrdinal:1,playerSlot:0,action:'PassTurnAction',
        turnBefore:2,pendingPrompt:null},
      {actionOrdinal:2,playerSlot:1,action:'PlayCardAction',
        card:'Psychic Energy',turnBefore:3}
    ]
  };
  return {trial,selected};
}

test('exact source Pass root and genuine opponent action survive custody gate',()=>{
  assert.equal(VERSION,'agent35-issue25-v5-pass-integrity-v1');
  const {trial,selected}=fixture();
  const packet=verifyAnchor(trial,selected);
  assert.equal(packet.id,selected.id);
  assert.equal(packet.passRootOrdinal,1);
  assert.equal(packet.paperPayableAlternative,'unknown');
  assert.equal(packet.ownerHandAtPass,'not-in-public-archive');
  assert.equal(packet.opponentContinuationObserved.action,'PlayCardAction');
});

test('fail closed for wrong actor, card, turn, prompt or physical deal',()=>{
  const mutations=[
    a=>{a.trial.originalSourceSeat=1;},
    a=>{a.trial.candidateSeat=0;},
    a=>{a.trial.actualFirstPlayer=0;},
    a=>{a.trial.sourceDealFingerprint='other';},
    a=>{a.trial.fullPhysicalDealFingerprint='other';},
    a=>{a.trial.publicRootLedgerSha256Computed='other';},
    a=>{a.trial.publicRootActions[1].action='ResolvePromptAction';},
    a=>{a.trial.publicRootActions[1].playerSlot=1;},
    a=>{a.trial.publicRootActions[1].pendingPrompt='WaitPrompt';},
    a=>{a.trial.publicRootActions[1].turnBefore=3;},
    a=>{a.trial.publicRootActions[0].turnBefore=2;},
    a=>{a.trial.publicRootActions[2].card='Fighting Energy';},
    a=>{a.trial.publicRootActions[2].actionOrdinal=0;},
    a=>{a.trial.publicRootActions[2].playerSlot=0;}
  ];
  for(const change of mutations){
    const data=fixture();
    change(data);
    assert.throws(()=>verifyAnchor(data.trial,data.selected));
  }
});

test('reject absent native file and tampered raw bytes before metadata inspection',()=>{
  assert.throws(()=>audit('not-a-Buffer',{}));
  assert.throws(()=>audit(Buffer.from('not-json'),{
    jsonMemberBytes:8,jsonMemberSha256:'wrong'
  }));
});

const rawFile=process.env.AGENT35_V5_NATIVE_JSON;
const manifestFile=process.env.AGENT35_V5_REGISTRATION_JSON;
test('exact v5 artifact reproduces all source roots and anchor physical deals',
  {skip:!(rawFile&&manifestFile)},()=>{
    const raw=fs.readFileSync(rawFile);
    const manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
    const result=audit(raw,manifest);
    assert.equal(result.originalAttempts,8);
    assert.equal(result.allAcceptedRoots,350);
    assert.equal(result.sourceAcceptedRoots,155);
    assert.equal(result.sourcePromptRoots,115);
    assert.equal(result.sourcePassRoots,33);
    assert.equal(result.sourcePlayCardRoots,7);
    assert.equal(result.sourceAttackRoots,0);
    assert.equal(result.firstPlayerSourceTurnOnePasses,2);
    assert.equal(result.immediatelyAfterSourcePlayPasses,6);
    assert.equal(result.sourcePassFollowedByOpponentAttack,4);
    assert.equal(result.sourceSeatInferredFromRegisteredCandidateOnRows,1);
    assert.deepEqual(result.anchors.map(a=>a.passRootOrdinal),[17,37]);
    assert.equal(result.competitiveGamesQualified,0);

    const changed=JSON.parse(raw.toString('utf8'));
    const affected=changed.attempts.find(a=>
      a.id==='11:102:A:champion-reference');
    affected.publicRootActions[37].action='AttackAction';
    const modified=Buffer.from(JSON.stringify(changed));
    const mutatedManifest=structuredClone(manifest);
    mutatedManifest.jsonMemberBytes=modified.length;
    mutatedManifest.jsonMemberSha256=hash(modified);
    assert.throws(()=>audit(modified,mutatedManifest),
      /Expected values to be strictly equal/);
  });
