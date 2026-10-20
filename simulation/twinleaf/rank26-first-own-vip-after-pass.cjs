'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const VIP = 'Battle VIP Pass';
const MELOETTA = 'Meloetta ex';
const EXEGGCUTE = 'Exeggcute';
const KOKO = 'Tapu Koko Prism Star';
const COLOGNE = 'Canceling Cologne';
const SQUAWK = 'Squawkabilly ex';
const COMPRESSOR = 'Battle Compressor';
const LIGHTNING = 'Lightning Energy';

const {actorObservation} = require('./actor-observation-contract.cjs');

/**
 * Pre-search owner-only first-turn VIP opportunity from the detached,
 * frozen actor-observation contract. No native State or opponent hidden
 * identities are available to this decision predicate.
 * @param {object} view Verified owner actorObservation.
 * @param {number} phase Pinned PLAYER_TURN enum.
 * @returns {boolean}
 */
function sourceVipActorEligible(view,phase) {
  const inPlay=name=>[view.ownPublic.active,...view.ownPublic.bench]
    .some(slot=>slot?.printing?.startsWith(name+' '));
  const hasHand=name=>view.ownHand.some(print=>
    print.startsWith(name+' '));
  const free=view.ownPublic.bench.filter(slot=>slot===null).length;
  return view.decisionKind==='owner-root' &&
    view.globalTurn===1 && view.phase===phase &&
    hasHand(VIP) && !inPlay(MELOETTA) && !hasHand(MELOETTA) &&
    free > (inPlay(KOKO) ? 0 : 1);
}

/**
 * Owner-visible conditional next action after the VIP prompt has resolved.
 * The check does not inspect concealed deck, opponent hand, or Prizes.
 * @param {object} view Authenticated detached actor observation.
 * @param {number} phase Pinned PLAYER_TURN enum.
 * @returns {boolean}
 */
function sourceCologneAfterVipEligible(view,phase) {
  const inPlay=[view.ownPublic.active,...view.ownPublic.bench].some(slot=>
    slot?.printing?.startsWith(MELOETTA+' '));
  return view.decisionKind==='owner-root' &&
    view.globalTurn===1 && view.phase===phase &&
    view.ownTurnResources?.itemPlayLocked!==true &&
    view.ownHand.some(card=>card.startsWith(COLOGNE+' ')) &&
    inPlay && view.opponentPublic.active?.printing?.startsWith('Iron Thorns ex ')===true;
}

/**
 * Independent second VIP option after real first-turn Bench Squawk has supplied
 * another held VIP. The decision sees only the actual owner's detached hand,
 * the public board and ordinary Item lock flags. Whether Koko remains in deck
 * is learned only inside the subsequent native owner search.
 * @param {object} view Detached actor observation.
 * @param {number} phase Native PLAYER_TURN enum.
 * @returns {boolean}
 */
function sourceSecondVipActorEligible(view,phase) {
  const inPlay=name=>[view.ownPublic.active,...view.ownPublic.bench]
    .some(slot=>slot?.printing?.startsWith(name+' '));
  return view.decisionKind==='owner-root' &&
    view.globalTurn===1 && view.phase===phase &&
    view.ownTurnResources?.itemPlayLocked!==true &&
    view.ownHand.some(card=>card.startsWith(VIP+' ')) &&
    inPlay(MELOETTA) && inPlay(SQUAWK) && !inPlay(KOKO) &&
    view.ownPublic.bench.some(slot=>slot===null);
}

/**
 * A third missed setup Item at the ordinary root after Koko enters the Bench.
 * Only actor hand and public board determine whether to *offer* the Item.
 * Actual available Lightning and other deck cards are inspected exclusively
 * after the real owner's deck-search prompt opens.
 * @param {object} view Detached actor observation.
 * @param {number} phase Native player's first-turn phase.
 * @returns {boolean}
 */
function sourceCompressorAfterKokoEligible(view,phase) {
  const inPlay=name=>[view.ownPublic.active,...view.ownPublic.bench]
    .some(slot=>slot?.printing?.startsWith(name+' '));
  return view.decisionKind==='owner-root' &&
    view.globalTurn===1 && view.phase===phase &&
    view.ownTurnResources?.itemPlayLocked!==true &&
    view.ownHand.some(card=>card.startsWith(COMPRESSOR+' ')) &&
    inPlay(MELOETTA) && inPlay(KOKO);
}

