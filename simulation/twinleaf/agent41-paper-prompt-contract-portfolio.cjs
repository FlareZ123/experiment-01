'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {verdictVoltCyclone}=require('./agent39-paper-prompt-portfolio.cjs');
const {campingGearPaperVerdict}=
  require('./agent12-campinggear-prompt-paper-hook.cjs');
const {secretBoxPaymentNegative}=
  require('./agent4-secret-box-paper-payment-hook.cjs');
const {quickBallPaymentNegative}=
  require('./agent4-quick-ball-paper-payment-hook.cjs');
const QUICK_BALL_PRINTINGS=new Set(['Quick Ball FST','Quick Ball SSH']);
/**
 * Check independently observable native PutDamage zero-target, whole-packet
 * and optional total-budget negative restrictions. Do not first call prompt.validate:
 * the vendor validator can reject otherwise valid paper replies, and an
 * unrelated validation false must not become a paper-invalid verdict.
 *
 * @param {object} prompt Pending native PutDamagePrompt.
 * @param {unknown} answer Native physical answer.
 * @returns {string|null} Independently covered negative predicate or null.
 */
function independentPutDamageNegative(prompt,answer){
  if(!Array.isArray(answer))return null;
  const multiple=prompt.options?.damageMultiple;
  let total=0;
  for(const row of answer){
    if(!Number.isSafeInteger(row?.damage)||row.damage<0)
      return 'INVALID_DAMAGE_AMOUNT';
    total+=row.damage;
    if(!Number.isSafeInteger(total))return 'INVALID_DAMAGE_TOTAL';
    if(row.damage===0)continue;
    if(Number.isSafeInteger(multiple)&&multiple>0&&
      row.damage%multiple!==0)
      return 'INVALID_PRINTED_DAMAGE_PACKET';
    const target=row.target;
    const allowed=Array.isArray(prompt.maxAllowedDamage)?
      prompt.maxAllowedDamage:[];
    const cap=allowed.find(entry=>
      entry.target.player===target?.player&&
      entry.target.slot===target?.slot&&
      entry.target.index===target?.index);
    if(cap?.damage===0)return 'PRINTED_TARGET_ZERO_CAP';
  }
  // Native optional PutDamagePrompt.validate does not impose this budget;
  // actual Froslass UNM AttackAction can otherwise accept an eighth counter.
  if(prompt.options?.allowPlacePartialDamage===true&&
     Number.isSafeInteger(prompt.damage)&&total>prompt.damage)
    return 'EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET';
  return null;
}

/**
 * Source-specific printed Painful Spoons negative. Each transfer is one
 * 10-damage counter and the ability moves at most two from ONE opposing
 * Pokémon. A shared MoveDamagePrompt may be used by unrelated cards, so
 * this predicate is applied only to a prompt marked at the Radiant
 * Alakazam SIT reducer that actually created it.
 *
 * @param {unknown} answer Submitted native transfers.
 * @returns {string|null} Covered printed invalidity only.
 */
function independentPainfulSpoonsNegative(answer){
  if(!Array.isArray(answer)||answer.length<1||answer.length>2)
    return 'PAINFUL_SPOONS_PRINTED_COUNTER_COUNT_ONE_OR_TWO';
  if(answer.length<2)return null;
  const first=answer[0]?.from;
  if(!first||typeof first!=='object')return null;
  if(answer.some(row=>row?.from &&
      (row.from.player!==first.player||
       row.from.slot!==first.slot||
       row.from.index!==first.index)))
    return 'PAINFUL_SPOONS_MULTIPLE_SOURCE_POKEMON';
  return null;
}

/**
 * Independent mandatory two-other-card discard contract for the original
 * Ultra Ball MEG printing's genuine owner-hand payment prompt. Later search
 * prompts emitted by the same Item are not payment prompts.
 * @param {object} prompt Original native payment prompt.
 * @param {unknown} answer Native physical submitted payment cards.
 * @returns {string|null} Proven paper-invalid reason or no covered negative.
 */
