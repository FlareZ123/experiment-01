'use strict';

const assert=require('node:assert/strict');
const {samePhysicalProposal}=require('./agent16-owner-priority-contention.cjs');

const VERSION='agent41-same-root-proposal-choice-v1-partial-owner-view';
const MAX_SAMPLES=48;

/**
 * Each proposal is computed from the same detached owner root. Selectors are
 * genuinely independent: none is asked to consume or continue another one's
 * hypothetical action. The existing first-return choice is a control offer.
 * Native legality, prompt settlement and competitive competence remain
 * unverified until genuine Store evidence is joined to the root ordinal.
 */
const PROPOSERS=Object.freeze([
  {name:'immediate-special',flag:'publicContextSpecialEnergy',
    propose:(view,catalog)=>require('./agent41-public-flexible-energy-contest.cjs')
      .choosePublicFlexibleImmediateAttackEnergy(view,catalog)},
  {name:'public-special',flag:'publicContextSpecialEnergy',
    propose:(view,catalog)=>require('./agent17-public-context-special-energy.cjs')
      .choosePublicContextSpecialEnergy(view,catalog)},
  {name:'lowhand-lillie',flag:'lowHandLillieRoot',
    propose:view=>require('./agent25-lowhand-lillie-frontier.cjs')
      .chooseLowHandLillieBeforeAttack(view)},
  {name:'shuffle-supporter',flag:'conservativeShuffleBeforeAttack',
    propose:view=>{
      const p=require('./agent2-conservative-shuffle-supporter.cjs')
        .chooseConservativeShuffleSupporter(view);
      return p?{...p,kind:'play-conservative-shuffle-supporter'}:null;
    }},
  {name:'quick-ball',flag:'quickBallRoot',
    propose:view=>require('./agent8-actor-quick-ball-frontier.cjs')
      .chooseQuickBallRootIntent(view)},
  {name:'natural-evolution',flag:'naturalEvolutionRoot',
    propose:(view,catalog)=>require('./agent1-actor-evolution-frontier.cjs')
      .chooseNaturalEvolutionIntent(view,catalog)},
  {name:'team-flare-grunt',flag:'teamFlareGruntDenialRoot',
    propose:view=>require('./agent1-owner-team-flare-grunt-denial.cjs')
      .chooseTeamFlareGruntDenial(view)},
  {name:'held-guzma',flag:'heldGuzmaMobility',
    propose:(view,catalog)=>require('./agent2-held-guzma-mobility-frontier.cjs')
      .chooseHeldGuzmaMobility(view,catalog)},
  {name:'stranded-marnie',flag:'strandedMarnieRoot',
    propose:view=>require('./agent50-stranded-marnie-frontier.cjs')
      .chooseStrandedMarnie(view)}
]);

const ENERGY_KINDS=new Set([
  'attach-basic-energy','attach-special-energy','attach-dce'
]);
const SUPPORTER_KINDS=new Set([
  'play-lowhand-lillie','play-conservative-shuffle-supporter',
  'play-team-flare-grunt-denial','play-stranded-marnie',
  'play-held-guzma-mobility'
]);
const SEARCH_KINDS=new Set([
  'play-quick-ball','play-mysterious-treasure'
]);

/**
 * A candidate must match the same owner's physical printed hand index and
 * have an extant public recipient. Unknown kind/target is unsupported.
 * This is a structural precheck only: Store may still reject an action.
 *
 * @param {object} view
 * @param {object} proposal
 * @returns {boolean}
 */
