'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');

const VERSION='agent35-issue25-v5-pass-integrity-v1';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * Confirm one predeclared Pass, both physical-deal fingerprints, all card
 * event custody and opponent follow-up in the exact accepted public ledger.
 * @param {object} trial Genuine archived matching native match row.
 * @param {object} selected Frozen observational anchor from registration.
 * @returns {object} Origin-verified evidence and explicit paper uncertainty.
 */
function verifyAnchor(trial,selected){
  assert.ok(trial,'Missing selected original registration: '+selected.id);
  assert.equal(trial.originalSourceSeat,selected.sourceSeat);
  assert.equal(trial.candidateSeat,selected.candidateSeat);
  assert.equal(trial.actualFirstPlayer,selected.actualFirstPlayer);
  assert.equal(trial.sourceDealFingerprint,selected.sourceDealFingerprint);
  assert.equal(trial.fullPhysicalDealFingerprint,
    selected.fullPhysicalDealFingerprint);
  assert.equal(trial.publicRootLedgerSha256Computed,
    selected.originalAcceptedRootLedgerSha256);
  const roots=trial.publicRootActions;
  const passRoot=roots[selected.passRootOrdinal];
  assert.equal(passRoot?.actionOrdinal,selected.passRootOrdinal);
  assert.equal(passRoot.playerSlot,selected.sourceSeat);
  assert.equal(passRoot.turnBefore,selected.turn);
  assert.equal(passRoot.action,'PassTurnAction');
  assert.equal(passRoot.pendingPrompt,null);
  if(selected.priorOpponentRoot){
    const prior=roots[selected.priorOpponentRoot.ordinal];
    assert.equal(prior.playerSlot,selected.candidateSeat);
    assert.equal(prior.action,selected.priorOpponentRoot.action);
    assert.equal(prior.turnBefore,selected.priorOpponentRoot.turn);
    assert.ok(prior.actionOrdinal<passRoot.actionOrdinal);
  }
  if(selected.immediatelyPrecedingSourcePlay){
    const prior=roots[selected.immediatelyPrecedingSourcePlay.ordinal];
    assert.equal(prior.actionOrdinal,passRoot.actionOrdinal-1);
    assert.equal(prior.playerSlot,selected.sourceSeat);
    assert.equal(prior.turnBefore,selected.turn);
    assert.equal(prior.action,selected.immediatelyPrecedingSourcePlay.action);
    assert.equal(prior.card,selected.immediatelyPrecedingSourcePlay.card);
  }
  const next=selected.observedFollowingOpponentRoot??
    selected.observedFollowingOpponentAttack;
  const nextRoot=roots[next.ordinal];
  assert.equal(nextRoot.playerSlot,selected.candidateSeat);
  assert.equal(nextRoot.action,next.action);
  assert.equal(nextRoot.turnBefore,next.turn);
  if(next.card)assert.equal(nextRoot.card,next.card);
  if(next.attack)assert.equal(nextRoot.attack,next.attack);
  assert.ok(nextRoot.actionOrdinal>passRoot.actionOrdinal);
  return {
    id:trial.id,sourceSeat:selected.sourceSeat,
    globalTurn:selected.turn,passRootOrdinal:passRoot.actionOrdinal,
    fullPhysicalDealFingerprint:selected.fullPhysicalDealFingerprint,
    ownerHandAtPass:'not-in-public-archive',
    paperPayableAlternative:'unknown',
    sourceAttackAfterPassUnestablished:true,
    opponentContinuationObserved:{
      ordinal:nextRoot.actionOrdinal,
      action:nextRoot.action,
      turn:nextRoot.turnBefore
    }
  };
}

/**
 * Verify the complete released raw original-eight artifact before making any
 * inference about an actor's accepted source Pass roots. All decisions and
 * available fields are post-Store publicly observable evidence only.
 * @param {Buffer} raw Exact downloaded JSON member, without reformatting.
 * @param {object} manifest Immutable two-root observational registration.
 * @returns {object} Reproducible counts and verified anchor evidence.
 */
