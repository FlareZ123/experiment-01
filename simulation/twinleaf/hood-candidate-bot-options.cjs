'use strict';

const {hoodAwareArvenResolverClass} =
  require('./hood-aware-arven-resolver.cjs');
const {hoodAwareAttachToolTacticClass} =
  require('./hood-aware-attach-tool-tactic.cjs');

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
 * Install Hood-specific Arven and Tool tactics into one seat's bot options.
 * The caller must pass a candidate-owned options object; this function never
 * mutates the supplied object or its arrays, so the opponent can retain the
 * baseline definitions.
 *
 * It wraps the currently installed resolver/tactic subclass when another
 * candidate policy already replaced the native base class. This preserves
 * earlier opening/search and Tool-tactic behavior through super calls.
 *
 * Optional class factories make the replacement contract testable without
 * loading the pinned Twinleaf build. Native callers should omit them.
 *
 * @param {object} options Candidate seat's SimpleTacticsAi options.
 * @param {object} [factories] Optional resolver/tactic class factories.
 * @returns {object} New options object with candidate-only resolver/tactic.
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

  const tacticProbe=makeAttachTactic();
  const nativeTacticBase=Object.getPrototypeOf(tacticProbe);
  if(typeof nativeTacticBase!=='function') {
    throw new TypeError('Hood tactic must extend the pinned AttachToolTactic');
  }
  const tacticEntry=currentClassEntry(options.tactics,
    nativeTacticBase,'HoodAwareAttachToolTactic','AttachToolTactic');
  const HoodAwareAttachToolTactic=tacticEntry.installed?
    tacticEntry.current:makeAttachTactic(tacticEntry.current);
  const tactics=tacticEntry.installed?
    options.tactics:
    replaceAt(options.tactics,tacticEntry.index,HoodAwareAttachToolTactic);

  return {...options,promptResolvers,tactics};
}

module.exports={withHoodCandidateBotOptions};