function structurallySupported(view,proposal){
  if(!proposal||typeof proposal.kind!=='string')return false;
  if(proposal.kind==='attack')return typeof proposal.attackName==='string';
  if(proposal.kind==='pass')return true;
  if(!Number.isSafeInteger(proposal.handIndex)||proposal.handIndex<0||
     view.ownHand?.[proposal.handIndex]!==proposal.printing)return false;
  if(ENERGY_KINDS.has(proposal.kind)){
    const r=view.ownTurnResources;
    if(r?.energyPlayLocked===true||r?.energyPlayedTurn===view.globalTurn||
       (proposal.kind!=='attach-basic-energy'&&
        r?.specialEnergyPlayLocked===true))return false;
    if(proposal.slot==='bench'){
      return Number.isSafeInteger(proposal.index)&&proposal.index>=0&&
        view.ownPublic?.bench?.[proposal.index]!=null;
    }
    return (proposal.slot===undefined||proposal.slot==='active')&&
      view.ownPublic?.active!=null;
  }
  if(SUPPORTER_KINDS.has(proposal.kind)){
    const r=view.ownTurnResources;
    if(r?.supporterPlayedTurn!==0||r?.supporterPlayLocked===true||
       view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true||
       (view.ownPublic?.resolvingSupporter?.length??0)>0)return false;
  }
  if(proposal.kind==='bench-basic')return Number.isSafeInteger(
    proposal.benchIndex)&&view.ownPublic?.bench?.[proposal.benchIndex]===null;
  return SUPPORTER_KINDS.has(proposal.kind)||
    SEARCH_KINDS.has(proposal.kind)||
    proposal.kind==='evolve-pokemon';
}

/**
 * Preserve physical printing and target differences. Same-printing copies
 * share an action family, but the selected physical hand index is retained
 * separately in the offer and the genuine Store acceptance ledger.
 */
function duplicateProposal(a,b){
  if(samePhysicalProposal(a,b))return true;
  if(a.kind!==b.kind||a.printing!==b.printing)return false;
  if(a.kind==='pass')return true;
  if(SUPPORTER_KINDS.has(a.kind)||SEARCH_KINDS.has(a.kind))
    return a.target===b.target;
  return false;
}

/**
 * Explicit, deliberately conservative scores. A positive override exists
 * only for an immediate printed attack funded by a better Special Energy
 * before a generic Basic attachment, or for visible multi-Energy denial
 * before a non-final-prize attack. All other legal-looking offers are
 * recorded but not promoted without a stronger policy model.
 */
function scoreOffer(view,baseline,offer){
  if(offer.source==='first-return')return {score:0,reason:'control-baseline'};
  if(offer.intent.kind==='pass')return {
    score:-100,reason:'preserve-nonterminal-opportunity'};
  if(baseline.kind==='attach-basic-energy'&&
     offer.source==='immediate-special'&&
     offer.intent.kind==='attach-special-energy')
    return {score:20,reason:'fund-visible-immediate-attack'};
  if(baseline.kind==='attack'&&
     offer.intent.kind==='play-team-flare-grunt-denial'&&
     view.ownPublic?.prizeCount>1&&
     (view.opponentPublic?.active?.energies?.length??0)>=2)
    return {score:10,reason:'deny-multi-energy-before-attack'};
  return {score:-10,reason:'unverified-opportunity-cost'};
}

/**
 * @param {object} view Detached actor-owned observation.
 * @param {object} catalog Public card-printing metadata only.
 * @param {object} baseline First-return control, never dispatched beforehand.
 * @param {object} options Existing both-seat enabled selector flags.
 * @param {Array<object>} [proposers] Injected pure-test proposal definitions.
 * @returns {{intent:object,receipt:object}}
 */
