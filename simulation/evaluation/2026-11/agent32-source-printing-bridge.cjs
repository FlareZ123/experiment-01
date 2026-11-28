'use strict';

const assert=require('node:assert/strict');
const certifiedMaps=new WeakMap();
function certifiedMapUnchanged(map){
  if(!(map instanceof Map))return false;
  if(map.size===0)return true;
  const snap=certifiedMaps.get(map);
  return snap instanceof Map&&snap.size===map.size&&[...snap].every(
    ([nativePrinting,sourcePrinting])=>map.get(nativePrinting)===sourcePrinting);
}

/**
 * Use a precommitted source-60/native-60 pairing, not a guessed alias:
 * the existing resolver has already selected every native card ID.
 * A native ID that represents two different source printings is ambiguous.
 */
function buildSourcePrintingMap(sourceDeck,nativeOrdered60){
  assert.ok(Array.isArray(sourceDeck?.cards),'source deck cards required');
  assert.ok(Array.isArray(nativeOrdered60),'ordered native deck required');
  const count=sourceDeck.cards.reduce((n,row)=>n+row.count,0);
  assert.equal(count,60,'source deck must contain exactly 60 physical cards');
  assert.equal(nativeOrdered60.length,60,'native deck must resolve exactly 60 cards');
  const byNative=new Map();
  let index=0;
  for(const row of sourceDeck.cards){
    assert.ok(Number.isSafeInteger(row.count)&&row.count>0);
    const name=row.name,set=row.printing?.set,number=row.printing?.number;
    assert.ok([name,set,number].every(x=>typeof x==='string'&&x.length>0),
      'source card name, set and number required');
    const sourcePrinting=`${name} ${set} ${number}`;
    const resolved=nativeOrdered60.slice(index,index+row.count);
    assert.equal(resolved.length,row.count);
    assert.ok(resolved.every(id=>typeof id==='string'&&id.length>0&&id===resolved[0]),
      'one source printing must map to one resolved native ID');
    const nativePrinting=resolved[0];
    if(byNative.has(nativePrinting)){
      assert.equal(byNative.get(nativePrinting),sourcePrinting,
        `ambiguous source printings for native ID ${nativePrinting}`);
    }else byNative.set(nativePrinting,sourcePrinting);
    index+=row.count;
  }
  assert.equal(index,60);
  certifiedMaps.set(byNative,new Map(byNative));
  return byNative;
}

const label=(value,map)=>typeof value==='string'&&map instanceof Map?
  map.get(value)??value:value;
const mapped=(list,map)=>Array.isArray(list)?list.map(x=>label(x,map)):list;
function mapPokemon(p,map,opponentMap){
  if(!p||p.concealed===true)return p;
  return {...p,
    printing:label(p.printing,map),
    evolutionPrintings:mapped(p.evolutionPrintings,map),
    energies:mapped(p.energies,map),tools:mapped(p.tools,map),
    ...(Object.hasOwn(p,'abilitySuppressions')?{abilitySuppressions:
      Array.isArray(p.abilitySuppressions)?
        p.abilitySuppressions.map(a=>({...a,
          sourcePrinting:uniqueVisibleLabel(a.sourcePrinting,
            map,opponentMap??new Map())})):p.abilitySuppressions}:{})};
}
function mapPlayer(p,map,opponentMap){
  if(!p)return p;
  return {...p,
    active:mapPokemon(p.active,map,opponentMap),
    bench:Array.isArray(p.bench)?p.bench.map(x=>mapPokemon(x,map,opponentMap)):p.bench,
    stadium:mapped(p.stadium,map),discard:mapped(p.discard,map),
    lostZone:mapped(p.lostZone,map),
    resolvingSupporter:mapped(p.resolvingSupporter,map),
    publicHand:mapped(p.publicHand,map),
    prizeSlots:Array.isArray(p.prizeSlots)?p.prizeSlots.map(x=>
      typeof x.printing==='string'?{...x,printing:label(x.printing,map)}:x):p.prizeSlots};
}
/**
 * Relabel only actor-visible fields. This never accesses a raw Store.
 * Concealed deck/hand/Prize cards remain concealed. Certified owner K1
 * retains separate custody and epoch rules.
 */

