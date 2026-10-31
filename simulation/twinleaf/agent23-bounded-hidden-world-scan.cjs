'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {cardKind,hiddenZoneFingerprint}=
  require('./opponent-hidden-live-root-probe.cjs');
const {actionSignature}=require('./rank10-hidden-order-live-probe.cjs');
const {stateGraphFingerprint}=
  require('./rank10-live-decision-noninterference.cjs');
const {captureTacticScores,compareTacticScores}=
  require('./tactic-score-trace.cjs');

const VERSION='agent23-detached-bounded-hidden-world-single-exchange-v1';

/**
 * Deterministically cover contrasting hidden card kinds and distinct changes
 * in opponent concealed hand-printing composition before redundant physical
 * swaps. Selection uses concealed identities ONLY in a
 * detached diagnostic after actual play; never use it to choose live actions.
 * @param {object[]} hand Opponent concealed hand cards.
 * @param {object[]} deck Opponent concealed deck cards.
 * @param {number} limit Bounded number of detached counterfactuals.
 * @returns {{available:number,exchanges:object[],exhaustive:boolean}}
 */
function selectBoundedHiddenExchanges(hand,deck,limit=16){
  assert.ok(Array.isArray(hand)&&Array.isArray(deck));
  assert.ok(Number.isSafeInteger(limit)&&limit>=1&&limit<=64);
  const printingPair=pair=>JSON.stringify([
    hand[pair.handIndex].fullName,deck[pair.deckIndex].fullName
  ]);
  const pairs=[];
  for(let hi=0;hi<hand.length;hi++){
    for(let di=0;di<deck.length;di++){
      if(hand[hi].fullName===deck[di].fullName)continue;
      const a=cardKind(hand[hi]),b=cardKind(deck[di]);
      pairs.push({handIndex:hi,deckIndex:di,kindPair:a+'-vs-'+b,
        crossKind:a!==b});
    }
  }
  pairs.sort((a,b)=>Number(b.crossKind)-Number(a.crossKind)||
    a.handIndex-b.handIndex||a.deckIndex-b.deckIndex);
  const exchanges=[],seen=new Set(),chosen=new Set();
  // First reserve a witness per kind pair, avoiding repeated first-kind bias.
  for(let i=0;i<pairs.length&&exchanges.length<limit;i++){
    if(seen.has(pairs[i].kindPair))continue;
    seen.add(pairs[i].kindPair);
    chosen.add(i);
    exchanges.push(pairs[i]);
  }
  const seenHands=new Set(exchanges.map(x=>x.handIndex));
  const seenDecks=new Set(exchanges.map(x=>x.deckIndex));
  const seenPrintChanges=new Set(exchanges.map(printingPair));
  // A first occurrence of an (outgoing printing, incoming printing) pair
  // yields a new concealed hand multiset; an index-only repetition does not.
  while(exchanges.length<limit&&exchanges.length<pairs.length){
    let winner=-1,best=-1;
    for(let i=0;i<pairs.length;i++){
      if(chosen.has(i)||seenPrintChanges.has(printingPair(pairs[i])))continue;
      const pair=pairs[i];
      const coverage=(seenHands.has(pair.handIndex)?0:2)+
        (seenDecks.has(pair.deckIndex)?0:1);
      if(coverage>best){best=coverage;winner=i;}
    }
    if(winner<0)break;
    const pair=pairs[winner];
    chosen.add(winner);
    seenHands.add(pair.handIndex);
    seenDecks.add(pair.deckIndex);
    seenPrintChanges.add(printingPair(pair));
    exchanges.push(pair);
  }
  // Once composition contrasts are exhausted, physically distinct positions
  // can still reveal dependence on opponent concealed deck ORDER.
  while(exchanges.length<limit&&exchanges.length<pairs.length){
    let winner=-1,best=-1;
    for(let i=0;i<pairs.length;i++){
      if(chosen.has(i))continue;
      const pair=pairs[i];
      // Maximize distinct physical source positions in the small budget.
      // Stable order of 'pairs' supplies a deterministic tie-breaker.
      const coverage=(seenHands.has(pair.handIndex)?0:2)+
        (seenDecks.has(pair.deckIndex)?0:1);
      if(coverage>best){best=coverage;winner=i;}
    }
    assert.ok(winner>=0);
    const pair=pairs[winner];
    chosen.add(winner);
    seenHands.add(pair.handIndex);
    seenDecks.add(pair.deckIndex);
    seenPrintChanges.add(printingPair(pair));
    exchanges.push(pair);
  }
  return {available:pairs.length,exchanges,
    eligibleDistinctHandCompositions:new Set(pairs.map(printingPair)).size,
    testedDistinctHandCompositions:seenPrintChanges.size,
    exhaustive:exchanges.length===pairs.length};
}