function collectAndChooseOwnerRoot(view,catalog,baseline,options={},proposers=PROPOSERS){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(baseline&&typeof baseline.kind==='string');
  const offers=[{source:'first-return',intent:baseline}];
  const unsupported=[];
  const omitted=[];
  const errors=[];
  for(const p of proposers){
    if(options[p.flag]!==true){omitted.push(p.name);continue;}
    let proposed;
    try{proposed=p.propose(view,catalog,options);}
    catch(error){
      // A newly reached selector must never silently end a native match.
      // Preserve the selected baseline and diagnostic for follow-up repair.
      errors.push({selector:p.name,error:String(error)});
      continue;
    }
    if(!proposed)continue;
    if(!structurallySupported(view,proposed)){
      unsupported.push({selector:p.name,kind:proposed.kind??null});
      continue;
    }
    if(offers.some(o=>duplicateProposal(o.intent,proposed)))continue;
    offers.push({source:p.name,intent:proposed});
  }
  if(!offers.some(o=>o.intent.kind==='pass'))offers.push({
    source:'terminal-hold',intent:{kind:'pass',
      reason:'explicit-same-root-hold'}});
  const ranked=offers.map(o=>({...o,...scoreOffer(view,baseline,o)}))
    .sort((a,b)=>b.score-a.score);
  const winner=ranked[0];
  const intent=options.sameRootChoiceApply===true?winner.intent:baseline;
  const selectedSource=options.sameRootChoiceApply===true?
    winner.source:'first-return';
  const reason=options.sameRootChoiceApply===true?
    winner.reason:'observation-only';
  const receipt={
    version:VERSION,mode:options.sameRootChoiceApply===true?
      'select':'observe',
    baselineKind:baseline.kind,selectedKind:intent.kind,
    selectedSource,reason,
    changed:options.sameRootChoiceApply===true&&
      !duplicateProposal(baseline,intent),
    opportunityCount:ranked.length,
    supportedAlternativeCount:ranked.length-1,
    skippedSelectors:omitted,unsupportedSelectors:unsupported,
    selectorErrors:errors,
    offers:ranked.map(o=>({
      source:o.source,kind:o.intent.kind,
      printing:o.intent.printing??null,
      handIndex:o.intent.handIndex??null,
      attackName:o.intent.attackName??null,
      slot:o.intent.slot??(o.intent.kind==='bench-basic'?'bench':null),
      index:o.intent.index??o.intent.benchIndex??null,
      score:o.score,reason:o.reason,
      nativePlayability:'unverified'
    })),
    attackIfBaselineNotAttack:baseline.kind==='attack'?
      'baseline-only':'not-enumerated',
    publicHistoryCoverage:'unverified',
    nativeAcceptance:'unverified',
    fullyQualified:false
  };
  return {intent,receipt};
}

/** @returns {object} Bounded two-seat live root census. */
function newSameRootAudit(){
  return {version:VERSION,ownerRoots:0,changedRoots:0,
    offerRoots:0,selectorErrorRoots:0,bySeat:{
      0:{ownerRoots:0,changedRoots:0},
      1:{ownerRoots:0,changedRoots:0}},
    selectionReasons:{},samples:[],
    qualification:{ownerOnlyProposals:true,completeVocabulary:false,
      allProposalsNativeLegal:false,publicHistorySufficient:false,
      competitiveGameQualified:false}};
}

/** @param {object} audit @param {0|1} seat @param {number} turn
 *  @param {number} ordinal @param {object} receipt */
function recordSameRootAudit(audit,seat,turn,ordinal,receipt){
  assert.ok(seat===0||seat===1);
  assert.ok(Number.isSafeInteger(ordinal)&&ordinal>=1);
  audit.ownerRoots++;audit.bySeat[seat].ownerRoots++;
  if(receipt.changed){audit.changedRoots++;audit.bySeat[seat].changedRoots++;}
  if(receipt.supportedAlternativeCount>0)audit.offerRoots++;
  if(receipt.selectorErrors.length)audit.selectorErrorRoots++;
  audit.selectionReasons[receipt.reason]=
    (audit.selectionReasons[receipt.reason]??0)+1;
  if(audit.samples.length<MAX_SAMPLES&&
     (receipt.changed||receipt.supportedAlternativeCount>0||
       receipt.selectorErrors.length>0)){
    audit.samples.push({seat,globalTurn:turn,rootOrdinal:ordinal,...receipt});
  }
}

module.exports={VERSION,PROPOSERS,structurallySupported,
  duplicateProposal,scoreOffer,collectAndChooseOwnerRoot,
  newSameRootAudit,recordSameRootAudit};
