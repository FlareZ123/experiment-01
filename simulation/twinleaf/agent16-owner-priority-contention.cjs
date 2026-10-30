'use strict';

const assert=require('node:assert/strict');

const VERSION='agent16-owner-priority-contention-census-v3-branch-order-and-self-filter';

// These ranks mirror the existing first-return order in
// agent34-actor-only-root-policy.cjs. This is a partial vocabulary,
// deliberately not an exhaustive legal-action generator.
const PRIORITY=Object.freeze({
  'bench-basic':0,'evolve-pokemon':1,'play-quick-ball':2,
  'attach-emergency-floatstone':3,'retreat-emergency-floatstone':3,
  'equip-powerglass':4,'play-thunder-mountain':5,'attach-dce':5,
  'perfection-transition':6,'attach-basic-energy':7,
  'play-lowhand-lillie':8,'play-conservative-shuffle-supporter':9,
  'play-seeker-get-lillie':10,'play-seeker-recovered-lillie':10,
  'play-carmine-first':11,'paid-retreat':12,
  'attack':14,'perfection':15,'attach-special-energy':16,
  'play-held-guzma-mobility':17,'play-stranded-marnie':18,
  'play-team-flare-grunt-denial':19,'pass':20
});

const PROBES=Object.freeze([
  {flag:'lowHandLillieRoot',order:8,name:'low-hand-lillie',
    load:()=>require('./agent25-lowhand-lillie-frontier.cjs')
      .chooseLowHandLillieBeforeAttack},
  {flag:'conservativeShuffleBeforeAttack',order:9,name:'shuffle-supporter',
    load:()=>view=>{
      const choice=require('./agent2-conservative-shuffle-supporter.cjs')
        .chooseConservativeShuffleSupporter(view);
      return choice?{...choice,kind:'play-conservative-shuffle-supporter'}:null;
    }},
  {flag:'seekerLillieRoot',order:10,name:'vs-seeker-lillie',
    load:()=>require('./agent48-owner-vs-seeker-lillie.cjs')
      .chooseSeekerLillieRoot},
  {flag:'carmineFirstRoot',order:11,name:'carmine',
    load:()=>require('./agent48-conservative-first-carmine.cjs')
      .chooseConservativeFirstCarmine},
  {flag:'raichuKoBreakpointBeforeAttack',order:14,name:'raichu-current-attack',
    load:()=> (view,catalog,options)=>{
      if(view.ownPublic?.active?.printing!=='Alolan Raichu UNM')return null;
      const remaining=require('./agent34-actor-only-root-policy.cjs')
        .chooseActorRootIntent(view,catalog,{
          ...options,raichuKoBreakpointBeforeAttack:false});
      return remaining.kind==='attack'?remaining:null;
    }},
  {flag:'publicContextSpecialEnergy',order:16,name:'public-special-energy',
    load:()=>require('./agent17-public-context-special-energy.cjs')
      .choosePublicContextSpecialEnergy},
  {flag:'specialEnergyRoot',order:16,name:'numeric-special-energy',
    load:()=>require('./agent3-special-energy-frontier.cjs')
      .chooseSpecialEnergyIntent},
  {flag:'heldGuzmaMobility',order:17,name:'held-guzma',
    load:()=>require('./agent2-held-guzma-mobility-frontier.cjs')
      .chooseHeldGuzmaMobility},
  {flag:'strandedMarnieRoot',order:18,name:'stranded-marnie',
    load:()=>require('./agent50-stranded-marnie-frontier.cjs')
      .chooseStrandedMarnie},
  {flag:'teamFlareGruntDenialRoot',order:19,name:'team-flare-grunt',
    load:()=>require('./agent1-owner-team-flare-grunt-denial.cjs')
      .chooseTeamFlareGruntDenial}
]);

const SUPPORTER_KINDS=new Set([
  'play-lowhand-lillie','play-conservative-shuffle-supporter',
  'play-seeker-recovered-lillie','play-carmine-first',
  'play-held-guzma-mobility','play-stranded-marnie',
  'play-team-flare-grunt-denial'
]);
const ENERGY_KINDS=new Set([
  'attach-basic-energy','attach-special-energy','attach-dce'
]);

function contentionReason(selectedKind,alternativeKind){
  if(selectedKind==='attack'||selectedKind==='pass')
    return 'turn-ending-selection';
  if(ENERGY_KINDS.has(selectedKind)&&ENERGY_KINDS.has(alternativeKind))
    return 'same-turn-energy-attachment';
  if(SUPPORTER_KINDS.has(selectedKind)&&
      SUPPORTER_KINDS.has(alternativeKind))
    return 'same-turn-supporter-quota';
  return 'later-root-may-recover';
}

