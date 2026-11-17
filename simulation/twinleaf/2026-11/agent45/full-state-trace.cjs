'use strict';

const TRACE_SCHEMA = 'twinleaf-offline-full-state-trace-v1';
const SNAPSHOT_SCHEMA = 'twinleaf-native-state-snapshot-v1';

function safeOwnData(value,key) {
  const descriptor=value && Object.getOwnPropertyDescriptor(value,key);
  return descriptor && Object.prototype.hasOwnProperty.call(descriptor,'value') ?
    descriptor.value : undefined;
}

function cardLabelForText(card) {
  if (card===null || card===undefined) return null;
  if (typeof card!=='object') return String(card);
  const fullName=safeOwnData(card,'fullName');
  if (typeof fullName==='string' && fullName) return fullName;
  const name=safeOwnData(card,'name');
  if (typeof name==='string' && name) {
    const set=safeOwnData(card,'set');
    const number=safeOwnData(card,'number');
    return typeof set==='string' && typeof number==='string' ?
      name+' ['+set+' '+number+']' : name;
  }
  const id=safeOwnData(card,'id');
  if (typeof id==='string' || typeof id==='number') return 'Card#'+String(id);
  return constructorNameOf(card);
}

function zoneCardLabelsForText(zone) {
  const cards=safeOwnData(zone,'cards');
  return Array.isArray(cards)?cards.map(cardLabelForText):[];
}

/**
 * Compact, human-readable view of every card zone plus the public board.
 * The full native state remains separately available in the machine trace.
 */
function summarizeNativeStateForText(state,publicBoard=null) {
  const nativePlayers=safeOwnData(state,'players');
  const players=Array.isArray(nativePlayers)?nativePlayers.map((player,seat)=>{
    const prizes=safeOwnData(player,'prizes');
    const board=Array.isArray(publicBoard)?publicBoard[seat]:null;
    return {
      seat,
      playerId:safeOwnData(player,'id') ?? null,
      deck:zoneCardLabelsForText(safeOwnData(player,'deck')),
      hand:zoneCardLabelsForText(safeOwnData(player,'hand')),
      discard:zoneCardLabelsForText(safeOwnData(player,'discard')),
      lostzone:zoneCardLabelsForText(safeOwnData(player,'lostzone')),
      prizes:Array.isArray(prizes)?prizes.map(zoneCardLabelsForText):[],
      active:board?.active ?? null,
      bench:board?.bench ?? [],
      stadium:zoneCardLabelsForText(safeOwnData(player,'stadium')),
      supporter:zoneCardLabelsForText(safeOwnData(player,'supporter'))
    };
  }):[];
  const nativePrompts=safeOwnData(state,'prompts');
  const unresolvedPrompts=Array.isArray(nativePrompts)?nativePrompts
    .filter(prompt=>safeOwnData(prompt,'result')===undefined)
    .map(prompt=>{
      const player=safeOwnData(prompt,'player');
      const message=safeOwnData(prompt,'message') ?? safeOwnData(prompt,'text');
      const promptCards=safeOwnData(prompt,'cards') ?? safeOwnData(prompt,'cardList');
      return {
        type:constructorNameOf(prompt),
        playerId:safeOwnData(prompt,'playerId') ?? safeOwnData(player,'id') ?? null,
        message:typeof message==='string'?message:null,
        cards:zoneCardLabelsForText(promptCards)
      };
    }):[];
  return {
    turn:safeOwnData(state,'turn') ?? null,
    phase:safeOwnData(state,'phase') ?? null,
    activePlayer:safeOwnData(state,'activePlayer') ?? null,
    winner:safeOwnData(state,'winner') ?? null,
    isSuddenDeath:safeOwnData(state,'isSuddenDeath') ?? null,
    players,
    unresolvedPrompts
  };
}

function readOwnDataProperty(value,key) {
  const descriptor=value && Object.getOwnPropertyDescriptor(value,key);
  return descriptor && Object.prototype.hasOwnProperty.call(descriptor,'value') ?
    descriptor.value : undefined;
}

function describePolicyComponent(component) {
  if (typeof component === 'function') {
    const name=readOwnDataProperty(component,'name');
    return typeof name==='string' && name ? name : 'anonymous';
  }
  if (component && typeof component === 'object') {
    const name=readOwnDataProperty(component,'name');
    if (typeof name==='string' && name) return name;
    const prototype=Object.getPrototypeOf(component);
    const descriptor=prototype?Object.getOwnPropertyDescriptor(prototype,'constructor'):null;
    const constructor=descriptor && Object.prototype.hasOwnProperty.call(descriptor,'value') ?
      descriptor.value : null;
    return typeof constructor==='function' && constructor.name ? constructor.name : 'object';
  }
  return typeof component;
}

