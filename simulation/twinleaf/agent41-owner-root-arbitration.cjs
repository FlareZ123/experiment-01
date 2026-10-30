'use strict';

const assert=require('node:assert/strict');

const VERSION='agent41-owner-turnend-arbitration-v2-bench-special-or-active-denial';
const MAX_SAMPLES=40;

/**
 * Arbitrate the observed first-choice attack against a bounded owner-visible
 * nonterminal alternative. This is a deliberately small partial action chooser:
 * it does not assert native legality, optimal play, or full information safety
 * for the fallback decision engine. Only the real Store settles any selection.
 *
 * @param {object} view Detached acting-player hand, resources, public board.
 * @param {object} catalog Public printing metadata.
 * @param {object} first Existing actor-only first-return intent.
 * @param {object} options Frozen enabled policy switches.
 * @param {Function} [collect] Pure-test seam for the bounded opportunity census.
 * @returns {{intent:object,receipt:object}}
 */
function arbitrateOwnerRootIntent(view,catalog,first,options={},collect){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(first&&typeof first.kind==='string');
  const receipt={version:VERSION,baselineKind:first.kind,
    selectedKind:first.kind,reason:'preserve-first-choice',
    candidateCount:0,selectedPrinting:null,selectedTarget:null,
    nativePlayability:'unverified'};
  const specialEnabled=options.publicContextSpecialEnergy===true;
  const denialEnabled=options.beforeAttackDenialRoot===true&&
    options.teamFlareGruntDenialRoot===true;
  const eriEnabled=options.eriRevealRoot===true;
  if(first.kind!=='attack'||(!specialEnabled&&!denialEnabled&&!eriEnabled)){
    receipt.reason='outside-bounded-attack-resource-contention';
    return {intent:first,receipt};
  }
  const collector=collect??require('./agent16-owner-priority-contention.cjs')
    .collectOwnerContention;
  const offers=collector(view,catalog,options,first).alternatives??[];
  const matching=specialEnabled?offers.filter(x=>
    x.probe==='public-special-energy'&&
    x.kind==='attach-special-energy'&&x.slot==='bench'):[];
  const denials=denialEnabled?offers.filter(x=>
    x.probe==='team-flare-grunt'&&
    x.kind==='play-team-flare-grunt-denial'):[];
  const eri=eriEnabled?require('./agent50-eri-revealed-item-prompt.cjs')
    .offerEriBeforeAttack(view,first):null;
  receipt.candidateCount=matching.length+denials.length+(eri?1:0);
  if(receipt.candidateCount===0){
    receipt.reason=denialEnabled?'no-supported-attack-resource-offer':
      eriEnabled?'no-supported-eri-reveal-offer':
      'no-supported-bench-special-offer';
    return {intent:first,receipt};
  }
  // Never spend a bounded resource instead of a possible final-Prize attack.
  // This is a tactical hold even when a nonterminal action looks plausible.
  if(view.ownPublic?.prizeCount===1){
    receipt.reason='potential-last-prize-attack';
    return {intent:first,receipt};
  }
  if(options.protectPotentialPrintedPrizeAttack===true){
    const {VERSION:vetoVersion,potentialPrintedPrizeFinisher}=
      require('./agent42-visible-printed-prize-finisher.cjs');
    const opportunity=potentialPrintedPrizeFinisher(view,first,catalog);
    if(opportunity.protect){
      receipt.version=VERSION+'+'+vetoVersion;
      receipt.reason=opportunity.reason;
      receipt.potentialTerminalAttack={
        opponentPrinting:opportunity.opponentPrinting,
        printedDamage:opportunity.printedDamage,
        opponentRemainingHp:opportunity.opponentRemainingHp,
        printedPrizeAward:opportunity.award
      };
      return {intent:first,receipt};
    }
  }
  if(options.protectPotentialTwoPrizeAttack===true){
    const {VERSION:vetoVersion,potentialTwoPrizeAttackVeto}=
      require('./agent35-potential-two-prize-attack-veto.cjs');
    const opportunity=potentialTwoPrizeAttackVeto(view,first);
    if(opportunity.protect){
      receipt.version=VERSION+'+'+vetoVersion;
      receipt.reason=opportunity.reason;
      receipt.potentialTerminalAttack={
        opponentPrinting:opportunity.opponentPrinting,
        printedDamage:opportunity.printedDamage,
        opponentRemainingHp:opportunity.opponentRemainingHp
      };
      return {intent:first,receipt};
    }
  }
  const r=view.ownTurnResources;
  if(matching.length>0){
    if(r?.energyPlayLocked===true||r?.specialEnergyPlayLocked===true||
        r?.energyPlayedTurn===view.globalTurn){
      receipt.reason='energy-quota-or-lock';
    }else{
      const good=matching.find(x=>
        Number.isInteger(x.handIndex)&&x.handIndex>=0&&
        view.ownHand?.[x.handIndex]===x.printing&&
        Number.isInteger(x.index)&&x.index>=0&&
        view.ownPublic?.bench?.[x.index]&&
        Array.isArray(view.ownPublic.bench[x.index].attacks)&&
        view.ownPublic.bench[x.index].attacks.length>0);
      if(good){
        const intent={kind:'attach-special-energy',
          printing:good.printing,handIndex:good.handIndex,
          slot:'bench',index:good.index};
        receipt.selectedKind=intent.kind;
        receipt.selectedPrinting=intent.printing;
        const target=view.ownPublic.bench[intent.index];
        receipt.selectedTarget={slot:intent.slot,index:intent.index,
          pokemonPrinting:typeof target.printing==='string'?target.printing:null,
          pokemonName:typeof target.name==='string'?target.name:null};
        receipt.reason='fund-public-bench-attack-before-turn-ending-root';
        return {intent,receipt};
      }
      receipt.reason='unmatched-physical-owner-target';
    }
  }
  if(denials.length>0){
    // Team Flare Grunt's verified printed effect targets the opponent's
    // Active Energy. Require a visible multi-Energy investment before
    // interrupting an available attack. This is a conservative heuristic,
    // never a settled strategic win or a native legality certificate.
    const target=view.opponentPublic?.active;
    if(!Array.isArray(target?.energies)||target.energies.length<2){
      receipt.reason='no-multi-energy-opponent-active';
    }else if(r?.supporterPlayedTurn!==0||
        r?.supporterPlayLocked===true||
        view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true||
        (view.ownPublic?.resolvingSupporter?.length??0)>0){
      receipt.reason='supporter-quota-or-lock';
    }else{
      const good=denials.find(x=>
        Number.isInteger(x.handIndex)&&x.handIndex>=0&&
        view.ownHand?.[x.handIndex]===x.printing&&
        x.printing==='Team Flare Grunt XY');
      if(good){
        const intent={kind:'play-team-flare-grunt-denial',
          printing:good.printing,handIndex:good.handIndex};
        receipt.selectedKind=intent.kind;
        receipt.selectedPrinting=intent.printing;
        receipt.selectedTarget={slot:'opponent-active',index:0,
          pokemonPrinting:target.printing??null,
          pokemonName:target.name??null};
        receipt.reason='deny-visible-active-energy-before-turn-ending-attack';
        return {intent,receipt};
      }
      receipt.reason='unmatched-physical-owner-supporter';
    }
  }
  if(eri){
    // Only now compare the optional, uncertain Eri hand-reveal Supporter
    // against the already considered concrete Bench funding and visible
    // opposing Active Energy denial. A large opposing hand gives no evidence
    // of actual Item identities before Eri is accepted and reveals them.
    receipt.version=VERSION+'+'+
      require('./agent50-eri-revealed-item-prompt.cjs').VERSION;
    receipt.selectedKind=eri.kind;
    receipt.selectedPrinting=eri.printing;
    receipt.selectedTarget={slot:'opponent-hand',index:0,
      publiclyKnownCount:eri.opponentPublicHandCount};
    receipt.reason='possible-item-denial-before-payable-attack';
    return {intent:eri,receipt};
  }
  return {intent:first,receipt};
}

