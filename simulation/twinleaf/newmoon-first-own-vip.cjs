'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(output,name));

const VIP='Battle VIP Pass FST';
const MEWTWO='Mewtwo & Mew-GX UNM';
const GENGAR='Gengar & Mimikyu-GX TEU';
const SQUAWKABILLY='Squawkabilly ex PAL';

/**
 * Owner/board-only initial-turn opportunity screen. Never touches deck/Prizes.
 * Battle VIP Pass is only valid on the owner's FIRST normal turn, which can
 * be global turn 1 or 2 depending on actual first-player selection.
 *
 * @param {object} state
 * @param {object} own
 * @param {0|1} seat
 * @param {number} playerTurnPhase
 * @returns {boolean}
 */
function ownFirstVipOpportunity(state,own,seat,playerTurnPhase){
  return (state.turn===1 || state.turn===2) &&
    state.activePlayer===seat && state.phase===playerTurnPhase &&
    !state.prompts.some(p=>p.result===undefined) &&
    own.hand.cards.some(c=>c.fullName===VIP) &&
    own.bench.some(s=>!s.getPokemonCard());
}

/**
 * This may inspect actual available card instances ONLY when called during
 * the acting owner's legitimate ChooseCardsPrompt whose cards are own.deck.
 * The priorities are simple prospective choices, not an optimality claim.
 *
 * @param {object} own
 * @param {object} prompt
 * @param {object} state
 * @returns {object[]}
 */
function chooseOwnedVipTargets(own,prompt,state){
  const inPlay=name=>
    own.active.getPokemonCard()?.fullName===name ||
    own.bench.some(s=>s.getPokemonCard()?.fullName===name);
  const inDiscard=name=>own.discard.cards.some(c=>c.fullName===name);
  const prefer=[
    ...(!inPlay(GENGAR)&&!inDiscard(GENGAR)?[GENGAR]:[]),
    ...(!inPlay(MEWTWO)?[MEWTWO]:[]),
    ...(!inPlay(SQUAWKABILLY)&&!inDiscard(SQUAWKABILLY)?[SQUAWKABILLY]:[]),
    MEWTWO
  ];
  const limit=Math.min(2,own.bench.filter(s=>!s.getPokemonCard()).length);
  const selected=[];
  for(const name of prefer){
    if(selected.length===limit)break;
    const card=prompt.cards.cards.find(c=>
      c.fullName===name && !selected.includes(c));
    if(card)selected.push(card);
  }
  // Validation from the actual pinned owner prompt is authoritative; an
  // absent Basic, Prize card or short Bench cannot be conjured by the policy.
  for(let length=selected.length;length>=1;length--){
    const prefix=selected.slice(0,length);
    if(prompt.validate(prefix,state))return prefix;
  }
  return [];
}

/**
 * Opt-in versioned generic New Moon first-own-turn VIP policy. Acts only
 * on the specified candidate's own public board, own hand and real owner
 * search prompt. Never applies hard-coded seeds, opponent deck information
 * or setup-zone mutation. All other choices remain the pinned generic bot.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withNewMoonFirstOwnVip(candidateSeat,execute){
  if(![0,1].includes(candidateSeat)||typeof execute!=='function'){
    throw new TypeError('Need candidate physical seat and synchronous runner');
  }
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const {GamePhase}=engine('game/store/state/state');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const candidateId=candidateSeat===0?101:202;
  const events=[];
  let stage='available';
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

  const policy=function newMoonFirstVip(state){
    const own=state.players.find(p=>p.id===this.client?.id);
    if(own?.id!==candidateId)return original.call(this,state);
    const pending=state.prompts.find(p=>p.result===undefined);

    if(stage==='choose' && pending?.constructor.name==='WaitPrompt'){
      return original.call(this,state);
    }
    if(stage==='choose'){
      if(pending?.constructor.name==='ChooseCardsPrompt' &&
          pending.playerId===own.id && pending.cards===own.deck){
        const selected=chooseOwnedVipTargets(own,pending,state);
        if(selected.length){
          events.push({turn:state.turn,kind:'validated-owner-deck-targets',
            names:selected.map(c=>c.fullName),count:selected.length,
            ownerSearchPrompt:true});
          stage='verify';
          return new ResolvePromptAction(pending.id,selected);
        }
      }
      events.push({turn:state.turn,kind:'missing-valid-own-search-target',
        promptType:pending?.constructor.name??null});
      stage='finished';
      return original.call(this,state);
    }
    if(stage==='verify'&&!pending){
      events.push({turn:state.turn,kind:'post-dispatch-public-bench',
        names:own.bench.map(s=>s.getPokemonCard()?.fullName??null)});
      stage='finished';
    }
    if(stage==='available' &&
       ownFirstVipOpportunity(state,own,candidateSeat,GamePhase.PLAYER_TURN)){
      const index=own.hand.cards.findIndex(c=>c.fullName===VIP);
      const action=new PlayCardAction(own.id,index,board);
      const legal=this.isValidAction(state,action);
      events.push({turn:state.turn,kind:'real-hand-first-own-VIP-offer',
        legal,freeBench:own.bench.filter(s=>!s.getPokemonCard()).length,
        printedCard:own.hand.cards[index].fullName});
      if(legal){
        stage='choose';
        return action;
      }
      stage='finished';
    }
    return original.call(this,state);
  };
  SimpleTacticsAi.prototype.decodeNextAction=policy;
  try{
    const result=execute();
    return {result,policyAudit:{
      version:'newmoon-first-own-vip-v1',
      candidateSeat,stageAtEnd:stage,events,
      selectedLegalVip:events.some(e=>
        e.kind==='real-hand-first-own-VIP-offer'&&e.legal),
      validatedSearchSelection:events.some(e=>
        e.kind==='validated-owner-deck-targets'),
      targetInformation:'own hand and public board, then prompt-owner deck search',
      qualifiedCompetitiveGames:0
    }};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,policy,
      'Other adapter modified same bot hook while New Moon policy owned it');
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

module.exports={VIP,MEWTWO,GENGAR,SQUAWKABILLY,
  ownFirstVipOpportunity,chooseOwnedVipTargets,withNewMoonFirstOwnVip};
