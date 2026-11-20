'use strict';

const TRACE_SCHEMA = 'twinleaf-offline-full-state-trace-v1';
const SNAPSHOT_SCHEMA = 'twinleaf-native-state-snapshot-v1';
const MAP_ENTRIES = Map.prototype.entries;
const SET_VALUES = Set.prototype.values;
const REGEXP_SOURCE_GETTER = Object.getOwnPropertyDescriptor(RegExp.prototype,'source')?.get;
const REGEXP_FLAG_GETTERS = [
  {flag:'d',get:Object.getOwnPropertyDescriptor(RegExp.prototype,'hasIndices')?.get},
  {flag:'g',get:Object.getOwnPropertyDescriptor(RegExp.prototype,'global')?.get},
  {flag:'i',get:Object.getOwnPropertyDescriptor(RegExp.prototype,'ignoreCase')?.get},
  {flag:'m',get:Object.getOwnPropertyDescriptor(RegExp.prototype,'multiline')?.get},
  {flag:'s',get:Object.getOwnPropertyDescriptor(RegExp.prototype,'dotAll')?.get},
  {flag:'u',get:Object.getOwnPropertyDescriptor(RegExp.prototype,'unicode')?.get},
  {flag:'v',get:Object.getOwnPropertyDescriptor(RegExp.prototype,'unicodeSets')?.get},
  {flag:'y',get:Object.getOwnPropertyDescriptor(RegExp.prototype,'sticky')?.get}
];

function safeDataProperty(value,key) {
  let current=value;
  while(current && (typeof current==='object' || typeof current==='function')) {
    const descriptor=Object.getOwnPropertyDescriptor(current,key);
    if(descriptor) return Object.prototype.hasOwnProperty.call(descriptor,'value') ?
      descriptor.value : undefined;
    current=Object.getPrototypeOf(current);
  }
  return undefined;
}

function safeErrorSummary(error) {
  const name=safeDataProperty(error,'name');
  const message=safeDataProperty(error,'message');
  const code=safeDataProperty(error,'code');
  return {
    name:typeof name==='string'&&name?name:'Error',
    message:typeof message==='string'?message:
      (typeof error==='string'?error:'Error details unavailable'),
    code:typeof code==='string'?code:null
  };
}

function formatTraceError(error) {
  if(error===null||error===undefined)return '';
  return typeof error==='string'?error:JSON.stringify(error);
}

function safeFunctionName(value) {
  if(typeof value!=='function') return null;
  const descriptor=Object.getOwnPropertyDescriptor(value,'name');
  return descriptor && Object.prototype.hasOwnProperty.call(descriptor,'value') &&
    typeof descriptor.value==='string' ? descriptor.value : null;
}

function safeArrayMap(value,mapper) {
  if(!Array.isArray(value)) return [];
  const lengthDescriptor=Object.getOwnPropertyDescriptor(value,'length');
  const length=lengthDescriptor && Number.isSafeInteger(lengthDescriptor.value) &&
    lengthDescriptor.value>=0 ? lengthDescriptor.value : 0;
  const result=[];
  for(let index=0;index<length;index++) {
    const descriptor=Object.getOwnPropertyDescriptor(value,String(index));
    const item=descriptor && Object.prototype.hasOwnProperty.call(descriptor,'value') ?
      descriptor.value : undefined;
    result.push(mapper(item,index));
  }
  return result;
}

function safeArrayFilterMap(value,predicate,mapper) {
  if(!Array.isArray(value)) return [];
  const lengthDescriptor=Object.getOwnPropertyDescriptor(value,'length');
  const length=lengthDescriptor && Number.isSafeInteger(lengthDescriptor.value) &&
    lengthDescriptor.value>=0 ? lengthDescriptor.value : 0;
  const result=[];
  for(let index=0;index<length;index++) {
    const descriptor=Object.getOwnPropertyDescriptor(value,String(index));
    if(!descriptor || !Object.prototype.hasOwnProperty.call(descriptor,'value')) continue;
    const item=descriptor.value;
    if(predicate(item,index)) result.push(mapper(item,index));
  }
  return result;
}