function summarizePolicyConfiguration(optionsBySeat) {
  return (Array.isArray(optionsBySeat)?optionsBySeat:[]).map((options,seat)=>{
    const tactics=readOwnDataProperty(options,'tactics');
    const promptResolvers=readOwnDataProperty(options,'promptResolvers');
    const scores=readOwnDataProperty(options,'scores') || {};
    const arbiter=readOwnDataProperty(options,'arbiter');
    return {
      seat,
      tacticOrder:(Array.isArray(tactics)?tactics:[]).map(describePolicyComponent),
      promptResolverOrder:(Array.isArray(promptResolvers)?promptResolvers:[]).map(describePolicyComponent),
      scoreKeys:Object.keys(scores).sort(),
      arbiter:arbiter ? {
        flipMode:readOwnDataProperty(arbiter,'flipMode') ?? null,
        shuffleMode:readOwnDataProperty(arbiter,'shuffleMode') ?? null
      } : null
    };
  });
}

function constructorNameOf(value) {
  const prototype=Object.getPrototypeOf(value);
  const descriptor=prototype?Object.getOwnPropertyDescriptor(prototype,'constructor'):null;
  return descriptor && Object.prototype.hasOwnProperty.call(descriptor,'value') &&
    typeof descriptor.value==='function' && descriptor.value.name ?
      descriptor.value.name : 'Object';
}

/**
 * Convert a live Twinleaf object graph into detached, JSON-safe data.
 * Own property descriptors are inspected without invoking user-defined
 * getters. Repeated references and cycles are retained as {$ref:id};
 * functions/accessors are described, never executed. This can include
 * concealed zones and is strictly an offline diagnostic: never pass the
 * result to either player policy.
 *
 * @param {unknown} value
 * @param {{maxDepth?:number,maxNodes?:number,omitKeys?:string[]}} [options]
 */
function snapshotFullState(value, options = {}) {
  const maxDepth = Number.isSafeInteger(options.maxDepth) && options.maxDepth >= 0 ?
    options.maxDepth : 64;
  const maxNodes = Number.isSafeInteger(options.maxNodes) && options.maxNodes >= 1 ?
    options.maxNodes : 50000;
  const omitKeys = new Set(Array.isArray(options.omitKeys)?options.omitKeys:[]);
  const seen = new WeakMap();
  let nextId = 1;
  let nodeCount = 0;
  let truncated = false;

  function visit(input, depth) {
    if (input === null || typeof input === 'string' || typeof input === 'boolean')
      return input;
    if (typeof input === 'number')
      return Number.isFinite(input) ? input : {$type:'Number',value:String(input)};
    if (typeof input === 'undefined') return {$type:'Undefined'};
    if (typeof input === 'bigint') return {$type:'BigInt',value:String(input)};
    if (typeof input === 'symbol') return {$type:'Symbol',description:input.description ?? null};
    if (typeof input === 'function') return {$type:'Function',name:input.name || null};
    if (typeof input !== 'object') return String(input);

    if (seen.has(input)) return {$ref:seen.get(input)};
    if (nodeCount >= maxNodes) {
      truncated = true;
      return {$truncated:'maxNodes'};
    }
    const id = nextId++;
    nodeCount++;
    seen.set(input,id);
    if (depth > maxDepth) {
      truncated = true;
      return {$id:id,$truncated:'maxDepth'};
    }

    if (Buffer.isBuffer(input))
      return {$id:id,$type:'Buffer',encoding:'base64',value:Buffer.prototype.toString.call(input,'base64')};
    if (input instanceof Date)
      return {$id:id,$type:'Date',value:Number.isNaN(input.getTime())?null:Date.prototype.toISOString.call(input)};
    if (input instanceof RegExp)
      return {$id:id,$type:'RegExp',source:input.source,flags:input.flags};
    if (input instanceof Map)
      return {$id:id,$type:'Map',entries:[...input.entries()].map(([k,v])=>[visit(k,depth+1),visit(v,depth+1)])};
    if (input instanceof Set)
      return {$id:id,$type:'Set',values:[...input.values()].map(v=>visit(v,depth+1))};
    if (input instanceof WeakMap || input instanceof WeakSet)
      return {$id:id,$type:constructorNameOf(input),opaque:true};
    if (input instanceof ArrayBuffer)
      return {$id:id,$type:'ArrayBuffer',bytes:[...new Uint8Array(input)]};
    if (ArrayBuffer.isView(input)) {
      const bytes = new Uint8Array(input.buffer,input.byteOffset,input.byteLength);
      return {$id:id,$type:constructorNameOf(input),bytes:[...bytes],length:input.length ?? null};
    }
    if (Array.isArray(input))
      return {$id:id,$type:'Array',items:input.map(item=>visit(item,depth+1))};

    const properties = Object.create(null);
    const keys = Reflect.ownKeys(input).sort((a,b)=>String(a).localeCompare(String(b)));
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(input,key);
      if (!descriptor) continue;
      const name = typeof key === 'symbol' ? '['+String(key)+']' : key;
      if (typeof name === 'string' && omitKeys.has(name) &&
          Object.prototype.hasOwnProperty.call(descriptor,'value')) {
        properties[name] = {$type:'OmittedForTrace',itemCount:Array.isArray(descriptor.value)?descriptor.value.length:null};
      } else if (Object.prototype.hasOwnProperty.call(descriptor,'value')) {
        properties[name] = visit(descriptor.value,depth+1);
      } else {
        properties[name] = {
          $type:'Accessor',
          get:descriptor.get?.name || null,
          set:descriptor.set?.name || null
        };
      }
    }
    return {$id:id,$type:constructorNameOf(input),properties};
  }

  const snapshot = visit(value,0);
  return {
    schema:SNAPSHOT_SCHEMA,
    nodeCount,
    truncated,
    limits:{maxDepth,maxNodes},
    snapshot
  };
}