/**
 * This check sees only the acting player hand and public Active/Bench.
 * Reserve one Bench slot for Koko if Koko has not entered play.
 * @param {object} state Native live source state.
 * @param {object} own Source player.
 * @param {0|1} seat Physical source seat.
 * @param {number} phase Pinned PLAYER_TURN phase.
 * @returns {boolean}
 */
function sourceVipAfterPassEligible(state, own, seat, phase) {
  const board = [own.active, ...own.bench];
  const hasInPlay = name => board.some(
    slot => slot.getPokemonCard()?.name === name);
  const empty = own.bench.filter(slot => !slot.getPokemonCard()).length;
  return state.turn === 1 && state.activePlayer === seat &&
    state.phase === phase && state.players[seat] === own &&
    !state.prompts.some(prompt => prompt.result === undefined) &&
    own.hand.cards.some(card => card.name === VIP) &&
    !hasInPlay(MELOETTA) &&
    !own.hand.cards.some(card => card.name === MELOETTA) &&
    empty > (hasInPlay(KOKO) ? 0 : 1);
}

/**
 * Owner-deck inspection is permitted only after the actual owner search prompt.
 * Prefer a missing Meloetta then a physical Exeggcute without filling the
 * reserved Koko Bench slot or selecting a card unavailable in the search.
 * @param {object} own Source player after VIP was accepted.
 * @param {object} prompt Actual owner-deck ChooseCardsPrompt.
 * @param {object} state Live state.
 * @param {{preferSquawk?:boolean}} [options] Owner-prompt-only target prioritization.
 * @returns {object[]} Native card references, zero to two.
 */
function selectSourceVipBasics(own, prompt, state, {preferSquawk=false}={}) {
  const kokoInPlay = [own.active, ...own.bench].some(
    slot => slot.getPokemonCard()?.name === KOKO);
  const free = own.bench.filter(slot => !slot.getPokemonCard()).length;
  const budget = Math.min(2, free - (kokoInPlay ? 0 : 1));
  if (budget < 1) return [];
  const choices = [];
  for (const name of preferSquawk ? [MELOETTA,SQUAWK,EXEGGCUTE] :
    [MELOETTA,EXEGGCUTE]) {
    if (choices.length >= budget) break;
    const card = prompt.cards.cards.find(item =>
      item.name === name && !choices.includes(item));
    if (card) choices.push(card);
  }
  for (let n = choices.length; n >= 1; n--) {
    const group = choices.slice(0,n);
    if (prompt.validate(group,state)) return group;
  }
  return [];
}

/**
 * Select available genuine physical cards only after the second native owner
 * deck-search prompt is offered. Koko permits a potentially useful Lightning
 * acceleration later in the same turn; no such acceleration is assumed here.
 * @param {object} own Owner after accepted VIP.
 * @param {object} prompt Live owner-deck ChooseCardsPrompt.
 * @param {object} state Live native State.
 * @returns {object[]} Actual source cards (up to two).
 */
function selectSecondVipBasics(own,prompt,state) {
  const free=own.bench.filter(slot=>!slot.getPokemonCard()).length;
  const choices=[];
  for(const name of [KOKO,EXEGGCUTE]){
    if(choices.length>=Math.min(2,free))break;
    const card=prompt.cards.cards.find(c=>c.name===name&&!choices.includes(c));
    if(card)choices.push(card);
  }
  for(let n=choices.length;n>=1;n--){
    const group=choices.slice(0,n);
    if(prompt.validate(group,state))return group;
  }
  return [];
}

/**
 * Select only genuine owner-deck cards in the native Battle Compressor prompt.
 * Prepare available basic Lightning cards for the printed Koko acceleration;
 * any remaining slot may put a physical Exeggcute into the discard pile.
 * This is a tactical experiment and does not establish optimal discard value.
 * @param {object} prompt Genuine owner ChooseCardsPrompt.
 * @param {object} state Native Store state.
 * @returns {object[]} References from this exact owner's prompted deck.
 */
function selectSourceCompressorCards(prompt,state){
  const found=[];
  for(const name of [LIGHTNING,LIGHTNING,EXEGGCUTE]){
    const card=prompt.cards.cards.find(c=>c.name===name&&!found.includes(c));
    if(card)found.push(card);
  }
  for(let n=found.length;n>=1;n--){
    const group=found.slice(0,n);
    if(prompt.validate(group,state))return group;
  }
  return [];
}