/** @returns {object} Bounded, postgame redacted chooser diagnostics. */
function newOwnerArbitrationAudit(){
  return {version:VERSION,ownerRoots:0,changedRoots:0,
    bySeat:{0:{ownerRoots:0,changedRoots:0},
      1:{ownerRoots:0,changedRoots:0}},reasons:{},samples:[],
    nativeLegality:'requires separate Store accepted/effect witness',
    scope:'Owner-visible opt-in attack-versus-Bench-Special-or-active-Energy-denial policy'};
}

/**
 * @param {object} audit Mutable diagnostics, not decision input.
 * @param {0|1} seat Real physical actor seat.
 * @param {number} turn Current turn.
 * @param {object} receipt Pure chooser receipt.
 * @param {number|null} [rootOrdinal] Monotone root-selection identity, if known.
 */
function recordOwnerArbitration(audit,seat,turn,receipt,rootOrdinal=null){
  assert.ok(seat===0||seat===1);
  assert.ok(rootOrdinal===null||
    (Number.isSafeInteger(rootOrdinal)&&rootOrdinal>=1));
  const changed=receipt.baselineKind!==receipt.selectedKind;
  audit.ownerRoots++;
  audit.bySeat[seat].ownerRoots++;
  if(changed){audit.changedRoots++;audit.bySeat[seat].changedRoots++;}
  audit.reasons[receipt.reason]=(audit.reasons[receipt.reason]??0)+1;
  if(audit.samples.length<MAX_SAMPLES&&
      (changed||receipt.candidateCount>0)){
    audit.samples.push({seat,globalTurn:turn,
      ...(rootOrdinal===null?{}:{rootOrdinal}),
      baselineKind:receipt.baselineKind,selectedKind:receipt.selectedKind,
      reason:receipt.reason,offerCount:receipt.candidateCount,
      selectedPrinting:receipt.selectedPrinting,
      selectedTarget:receipt.selectedTarget,
      nativePlayability:'unverified'});
  }
}

module.exports={VERSION,arbitrateOwnerRootIntent,
  newOwnerArbitrationAudit,recordOwnerArbitration};