/** Different source decks may bind the same engine ID to different printings. */
function uniqueVisibleLabel(value,mine,other){
  if(typeof value!=='string')return value;
  const a=mine.get(value),b=other.get(value);
  return a&&b&&a!==b?value:a??b??value;
}
function mapAttackReceipt(row,map){
  return row?{...row,sourcePrinting:label(row.sourcePrinting,map)}:row;
}
function mapPublicEventReceipt(receipt,mine,other){
  if(!receipt)return receipt;
  const eventPokemon=p=>p?{...p,printing:label(p.printing,mine)}:p;
  const attackRows=rows=>Array.isArray(rows)?rows.map(x=>mapAttackReceipt(x,other)):rows;
  return {...receipt,
    ownerActive:eventPokemon(receipt.ownerActive),
    ownerBench:Array.isArray(receipt.ownerBench)?
      receipt.ownerBench.map(eventPokemon):receipt.ownerBench,
    opponentLastTurnAttacks:attackRows(receipt.opponentLastTurnAttacks),
    ...(Object.hasOwn(receipt,'opponentCopycatChoices')?{
      opponentCopycatChoices:attackRows(receipt.opponentCopycatChoices)}:{})};
}
function mapPrompt(prompt,mine,other){
  if(!prompt)return prompt;
  const origin=prompt.source??{};
  // Night Watch must be handled by the physical host. Relabeling its
  // source must never bypass the strict worker's literal host-only guard.
  // A copied Night Watch retains its host-only randomness even when the
  // visible source is Copycat. Check both source and copied-source variants
  // before any mapping can change the worker's exact-print comparison.
  const trevenantSource=value=>typeof value==='string'&&
    /^Trevenant & Dusknoir-GX SMP(?:\s|$)/i.test(value);
  if((origin.effectName==='Night Watch'&&
        trevenantSource(origin.sourcePrinting))||
      (origin.effectName==='Copycat'&&
        origin.copiedAttackName==='Night Watch'&&
        trevenantSource(origin.copiedSourcePrinting))){
    throw new Error('HOST_ONLY_PHYSICAL_PROMPT');
  }
  const source={...origin,
    sourcePrinting:uniqueVisibleLabel(origin.sourcePrinting,mine,other),
    ...(Object.hasOwn(origin,'copiedSourcePrinting')?{
      copiedSourcePrinting:uniqueVisibleLabel(
        origin.copiedSourcePrinting,mine,other)}:{})};
  const choices=Array.isArray(prompt.choices)?prompt.choices.map(choice=>{
    const seat=choice.publicMetadata?.ownerSeat??prompt.publicMetadata?.ownerSeat;
    const m=seat==='actor'?mine:seat==='opponent'?other:null;
    const meta=choice.publicMetadata;
    return {...choice,
      ...(Object.hasOwn(choice,'printing')?{
        printing:label(choice.printing,m)}:{}),
      ...(Object.hasOwn(choice,'publicMetadata')?{publicMetadata:meta?{...meta,
        ...(Object.hasOwn(meta,'sourcePrinting')?{
          sourcePrinting:uniqueVisibleLabel(meta.sourcePrinting,mine,other)}:{})}:meta}:{})};
  }):prompt.choices;
  return {...prompt,source,choices,
    publicMetadata:prompt.publicMetadata?{...prompt.publicMetadata,
      ...(Object.hasOwn(prompt.publicMetadata,'sourcePrinting')?{
        sourcePrinting:uniqueVisibleLabel(
          prompt.publicMetadata.sourcePrinting,mine,other)}:{})}:prompt.publicMetadata};
}
function mapOwnerK1(snapshot,map){
  if(!snapshot)return snapshot;
  return {...snapshot,knownPrintings:Array.isArray(snapshot.knownPrintings)?
    snapshot.knownPrintings.map(row=>({
      ...row,printing:label(row.printing,map)})):snapshot.knownPrintings};
}