/**
 * Public post-Store physical-zone observation, read at a genuine next root.
 * This does not infer action success from a selected ability declaration:
 * Koko must have reached the Lost Zone and real Lightning cards must have
 * reached distinct Bench recipients.
 * @param {object} own Native physical source owner.
 * @returns {{prismInLostZone:boolean,prismCount:number,
 *   recipientCount:number,lightningAttached:number,
 *   benchRecipients:object[],discardLightning:number}}
 */
function sourceKokoNativePostcondition(own){
  const prismCount=own.lostzone.cards.filter(c=>c.name===KOKO).length;
  const benchRecipients=own.bench.map((slot,index)=>({
    index,pokemon:slot.getPokemonCard()?.fullName??null,
    lightning:slot.energies.cards.filter(c=>c.name===LIGHTNING).length
  }));
  return {prismInLostZone:prismCount>0,prismCount,
    recipientCount:benchRecipients.filter(r=>r.lightning>0).length,
    lightningAttached:benchRecipients.reduce((n,r)=>n+r.lightning,0),
    benchRecipients,
    discardLightning:own.discard.cards.filter(c=>c.name===LIGHTNING).length};
}

/**
 * Once the existing source bot proposes Pass, attempt one owner-information
 * Battle VIP Pass root, then resolve its native owner-deck search. No card
 * instances are fabricated. This is an opt-in development policy, not an
 * established optimal opening or competitive win-rate test.
 * @template T
 * @param {0|1} seat Source physical seat.
 * @param {()=>T} execute Synchronous native headless experiment.
 * @param {{followupCologne?:boolean,preferSquawk?:boolean,followupSecondVip?:boolean,followupCompressor?:boolean,auditTacticMutation?:boolean}} [options] Opt-in source alternatives.
 * @returns {{result:T,policyAudit:object}}
 */