/**
 * Diagnostic potential action set at the SAME owner-root view. The genuine
 * Store is not probed. Printed card targets, locks and all other feasibility
 * checks remain the responsibility of the native action dispatcher.
 * @param {object} view Detached current owner's own hand/public board.
 * @param {object} catalog Public printing and type catalog.
 * @param {object} options The exact enabled root options.
 * @param {object} selected Original first-match chosen intent.
 * @param {Array<object>} [probes] Injection for pure regressions.
 * @returns {object} Bounded partial alternative vocabulary, no hidden zones.
 */
function actualSelectedPriority(view,catalog,options,selected){
  const baseline=PRIORITY[selected.kind];
  if(selected.kind!=='attach-special-energy'||
     options.raichuKoBreakpointBeforeAttack!==true||
     options.publicContextSpecialEnergy!==true||
     view.ownPublic?.active?.printing!=='Alolan Raichu UNM')return baseline;
  const early=require('./agent10-raichu-damage-breakpoint-before-attack.cjs')
    .chooseRaichuPrintedKnockoutAttachment(view,catalog);
  if(early&&['handIndex','printing','slot','index']
      .every(key=>early[key]===selected[key]))return 13;
  return baseline;
}

/**
 * A branch can select a printing already obtained by a later generic
 * probe. Duplicate printings from different private hand positions still
 * represent the same printed action and target for contention purposes.
 * @param {object} selected Original first-choice intent.
 * @param {object} proposed Later pure selector's output.
 * @returns {boolean}
 */
function samePhysicalProposal(selected,proposed){
  return selected.kind===proposed.kind&&
    typeof selected.printing==='string'&&selected.printing.length>0&&
    selected.printing===proposed.printing&&
    selected.slot===proposed.slot&&selected.index===proposed.index;
}

function collectOwnerContention(view,catalog,options,selected,probes=PROBES){
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(selected&&typeof selected.kind==='string');
  const selectedPriority=actualSelectedPriority(view,catalog,options,selected);
  if(!Number.isInteger(selectedPriority))
    return {selectedKind:selected.kind,unknownPriority:true,alternatives:[]};
  const alternatives=[];
  for(const p of probes){
    if(options[p.flag]!==true||p.order<=selectedPriority)continue;
    if((p.flag==='specialEnergyRoot'||
        p.flag==='publicContextSpecialEnergy')&&(
      !view.ownPublic?.active||
      view.ownTurnResources?.energyPlayLocked!==false||
      view.ownTurnResources?.specialEnergyPlayLocked===true||
      view.ownTurnResources?.energyPlayedTurn===view.globalTurn
    ))continue;
    const proposed=p.load()(view,catalog,options);
    if(!proposed||samePhysicalProposal(selected,proposed))continue;
    // Some selectors share one intent kind. Do not double-count a physical
    // action identified by identical printing, recipient and card index.
    const duplicate=alternatives.some(a=>a.kind===proposed.kind&&
      a.printing===proposed.printing&&a.handIndex===proposed.handIndex&&
      a.slot===proposed.slot&&a.index===proposed.index);
    if(duplicate)continue;
    alternatives.push({
      probe:p.name,kind:proposed.kind,
      // Hand index is actor-private evidence, NEVER a card from unknown
      // deck order, Prize identities, or the opponent's concealed zones.
      printing:proposed.printing??null,
      handIndex:proposed.handIndex??null,
      slot:proposed.slot??null,index:proposed.index??null,
      reason:contentionReason(selected.kind,proposed.kind),
      nativePlayability:'unverified'
    });
  }
  return {selectedKind:selected.kind,selectedPriority,
    unknownPriority:false,alternatives};
}

/**
 * Aggregate owner-root potential choices without leaking the full hand or
 * adding an unbounded audit archive. The source's unmodified root still wins.
 */
function recordOwnerContention(audit,seat,globalTurn,receipt){
  audit.ownerRoots++;
  if(receipt.unknownPriority)audit.unknownPriorityRoots++;
  if(receipt.alternatives.length>0)audit.contentionRoots++;
  for(const alt of receipt.alternatives){
    const label=receipt.selectedKind+' > '+alt.kind;
    audit.pairs[label]=(audit.pairs[label]??0)+1;
    audit.reasons[alt.reason]=(audit.reasons[alt.reason]??0)+1;
    if(audit.samples.length<40)audit.samples.push({
      seat,globalTurn,selectedKind:receipt.selectedKind,
      probe:alt.probe,alternativeKind:alt.kind,
      printing:alt.printing,slot:alt.slot,index:alt.index,
      reason:alt.reason,nativePlayability:'unverified'
    });
  }
}

function newOwnerContentionAudit(){
  return {version:VERSION,ownerRoots:0,unknownPriorityRoots:0,
    contentionRoots:0,pairs:{},reasons:{},samples:[],
    scope:'Partial enabled-option same-root heuristic offers; no native legality or counterfactual outcome'};
}

module.exports={VERSION,PRIORITY,actualSelectedPriority,samePhysicalProposal,
  collectOwnerContention,
  contentionReason,recordOwnerContention,newOwnerContentionAudit};
