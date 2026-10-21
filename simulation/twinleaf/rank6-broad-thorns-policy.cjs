'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

// Preference is explicitly heuristic. Distinct hand Card objects pay distinct
// discard slots. Avoid consuming the ACE SPEC and irreplaceable attack channel.
const discardOrder=[
  'Tropical Beach',"Trainers' Mail",'Palace Belt','Camping Gear',
  "Player's Ceremony",'Crushing Hammer','Enhanced Hammer',
  'Team Flare Grunt','Plumeria','Handheld Fan','Tool Jammer','Echoing Horn',
  "Team Rocket's Handiwork",'Team Skull Grunt','Sidney','Eri','Faba',
  'Captivating Poké Puff','Palace Book','Cynthia & Caitlin',
  'Guzma','Lillie\'s Determination','Lusamine','Gladion'
];

/**
 * @param {{name:string}[]} cards
 * @param {string[]} [priorities]
 * @param {boolean} [conditionalTagCallPayment]
 * @returns {{name:string}[]}
 */
function chooseOpeningDiscards(
  cards,priorities=discardOrder,conditionalTagCallPayment=false
) {
  const out=[];
  for(const name of priorities) {
    for(const card of cards) {
      if(card.name===name && out.length<2 && !out.includes(card)) out.push(card);
    }
  }
  // A spare, now-redundant Tag Call can pay after the required connector
  // has been spent; this is always opt-in and lowest payment priority.
  if(conditionalTagCallPayment) {
    for(const card of cards) {
      if(card.name==='Tag Call' && out.length<2 && !out.includes(card)) {
        out.push(card);
      }
    }
  }
  return out.length===2?out:[];
}

/**
 * A conservative, seed-free K0 opportunity selector. No own hidden deck or
 * Prize values are read. Actual accessibility is deferred to search prompts.
 * @param {{name:string}[]} hand
 * @param {boolean} [thunderInPlay]
 * @param {string[]} [priorities]
 * @param {boolean} [conditionalTagCallPayment]
 * @param {{stadiumLocked?:boolean,specialEnergyLocked?:boolean,itemLocked?:boolean,supporterLocked?:boolean,stadiumAlreadyPlayed?:boolean,activeDceAttached?:boolean,energyAlreadyAttached?:boolean,energyLocked?:boolean}} [constraints]
 * @returns {{channel:string,needDce:boolean,needThunder:boolean,discardCount:number}|null}
 */
function planOpeningHand(
  hand,thunderInPlay=false,priorities=discardOrder,
  conditionalTagCallPayment=false,constraints={}
) {
  // This particular opener must play DCE from hand and have Thunder Mountain
  // in play before Volt Cyclone. Public player-level locks can make an
  // otherwise reachable Tag Call/G&H path impossible on the current turn.
  if (((constraints.specialEnergyLocked || constraints.energyLocked ||
       constraints.energyAlreadyAttached) && !constraints.activeDceAttached) ||
      (constraints.stadiumLocked && !thunderInPlay) ||
      (constraints.stadiumAlreadyPlayed && !thunderInPlay)) return null;
  const held = name=>hand.some(c=>c.name===name);
  const needDce=!held('Double Colorless Energy') &&
    constraints.activeDceAttached!==true;
  const needThunder=!thunderInPlay && !held('Thunder Mountain Prism Star');
  if(!needDce && !needThunder) {
    return {channel:'direct',needDce:false,needThunder:false,discardCount:0};
  }
  const supporter=held('Guzma & Hala')?'held-guzma-hala':
    (!constraints.itemLocked && held('Tag Call')?'tag-call-to-guzma-hala':null);
  if(!supporter || constraints.supporterLocked) return null;
  if(needDce) {
    // The first Tag Call must be played to obtain G&H. Never pre-count
    // that same physical card as one of the two later discard payments.
    const paymentHand=hand.slice();
    if(supporter==='tag-call-to-guzma-hala') {
      paymentHand.splice(paymentHand.findIndex(c=>c.name==='Tag Call'),1);
    }
    if(chooseOpeningDiscards(
      paymentHand,priorities,conditionalTagCallPayment
    ).length!==2) return null;
  }
  return {channel:supporter,needDce,needThunder,
    discardCount:needDce?2:0};
}

