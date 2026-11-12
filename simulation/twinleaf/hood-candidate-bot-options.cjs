'use strict';

const {hoodAwareArvenResolverClass} =
  require('./hood-aware-arven-resolver.cjs');
const {hoodAwareAttachToolTacticClass} =
  require('./hood-aware-attach-tool-tactic.cjs');

function replaceClass(list,base,replacement,label) {
  if(!Array.isArray(list))throw new TypeError(label+' options must be an array');
  if(list.includes(replacement))return list;
  const index=list.indexOf(base);
  if(index<0)throw new Error('Pinned '+label+' missing from candidate bot options');
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
 * Optional factories make the class replacement contract testable without
 * loading the pinned Twinleaf build. Native callers should omit them.
 *
 * @param {object} options Candidate seat's SimpleTacticsAi options.
 * @param {object} [factories] Optional injected replacement classes.
 * @returns {object} New options object with candidate-only resolver/tactic.
 */
function withHoodCandidateBotOptions(options,factories={}) {
  if(!options||typeof options!=='object') {
    throw new TypeError('candidate bot options are required');
  }
  factories=factories??{};
  const HoodAwareArvenResolver=factories.HoodAwareArvenResolver??
    hoodAwareArvenResolverClass();
  const HoodAwareAttachToolTactic=factories.HoodAwareAttachToolTactic??
    hoodAwareAttachToolTacticClass();
  if(typeof HoodAwareArvenResolver!=='function'||
     typeof HoodAwareAttachToolTactic!=='function') {
    throw new TypeError('Hood resolver and tactic constructors are required');
  }
  const ChooseCardsPromptResolver=Object.getPrototypeOf(HoodAwareArvenResolver);
  const AttachToolTactic=Object.getPrototypeOf(HoodAwareAttachToolTactic);
  if(typeof ChooseCardsPromptResolver!=='function'||
     typeof AttachToolTactic!=='function') {
    throw new TypeError('Hood replacements must extend pinned base classes');
  }
  const promptResolvers=replaceClass(options.promptResolvers,
    ChooseCardsPromptResolver,HoodAwareArvenResolver,'ChooseCardsPromptResolver');
  const tactics=replaceClass(options.tactics,
    AttachToolTactic,HoodAwareAttachToolTactic,'AttachToolTactic');
  return {...options,promptResolvers,tactics};
}

module.exports={withHoodCandidateBotOptions};