function withSourceVipAfterPass(seat, execute,
  {followupCologne=false,preferSquawk=false,followupSecondVip=false,
    followupCompressor=false,auditTacticMutation=false}={}) {
  if (![0,1].includes(seat) || typeof execute !== 'function')
    throw new TypeError('Need source seat and synchronous runner');
  const get = subpath => require(path.join(OUTPUT, subpath));
  const {SimpleTacticsAi} = get('simple-bot/simple-tactics-ai');
  const {PlayCardAction, PlayerType, SlotType} =
    get('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    get('game/store/actions/resolve-prompt-action');
  const {GamePhase} = get('game/store/state/state');
  const previous = SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId = seat === 0 ? 101 : 202;
  const events = [];
  let stage = 'available';
  const override = function rank26VipAfterPass(state) {
    const own = state.players[seat];
    if (this.client?.id !== sourceId || !own)
      return previous.call(this,state);
    const prompt = state.prompts.find(p => p.result === undefined);
    if(stage==='compressor-search' && prompt){
      if(prompt.constructor.name==='WaitPrompt')
        return previous.call(this,state);
      if(prompt.constructor.name==='ChooseCardsPrompt' &&
          prompt.playerId===sourceId && prompt.cards===own.deck){
        const selected=selectSourceCompressorCards(prompt,state);
        const lightningAvailable=prompt.cards.cards
          .filter(c=>c.name===LIGHTNING).length;
        events.push({kind:'owner-compressor-deck-target',turn:state.turn,
          nativeValid:prompt.validate(selected,state),
          physicalAvailableLightning:lightningAvailable,
          cards:selected.map(c=>c.fullName)});
        stage='compressor-post';
        return new ResolvePromptAction(prompt.id,selected);
      }
      events.push({kind:'compressor-unexpected-prompt',
        type:prompt.constructor.name});
      stage='compressor-finished';
    }
    if(stage==='second-search' && prompt){
      if(prompt.constructor.name==='WaitPrompt')
        return previous.call(this,state);
      if(prompt.constructor.name==='ChooseCardsPrompt' &&
          prompt.playerId===sourceId && prompt.cards===own.deck){
        const selected=selectSecondVipBasics(own,prompt,state);
        events.push({kind:'second-owner-deck-target',turn:state.turn,
          cards:selected.map(c=>c.fullName),nativeValid:selected.length>0,
          searchedKokoAvailable:prompt.cards.cards.some(c=>c.name===KOKO)});
        stage='second-post';
        if(selected.length)return new ResolvePromptAction(prompt.id,selected);
      }else{
        events.push({kind:'second-unexpected-prompt',type:prompt.constructor.name});
        stage='second-finished';
      }
    }
    if (stage === 'search' && prompt) {
      if (prompt.constructor.name === 'WaitPrompt')
        return previous.call(this,state);
      if (prompt.constructor.name === 'ChooseCardsPrompt' &&
          prompt.playerId === sourceId && prompt.cards === own.deck) {
        const selected = selectSourceVipBasics(own,prompt,state,{preferSquawk});
        events.push({kind:'owner-deck-target',turn:state.turn,
          cards:selected.map(c => c.fullName),nativeValid:selected.length>0,
          searchedSquawkAvailable:prompt.cards.cards.some(c=>c.name===SQUAWK),
          preferSquawk});
        stage = 'post';
        if (selected.length)
          return new ResolvePromptAction(prompt.id,selected);
      } else {
        events.push({kind:'unexpected-prompt',type:prompt.constructor.name});
        stage = 'finished';
      }
    }
    if (stage === 'post' && !prompt) {
      events.push({kind:'public-board-after',turn:state.turn,
        bench:own.bench.map(s => s.getPokemonCard()?.fullName ?? null)});
      stage = 'finished';
      if (followupCologne) {
        const view=actorObservation(state,seat);
        if (sourceCologneAfterVipEligible(view,GamePhase.PLAYER_TURN)) {
          const index=own.hand.cards.findIndex(c=>c.name===COLOGNE);
          const next=new PlayCardAction(sourceId,index,{
            player:PlayerType.ANY,slot:SlotType.BOARD,index:0
          });
          const nativeValid=this.isValidAction(state,next);
          events.push({kind:'owner-cologne-after-vip-offer',turn:state.turn,
            nativeValid,card:own.hand.cards[index].fullName,
            opponentActive:view.opponentPublic.active?.printing??null});
          if (nativeValid) {
            stage='cologne-post';
            return next;
          }
        }
      }
    }
    if (stage==='cologne-post' && !prompt) {
      events.push({kind:'owner-cologne-postcondition',turn:state.turn,
        sourceHasCologne:own.hand.cards.some(c=>c.name===COLOGNE),
        sourceDiscardHasCologne:own.discard.cards.some(c=>c.name===COLOGNE)});
      stage='finished';
    }
    if(stage==='second-post' && !prompt){
      events.push({kind:'second-public-board-after',turn:state.turn,
        bench:own.bench.map(s=>s.getPokemonCard()?.fullName??null)});
      stage='second-finished';
    }
    if(stage==='compressor-post' && !prompt){
      events.push({kind:'owner-compressor-postcondition',turn:state.turn,
        physicalDiscardLightning:own.discard.cards
          .filter(c=>c.name===LIGHTNING).length,
        physicalDiscardEgg:own.discard.cards
          .filter(c=>c.name===EXEGGCUTE).length,
        ownerHasCompressor:own.hand.cards.some(c=>c.name===COMPRESSOR),
        discardHasCompressor:own.discard.cards.some(c=>c.name===COMPRESSOR)});
      stage='compressor-finished';
    }
    if(stage==='compressor-finished'&&!prompt &&
        !events.some(e=>e.kind==='source-koko-native-postcondition')){
      const effect=sourceKokoNativePostcondition(own);
      if(effect.prismInLostZone){
        events.push({kind:'source-koko-native-postcondition',turn:state.turn,
          ...effect});
      }
    }
    const auditBefore=auditTacticMutation && stage==='compressor-finished' &&
      !prompt && state.turn===1 && state.activePlayer===seat &&
      state.phase===GamePhase.PLAYER_TURN
      ?actorObservation(state,seat):null;
    const action = previous.call(this,state);
    if(auditBefore){
      const auditAfter=actorObservation(state,seat);
      events.push({kind:'source-bot-root-scorer-mutation-audit',
        turn:state.turn,action:action?.constructor?.name??null,
        beforeSupporterTurn:auditBefore.ownTurnResources.supporterPlayedTurn,
        afterSupporterTurn:auditAfter.ownTurnResources.supporterPlayedTurn,
        beforeHand:auditBefore.ownHand,
        afterHand:auditAfter.ownHand,
        heldCarmine:auditBefore.ownHand.some(c=>c.startsWith('Carmine ')),
        supporterTurnChanged:auditBefore.ownTurnResources.supporterPlayedTurn!==
          auditAfter.ownTurnResources.supporterPlayedTurn,
        ownerHandChanged:JSON.stringify(auditBefore.ownHand)!==
          JSON.stringify(auditAfter.ownHand)});
    }
    if(followupCompressor && stage==='second-finished' &&
        action?.constructor?.name==='PassTurnAction' &&
        state.turn===1 && state.activePlayer===seat &&
        state.phase===GamePhase.PLAYER_TURN){
      const view=actorObservation(state,seat);
      if(sourceCompressorAfterKokoEligible(view,GamePhase.PLAYER_TURN)){
        const index=own.hand.cards.findIndex(c=>c.name===COMPRESSOR);
        const replacement=new PlayCardAction(sourceId,index,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
        const nativeValid=this.isValidAction(state,replacement);
        events.push({kind:'owner-compressor-offer',turn:state.turn,
          nativeValid,card:own.hand.cards[index].fullName,
          detachedActorView:true});
        stage=nativeValid?'compressor-search':'compressor-finished';
        if(nativeValid)return replacement;
      }
    }
    if(followupSecondVip && stage==='finished' &&
        action?.constructor?.name==='PassTurnAction' &&
        state.turn===1 && state.activePlayer===seat &&
        state.phase===GamePhase.PLAYER_TURN){
      const view=actorObservation(state,seat);
      if(sourceSecondVipActorEligible(view,GamePhase.PLAYER_TURN)){
        const index=own.hand.cards.findIndex(c=>c.name===VIP);
        const candidate=new PlayCardAction(sourceId,index,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
        const nativeValid=this.isValidAction(state,candidate);
        events.push({kind:'second-vip-offer',turn:state.turn,
          nativeValid,card:own.hand.cards[index].fullName,
          detachedActorView:true});
        stage=nativeValid?'second-search':'second-finished';
        if(nativeValid)return candidate;
      }
    }
    if (stage === 'available' &&
        action?.constructor?.name === 'PassTurnAction' &&
        state.turn === 1 && state.phase === GamePhase.PLAYER_TURN &&
        state.activePlayer === seat) {
      const view = actorObservation(state,seat);
      const eligible = sourceVipActorEligible(view,GamePhase.PLAYER_TURN);
      assert.equal(eligible,
        sourceVipAfterPassEligible(state,own,seat,GamePhase.PLAYER_TURN),
        'Detached actor view changed the first-turn VIP eligibility');
      if (eligible) {
        const handIndex = own.hand.cards.findIndex(c => c.name === VIP);
        const replacement = new PlayCardAction(sourceId,handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
        const nativeValid = this.isValidAction(state,replacement);
        events.push({kind:'source-pass-vip-opportunity',turn:state.turn,
          nativeValid,seat,freeBench:own.bench.filter(s=>!s.getPokemonCard()).length,
          detachedActorView:true});
        stage = nativeValid ? 'search' : 'finished';
        if (nativeValid) return replacement;
      }
    }
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction = override;
  try {
    return {result:execute(),policyAudit:{
      version:'rank26-first-own-vip-after-pass-v1'+
        (followupCologne?'+owner-cologne-followup-v1':'')+
        (preferSquawk?'+owner-squawk-priority-v1':'')+
        (followupSecondVip?'+owner-second-vip-v1':'')+
        (followupCompressor?'+owner-compressor-after-koko-v1':'')+
        (auditTacticMutation?'+read-only-tactic-purity-audit-v1':''),
      seat,events,
      finalStage:stage,competitiveGameQualified:false
    }};
  } finally {
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,override,
      'Rank26 VIP wrapper lost single-owner bot override');
    SimpleTacticsAi.prototype.decodeNextAction = previous;
  }
}

module.exports={sourceVipAfterPassEligible,sourceVipActorEligible,
  sourceCologneAfterVipEligible,sourceSecondVipActorEligible,
  sourceCompressorAfterKokoEligible,selectSourceCompressorCards,
  sourceKokoNativePostcondition,
  selectSourceVipBasics,selectSecondVipBasics,withSourceVipAfterPass};