/**
 * Identify requirements rendered physically unreachable by an authenticated
 * owner-deck Tag Call search. Call only while its unresolved native
 * ChooseCardsPrompt exposes the acting player's own deck. Earlier K0 play
 * cannot inspect these card identities.
 * @param {{needThunder:boolean,needDce:boolean}} plan
 * @param {{name:string}[]} deckCards Visible at actual own-deck prompt.
 * @param {{name:string}[]} handCards Already held by the acting owner.
 * @returns {string[]} Missing requirements for this specific opening line.
 */
function missingTagCallK1Requirements(plan,deckCards,handCards) {
  const required=[
    ...(plan.needThunder?['Thunder Mountain Prism Star']:[]),
    ...(plan.needDce?['Double Colorless Energy']:[])
  ];
  return required.filter(name=>
    !deckCards.some(card=>card.name===name) &&
    !handCards.some(card=>card.name===name));
}

/**
 * True if a manual DCE attachment would violate a public, player-level
 * hand-play restriction or the already-spent attachment allowance.
 * Pin: play-card-reducer.ts at a9905a76. This is an owner-visible check.
 * @param {{cannotPlayEnergyCards?:boolean,cannotPlaySpecialEnergyCards?:boolean,energyPlayedTurn?:number,usedDragonsWish?:boolean}} player
 * @param {{turn:number,rules?:{unlimitedEnergyAttachments?:boolean}}} state
 * @returns {boolean}
 */
function dceHandAttachmentBlocked(player,state) {
  return Boolean(player.cannotPlayEnergyCards ||
    player.cannotPlaySpecialEnergyCards ||
    (player.energyPlayedTurn===state.turn &&
     player.usedDragonsWish!==true &&
     state.rules?.unlimitedEnergyAttachments!==true));
}

/**
 * Choose a printed fallback when the genuine owner-deck G&H prompt proves
 * the only DCE is inaccessible. This helper must ONLY receive the actual
 * prompt owner's deck contents after that deck is legitimately searchable.
 * It neither infers physical Prize identities at K0 nor proves an attack.
 * @param {{name:string}[]} searchableOwnDeck
 * @returns {string|null}
 */
function chooseK1AlternateSpecialEnergy(searchableOwnDeck){
  if(searchableOwnDeck.some(card=>card.name==='Double Colorless Energy'))
    return null;
  for(const name of ['Speed Lightning Energy','Capture Energy','Spiky Energy']){
    if(searchableOwnDeck.some(card=>card.name===name))return name;
  }
  return null;
}

/**
 * Opt-in broad source-opponent attack tactic, still deliberately simple.
 * Selects using own hand, public stadium and legal search prompts only;
 * reading deck cards is restricted to actual ChooseCardsPrompt resolution.
 * @template T
 * @param {()=>T} work
 * @param {{seat?:number,turn?:number|'first-eligible',discardPriority?:string[],benchBackup?:boolean,conditionalTagCallPayment?:boolean,playLockAwareOpening?:boolean,k1ReplanAfterTagCall?:boolean,k1AlternativeEnergy?:boolean,k1TagCallAlternative?:'none'|'append-bellelba'|'replace-bellelba'}} [options]
 * @returns {{result:T,started:boolean,completed:boolean,events:object[],abortReason:string|null,openingPlan:object|null}}
 */