function cardLabelForText(card) {
  if (card===null || card===undefined) return null;
  if (typeof card!=='object') return String(card);
  const id=safeDataProperty(card,'id');
  const suffix=typeof id==='string' || typeof id==='number' ? ' (#'+String(id)+')' : '';
  const fullName=safeDataProperty(card,'fullName');
  if (typeof fullName==='string' && fullName) return fullName+suffix;
  const name=safeDataProperty(card,'name');
  if (typeof name==='string' && name) {
    const set=safeDataProperty(card,'set');
    const number=safeDataProperty(card,'number');
    const label=typeof set==='string' && typeof number==='string' ?
      name+' ['+set+' '+number+']' : name;
    return label+suffix;
  }
  if (id!==undefined && id!==null) return 'Card#'+String(id);
  return constructorNameOf(card);
}

function zoneCardLabelsForText(zone) {
  const cards=safeDataProperty(zone,'cards');
  return safeArrayMap(cards,cardLabelForText);
}

function scalarLabelForText(value) {
  if (value===null || value===undefined) return null;
  if (typeof value==='string' || typeof value==='number' || typeof value==='boolean') return value;
  if (typeof value==='bigint' || typeof value==='symbol') return String(value);
  if (typeof value==='object' || typeof value==='function') {
    const id=safeDataProperty(value,'id');
    if (typeof id==='string' || typeof id==='number' || typeof id==='bigint' ||
        typeof id==='boolean' || typeof id==='symbol') return String(id);
    const name=safeDataProperty(value,'name');
    if (typeof name==='string' && name) return name;
    return constructorNameOf(value);
  }
  return String(value);
}

function cardCollectionLabelsForText(value) {
  return Array.isArray(value)?safeArrayMap(value,cardLabelForText):zoneCardLabelsForText(value);
}

function choiceLabelForText(choice) {
  const label=safeDataProperty(choice,'label') ?? safeDataProperty(choice,'text') ??
    safeDataProperty(choice,'name');
  return typeof label==='string' && label ? label : cardLabelForText(choice);
}

/**
 * Compact, human-readable view of every card zone plus the public board.
 * The full native state remains separately available in the machine trace.
 */
function summarizeNativeStateForText(state,publicBoard=null) {
  const nativePlayers=safeDataProperty(state,'players');
  const players=safeArrayMap(nativePlayers,(player,seat)=>{
    const prizes=safeDataProperty(player,'prizes');
    const board=Array.isArray(publicBoard)?publicBoard[seat]:null;
    return {
      seat,
      playerId:scalarLabelForText(safeDataProperty(player,'id')),
      deck:zoneCardLabelsForText(safeDataProperty(player,'deck')),
      hand:zoneCardLabelsForText(safeDataProperty(player,'hand')),
      discard:zoneCardLabelsForText(safeDataProperty(player,'discard')),
      lostzone:zoneCardLabelsForText(safeDataProperty(player,'lostzone')),
      prizes:safeArrayMap(prizes,zoneCardLabelsForText),
      active:board?.active ?? null,
      bench:board?.bench ?? [],
      stadium:zoneCardLabelsForText(safeDataProperty(player,'stadium')),
      supporter:zoneCardLabelsForText(safeDataProperty(player,'supporter'))
    };
  });
  const nativePrompts=safeDataProperty(state,'prompts');
  const unresolvedPrompts=safeArrayFilterMap(nativePrompts,
    prompt=>safeDataProperty(prompt,'result')===undefined,
    prompt=>{
      const player=safeDataProperty(prompt,'player');
      const message=safeDataProperty(prompt,'message') ?? safeDataProperty(prompt,'text');
      const promptCards=safeDataProperty(prompt,'cards') ?? safeDataProperty(prompt,'cardList');
      const choices=safeDataProperty(prompt,'choices') ?? safeDataProperty(prompt,'options');
      return {
        type:constructorNameOf(prompt),
        playerId:scalarLabelForText(safeDataProperty(prompt,'playerId') ?? safeDataProperty(player,'id')),
        message:typeof message==='string'?message:null,
        cards:cardCollectionLabelsForText(promptCards),
        choices:safeArrayMap(choices,choiceLabelForText)
      };
    });
  return {
    turn:scalarLabelForText(safeDataProperty(state,'turn')),
    phase:scalarLabelForText(safeDataProperty(state,'phase')),
    activePlayer:scalarLabelForText(safeDataProperty(state,'activePlayer')),
    winner:scalarLabelForText(safeDataProperty(state,'winner')),
    isSuddenDeath:scalarLabelForText(safeDataProperty(state,'isSuddenDeath')),
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
    return typeof constructor==='function' && safeFunctionName(constructor) ?
      safeFunctionName(constructor) : 'object';
  }
  return typeof component;
}