function audit(raw,manifest){
  assert.ok(Buffer.isBuffer(raw));
  assert.equal(raw.length,manifest.jsonMemberBytes);
  assert.equal(hash(raw),manifest.jsonMemberSha256);
  assert.equal(manifest.eligibilityStatus,'not-a-paper-legality-claim');
  const data=JSON.parse(raw.toString('utf8'));
  assert.ok(Array.isArray(data.attempts));
  assert.equal(data.attempts.length,manifest.sourceAttemptCount);
  assert.equal(manifest.roots.length,manifest.selectedRootCount);
  const byId=new Map();
  let allRoots=0;
  let prompt=0;
  let pass=0;
  let play=0;
  let attack=0;
  let firstPlayerSourceTurnOnePasses=0;
  let immediatelyAfterSourcePlayPasses=0;
  let sourcePassFollowedByOpponentAttack=0;
  let missingExplicitSourceSeat=0;
  const rowSummaries=[];
  for(const trial of data.attempts){
    assert.equal(typeof trial.id,'string');
    assert.ok(!byId.has(trial.id),'Duplicate original registration: '+trial.id);
    byId.set(trial.id,trial);
    assert.ok(Array.isArray(trial.publicRootActions));
    const roots=trial.publicRootActions;
    assert.equal(trial.publicRootActionsTruncated,false);
    assert.equal(roots.length,trial.publicRootActionCount);
    assert.equal(roots.length,trial.nativeRootActionCount);
    assert.ok(roots.length<=manifest.originalRootCap);
    const ledgerSha=hash(Buffer.from(JSON.stringify(roots)));
    assert.equal(ledgerSha,trial.publicRootLedgerSha256Computed);
    assert.equal(ledgerSha,trial.publicRootLedgerSha256Reported);
    assert.equal(trial.publicRootLedgerDigestConsistent,true);
    allRoots+=roots.length;
    for(let i=0;i<roots.length;i++){
      assert.equal(roots[i].actionOrdinal,i);
    }
    const slot=/^[0-9]+:[0-9]+:([AB]):/.exec(trial.id)?.[1];
    assert.ok(slot==='A'||slot==='B');
    const registeredCandidateSeat=slot==='A'?0:1;
    const inferredSourceSeat=trial.originalSourceSeat===null;
    const seat=inferredSourceSeat?1-registeredCandidateSeat:
      trial.originalSourceSeat;
    assert.equal(seat,1-registeredCandidateSeat);
    if(inferredSourceSeat){
      missingExplicitSourceSeat++;
      assert.ok(roots.filter(r=>r.playerSlot===seat).every(r=>
        r.action==='ResolvePromptAction'),
      'Never infer source owner for nonprompt decisions');
    }
    if(!inferredSourceSeat)assert.equal(trial.candidateSeat,1-seat);
    else assert.equal(trial.candidateSeat,null);
    const sourceRoots=roots.filter(r=>r.playerSlot===seat);
    prompt+=sourceRoots.filter(r=>r.action==='ResolvePromptAction').length;
    pass+=sourceRoots.filter(r=>r.action==='PassTurnAction').length;
    play+=sourceRoots.filter(r=>r.action==='PlayCardAction').length;
    attack+=sourceRoots.filter(r=>r.action==='AttackAction').length;
    for(let i=0;i<roots.length;i++){
      const root=roots[i];
      if(root.playerSlot!==seat||root.action!=='PassTurnAction')continue;
      if(trial.actualFirstPlayer===seat&&root.turnBefore===1){
        firstPlayerSourceTurnOnePasses++;
      }
      const prev=roots[i-1];
      if(prev&&prev.playerSlot===seat&&
         prev.action==='PlayCardAction'&&prev.turnBefore===root.turnBefore){
        immediatelyAfterSourcePlayPasses++;
      }
      const nextNonprompt=roots.slice(i+1).find(r=>
        r.playerSlot===1-seat&&r.action!=='ResolvePromptAction');
      if(nextNonprompt?.action==='AttackAction'){
        sourcePassFollowedByOpponentAttack++;
      }
    }
    rowSummaries.push({id:trial.id,sourceSeat:seat,
      nativeRoots:roots.length,
      status:trial.finished===true?'native-terminal-unqualified':
        roots.length===manifest.originalRootCap?'root-cap-censored':
          'native-error-or-partial-unqualified'});
  }
  const anchors=manifest.roots.map(selected=>
    verifyAnchor(byId.get(selected.id),selected));
  assert.equal(allRoots,350);
  assert.equal(missingExplicitSourceSeat,1);
  assert.equal(prompt,115);
  assert.equal(pass,33);
  assert.equal(play,7);
  assert.equal(attack,0);
  assert.equal(firstPlayerSourceTurnOnePasses,2);
  assert.equal(immediatelyAfterSourcePlayPasses,6);
  assert.equal(sourcePassFollowedByOpponentAttack,4);
  return {
    schema:VERSION,originalAttempts:data.attempts.length,
    originalRootCap:manifest.originalRootCap,
    allAcceptedRoots:allRoots,sourceAcceptedRoots:prompt+pass+play+attack,
    sourcePromptRoots:prompt,sourcePassRoots:pass,
    sourcePlayCardRoots:play,sourceAttackRoots:attack,
    firstPlayerSourceTurnOnePasses,
    immediatelyAfterSourcePlayPasses,
    sourcePassFollowedByOpponentAttack,
    sourceSeatInferredFromRegisteredCandidateOnRows:missingExplicitSourceSeat,
    anchors,rowSummaries,
    ownerHandAndPaperOpportunityUnverified:true,
    competitiveGamesQualified:0
  };
}

if(require.main===module){
  const [rawPath,manifestPath]=process.argv.slice(2);
  assert.ok(rawPath&&manifestPath,
    'Expected exact native v5 JSON file and frozen registration paths');
  const raw=fs.readFileSync(rawPath);
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  process.stdout.write(JSON.stringify(audit(raw,manifest),null,2)+'\n');
}

module.exports={VERSION,audit,verifyAnchor};