function independentUltraBallPaymentNegative(prompt,answer){
  if(!Array.isArray(answer)||answer.length!==2)
    return 'ULTRA_BALL_PRINTED_PAYMENT_REQUIRES_EXACTLY_TWO';
  if(new Set(answer).size!==2)
    return 'ULTRA_BALL_REQUIRES_TWO_DISTINCT_PHYSICAL_CARDS';
  if(!Array.isArray(prompt?.cards?.cards)||
     answer.some(card=>!prompt.cards.cards.includes(card)))
    return 'ULTRA_BALL_PAYMENT_OUTSIDE_PHYSICAL_HAND';
  return null;
}

/**
 * Exact original Roxie CEC source-stamped ChooseCardsPrompt negative.
 * Roxie must discard 1 or 2 eligible own Pokémon, excluding Pokémon-EX
 * and Pokémon-GX. Physical owner-hand membership is required independently
 * from the pinned prompt's unreliable blocked-index validation.
 *
 * @param {object} prompt Genuine native source-stamped Roxie prompt.
 * @param {unknown} answer Submitted physical cards.
 * @param {(card:object)=>boolean|null} eligible Printed card predicate.
 * @returns {string|null} A proven printed invalidity or unknown.
 */
function independentRoxiePaymentNegative(prompt,answer,eligible){
  if(!Array.isArray(answer)||answer.length<1||answer.length>2)
    return 'ROXIE_PRINTED_PAYMENT_REQUIRES_ONE_OR_TWO';
  if(typeof eligible!=='function')return null;
  if(!Array.isArray(prompt.cards?.cards)||
     answer.some(card=>!prompt.cards.cards.includes(card)))
    return 'ROXIE_NOT_IN_PHYSICAL_OWNER_HAND';
  if(answer.some(card=>!eligible(card)))
    return 'ROXIE_PRINTED_DISALLOWS_SELECTED_CARD';
  return null;
}

const {nightWatchLikeShape}=
  require('./agent12-nightwatch-paper-random-chooser.cjs');
const {duplicatePhysicalChoiceReason}=
  require('./agent39-paper-distinct-selection.cjs');

const VERSION='agent41-unified-paper-prompt-contract-portfolio-v13-quick-ball-print-cost';
const STATUSES=['PAPER_PROMPT_VERIFIED','PAPER_PROMPT_INVALID',
  'PAPER_PROMPT_UNVERIFIED'];

/**
 * A native validator can reject an independently legal paper response or
 * overlook a physically foreign card. Make the own-deck membership proof
 * independent before calling a printed search contract verified.
 * @param {object} state Original physical state, never player policy input.
 * @param {object} action Real submitted ResolvePromptAction.
 * @param {object} old Existing source-stamp eligibility classification.
 * @returns {{paperValid:boolean,reason:string,nativeValid:boolean}}
 */
function independentCampingGearContract(state,action,old){
  const p=state.prompts?.find(x=>x.id===action.id&&x.result===undefined);
  const owner=state.players?.find(x=>x.id===p?.playerId);
  if(!owner||p?.player!==owner||p?.cards!==owner.deck||
      !Array.isArray(owner.deck?.cards))
    return {paperValid:false,reason:'own-deck-zone-mismatch',
      nativeValid:old.nativeValid};
  if(!Array.isArray(action.result)||action.result.length!==1)
    return {paperValid:false,reason:'printed-exactly-one-required',
      nativeValid:old.nativeValid};
  if(!owner.deck.cards.includes(action.result[0]))
    return {paperValid:false,reason:'selected-card-not-in-physical-own-deck',
      nativeValid:old.nativeValid};
  return {paperValid:true,reason:'printed-one-physical-own-deck-card',
    nativeValid:old.nativeValid};
}

/**
 * Redacted proof of native-declared physical selection geometry only.
 * This is never a printed-card effect certificate, and cannot identify a
 * concealed card or reveal a private selection's slot index or order.
 *
 * @param {object} state Pre-dispatch physical state.
 * @param {object|null} prompt Pending physical prompt.
 * @param {unknown} answer Submitted native reply, inspected post-policy.
 * @param {object} types Native PlayerType / SlotType enum.
 * @returns {object|null} Redacted selection geometry or unsupported family.
 */