function summarizePolicyConfiguration(optionsBySeat) {
  return safeArrayMap(optionsBySeat,(options,seat)=>{
    const tactics=readOwnDataProperty(options,'tactics');
    const promptResolvers=readOwnDataProperty(options,'promptResolvers');
    const scores=readOwnDataProperty(options,'scores') || {};
    const arbiter=readOwnDataProperty(options,'arbiter');
    return {
      seat,
      tacticOrder:safeArrayMap(tactics,describePolicyComponent),
      promptResolverOrder:safeArrayMap(promptResolvers,describePolicyComponent),
      scoreKeys:Object.keys(scores).sort(),
      scoreValues:Object.fromEntries(safeArrayMap(Object.keys(scores).sort(),
        key=>[key,readOwnDataProperty(scores,key)])),
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
  const constructor=descriptor &&
    Object.prototype.hasOwnProperty.call(descriptor,'value') ? descriptor.value : null;
  return safeFunctionName(constructor) || 'Object';
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
    if (typeof input === 'function') return {$type:'Function',name:safeFunctionName(input)};
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
    if (input instanceof RegExp) {
      const source=REGEXP_SOURCE_GETTER ? REGEXP_SOURCE_GETTER.call(input) : '';
      let flags='';
      for(const entry of REGEXP_FLAG_GETTERS)
        if(entry.get && entry.get.call(input)) flags+=entry.flag;
      return {$id:id,$type:'RegExp',source,flags};
    }
    if (input instanceof Map) {
      const entries=[];
      for(const [key,item] of MAP_ENTRIES.call(input))
        entries.push([visit(key,depth+1),visit(item,depth+1)]);
      return {$id:id,$type:'Map',entries};
    }
    if (input instanceof Set) {
      const values=[];
      for(const item of SET_VALUES.call(input)) values.push(visit(item,depth+1));
      return {$id:id,$type:'Set',values};
    }
    if (input instanceof WeakMap || input instanceof WeakSet)
      return {$id:id,$type:constructorNameOf(input),opaque:true};
    if (input instanceof ArrayBuffer)
      return {$id:id,$type:'ArrayBuffer',bytes:[...new Uint8Array(input)]};
    if (ArrayBuffer.isView(input)) {
      const bytes = new Uint8Array(input.buffer,input.byteOffset,input.byteLength);
      return {$id:id,$type:constructorNameOf(input),bytes:[...bytes],length:input.length ?? null};
    }
    if (Array.isArray(input)) {
      const lengthDescriptor=Object.getOwnPropertyDescriptor(input,'length');
      const length=lengthDescriptor && Number.isSafeInteger(lengthDescriptor.value) ?
        lengthDescriptor.value : 0;
      const items=[];
      for(let index=0;index<length;index++) {
        const descriptor=Object.getOwnPropertyDescriptor(input,String(index));
        if(!descriptor) items.push({$type:'ArrayHole'});
        else if(Object.prototype.hasOwnProperty.call(descriptor,'value'))
          items.push(visit(descriptor.value,depth+1));
        else items.push({$type:'Accessor',get:safeFunctionName(descriptor.get),
          set:safeFunctionName(descriptor.set)});
      }
      return {$id:id,$type:'Array',items};
    }

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
          get:safeFunctionName(descriptor.get) || null,
          set:safeFunctionName(descriptor.set) || null
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
 * initial native state and one detached post-dispatch state per accepted root
 * or prompt action; each step's beforeState points to the preceding snapshot,
 * avoiding duplicate copies. The cumulative native log is captured once at the
 * end. Full state may reveal concealed zones and must remain offline.
 */
function createFullStateTraceRecorder({label='',seed=null,limits={},policyConfiguration=[]} = {}) {
  const maxSteps=Number.isSafeInteger(limits.maxSteps)&&limits.maxSteps>=1?limits.maxSteps:512;
  const snapshotLimits={maxDepth:limits.maxDepth,maxNodes:limits.maxNodes};
  const policyConfigurationSnapshot=snapshotFullState(policyConfiguration,snapshotLimits);
  let initialState = null;
  let initialPublicBoard = null;
  let initialHumanSummary = null;
  let initialNativeLogs = null;
  let lastLogCount = null;
  let stepLimitExceeded=false;
  let nativeLogs = null;
  const steps = [];
  const stateLimits = {...snapshotLimits,omitKeys:['logs']};
  let captureError=null;
  let publicBoardError=null;
  let humanSummaryError=null;
  function rememberError(current,error) {
    if(error===null||error===undefined)
      throw new TypeError('Trace error recorder requires a non-null error.');
    return current===null?safeErrorSummary(error):current;
  }
  function recordCaptureError(error) {
    captureError=rememberError(captureError,error);
  }
  function recordPublicBoardError(error) {
    publicBoardError=rememberError(publicBoardError,error);
  }
  function recordHumanSummaryError(error) {
    humanSummaryError=rememberError(humanSummaryError,error);
  }
  function captureInitial(state,publicBoard=null,humanSummary=null) {
    try {
      if (initialState !== null) throw new Error('Initial full-state snapshot already captured.');
      initialState = snapshotFullState(state,stateLimits);
      initialPublicBoard = publicBoard===null?null:snapshotFullState(publicBoard,snapshotLimits);
      initialHumanSummary = humanSummary;
      const logs=safeDataProperty(state,'logs');
      initialNativeLogs=Array.isArray(logs)?snapshotFullState(logs,limits):null;
      lastLogCount=Array.isArray(logs)?logs.length:null;
    } catch(error) {
      recordCaptureError(error);
      throw error;
    }
  }
  function captureStep({state,action,actionOrdinal,playerSlot,playerId=null,actionType=null,turnBefore,turnAfter,
    phaseBefore=null,phaseAfter=null,publicBoard=null,humanSummary=null,pendingPrompt=null,error=null,failureStage=null} = {}) {
    try {
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
    const currentLogs=safeDataProperty(state,'logs');
    let nativeLogDelta=null;
    if(Array.isArray(currentLogs)) {
      const countBefore=lastLogCount;
      const reset=Number.isInteger(countBefore) && currentLogs.length<countBefore;
      const start=reset?0:(Number.isInteger(countBefore)?countBefore:0);
      nativeLogDelta={countBefore,countAfter:currentLogs.length,reset,
        entries:snapshotFullState(currentLogs.slice(start),limits)};
      lastLogCount=currentLogs.length;
    }
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
      nativeLogDelta,
      pendingPrompt:pendingPrompt===null?null:snapshotFullState(pendingPrompt,limits),
      afterState:snapshotFullState(state,stateLimits),
      ...(error?{error:snapshotFullState({
        name:safeDataProperty(error,'name'),
        message:safeDataProperty(error,'message'),
        code:safeDataProperty(error,'code'),
        stack:safeDataProperty(error,'stack')
      },limits)}:{}),
      ...(failureStage?{failureStage}: {})
      });
    } catch(error) {
      recordCaptureError(error);
      throw error;
    }
  }
  function captureFinal(state) {
    try {
      const logs=safeDataProperty(state,'logs');
      nativeLogs=snapshotFullState(Array.isArray(logs)?logs:[],limits);
    } catch(error) {
      recordCaptureError(error);
      throw error;
    }
  }
  function canCaptureStep() {
    if (stepLimitExceeded) return false;
    if (steps.length >= maxSteps) {
      stepLimitExceeded=true;
      return false;
    }
    return true;
  }
  function result() {
    return {
      schema:TRACE_SCHEMA,label,seed,
      stateVisibility:'FULL_PRIVATE_NATIVE_STATE_OFFLINE_ONLY',
      policyConfiguration:policyConfigurationSnapshot,
      maxSteps,stepLimitExceeded,
      captureError,publicBoardError,humanSummaryError,
      initialState,initialPublicBoard,initialHumanSummary,initialNativeLogs,
      steps:steps.slice(),
      nativeLogs,
      complete:captureError===null && publicBoardError===null && humanSummaryError===null &&
        !stepLimitExceeded && policyConfigurationSnapshot.truncated===false && initialState!==null &&
        initialState.truncated===false && (initialPublicBoard===null || !initialPublicBoard.truncated) &&
        (initialNativeLogs===null || !initialNativeLogs.truncated) &&
        nativeLogs!==null && !nativeLogs.truncated && steps.every((step,index)=>
          step.actionOrdinal===index+1 && !step.action.truncated &&
          (!step.publicBoard || !step.publicBoard.truncated) &&
          (!step.pendingPrompt || !step.pendingPrompt.truncated) && !step.afterState.truncated &&
          (!step.error || !step.error.truncated) &&
          (!step.nativeLogDelta || !step.nativeLogDelta.entries.truncated)),
      stepCount:steps.length
    };
  }
  function text() {
    try {
      return formatFullStateTrace(result());
    } catch(error) {
      recordCaptureError(error);
      throw error;
    }
  }
  return {
    captureInitial,
    captureStep,
    captureFinal,
    canCaptureStep,
    recordCaptureError,
    recordPublicBoardError,
    recordHumanSummaryError,
    result,
    text
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
    'capture error: '+formatTraceError(trace.captureError),
    'public board summary error: '+formatTraceError(trace.publicBoardError),
    'human summary error: '+formatTraceError(trace.humanSummaryError),
    'steps: '+(trace.stepCount ?? trace.steps?.length ?? 0),
    '',
    '=== INITIAL HUMAN-READABLE GAME STATE ===',
    JSON.stringify(trace.initialHumanSummary,null,2),
    '=== INITIAL NATIVE LOGS ===',
    JSON.stringify(trace.initialNativeLogs,null,2),
    'Full native snapshots/logs remain available in fullStateTrace.initialState, fullStateTrace.steps[].afterState, and fullStateTrace.nativeLogs.'
  ];
  for (const step of trace.steps || []) {
    lines.push('',
      '=== ACTION '+step.actionOrdinal+' | actor '+(step.playerId ?? '?')+' / seat '+(step.playerSlot ?? '?')+' | '+(step.actionType || 'unknown action')+' | turn '+(step.turnBefore ?? '?')+' -> '+(step.turnAfter ?? '?')+' | phase '+(step.phaseBefore ?? '?')+' -> '+(step.phaseAfter ?? '?')+' ===',
      'BEFORE STATE REFERENCE:',JSON.stringify(step.beforeState,null,2),
      'PENDING PROMPT:',JSON.stringify(step.pendingPrompt,null,2),
      'SELECTED ACTION:',JSON.stringify(step.action,null,2),
      'NATIVE LOG DELTA:',JSON.stringify(step.nativeLogDelta,null,2),
      'GAME STATE AFTER ACTION:',JSON.stringify(step.humanSummary,null,2));
    if (step.failureStage) lines.push('FAILURE STAGE: '+step.failureStage);
    if (step.error) lines.push('STEP ERROR:',JSON.stringify(step.error,null,2));
  }
  lines.push('','=== FINAL NATIVE LOGS ===',JSON.stringify(trace.nativeLogs,null,2));
  return lines.join('\n');
}

module.exports={TRACE_SCHEMA,SNAPSHOT_SCHEMA,snapshotFullState,
  summarizePolicyConfiguration,summarizeNativeStateForText,createFullStateTraceRecorder,formatFullStateTrace};