/**
 * An opt-in recorder for the existing headless Store loop. It records one
 * initial native state and one detached post-dispatch state per root action;
 * each step's beforeState points to the preceding snapshot, avoiding duplicate
 * copies. The cumulative native log is captured once at the end. Full state
 * may reveal concealed zones and must remain offline.
 */
function createFullStateTraceRecorder({label='',seed=null,limits={},policyConfiguration=[]} = {}) {
  const maxSteps=Number.isSafeInteger(limits.maxSteps)&&limits.maxSteps>=1?limits.maxSteps:512;
  const snapshotLimits={maxDepth:limits.maxDepth,maxNodes:limits.maxNodes};
  const policyConfigurationSnapshot=snapshotFullState(policyConfiguration,snapshotLimits);
  let initialState = null;
  let initialPublicBoard = null;
  let initialHumanSummary = null;
  let stepLimitExceeded=false;
  let nativeLogs = null;
  const steps = [];
  const stateLimits = {...snapshotLimits,omitKeys:['logs']};
  function captureInitial(state,publicBoard=null,humanSummary=null) {
    if (initialState !== null) throw new Error('Initial full-state snapshot already captured.');
    initialState = snapshotFullState(state,stateLimits);
    initialPublicBoard = publicBoard===null?null:snapshotFullState(publicBoard,snapshotLimits);
    initialHumanSummary = humanSummary;
  }
  function captureStep({state,action,actionOrdinal,playerSlot,playerId=null,actionType=null,turnBefore,turnAfter,
    phaseBefore=null,phaseAfter=null,publicBoard=null,humanSummary=null,pendingPrompt=null,error=null,failureStage=null} = {}) {
    if (initialState === null) captureInitial(state,publicBoard,humanSummary);
    if (steps.length >= maxSteps) {
      stepLimitExceeded=true;
      throw new Error('Full-state trace maxSteps exceeded ('+maxSteps+').');
    }
    if (!Number.isSafeInteger(actionOrdinal) || actionOrdinal < 1)
      throw new TypeError('Full-state trace actionOrdinal must be a positive integer.');
    if (actionOrdinal !== steps.length+1)
      throw new Error('Full-state trace action ordinals must be contiguous.');
    const previous = steps.length ? steps[steps.length-1].actionOrdinal : 0;
    steps.push({
      actionOrdinal,
      playerSlot:Number.isInteger(playerSlot)?playerSlot:null,
      playerId:Number.isInteger(playerId)?playerId:null,
      actionType:typeof actionType==='string'?actionType:null,
      turnBefore:Number.isFinite(turnBefore)?turnBefore:null,
      turnAfter:Number.isFinite(turnAfter)?turnAfter:null,
      phaseBefore:phaseBefore??null,
      phaseAfter:phaseAfter??null,
      beforeState:{kind:previous===0?'initial':'previous-step',actionOrdinal:previous},
      action:snapshotFullState(action,limits),
      publicBoard:publicBoard===null?null:snapshotFullState(publicBoard,snapshotLimits),
      humanSummary,
      pendingPrompt:pendingPrompt===null?null:snapshotFullState(pendingPrompt,limits),
      afterState:snapshotFullState(state,stateLimits),
      ...(error?{error:snapshotFullState({name:error.name,message:error.message,code:error.code,stack:error.stack},limits)}:{}),
      ...(failureStage?{failureStage}: {})
    });
  }
  function captureFinal(state) {
    nativeLogs=snapshotFullState(Array.isArray(state?.logs)?state.logs:[],limits);
  }
  function result() {
    return {
      schema:TRACE_SCHEMA,label,seed,
      stateVisibility:'FULL_PRIVATE_NATIVE_STATE_OFFLINE_ONLY',
      policyConfiguration:policyConfigurationSnapshot,
      maxSteps,stepLimitExceeded,
      initialState,initialPublicBoard,initialHumanSummary,
      steps:steps.slice(),
      nativeLogs,
      complete:!stepLimitExceeded && policyConfigurationSnapshot.truncated===false && initialState!==null &&
        initialState.truncated===false && nativeLogs!==null && !nativeLogs.truncated && steps.every((step,index)=>
          step.actionOrdinal===index+1 && !step.action.truncated &&
          (!step.pendingPrompt || !step.pendingPrompt.truncated) && !step.afterState.truncated &&
          (!step.error || !step.error.truncated)),
      stepCount:steps.length
    };
  }
  return {
    captureInitial,
    captureStep,
    captureFinal,
    result,
    text:()=>formatFullStateTrace(result())
  };
}