function physicalPromptChoiceMetadata(state,prompt,answer,types){
  const family=prompt?.constructor?.name;
  if(!['ChoosePokemonPrompt','ChoosePrizePrompt','SelectPrompt',
    'OrderCardsPrompt'].includes(family))return null;
  const count=Array.isArray(answer)?answer.length:null;
  const out={family,selectedCount:count,nativeDeclaredGeometry:null,
    reason:'native-prompt-metadata-insufficient',
    containsPhysicalCardIdentities:false,
    printedPaperEffectQualified:false};
  if(answer===null&&prompt.options?.allowCancel===true){
    out.nativeDeclaredGeometry=true;
    out.reason='native-declared-cancel-allowed';
    return out;
  }
  const isArray=Array.isArray(answer)&&
    Object.keys(answer).length===answer.length;
  const range=(min,max)=>isArray&&
    (min===undefined||count>=min)&&
    (max===undefined||count<=max);
  const ownerSeat=state.players?.findIndex(p=>
    p.id===(typeof prompt.getPerspectivePlayerId==='function'?
      prompt.getPerspectivePlayerId():prompt.playerId));
  const owner=ownerSeat>=0?state.players[ownerSeat]:null;
  if(family==='ChoosePokemonPrompt'){
    if(!owner||!Array.isArray(prompt.slots)||
      !types?.SlotType||!types?.PlayerType)return out;
    const occupied=list=>typeof list?.getPokemonCard==='function'?
      Boolean(list.getPokemonCard()):
      Array.isArray(list?.cards)&&list.cards.length>0;
    const physical=list=>{
      for(let seat=0;seat<state.players.length;seat++){
        const p=state.players[seat];
        if(p.active===list)
          return {seat,slot:types.SlotType.ACTIVE};
        const i=p.bench?.indexOf(list)??-1;
        if(i>=0)return {seat,slot:types.SlotType.BENCH};
      }
      return null;
    };
    const seen=new Set();
    const valid=range(prompt.options?.min,prompt.options?.max)&&
      answer.every(list=>{
        const at=physical(list);
        if(!at||seen.has(list)||!occupied(list))return false;
        seen.add(list);
        const side=at.seat===ownerSeat?
          types.PlayerType.BOTTOM_PLAYER:types.PlayerType.TOP_PLAYER;
        return (prompt.playerType===types.PlayerType.ANY||
          prompt.playerType===side)&&prompt.slots.includes(at.slot);
      });
    out.nativeDeclaredGeometry=valid;
    out.reason=valid?'physical-pokemon-slot-and-declared-side-match':
      'invalid-physical-pokemon-slot-or-declared-side';
  }else if(family==='ChoosePrizePrompt'){
    if(!owner||!Number.isSafeInteger(prompt.options?.count))return out;
    const prizes=(prompt.options.useOpponentPrizes===true?
      state.players.find((p,i)=>i!==ownerSeat):owner)?.prizes;
    if(!Array.isArray(prizes))return out;
    const seen=new Set();
    const valid=isArray&&count===prompt.options.count&&
      answer.every(list=>{
        const index=prizes.indexOf(list);
        if(index<0||seen.has(list)||!Array.isArray(list?.cards)||
          list.cards.length===0||
          prompt.options.blocked?.includes(index))return false;
        seen.add(list);
        return true;
      });
    out.nativeDeclaredGeometry=valid;
    out.reason=valid?'physical-prize-zone-and-count-match':
      'invalid-physical-prize-zone-or-count';
  }else if(family==='SelectPrompt'){
    if(!Array.isArray(prompt.values))return out;
    const valid=Number.isSafeInteger(answer)&&answer>=0&&
      answer<prompt.values.length;
    out.nativeDeclaredGeometry=valid;
    out.reason=valid?'offered-option-index-match':
      'option-outside-native-offer';
  }else if(family==='OrderCardsPrompt'){
    const n=prompt.cards?.cards?.length;
    if(!Number.isSafeInteger(n))return out;
    const seen=new Set();
    const valid=isArray&&count===n&&answer.every(index=>{
      if(!Number.isSafeInteger(index)||index<0||index>=n||
        seen.has(index))return false;
      seen.add(index);
      return true;
    });
    out.nativeDeclaredGeometry=valid;
    out.reason=valid?'physical-index-permutation-shape-match':
      'invalid-native-index-permutation-shape';
  }
  return out;
}