/**
 * Audit a genuine previously observed owner root using independently cloned
 * opponent hidden hand/deck assignments and identically reseeded fresh bots.
 * The physical source Store is never modified. This cannot certify a complete
 * historical information set, competitive play, or untested multi-card worlds.
 *
 * @param {object} source Authentic live Store State, inspected postgame.
 * @param {number} actorId Actual owner player identifier.
 * @param {()=>object} newBot Fresh bot with unchanged original policy options.
 * @param {(state:object)=>object} cloneState Fully detached clone.
 * @param {()=>()=>number} makeRandom New equivalent policy RNG per evaluation.
 * @param {{fingerprint?:(s:object)=>unknown,limit?:number,
 *   actorView?:(state:object,seat:0|1)=>object}|((work:Function)=>object)|null} [options]
 * @returns {object} Bounded, explicitly incomplete sensitivity evidence.
 */
function scanBoundedOpponentHiddenWorlds(source,actorId,newBot,cloneState,
  makeRandom,options={}){
  assert.equal(typeof newBot,'function');
  assert.equal(typeof cloneState,'function');
  assert.equal(typeof makeRandom,'function');
  // The native postgame wrapper passes an optional per-world policy hook,
  // or null when no such hook is requested. Install policy hooks separately
  // before constructing the fresh bot in EACH alternate world.
  const settings=options??{};
  const withWorldPolicy=typeof options==='function'?options:work=>work();
  const fingerprint=settings.fingerprint??stateGraphFingerprint;
  const sourceBefore=fingerprint(source);
  const actor=source.players.find(p=>p.id===actorId);
  const other=source.players.find(p=>p.id!==actorId);
  assert.ok(actor&&other&&source.players.length===2);
  const originalPool=hiddenZoneFingerprint(other);
  const selected=selectBoundedHiddenExchanges(
    other.hand.cards,other.deck.cards,settings.limit??16);
  const seat=source.players.findIndex(p=>p.id===actorId);
  assert.ok(seat===0||seat===1);
  const actorView=settings.actorView??
    require('./actor-observation-contract.cjs').actorObservation;
  const originalObservation=actorView(source,seat);

  function detachedWorld(){
    const world=cloneState(source);
    assert.notStrictEqual(world,source,'Clone returned the live Store object');
    assert.notStrictEqual(world.players,source.players,
      'Clone reused the live player array');
    assert.equal(world.players.length,source.players.length);
    for(let i=0;i<source.players.length;i++){
      const actual=source.players[i],copy=world.players[i];
      assert.notStrictEqual(copy,actual,'Clone reused a live player object');
      for(const zone of ['hand','deck']){
        assert.notStrictEqual(copy[zone],actual[zone],
          'Clone reused a live concealed-zone object');
        assert.notStrictEqual(copy[zone].cards,actual[zone].cards,
          'Clone reused a live concealed card array');
        assert.equal(copy[zone].cards.length,actual[zone].cards.length);
        for(let j=0;j<actual[zone].cards.length;j++){
          assert.notStrictEqual(copy[zone].cards[j],actual[zone].cards[j],
            'Clone reused a live concealed physical card object');
        }
      }
    }
    return world;
  }

  function evaluate(detached){
    const oldRandom=Math.random;
    Math.random=makeRandom();
    try{
      return withWorldPolicy(()=>{
        const bot=newBot();
        const output=captureTacticScores(bot,()=>bot.decodeNextAction(detached));
        return {action:actionSignature(output.result),scores:output.trace};
      });
    }finally{
      Math.random=oldRandom;
    }
  }

  const physical=detachedWorld();
  assert.deepEqual(actorView(physical,seat),originalObservation,
    'Detached baseline changed owner-visible observation');
  const baseline=evaluate(physical);
  const cases=[];
  for(const proposal of selected.exchanges){
    const world=detachedWorld();
    const opponent=world.players.find(p=>p.id!==actorId);
    assert.deepEqual(hiddenZoneFingerprint(opponent),originalPool,
      'Detached world must start with the original physical hidden inventory');
    const hi=proposal.handIndex,di=proposal.deckIndex;
    const originalHand=opponent.hand.cards[hi];
    opponent.hand.cards[hi]=opponent.deck.cards[di];
    opponent.deck.cards[di]=originalHand;
    assert.deepEqual(hiddenZoneFingerprint(opponent),originalPool,
      'Exchange must conserve every concealed physical card instance');
    assert.equal(opponent.hand.cards.length,other.hand.cards.length);
    assert.equal(opponent.deck.cards.length,other.deck.cards.length);
    assert.deepEqual(actorView(world,seat),originalObservation,
      'Concealed swap changed the owner-visible observation');
    const alternative=evaluate(world);
    const scoreComparison=compareTacticScores(
      baseline.scores,alternative.scores);
    cases.push({
      exchangeKind:proposal.kindPair,
      actionChanged:!isDeepStrictEqual(baseline.action,alternative.action),
      scoreTraceChanged:scoreComparison.equalScoreTraces===false,
      counterfactualAction:alternative.action,
      scoreComparison
    });
  }
  // A/B/.../A guards against module-global simulator state, RNG drift, or a
  // bot that changes merely because previous detached evaluations occurred.
  const originalRepeat=detachedWorld();
  assert.deepEqual(actorView(originalRepeat,seat),originalObservation,
    'Bracketed baseline changed owner-visible observation');
  const repeat=evaluate(originalRepeat);
  assert.deepEqual(repeat.action,baseline.action,
    'Repeated original hidden world changed the chosen action');
  assert.deepEqual(repeat.scores,baseline.scores,
    'Repeated original hidden world changed candidate evaluations');
  assert.deepEqual(fingerprint(source),sourceBefore,
    'Detached worlds or policy contaminated the original Store');
  assert.deepEqual(hiddenZoneFingerprint(other),originalPool,
    'Diagnostic altered the original opponent concealed inventory');

  const actionCases=cases.filter(x=>x.actionChanged);
  const scoreOnlyCases=cases.filter(x=>
    !x.actionChanged&&x.scoreTraceChanged);
  return {
    schema:VERSION,opportunity:selected.available>0,
    totalEligibleSingleExchanges:selected.available,
    testedSingleExchanges:cases.length,
    eligibleDistinctHandCompositions:selected.eligibleDistinctHandCompositions,
    testedDistinctHandCompositions:selected.testedDistinctHandCompositions,
    exhaustiveSingleExchangeCoverage:selected.exhaustive,
    // Completeness even of every one-exchange world does not establish
    // invariance over simultaneous multi-card exchanges or reveal history.
    completeOwnerObservationHistoryCertified:false,
    opponentHandIdentityUnobservedVerified:false,
    sourceHiddenPoolConserved:true,
    currentOwnerObservationEquivalent:true,
    liveStatePreserved:true,
    baselineReplayStable:true,
    perWorldPolicyIsolation:typeof options==='function',
    physicalOrder:baseline.action,
    actionSensitiveToOpponentHiddenHand:actionCases.length>0,
    actionReversals:actionCases.length,
    scoreOnlyChanges:scoreOnlyCases.length,
    firstActionReversal:actionCases[0]??null,
    firstScoreOnlyChange:scoreOnlyCases[0]??null,
    byExchangeKind:cases.reduce((acc,x)=>{
      const current=acc[x.exchangeKind]??{tested:0,actionReversals:0,scoreChanges:0};
      current.tested++;
      if(x.actionChanged)current.actionReversals++;
      if(x.scoreTraceChanged)current.scoreChanges++;
      acc[x.exchangeKind]=current;return acc;
    },{}),
    qualification:{
      hiddenInformationSafe:false,
      competitiveGameQualified:false,
      posteriorWorldSampling:false,
      verifiedPublicRevealHistory:false
    },
    caveat:'Deterministic postgame exchanges conditioned on actual private '+
      'card identities; no live intervention, no historical information-set '+
      'proof, no competitive outcome inference.'
  };
}

module.exports={VERSION,selectBoundedHiddenExchanges,
  scanBoundedOpponentHiddenWorlds};
