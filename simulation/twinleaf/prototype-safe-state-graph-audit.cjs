'use strict';

const path = require('node:path');
const {preparedRegidrago} = require('./apex-attack-action.cjs');
const {installPrototypeSafeSimulatorHook} =
  require('./prototype-safe-simulator-hook.cjs');
const {installPostSuperAliasRepairHook} =
  require('./post-super-alias-repair-hook.cjs');

const output = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Identify the real class prototype without reading instance properties or
 * invoking getters on card/template objects.
 * @param {object} value
 * @returns {Function|null}
 */
function inheritedClassConstructor(value) {
  let proto=Object.getPrototypeOf(value);
  while(proto!==null) {
    const descriptor=Object.getOwnPropertyDescriptor(proto,'constructor');
    if(descriptor && Object.hasOwn(descriptor,'value') &&
       typeof descriptor.value==='function' &&
       descriptor.value.prototype===proto) return descriptor.value;
    proto=Object.getPrototypeOf(proto);
  }
  return null;
}

/**
 * Audit reference topology, array sizes, and primitive own-field values
 * in a real Store state. Walk only own enumerable data, as pinned deepClone does.
 *
 * @param {object} source Original Store state.
 * @param {object} detached Cloned State under investigation.
 * @returns {object} Local alias/noninterference observations.
 */
function compareOwnedStateGraph(source, detached) {
  const seen = new WeakMap();
  const unexpected = {sharedReferences:[], repeatedArrayBreaks:[],
    repeatedObjectBreaks:[], sourcePrototypeAliases:[], missingProperties:[],
    valueMismatches:[], arrayLengthMismatches:[],
    classPrototypeMismatches:[], indirectInstancePrototypes:[]};
  let nodes = 0;
  let arrays = 0;
  /** @param {any} original @param {any} cloned @param {string} location */
  function walk(original,cloned,location) {
    if (original === null || typeof original !== 'object') {
      if (!Object.is(original,cloned)) {
        unexpected.valueMismatches.push(location);
      }
      return;
    }
    if (cloned === null || typeof cloned !== 'object') {
      unexpected.missingProperties.push(location+' (object became primitive)');
      return;
    }
    if (original === cloned) {
      unexpected.sharedReferences.push(location);
    }
    const originalClass=inheritedClassConstructor(original);
    if (originalClass!==inheritedClassConstructor(cloned)) {
      unexpected.classPrototypeMismatches.push(location);
    }
    // Constructor identity cannot detect an inherited intermediate instance
    // introduced during the pinned Simulator's second clone pass.
    if (originalClass &&
        Object.getPrototypeOf(cloned)!==originalClass.prototype) {
      unexpected.indirectInstancePrototypes.push(location);
    }
    if (Array.isArray(original) &&
        (!Array.isArray(cloned) || original.length !== cloned.length)) {
      unexpected.arrayLengthMismatches.push(location);
    }
    const previously = seen.get(original);
    if (previously) {
      if (previously.clone !== cloned) {
        const kind=Array.isArray(original) ?
          'repeatedArrayBreaks':'repeatedObjectBreaks';
        unexpected[kind].push(previously.path+' / '+location);
      }
      return;
    }
    seen.set(original,{clone:cloned,path:location});
    nodes++;
    if (Array.isArray(original)) arrays++;
    if (Object.getPrototypeOf(cloned) === original) {
      unexpected.sourcePrototypeAliases.push(location);
    }
    for(const key of Object.keys(original)) {
      const nested=location+'.'+key;
      if (!Object.prototype.hasOwnProperty.call(cloned,key)) {
        unexpected.missingProperties.push(nested);
      } else {
        walk(original[key],cloned[key],nested);
      }
    }
  }
  walk(source,detached,'state');
  const failures=Object.fromEntries(Object.entries(unexpected).map(([key,paths])=>
    [key,{count:paths.length,examples:paths.slice(0,12)}]));
  return {sourceObjectNodes:nodes,sourceArrayNodes:arrays,...failures};
}

/**
 * @param {object} state The unmodified Store state for one observation.
 * @returns {{pinned:object,prototypeSafe:object}}
 */
function auditSimulatorProfiles(state) {
  const {Simulator}=engine('game/bots/simulator');
  const pinned=compareOwnedStateGraph(state,new Simulator(state).store.state);
  const restore=installPrototypeSafeSimulatorHook();
  let prototypeSafe;
  try {
    const {Simulator:SafeSimulator}=engine('game/bots/simulator');
    prototypeSafe=compareOwnedStateGraph(state,
      new SafeSimulator(state).store.state);
  } finally {
    restore();
  }
  const restorePostSuper=installPostSuperAliasRepairHook();
  let postSuperRepair;
  try {
    const {Simulator:ReconciledSimulator}=engine('game/bots/simulator');
    postSuperRepair=compareOwnedStateGraph(state,
      new ReconciledSimulator(state).store.state);
  } finally {
    restorePostSuper();
  }
  return {pinned,prototypeSafe,postSuperRepair};
}

/** @returns {object} */
function characterizePrototypeSafeStateGraph() {
  const f=preparedRegidrago();
  const baseline=auditSimulatorProfiles(f.state);
  const {preparedToolAttack} =
    require('./tm-attack-policy-characterization.cjs');
  const tool=preparedToolAttack();
  const toolReady=auditSimulatorProfiles(tool.store.state);
  const {AttackAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  tool.store.dispatch(new AttackAction(tool.attacker.id,'Crisis Punch'));
  let waits=0;
  while(true){
    const pending=tool.store.state.prompts.find(p=>p.result===undefined);
    if(!pending)break;
    if(pending.constructor.name!=='WaitPrompt') {
      throw new Error('Unexpected post-attack prompt: '+pending.constructor.name);
    }
    tool.store.dispatch(new ResolvePromptAction(pending.id,null));
    waits++;
    if(waits>12)throw new Error('Too many post-attack prompts');
  }
  const toolAfter=auditSimulatorProfiles(tool.store.state);
  const {deepClone}=engine('utils');
  const shared=[{value:1}];
  const repeated={left:shared,right:shared};
  const dup=deepClone(repeated);
  return {
    evidenceClass:'pinned-source-Store-clone-reference-graph',
    pinnedRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fixture:'preparedRegidrago staged Store state',
    pinned:baseline.pinned,
    prototypeSafe:baseline.prototypeSafe,
    additionalStateProfiles: {
      crisisPunchReady:toolReady,
      crisisPunchAfterRealAttack:{
        promptWaits:waits,
        defendingBoardDamage:tool.defender.active.damage,
        profiles:toolAfter
      }
    },
    syntheticRepeatedArrayAliasPreserved:dup.left===dup.right,
    caution:'Own-data identity checks are necessary but do not certify reducer, Ability, hidden-information or full-game fidelity.'
  };
}

if(require.main === module) {
  process.stdout.write(JSON.stringify(characterizePrototypeSafeStateGraph(),null,2)+'\n');
}

module.exports={compareOwnedStateGraph,auditSimulatorProfiles,characterizePrototypeSafeStateGraph};