function projectSourcePrintings(observation,frontier,sourceMapsBySeat,options={}){
  assert.ok(observation?.actorSeat===0||observation?.actorSeat===1);
  assert.ok(Array.isArray(sourceMapsBySeat)&&sourceMapsBySeat.length===2);
  assert.ok(sourceMapsBySeat.every(m=>certifiedMapUnchanged(m)),
    'nonempty source-printing map must be created from a complete resolved 60');
  const seat=observation.actorSeat;
  const mine=sourceMapsBySeat[seat],other=sourceMapsBySeat[1-seat];
  const view={...observation,
    ownHand:mapped(observation.ownHand,mine),
    ownPublic:mapPlayer(observation.ownPublic,mine,other),
    opponentPublic:mapPlayer(observation.opponentPublic,other,mine),
    ownerK1:mapOwnerK1(observation.ownerK1,mine)};
  let mappedFrontier=frontier;
  if(frontier){
    assert.ok(Array.isArray(frontier.items));
    mappedFrontier={...frontier,items:frontier.items.map(item=>{
      const m=item.publicMetadata??{};
      const targetMap=m.targetSeat==='actor'?mine:
        m.targetSeat==='opponent'?other:null;
      return {...item,
        ...(Object.hasOwn(item,'actorPrinting')?{
          // A globally playable Stadium effect can originate from either
          // player's source 60. Never attribute an opponent-owned Stadium
          // to the acting player's card inventory; conflicting print IDs
          // remain raw rather than guessing who physically played it.
          actorPrinting:item.kind==='use-stadium'
            ? uniqueVisibleLabel(item.actorPrinting,mine,other)
            : label(item.actorPrinting,mine)}:{}),
        ...(Object.hasOwn(item,'targetPrinting')?{
          targetPrinting:label(item.targetPrinting,targetMap)}:{}),
        ...(Object.hasOwn(item,'publicMetadata')?{publicMetadata:item.publicMetadata?{...m,
          ...(typeof m.priorSourcePrinting==='string'?{
            priorSourcePrinting:label(m.priorSourcePrinting,other)}:{}),
          ...(typeof m.stadiumPrinting==='string'?{
            stadiumPrinting:uniqueVisibleLabel(m.stadiumPrinting,mine,other)}:{}),
          ...(m.attackSource?{attackSource:{...m.attackSource,
            ...(Object.hasOwn(m.attackSource,'sourceCardFullName')?{
              sourceCardFullName:label(m.attackSource.sourceCardFullName,mine)}:{})}}:{})
        }:item.publicMetadata}:{})};
    })};
  }
  return {observation:view,actionFrontier:mappedFrontier,
    prompt:mapPrompt(options.prompt??null,mine,other),
    publicEventReceipt:mapPublicEventReceipt(
      options.publicEventReceipt??null,mine,other)};
}


/**
 * Host-only admission wrapper: the authenticated native source is validated
 * before and after source-printing projection. Keep this before the first
 * worker-input SHA computation, not after a driver request is hashed.
 *
 * The caller supplies the already pinned strict protocol; native actions and
 * physical RNG remain outside this function. This does NOT relax the worker
 * schema or let the policy see a raw Store, and NEVER changes a native token.
 */
function projectAdmittedWorkerParts(parts,sourceMapsBySeat,protocol,
    {observationAlreadySourcePrinted=false}={}){
  const {observation,prompt,publicEventReceipt,actionFrontier}=parts??{};
  assert.ok(observation&&typeof observation==='object');
  assert.ok(actionFrontier&&Array.isArray(actionFrontier.items));
  assert.ok(protocol&&[
    'validateActorObservation','validatePublicEventReceipt',
    'validatePrompt','validateFrontier'
  ].every(k=>typeof protocol[k]==='function'),'strict worker protocol required');
  const seat=observation.actorSeat;
  assert.ok(seat===0||seat===1,'actor physical seat must be authoritative');
  // The raw producer is not allowed to smuggle unclassified fields through
  // the relabeling boundary. All protocol admission errors propagate.
  protocol.validateActorObservation(observation,seat);
  protocol.validatePrompt(prompt??null,seat);
  // Once wrapSourcePrintedObserver is active, the native fixture driver
  // hashes and hands off a SOURCE-labeled observation. Event receipts are
  // still produced from the pinned Store's NATIVE fullNames. Validating
  // that raw receipt against a source-labeled observer fails with an
  // EVENT_OWNER_ACTIVE/BENCH_MISMATCH before any worker call. Validate a
  // schema-identical relabeled receipt against the already-certified
  // source observation; keep raw/native admission for direct callers.
  let receiptBefore=publicEventReceipt??null;
  if(observationAlreadySourcePrinted){
    const normalizedObservation=projectSourcePrintings(
      observation,null,sourceMapsBySeat).observation;
    // The frozen observer is JSON-detached; a second nonserializing
    // projection may include optional undefined keys that were stripped
    // by the initial JSON roundtrip. Require exact serialized equivalence
    // (the same semantics as the driver's observation SHA), not object
    // equivalence on these absent optional keys.
    assert.equal(JSON.stringify(observation),JSON.stringify(normalizedObservation),
      'pre-driver-SHA actor view must already be source-labeled');
    const mine=sourceMapsBySeat[seat],other=sourceMapsBySeat[1-seat];
    receiptBefore=mapPublicEventReceipt(receiptBefore,mine,other);
  }
  protocol.validatePublicEventReceipt(receiptBefore,observation);
  const beforeTokens=protocol.validateFrontier(actionFrontier);
  const projected=projectSourcePrintings(observation,actionFrontier,
    sourceMapsBySeat,{prompt,publicEventReceipt});
  protocol.validateActorObservation(projected.observation,seat);
  protocol.validatePrompt(projected.prompt,seat);
  protocol.validatePublicEventReceipt(projected.publicEventReceipt,
    projected.observation);
  const afterTokens=protocol.validateFrontier(projected.actionFrontier);
  assert.deepEqual([...beforeTokens],[...afterTokens],
    'relabeling may not alter the native action token whitelist');
  assert.deepEqual(
    projected.actionFrontier.items.map(item=>item.token),
    actionFrontier.items.map(item=>item.token),
    'relabeling may not reorder physical native actions');
  return projected;
}