/**
 * One research-owned native Store.dispatch boundary. Printed checks are
 * intentionally narrow: positive status certifies only the named contract.
 * All other families, including selection randomness, remain unverified.
 *
 * @template T
 * @param {()=>T} run Synchronous complete game, cohort, or native fixture.
 * @param {{Store?:Function,IronThornsex?:Function,RadiantAlakazam?:Function,
 *  wasPowerUsed?:Function,isRoxiePaymentCard?:(card:object)=>boolean,
 *  types?:object,
 *  currentTrialId?:()=>string|null,exampleLimit?:number,
 *  requireLiveStore?:boolean}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPaperPromptContractPortfolio(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=p=>require(path.join(output,p));
  const Store=deps.Store??native('game/store/store').Store;
  const IronThornsex=deps.IronThornsex??native(
    'sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex').IronThornsex;
  // Pure injected-Store tests can run without the compiled Twinleaf vendor.
  // Native runs always install the source-specific Radiant reducer marker.
  const RadiantAlakazam=deps.RadiantAlakazam??(deps.Store?null:native(
    'sets/09-sword-and-shield/set-silver-tempest/radiant-alakazam').RadiantAlakazam);
  const wasPowerUsed=deps.wasPowerUsed??(deps.Store?null:native(
    'game/store/prefabs/prefabs').WAS_POWER_USED);
  // Resolve native card classes only if an actual Roxie payment is
  // presented. This keeps injected-Store pure tests vendor-independent and
  // preserves printed validation for externally supplied genuine Stores.
  const isRoxiePaymentCard=deps.isRoxiePaymentCard??(card=>{
    const {PokemonCard}=native('game/store/card/pokemon-card');
    const {CardTag}=native('game/store/card/card-types');
    return card instanceof PokemonCard&&
      !card.hasTag(CardTag.POKEMON_GX)&&
      !card.hasTag(CardTag.POKEMON_EX);
  });
  const types=deps.types??{
    ...native('game/store/actions/play-card-action'),
    ...native('game/store/card/card-types')
  };
  const dispatchBefore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const reducerBefore=Object.getOwnPropertyDescriptor(
    IronThornsex.prototype,'reduceEffect');
  const spoonsReducerBefore=RadiantAlakazam?
    Object.getOwnPropertyDescriptor(RadiantAlakazam.prototype,'reduceEffect'):null;
  assert.equal(typeof dispatchBefore?.value,'function');
  assert.equal(typeof reducerBefore?.value,'function');
  if(RadiantAlakazam)
    assert.equal(typeof spoonsReducerBefore?.value,'function');
  const limit=deps.exampleLimit??24;
  assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=100);
  const marked=new WeakSet();
  const markedSpoons=new WeakSet();
  const liveByTrial=new Map();
  const liveOnly=deps.requireLiveStore===true;
  const trialKey=()=>deps.currentTrialId?.()??'__single__';
  const isLive=store=>!liveOnly||liveByTrial.get(trialKey())===store;
  const storeIndices=new WeakMap();
  const byTrial=Object.create(null);
  const audit={
    schema:VERSION,contractScope:[
      'ChooseCardsPrompt independent physical-card uniqueness and source-membership negative only',
      'Camping Gear BST mandatory own-deck exactly-one search',
      'Iron Thorns ex TWM printed Volt Cyclone transfer, positively reducer-marked',
      'PutDamagePrompt declared zero-target, whole-packet and optional budget negatives only',
      'Radiant Alakazam SIT source-marked Painful Spoons one-or-two counter and single-source negatives',
      'Roxie CEC source-stamped one-or-two owner Pokémon payment and no-eligible-root exclusions',
       'Ultra Ball MEG source-stamped exactly-two physical discard and insufficient-root exclusions',
      'Secret Box TWM source-stamped exactly-three other physical discard and insufficient-root exclusions',
      'Quick Ball FST/SSH source-stamped mandatory one OTHER owner-hand discard; optional Basic search is not cost',
      'Four interactive prompt families native-declared geometry recording only'
    ],
    resolvedNativeReplies:0,nativeAccepted:0,nativeRejected:0,
    nativeReturnedWithoutThrow:0,nativePromptSettled:0,
    nativeSilentNoop:0,nativeSettlementUnverified:0,
    vetoedBeforeDispatch:0,nativePreflightVetoed:0,
    markedVoltCyclonePrompts:0,markedPainfulSpoonsPrompts:0,
    inspectedRoxiePaymentPrompts:0,
    inspectedRoxiePlayCardRoots:0,vetoedRoxieNoEligibleRoots:0,
    inspectedUltraBallPlayCardRoots:0,vetoedUltraBallInsufficientRoots:0,
    inspectedUltraBallPaymentPrompts:0,
    inspectedSecretBoxPlayCardRoots:0,vetoedSecretBoxInsufficientRoots:0,
    inspectedSecretBoxPaymentPrompts:0,
    inspectedQuickBallPlayCardRoots:0,vetoedQuickBallInsufficientRoots:0,
    inspectedQuickBallPaymentPrompts:0,
    liveStoreRequired:liveOnly,liveSourceTrialCount:0,
    auxiliaryPromptAttempts:0,preLivePromptAttempts:0,
    physicalChoiceShapeCounts:{
      withinDeclaredGeometry:0,outsideDeclaredGeometry:0,
      insufficientMetadata:0},
    statusCounts:Object.fromEntries(STATUSES.map(s=>[s,0])),
    byFamily:{},byTrial,storeCount:0,stores:[],firstByStatus:{},
    examples:[],examplesTruncated:false,
    entireGamePaperQualified:false,competitiveQualifiedGames:0
  };
  function storeRow(store){
    let index=storeIndices.get(store);
    if(index===undefined){
      index=audit.stores.length;
      storeIndices.set(store,index);
      audit.stores.push({storeOrdinal:index,trialIds:[],
        acceptedPromptReplies:0,attemptedPromptReplies:0});
      audit.storeCount++;
    }
    return audit.stores[index];
  }
  function reduced(store,state,effect){
    const eligible=isLive(store)&&
      effect?.constructor?.name==='AfterAttackEffect'&&
      effect.attack===this.attacks?.[0];
    const before=eligible?new Set(state.prompts):null;
    const result=reducerBefore.value.call(this,store,state,effect);
    if(before){
      for(const prompt of state.prompts){
        if(!before.has(prompt)&&
          prompt?.constructor?.name==='AttachEnergyPrompt'&&
          prompt.playerId===effect.player?.id){
          marked.add(prompt);
          audit.markedVoltCyclonePrompts++;
        }
      }
    }
    return result;
  }
  function reducedSpoons(store,state,effect){
    const eligible=isLive(store)&&wasPowerUsed(effect,0,this)===true;
    const before=eligible?new Set(state.prompts):null;
    const result=spoonsReducerBefore.value.call(this,store,state,effect);
    if(before){
      for(const prompt of state.prompts){
        if(!before.has(prompt)&&
           prompt?.constructor?.name==='MoveDamagePrompt'&&
           prompt.playerId===effect.player?.id){
          markedSpoons.add(prompt);
          audit.markedPainfulSpoonsPrompts++;
        }
      }
    }
    return result;
  }
  function dispatched(action,...args){
    const type=action?.constructor?.name;
    if(liveOnly&&type==='AddPlayerAction'&&
      !liveByTrial.has(trialKey())){
      liveByTrial.set(trialKey(),this);
      audit.liveSourceTrialCount++;
    }
    if(liveOnly&&!isLive(this)){
      if(type==='ResolvePromptAction'){
        if(liveByTrial.has(trialKey()))audit.auxiliaryPromptAttempts++;
        else audit.preLivePromptAttempts++;
      }
      return dispatchBefore.value.call(this,action,...args);
    }
    const store=storeRow(this);
    if(type==='PlayCardAction'){
      const owner=this.state.players?.find(p=>p.id===action.id);
      const played=owner?.hand?.cards?.[action.handIndex];
      if(QUICK_BALL_PRINTINGS.has(played?.fullName)){
        audit.inspectedQuickBallPlayCardRoots++;
        if(!owner.hand.cards.some(card=>card!==played)){
          audit.vetoedQuickBallInsufficientRoots++;
          throw new Error('PAPER_ROOT_INVALID:QUICK_BALL_ONE_OTHER_CARD_REQUIRED');
        }
      }
      if(played?.fullName==='Roxie CEC'){
        audit.inspectedRoxiePlayCardRoots++;
        if(!owner.hand.cards.some(card=>card!==played&&
          isRoxiePaymentCard(card))){
          audit.vetoedRoxieNoEligibleRoots++;
          throw new Error('PAPER_ROOT_INVALID:ROXIE_CEC_NO_ELIGIBLE_POKEMON');
        }
      }
      if(played?.fullName==='Ultra Ball MEG'){
        audit.inspectedUltraBallPlayCardRoots++;
        if(owner.hand.cards.length<3){
          audit.vetoedUltraBallInsufficientRoots++;
          throw new Error('PAPER_ROOT_INVALID:ULTRA_BALL_REQUIRES_TWO_OTHER_CARDS');
        }
      }
      if(played?.fullName==='Secret Box TWM'){
        audit.inspectedSecretBoxPlayCardRoots++;
        if(owner.hand.cards.length<4){
          audit.vetoedSecretBoxInsufficientRoots++;
          throw new Error('PAPER_ROOT_INVALID:SECRET_BOX_REQUIRES_THREE_OTHER_CARDS');
        }
      }
    }
    if(type!=='ResolvePromptAction')
      return dispatchBefore.value.call(this,action,...args);
    const prompt=this.state.prompts?.find(p=>p.id===action.id&&
      p.result===undefined);
    const family=prompt?.constructor?.name??'missing-pending-prompt';
    const trial=deps.currentTrialId?.()??null;
    const camping=campingGearPaperVerdict(this.state,action);
    const volt=Boolean(prompt&&marked.has(prompt));
    const spoons=Boolean(prompt&&markedSpoons.has(prompt));
    let status='PAPER_PROMPT_UNVERIFIED';
    let sourcePrinting=prompt?.sourceCard?.fullName??null;
    let contract=null;
    let reason='no-independent-printed-contract';
    let nativePreflightRejected=false;
    const physicalSourceDefect=duplicatePhysicalChoiceReason(
      prompt,action.result);
    if(physicalSourceDefect){
      contract='generic-physical-choose-cards-unique-source-membership';
      status='PAPER_PROMPT_INVALID';
      reason=physicalSourceDefect;
    }else if(volt){
      sourcePrinting='Iron Thorns ex TWM';
      contract='printed-volt-cyclone-energy-transfer';
      const result=verdictVoltCyclone(this.state,prompt,action.result,types);
      // Independent printed geometry and native engine preflight are
      // distinct: native can veto a paper-valid proposed transfer.
      nativePreflightRejected=result.valid &&
        typeof prompt.validate==='function' &&
        prompt.validate(action.result,this.state)===false;
      status=nativePreflightRejected?'PAPER_PROMPT_UNVERIFIED':
        result.valid?'PAPER_PROMPT_VERIFIED':'PAPER_PROMPT_INVALID';
      reason=nativePreflightRejected?
        'native-additional-contract-rejected':result.reason;
    }else if(camping.applicable){
      sourcePrinting='Camping Gear BST';
      contract='mandatory-one-own-deck-card';
      const result=independentCampingGearContract(this.state,action,camping);
      nativePreflightRejected=result.paperValid&&!result.nativeValid;
      status=!result.paperValid?'PAPER_PROMPT_INVALID':
        nativePreflightRejected?'PAPER_PROMPT_UNVERIFIED':
        'PAPER_PROMPT_VERIFIED';
      reason=nativePreflightRejected?
        'native-validator-rejected-independent-print-valid-selection':
        result.reason;
    }else if(family==='ChooseCardsPrompt'&&
             prompt?.sourceCard?.fullName==='Roxie CEC'){
      audit.inspectedRoxiePaymentPrompts++;
      sourcePrinting='Roxie CEC';
      contract='printed-roxie-nonempty-eligible-own-pokemon-negative';
      const rejected=independentRoxiePaymentNegative(
        prompt,action.result,isRoxiePaymentCard);
      if(rejected)status='PAPER_PROMPT_INVALID';
      reason=rejected??'only-negative-predicates-audited';
    }else if(family==='ChooseCardsPrompt'&&
              prompt?.sourceCard?.fullName==='Ultra Ball MEG'&&
              prompt.options?.min===2&&prompt.options?.max===2){
      audit.inspectedUltraBallPaymentPrompts++;
      sourcePrinting='Ultra Ball MEG';
      contract='printed-ultra-ball-exactly-two-physical-discard-negative';
      const rejected=independentUltraBallPaymentNegative(prompt,action.result);
      if(rejected)status='PAPER_PROMPT_INVALID';
      reason=rejected??'only-negative-predicates-audited';
    }else if(family==='ChooseCardsPrompt'&&
              QUICK_BALL_PRINTINGS.has(prompt?.sourceCard?.fullName)&&
              prompt.message==='CHOOSE_CARD_TO_DISCARD'){
      audit.inspectedQuickBallPaymentPrompts++;
      sourcePrinting=prompt.sourceCard.fullName;
      contract='printed-quick-ball-exactly-one-other-owner-hand-discard-negative';
      const owner=this.state.players?.find(p=>p.id===prompt.playerId);
      const rejected=quickBallPaymentNegative(prompt,action.result,owner);
      if(rejected)status='PAPER_PROMPT_INVALID';
      reason=rejected??'only-negative-predicates-audited';
    }else if(family==='ChooseCardsPrompt'&&
              prompt?.sourceCard?.fullName==='Secret Box TWM'&&
              prompt.message==='CHOOSE_CARD_TO_DISCARD'){
      audit.inspectedSecretBoxPaymentPrompts++;
      sourcePrinting='Secret Box TWM';
      contract='printed-secret-box-exactly-three-other-physical-discard-negative';
      const owner=this.state.players?.find(p=>p.id===prompt.playerId);
      const rejected=secretBoxPaymentNegative(prompt,action.result,owner);
      if(rejected)status='PAPER_PROMPT_INVALID';
      reason=rejected??'only-negative-predicates-audited';
    }else if(spoons&&family==='MoveDamagePrompt'){
      sourcePrinting='Radiant Alakazam SIT';
      contract='printed-painful-spoons-one-or-two-counter-single-source-negative';
      const rejected=independentPainfulSpoonsNegative(action.result);
      if(rejected)status='PAPER_PROMPT_INVALID';
      reason=rejected??'only-negative-predicates-audited';
    }else if(family==='PutDamagePrompt'){
      contract='declared-zero-target-whole-packet-and-optional-budget-negative-only';
      const rejected=independentPutDamageNegative(prompt,action.result);
      if(['PRINTED_TARGET_ZERO_CAP','INVALID_PRINTED_DAMAGE_PACKET',
        'INVALID_DAMAGE_AMOUNT','INVALID_DAMAGE_TOTAL',
        'EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET'].includes(rejected)){
        status='PAPER_PROMPT_INVALID';
      }
      reason=rejected??'only-negative-predicates-audited';
    }else if(prompt){
      const owner=this.state.players?.find(p=>p.id===prompt.playerId);
      if(owner&&nightWatchLikeShape(this.state,owner,prompt)){
        contract='night-watch-like-opponent-hand-shape-only';
        reason='paper-randomness-not-independently-sampled-or-attributed';
      }
    }
    const choiceGeometry=physicalPromptChoiceMetadata(
      this.state,prompt,action.result,types);
    if(choiceGeometry){
      const category=choiceGeometry.nativeDeclaredGeometry===true?
        'withinDeclaredGeometry':
        choiceGeometry.nativeDeclaredGeometry===false?
          'outsideDeclaredGeometry':'insufficientMetadata';
      audit.physicalChoiceShapeCounts[category]++;
    }
    const event={storeOrdinal:store.storeOrdinal,trialId:trial,
      turn:this.state.turn??null,family,sourcePrinting,
      contract,status,reason,submittedCount:Array.isArray(action.result)?
        action.result.length:null,nativeAccepted:false,
      vetoedBeforeDispatch:false,nativePreflightRejected,
      nativeReturnedWithoutThrow:false,nativePromptSettled:false,
      nativeSilentNoop:false,nativeSettlementUnverified:false,
      physicalEffectVerified:false,choiceGeometry};
    audit.resolvedNativeReplies++;
    store.attemptedPromptReplies++;
    if(trial){
      const record=byTrial[trial]??={attempted:0,nativeAccepted:0,
        statusCounts:Object.fromEntries(STATUSES.map(s=>[s,0])),events:[]};
      record.attempted++;
      record.statusCounts[status]++;
      record.events.push(event);
      if(!store.trialIds.includes(trial))store.trialIds.push(trial);
    }
    audit.statusCounts[status]++;
    audit.byFamily[family]??={count:0,
      statusCounts:Object.fromEntries(STATUSES.map(s=>[s,0]))};
    audit.byFamily[family].count++;
    audit.byFamily[family].statusCounts[status]++;
    if(!audit.firstByStatus[status])audit.firstByStatus[status]=event;
    if(audit.examples.length<limit)audit.examples.push(event);
    else audit.examplesTruncated=true;
    if(status==='PAPER_PROMPT_INVALID'){
      event.vetoedBeforeDispatch=true;
      audit.vetoedBeforeDispatch++;
      throw new Error('PAPER_PROMPT_INVALID:'+String(contract)+':'+reason);
    }
    if(nativePreflightRejected){
      event.vetoedBeforeDispatch=true;
      audit.nativePreflightVetoed++;
      throw new Error('NATIVE_PROMPT_PREFLIGHT_REJECTED:'+
        String(contract)+':'+reason);
    }
    try{
      const result=dispatchBefore.value.call(this,action,...args);
      event.nativeReturnedWithoutThrow=true;
      audit.nativeReturnedWithoutThrow++;
      const resolved=prompt&&prompt.result!==undefined&&
        Object.is(prompt.result,action.result);
      event.nativePromptSettled=Boolean(resolved);
      if(resolved){
        event.nativeAccepted=true;
        audit.nativePromptSettled++;
        store.acceptedPromptReplies++;
        audit.nativeAccepted++;
        if(trial)byTrial[trial].nativeAccepted++;
      }else if(prompt&&prompt.result===undefined&&
               this.state.prompts?.includes(prompt)){
        event.nativeSilentNoop=true;
        audit.nativeSilentNoop++;
      }else{
        event.nativeSettlementUnverified=true;
        audit.nativeSettlementUnverified++;
      }
      return result;
    }catch(error){
      audit.nativeRejected++;
      throw error;
    }
  }
  Object.defineProperty(IronThornsex.prototype,'reduceEffect',
    {...reducerBefore,value:reduced});
  if(RadiantAlakazam)
    Object.defineProperty(RadiantAlakazam.prototype,'reduceEffect',
      {...spoonsReducerBefore,value:reducedSpoons});
  Object.defineProperty(Store.prototype,'dispatch',
    {...dispatchBefore,value:dispatched});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent41UnifiedPaperPromptPortfolio=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatched);
    assert.strictEqual(IronThornsex.prototype.reduceEffect,reduced);
    if(RadiantAlakazam)
      assert.strictEqual(RadiantAlakazam.prototype.reduceEffect,reducedSpoons);
    Object.defineProperty(Store.prototype,'dispatch',dispatchBefore);
    Object.defineProperty(IronThornsex.prototype,'reduceEffect',reducerBefore);
    if(RadiantAlakazam)
      Object.defineProperty(RadiantAlakazam.prototype,'reduceEffect',
        spoonsReducerBefore);
  }
}
module.exports={VERSION,independentCampingGearContract,
  independentPutDamageNegative,independentPainfulSpoonsNegative,
  independentRoxiePaymentNegative,independentUltraBallPaymentNegative,
  physicalPromptChoiceMetadata,
  withPaperPromptContractPortfolio};
