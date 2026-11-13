'use strict';

const {hoodAwareArvenResolverClass} =
  require('./hood-aware-arven-resolver.cjs');
const {hoodAwareAttachToolTacticClass} =
  require('./hood-aware-attach-tool-tactic.cjs');
const {hoodAwareMaxGeistRetreatTacticClass} =
  require('./hood-aware-max-geist-retreat-tactic.cjs');

function currentClassEntry(list,nativeBase,policyName,label) {
  if(!Array.isArray(list))throw new TypeError(label+' options must be an array');
  const installed=list.findIndex(item=>item?.name===policyName);
  if(installed>=0)return {index:installed,current:list[installed],installed:true};
  const index=list.findIndex(item=>typeof item==='function'&&
    (item===nativeBase||item.prototype instanceof nativeBase));
  if(index<0)throw new Error('Pinned '+label+' missing from candidate bot options');
  return {index,current:list[index],installed:false};
}

function replaceAt(list,index,replacement) {
  const next=[...list];
  next[index]=replacement;
  return next;
}

/**
 * Install Hood-specific Arven, Tool, and attack-conversion tactics into one
 * seat's bot options. The caller must pass a candidate-owned options object;
 * this function never mutates the supplied object or its arrays, so the
 * opponent can retain the baseline definitions.
 *
 * It wraps the currently installed resolver/tactic subclass when another
 * candidate policy already replaced the native base class. This preserves
 * earlier opening/search, Tool, and retreat behavior through super calls.
 *
 * Optional class factories make the replacement contract testable without
 * loading the pinned Twinleaf build. Native callers should omit them.
 *
 * @param {object} options Candidate seat's SimpleTacticsAi options.
 * @param {object} [factories] Optional resolver/tactic class factories.
 * @returns {object} New options object with candidate-only resolver/tactics.
 */
function withHoodCandidateBotOptions(options,factories={}) {
  if(!options||typeof options!=='object') {
    throw new TypeError('candidate bot options are required');
  }
  factories=factories??{};
  const makeResolver=factories.hoodAwareArvenResolverClass??
    hoodAwareArvenResolverClass;
  const makeAttachTactic=factories.hoodAwareAttachToolTacticClass??
    hoodAwareAttachToolTacticClass;
  const makeRetreatTactic=factories.hoodAwareMaxGeistRetreatTacticClass??
    hoodAwareMaxGeistRetreatTacticClass;

  const resolverProbe=makeResolver();
  const nativeResolverBase=Object.getPrototypeOf(resolverProbe);
  if(typeof nativeResolverBase!=='function') {
    throw new TypeError('Hood resolver must extend the pinned ChooseCardsPromptResolver');
  }
  const resolverEntry=currentClassEntry(options.promptResolvers,
    nativeResolverBase,'HoodAwareArvenResolver','ChooseCardsPromptResolver');
  const HoodAwareArvenResolver=resolverEntry.installed?
    resolverEntry.current:makeResolver(resolverEntry.current);
  const promptResolvers=resolverEntry.installed?
    options.promptResolvers:
    replaceAt(options.promptResolvers,resolverEntry.index,HoodAwareArvenResolver);

  const attachProbe=makeAttachTactic();
  const nativeAttachBase=Object.getPrototypeOf(attachProbe);
  if(typeof nativeAttachBase!=='function') {
    throw new TypeError('Hood tactic must extend the pinned AttachToolTactic');
  }
  const attachEntry=currentClassEntry(options.tactics,
    nativeAttachBase,'HoodAwareAttachToolTactic','AttachToolTactic');
  const HoodAwareAttachToolTactic=attachEntry.installed?
    attachEntry.current:makeAttachTactic(attachEntry.current);

  const retreatProbe=makeRetreatTactic();
  const nativeRetreatBase=Object.getPrototypeOf(retreatProbe);
  if(typeof nativeRetreatBase!=='function') {
    throw new TypeError('Hood retreat tactic must extend the pinned RetreatTactic');
  }
  const retreatEntry=currentClassEntry(options.tactics,
    nativeRetreatBase,'HoodMaxGeistRetreatTactic','RetreatTactic');
  const HoodMaxGeistRetreatTactic=retreatEntry.installed?
    retreatEntry.current:makeRetreatTactic(retreatEntry.current);

  let tactics=options.tactics;
  if(!attachEntry.installed) {
    tactics=replaceAt(tactics,attachEntry.index,HoodAwareAttachToolTactic);
  }
  if(!retreatEntry.installed) {
    tactics=replaceAt(tactics,retreatEntry.index,HoodMaxGeistRetreatTactic);
  }

  return {...options,promptResolvers,tactics};
}

/**
 * Build independent seat-ordered options and install Hood policy on candidate
 * seat only. The returned opponent options retain the exact baseline classes.
 *
 * @param {object} baseOptions Shared immutable baseline options.
 * @param {0|1} candidateSeat Physical candidate seat.
 * @param {object} [factories] Optional resolver/tactic class factories.
 * @returns {[object,object]} Distinct options objects in physical seat order.
 */
function withHoodCandidateBotOptionsBySeat(baseOptions,candidateSeat,factories={}) {
  if(candidateSeat!==0&&candidateSeat!==1) {
    throw new RangeError('candidateSeat must be physical seat 0 or 1');
  }
  if(!baseOptions||typeof baseOptions!=='object') {
    throw new TypeError('baseline bot options are required');
  }
  const clone=()=>({
    ...baseOptions,
    promptResolvers:[...(baseOptions.promptResolvers??[])],
    tactics:[...(baseOptions.tactics??[])],
    ...(Array.isArray(baseOptions.scores)?{scores:[...baseOptions.scores]}:{})
  });
  const bySeat=[clone(),clone()];
  bySeat[candidateSeat]=withHoodCandidateBotOptions(bySeat[candidateSeat],factories);
  return bySeat;
}

module.exports={withHoodCandidateBotOptions,withHoodCandidateBotOptionsBySeat};