/**
 * Install before the native fixture driver first calls native.observe().
 * That driver computes actorObservationSha256 immediately after observe().
 * Do not patch the observation downstream in session.decide(): it violates
 * ACTOR_OBSERVATION_DIGEST_MISMATCH by design.
 *
 * This is an opt-in RESEARCH-SIDE host wrapper; the pinned Twinleaf code and
 * original observer are unmodified. The returned view is a separate frozen
 * JSON tree, preserving the existing detached-observation contract. The
 * caller must still project prompt/frontier/receipt *before* worker audit and
 * must leave native action objects/token mapping in the host.
 */
function wrapSourcePrintedObserver(native,sourceMapsBySeat,protocol){
  assert.ok(native&&typeof native.observe==='function',
    'native observe callback required');
  assert.ok(protocol&&typeof protocol.validateActorObservation==='function',
    'strict actor observation validator required');
  assert.ok(Array.isArray(sourceMapsBySeat)&&sourceMapsBySeat.length===2);
  const freezeJson=value=>{
    if(!value||typeof value!=='object')return value;
    for(const item of Object.values(value))freezeJson(item);
    return Object.freeze(value);
  };
  const upstream=native.observe;
  return {...native,observe(state,seat){
    const raw=upstream.call(native,state,seat);
    if(raw===null)return null;
    protocol.validateActorObservation(raw,seat);
    const projected=projectSourcePrintings(raw,null,sourceMapsBySeat).observation;
    protocol.validateActorObservation(projected,seat);
    // Never freeze any original upstream object through shared references:
    // a JSON roundtrip creates the distinct host-owned worker view.
    return freezeJson(JSON.parse(JSON.stringify(projected)));
  }};
}


/**
 * Single construction point for both frozen native.observe and admitted
 * frontier/prompt/receipt projection. Keeps the physical-seat pairing private
 * to this host adapter, rather than requiring separate callers to reconstruct
 * potentially inconsistent maps for the driver and the worker resolver.
 */
function createCertifiedSourcePrintedHostBridge({
  native,protocol,sourceDecksBySeat,nativeOrdered60BySeat
}={}){
  assert.ok(Array.isArray(sourceDecksBySeat)&&sourceDecksBySeat.length===2);
  assert.ok(Array.isArray(nativeOrdered60BySeat)&&nativeOrdered60BySeat.length===2);
  const maps=Object.freeze([0,1].map(seat=>
    buildSourcePrintingMap(sourceDecksBySeat[seat],nativeOrdered60BySeat[seat])));
  const wrappedNative=wrapSourcePrintedObserver(native,maps,protocol);
  return Object.freeze({
    native:wrappedNative,
    projectWorkerParts(parts){
      return projectAdmittedWorkerParts(parts,maps,protocol,
        {observationAlreadySourcePrinted:true});
    }
  });
}


/** Adapt the V3 runner's candidate/opponent role assignment without seat drift. */
function createCertifiedRoleSourcePrintedHostBridge({
  native,protocol,
  candidateSeat,opponentSeat,
  candidateSourceDeck,opponentSourceDeck,
  candidateNativeOrdered60,opponentNativeOrdered60
}={}){
  assert.ok((candidateSeat===0||candidateSeat===1)&&
    (opponentSeat===0||opponentSeat===1)&&candidateSeat!==opponentSeat,
    'candidate/opponent roles must occupy different physical seats');
  const sourceDecksBySeat=[];
  const nativeOrdered60BySeat=[];
  sourceDecksBySeat[candidateSeat]=candidateSourceDeck;
  sourceDecksBySeat[opponentSeat]=opponentSourceDeck;
  nativeOrdered60BySeat[candidateSeat]=candidateNativeOrdered60;
  nativeOrdered60BySeat[opponentSeat]=opponentNativeOrdered60;
  return createCertifiedSourcePrintedHostBridge({
    native,protocol,sourceDecksBySeat,nativeOrdered60BySeat
  });
}