/** @param {ReturnType<ReturnType<typeof createFullStateTraceRecorder>['result']>} trace */
function formatFullStateTrace(trace) {
  const lines = [
    'TWINLEAF OFFLINE FULL-STATE TRACE ('+(trace.schema || TRACE_SCHEMA)+')',
    'label: '+(trace.label || ''),
    'seed: '+(trace.seed ?? ''),
    'visibility: '+(trace.stateVisibility || 'FULL_PRIVATE_NATIVE_STATE_OFFLINE_ONLY'),
    '=== PER-SEAT POLICY CONFIGURATION ===',
    JSON.stringify(trace.policyConfiguration,null,2),
    'complete: '+(trace.complete === true),
    'max steps: '+(trace.maxSteps ?? ''),
    'step limit exceeded: '+(trace.stepLimitExceeded === true),
    'capture error: '+(trace.captureError || ''),
    'public board summary error: '+(trace.publicBoardError || ''),
    'human summary error: '+(trace.humanSummaryError || ''),
    'steps: '+(trace.stepCount ?? trace.steps?.length ?? 0),
    '',
    '=== INITIAL HUMAN-READABLE GAME STATE ===',
    JSON.stringify(trace.initialHumanSummary,null,2),
    'Full native snapshots remain available in fullStateTrace.initialState and fullStateTrace.steps[].afterState.'
  ];
  for (const step of trace.steps || []) {
    lines.push('',
      '=== ACTION '+step.actionOrdinal+' | actor '+(step.playerId ?? '?')+' / seat '+(step.playerSlot ?? '?')+' | '+(step.actionType || 'unknown action')+' | turn '+(step.turnBefore ?? '?')+' -> '+(step.turnAfter ?? '?')+' | phase '+(step.phaseBefore ?? '?')+' -> '+(step.phaseAfter ?? '?')+' ===',
      'BEFORE STATE REFERENCE:',JSON.stringify(step.beforeState,null,2),
      'PENDING PROMPT:',JSON.stringify(step.pendingPrompt,null,2),
      'SELECTED ACTION:',JSON.stringify(step.action,null,2),
      'GAME STATE AFTER ACTION:',JSON.stringify(step.humanSummary,null,2));
    if (step.error) lines.push('DISPATCH ERROR:',JSON.stringify(step.error,null,2));
  }
  lines.push('','=== FINAL NATIVE LOGS ===',JSON.stringify(trace.nativeLogs,null,2));
  return lines.join('\n');
}

module.exports={TRACE_SCHEMA,SNAPSHOT_SCHEMA,snapshotFullState,
  summarizePolicyConfiguration,createFullStateTraceRecorder,formatFullStateTrace};