function withBroadThornsSourceAttack(work,options={}) {
  assert.equal(typeof work,'function');
  const seat=options.seat??1,turn=options.turn??2;
  assert.ok(turn==='first-eligible'||(Number.isInteger(turn)&&turn>=1));
  const priorities=options.discardPriority??discardOrder;
  const benchBackup=options.benchBackup===true;
  const conditionalTagCallPayment=options.conditionalTagCallPayment===true;
  const playLockAwareOpening=options.playLockAwareOpening===true;
  const k1ReplanAfterTagCall=options.k1ReplanAfterTagCall===true;
  const k1AlternativeEnergy=options.k1AlternativeEnergy===true;
  const k1TagCallAlternative=options.k1TagCallAlternative??'none';
  assert.ok(['none','append-bellelba','replace-bellelba']
    .includes(k1TagCallAlternative));
  assert.ok(k1ReplanAfterTagCall||k1TagCallAlternative==='none',
    'Alternative Tag Call selection requires authentic K1 replanning');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name */
  const engine=name=>require(path.join(root,name));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {GamePhase}=engine('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {AttackAction}=engine('game/store/actions/game-actions');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const active={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  let phase='idle',actorId=null,started=false,completed=false;
  let activeTurn=null;
  let openingPlan=null,abortReason=null,backupDeployed=false;
  let missingAfterTagCall=[];
  let backupEnergyName=null;
  const events=[];

  /** @param {object} state @param {string} action @param {object} result */
  function select(state,action,result) {
    events.push({turn:state.turn,phase,action});
    return result;
  }
  /** @param {object} state @param {string} reason */
  function abort(state,reason) {
    events.push({turn:state.turn,phase,abort:reason});
    phase='aborted';
    abortReason=reason;
  }
  /** @param {object} p @param {string} name @param {object} target */
  function play(p,name,target) {
    const handIndex=p.hand.cards.findIndex(card=>card.name===name);
    assert.ok(handIndex>=0,'Planned hand card unavailable: '+name);
    return new PlayCardAction(p.id,handIndex,target);
  }
  /** @param {object} state @param {object} p */
  function useSupporter(state,p) {
    phase='mode';
    return select(state,'Play Guzma & Hala',play(p,'Guzma & Hala',board));
  }
  /** @param {object} state @param {object} p */
  function continueAfterSearch(state,p) {
    const thunder=p.stadium.cards.some(c=>c.name==='Thunder Mountain Prism Star');
    if(!thunder) {
      if(!p.hand.cards.some(c=>c.name==='Thunder Mountain Prism Star')) {
        abort(state,'Required Stadium unavailable after search');
        return null;
      }
      phase='attach';
      return select(state,'Play Thunder Mountain',
        play(p,'Thunder Mountain Prism Star',board));
    }
    if(benchBackup && !backupDeployed) {
      const free=p.bench.findIndex(slot=>!slot.getPokemonCard());
      if(free>=0 && p.hand.cards.some(c=>c.name==='Iron Thorns ex')) {
        backupDeployed=true;
        phase='backup';
        return select(state,'Bench held backup Iron Thorns ex',
          play(p,'Iron Thorns ex',{
            player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:free
          }));
      }
    }
    // A source-first player may have legally attached DCE on global turn 1;
    // no second manual Energy attachment is required on turn 3.
    if(p.active.energies.cards.some(c=>c.name==='Double Colorless Energy')) {
      phase='done';completed=true;
      return select(state,'Attack with previously attached DCE',
        new AttackAction(p.id,'Volt Cyclone'));
    }
    if(!p.hand.cards.some(c=>c.name==='Double Colorless Energy')) {
      if(k1AlternativeEnergy&&backupEnergyName&&
         p.hand.cards.some(c=>c.name===backupEnergyName)){
        phase='fallback-deferred';
        if(dceHandAttachmentBlocked(p,state)){
          events.push({turn:state.turn,phase,action:'Preserve K1 backup: Energy attachment spent'});
          return null;
        }
        return select(state,'Attach K1 backup '+backupEnergyName,
          play(p,backupEnergyName,active));
      }
      abort(state,'Required DCE unavailable after search');
      return null;
    }
    if(dceHandAttachmentBlocked(p,state)) {
      abort(state,'Manual DCE attachment is no longer available');
      return null;
    }
    phase='attack';
    return select(state,'Attach Double Colorless Energy',
      play(p,'Double Colorless Energy',active));
  }

  SimpleTacticsAi.prototype.decodeNextAction=function broadThorns(state) {
    const p=state.players[seat];
    if(!p || this.client?.id!==p.id) return original.call(this,state);
    const prompt=state.prompts.find(x=>x.playerId===p.id&&x.result===undefined);
    if(phase==='idle') {
      const eligibleTurn=turn==='first-eligible' ?
        (state.turn===2||state.turn===3) : state.turn===turn;
      if(!eligibleTurn || state.activePlayer!==seat ||
         state.phase!==GamePhase.PLAYER_TURN || prompt ||
         p.active.getPokemonCard()?.name!=='Iron Thorns ex') {
        return original.call(this,state);
      }
      // Freeze the opening choice at the first genuine rank6 turn-two
      // decision. Reconsidering after a generic Supporter or manual Energy
      // attachment can create an illegal second Supporter/attachment.
      const inPlay=p.stadium.cards.some(c=>c.name==='Thunder Mountain Prism Star');
      const attached=Boolean(p.active.energies.cards.some(c=>
        c.name==='Double Colorless Energy'));
      const constraints=playLockAwareOpening ? {
        stadiumLocked:Boolean(p.cannotPlayStadiumCards),
        specialEnergyLocked:Boolean(p.cannotPlaySpecialEnergyCards),
        energyLocked:Boolean(p.cannotPlayEnergyCards),
        energyAlreadyAttached:p.energyPlayedTurn===state.turn &&
          p.usedDragonsWish!==true &&
          state.rules?.unlimitedEnergyAttachments!==true,
        itemLocked:Boolean(p.cannotPlayItemCards),
        supporterLocked:Boolean(p.cannotPlaySupporterCards) ||
          p.supporterTurn>0,
        stadiumAlreadyPlayed:p.stadiumPlayedTurn===state.turn,
        activeDceAttached:attached
      } : {activeDceAttached:attached};
      const plan=planOpeningHand(
        p.hand.cards,inPlay,priorities,conditionalTagCallPayment,constraints
      );
      if(!plan) {
        phase='inactive';
        return original.call(this,state);
      }
      openingPlan=plan;started=true;actorId=p.id;
      activeTurn=state.turn;
      if(plan.channel==='direct') {
        phase='direct';
        return continueAfterSearch(state,p)??original.call(this,state);
      }
      if(plan.channel==='tag-call-to-guzma-hala') {
        phase='tag-search';
        return select(state,'Play held Tag Call',play(p,'Tag Call',board));
      }
      return useSupporter(state,p);
    }
    if(actorId!==p.id || phase==='done' || phase==='aborted' ||
       phase==='inactive' || phase==='fallback-deferred') {
      return original.call(this,state);
    }
    if(state.turn!==activeTurn || state.activePlayer!==seat) {
      abort(state,'Source turn ended before complete attack');
      return original.call(this,state);
    }

    if(phase==='tag-search' && prompt?.constructor.name==='ChooseCardsPrompt') {
      // Own deck can be inspected only once the Tag Call search is underway.
      if(prompt.playerId!==p.id || prompt.cards!==p.deck){
        abort(state,'Tag Call has no authenticated owner-deck prompt');
        return original.call(this,state);
      }
      const gh=p.deck.cards.find(c=>c.name==='Guzma & Hala');
      if(!gh || !prompt.validate([gh],state)) {
        abort(state,'Tag Call cannot fetch a legal Guzma & Hala');
        return original.call(this,state);
      }
      if(k1ReplanAfterTagCall) {
        missingAfterTagCall=missingTagCallK1Requirements(
          openingPlan,p.deck.cards,p.hand.cards);
        events.push({turn:state.turn,phase:'tag-search',
          k1MissingOpeningTargets:[...missingAfterTagCall]});
      }
      const bellelba=missingAfterTagCall.length&&
        k1TagCallAlternative!=='none'?
        p.deck.cards.find(c=>c.name==='Bellelba & Brycen-Man'):null;
      const targets=bellelba?
        (k1TagCallAlternative==='replace-bellelba'?
          [bellelba]:[gh,bellelba]):[gh];
      if(!prompt.validate(targets,state)){
        abort(state,'K1 Tag Call alternative failed native prompt validation');
        return original.call(this,state);
      }
      phase='tag-followup';
      return select(state,'Tag Call chooses '+
        targets.map(card=>card.name).join(' + '),
        new ResolvePromptAction(prompt.id,targets));
    }
    if(phase==='tag-followup') {
      if(prompt?.constructor.name==='WaitPrompt') {
        return select(state,'Tag Call wait',
          new ResolvePromptAction(prompt.id,null));
      }
      if(prompt?.constructor.name==='ShowCardsPrompt') {
        return select(state,'Tag Call reveal acknowledgment',
          new ResolvePromptAction(prompt.id,true));
      }
      if(!prompt && state.phase===GamePhase.PLAYER_TURN) {
        if(k1ReplanAfterTagCall && missingAfterTagCall.length){
          abort(state,'K1 invalidated opening line: '+
            missingAfterTagCall.join(', '));
          // Let the ordinary bot reconsider alternative uses of the held
          // Supporter. This does not certify that its fallback is competent.
          return original.call(this,state);
        }
        return useSupporter(state,p);
      }
    }
    if(phase==='mode' && prompt?.constructor.name==='SelectOptionPrompt') {
      phase=openingPlan.needDce?'discard':'search';
      return select(state,'Choose G&H mode',
        new ResolvePromptAction(prompt.id,openingPlan.needDce?1:0));
    }
    if(phase==='discard' && prompt?.constructor.name==='ChooseCardsPrompt') {
      const payment=chooseOpeningDiscards(
        p.hand.cards,priorities,conditionalTagCallPayment
      );
      if(payment.length!==2 || !prompt.validate(payment,state)) {
        abort(state,'G&H discard payment unavailable');
        return original.call(this,state);
      }
      phase='search';
      events.push({turn:state.turn,phase:'discard',
        cards:payment.map(c=>c.name)});
      return select(state,'Discard two chosen hand cards',
        new ResolvePromptAction(prompt.id,payment));
    }
    if(phase==='search' && prompt?.constructor.name==='ChooseCardsPrompt') {
      if(prompt.playerId!==p.id || prompt.cards!==p.deck){
        abort(state,'G&H search lacks authenticated owner-deck prompt');
        return original.call(this,state);
      }
      const backup=k1AlternativeEnergy&&openingPlan.needDce?
        chooseK1AlternateSpecialEnergy(p.deck.cards):null;
      const targets=[
        ...(openingPlan.needThunder?['Thunder Mountain Prism Star']:[]),
        ...(openingPlan.needDce?[backup??'Double Colorless Energy']:[])
      ];
      const searched=targets.map(name=>p.deck.cards.find(c=>c.name===name));
      if(searched.some(card=>!card) || !prompt.validate(searched,state)) {
        abort(state,'G&H prompted search could not retrieve planned targets');
        return original.call(this,state);
      }
      backupEnergyName=backup;
      if(backup)events.push({turn:state.turn,phase:'search',
        action:'K1 DCE absent, search '+backup});
      phase='followup';
      return select(state,'Fetch '+targets.join(' plus '),
        new ResolvePromptAction(prompt.id,searched));
    }
    if(phase==='followup') {
      if(prompt?.constructor.name==='WaitPrompt') {
        return select(state,'G&H wait',
          new ResolvePromptAction(prompt.id,null));
      }
      if(prompt?.constructor.name==='ShowCardsPrompt') {
        return select(state,'G&H reveal acknowledgment',
          new ResolvePromptAction(prompt.id,true));
      }
      if(!prompt && state.phase===GamePhase.PLAYER_TURN) {
        return continueAfterSearch(state,p)??original.call(this,state);
      }
    }
    if(phase==='backup' && !prompt &&
        state.phase===GamePhase.PLAYER_TURN) {
      return continueAfterSearch(state,p)??original.call(this,state);
    }
    if(phase==='attach' && !prompt &&
        state.phase===GamePhase.PLAYER_TURN) {
      // Re-enter the shared post-Stadium path so opt-in backup Benching
      // happens before attachment even when Thunder was fetched this turn.
      // Previously this stage skipped backup entirely.
      if(!p.stadium.cards.some(c=>c.name==='Thunder Mountain Prism Star')) {
        abort(state,'Thunder Mountain not in play after Stadium action');
        return original.call(this,state);
      }
      return continueAfterSearch(state,p)??original.call(this,state);
    }
    if(phase==='attack' && !prompt &&
        state.phase===GamePhase.PLAYER_TURN) {
      if(!p.stadium.cards.some(c=>c.name==='Thunder Mountain Prism Star') ||
         !p.active.energies.cards.some(c=>c.name==='Double Colorless Energy')) {
        abort(state,'Attack prerequisites missing after actual Store actions');
        return original.call(this,state);
      }
      phase='done';completed=true;
      return select(state,'Announce Volt Cyclone',
        new AttackAction(p.id,'Volt Cyclone'));
    }
    abort(state,'Unexpected prompt or phase '+(prompt?.constructor.name??'none'));
    return original.call(this,state);
  };
  try {
    const result=work();
    return {result,started,completed,events,abortReason,openingPlan,
      backupEnergyName};
  } catch(error) {
    // Preserve the local decision witness when the Store rejects an action.
    // This is a diagnostic property on the already-thrown error, not a
    // substitute for a legal result.
    error.rank6PolicyEvidence={started,completed,abortReason,
      openingPlan,backupEnergyName,events:events.slice()};
    throw error;
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={discardOrder,chooseOpeningDiscards,planOpeningHand,
  missingTagCallK1Requirements,dceHandAttachmentBlocked,
  chooseK1AlternateSpecialEnergy,withBroadThornsSourceAttack};