/**
 * Opt-in composition at createV3WorkerDecisionResolver's dependency boundary.
 * These are all ordinary existing V3 injected dependencies:
 *   native, actionFrontier, promptProjection, eventReceipt.
 *
 * Leave ActionEnumerator, cloned-Store validation, native token-to-Action,
 * root/prompt dispatch, worker trace hashing, and the external seed unchanged.
 * The source-certified observer runs BEFORE the fixture driver hashes it.
 * When V3 later builds a frontier, receipt, or prompt, this adapter publishes
 * the same source labels. Every component is still admitted by the strict
 * worker protocol BEFORE session.decide.
 */
function createCertifiedV3RoleAdapters({
  native,protocol,candidateSeat,opponentSeat,candidateSourceDeck,
  opponentSourceDeck,candidateNativeOrdered60,opponentNativeOrdered60,
  actionFrontier,promptProjection,eventReceipt
}={}){
  assert.ok(actionFrontier&&
    typeof actionFrontier.buildNativeActionFrontier==='function'&&
    typeof actionFrontier.dispatchSelectedNativeAction==='function',
    'native root action frontier and dispatch binding required');
  assert.ok(promptProjection&&
    typeof promptProjection.projectPrompt==='function'&&
    typeof promptProjection.dispatchPromptChoice==='function'&&
    typeof promptProjection.resolveHostOnlyPrompt==='function',
    'native prompt projector and host-only settlement binding required');
  assert.equal(typeof eventReceipt,'function',
    'native public event receipt function required');
  const bridge=createCertifiedRoleSourcePrintedHostBridge({
    native,protocol,candidateSeat,opponentSeat,
    candidateSourceDeck,opponentSourceDeck,
    candidateNativeOrdered60,opponentNativeOrdered60
  });
  const emptyFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
  const view=(state,seat)=>bridge.native.observe(state,seat);
  const rootAdapter={...actionFrontier,
    buildNativeActionFrontier(args){
      const raw=actionFrontier.buildNativeActionFrontier.call(actionFrontier,args);
      assert.ok(raw&&raw.actionFrontier&&raw.actionByToken instanceof Map,
        'native action frontier must retain its physical token map');
      const originalTokens=raw.actionFrontier.items.map(item=>item.token);
      const rendered=bridge.projectWorkerParts({
        observation:view(args.state,args.actorSeat),prompt:null,
        publicEventReceipt:null,actionFrontier:raw.actionFrontier
      });
      assert.deepEqual(rendered.actionFrontier.items.map(item=>item.token),
        originalTokens,'source presentation may not change physical action tokens');
      return {...raw,actionFrontier:rendered.actionFrontier};
    }
  };
  const promptAdapter={...promptProjection,
    projectPrompt(args){
      const raw=promptProjection.projectPrompt.call(promptProjection,args);
      if(raw?.hostOnly)return raw;
      assert.ok(raw&&raw.promptProjection&&raw.choiceByToken instanceof Map,
        'native prompt projector must preserve physical choice token map');
      const rendered=bridge.projectWorkerParts({
        observation:view(args.state,args.actorSeat),
        prompt:raw.promptProjection,publicEventReceipt:null,
        actionFrontier:emptyFrontier
      });
      return {...raw,promptProjection:rendered.prompt};
    }
  };
  const eventAdapter=(state,seat,...rest)=>{
    const nativeReceipt=eventReceipt(state,seat,...rest);
    const rendered=bridge.projectWorkerParts({
      observation:view(state,seat),
      prompt:null,publicEventReceipt:nativeReceipt,
      actionFrontier:emptyFrontier
    });
    return rendered.publicEventReceipt;
  };
  return Object.freeze({
    native:bridge.native,
    actionFrontier:Object.freeze(rootAdapter),
    promptProjection:Object.freeze(promptAdapter),
    eventReceipt:eventAdapter
  });
}

module.exports={buildSourcePrintingMap,projectSourcePrintings,projectAdmittedWorkerParts,wrapSourcePrintedObserver,createCertifiedSourcePrintedHostBridge,createCertifiedRoleSourcePrintedHostBridge,createCertifiedV3RoleAdapters};
