'use strict';

const assert=require('node:assert/strict');

const {AttackAction}=
  require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');
const {ResolvePromptAction}=
  require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
const {GameMessage}=require('../../vendor/twinleaf/ptcg-server/output/game/game-message');

/**
 * Mimikyu's printed Copycat excludes GX attacks and, by official ruling,
 * another Mimikyu Copycat. Other copied-attack effects remain eligible:
 * the official FAQ specifically permits copying Zoroark BREAK's Foul Play.
 * Twinleaf's generic copycatAttack metadata is therefore too broad to use as
 * a blanket exclusion (e.g. Regidrago VSTAR's non-GX Apex Dragon).
 * @param {object} row Tracked previous-turn attack record.
 * @returns {boolean}
 */
function isMimikyuCopycatAttack(row){
  const sourceName=row?.sourceCardName??row?.sourceCard?.name??
    (typeof row?.sourceCardFullName==='string'?
      row.sourceCardFullName.split(' ')[0]:null);
  return sourceName==='Mimikyu'&&row?.attackName==='Copycat';
}

/** @param {object} row @returns {boolean} */
function isMimikyuCopycatEligibleAttack(row){
  return row?.gxAttack===false&&!isMimikyuCopycatAttack(row);
}

/**
 * Install a per-Store, research-owned public attack-history observer.
 *
 * It records declared AttackActions and the selected follow-up attack from
 * CHOOSE_ATTACK_TO_COPY prompts (e.g. Ω Barrage). A turn boundary is detected
 * from the native Store's active-player or global-turn transition, so it
 * covers both attacks that end a turn and PassTurnAction.
 *
 * The tracker does not change Store state or upstream code. Its attack/source
 * references are retained only for an explicit opt-in Copycat adapter choice.
 *
 * @param {object} store Pinned Twinleaf Store instance.
 * @returns {{
 *   getCurrentTurnAttacks:(playerId:number)=>object[],
 *   getPreviousTurnSnapshot:(playerId:number)=>{turn:number,attacks:object[]}|null,
 *   hasPreviousTurn:(playerId:number)=>boolean,
 *   getPreviousTurnAttacks:(playerId:number)=>object[],
 *   getEligiblePreviousTurnAttacks:(playerId:number)=>object[],
 *   getCopycatChoices:(playerId:number)=>object[],
 *   restore:()=>void
 * }}
 */
function installCopycatMultiAttackHistory(store){
  assert.ok(store&&typeof store.dispatch==='function');
  const hadOwn=Object.prototype.hasOwnProperty.call(store,'dispatch');
  const original=store.dispatch;
  const current=new Map();
  const previous=new Map();

  /** @param {number} playerId @param {object} record */
  function record(playerId,recordValue){
    const rows=current.get(playerId)??[];
    rows.push(recordValue);
    current.set(playerId,rows);
    return recordValue;
  }

  /**
   * @param {any} action
   * @param {number} [clientRoleId]
   * @returns {any}
   */
  function observedDispatch(action,clientRoleId){
    const before=this.state;
    const beforeActive=before.players?.[before.activePlayer];
    const beforeActiveIndex=before.activePlayer;
    const beforeTurn=before.turn;
    let declared=null;
    let barrageFollowup=null;

    if(action instanceof AttackAction){
      const player=before.players.find(value=>value.id===action.clientId);
      const sourceCard=player?.active.getPokemonCard();
      const attack=sourceCard?.attacks?.find(value=>value.name===action.name);
      if(player&&sourceCard&&attack){
        declared={
          kind:'declared',
          playerId:player.id,turn:before.turn,
          sourceCard,attack,
          sourceCardName:sourceCard.name,
          sourceCardFullName:sourceCard.fullName,
          attackName:attack.name,
          gxAttack:attack.gxAttack===true,
          copycatAttack:attack.copycatAttack===true
        };
      }
    }else if(action instanceof ResolvePromptAction){
      const prompt=before.prompts?.find(value=>value.id===action.id);
      if(prompt?.constructor.name==='ChooseAttackPrompt'&&
          prompt.message===GameMessage.CHOOSE_ATTACK_TO_COPY){
        const player=before.players.find(value=>value.id===prompt.playerId);
        const sourceCard=player?.active.getPokemonCard();
        const selected=action.result&&typeof action.result.name==='string'?
          action.result:prompt.decode(action.result,before);
        const attack=sourceCard?.attacks?.find(value=>value.name===selected?.name);
        const hasBarragePower=sourceCard?.powers?.some(
          power=>power.barrage===true
        )===true;
        const rows=player?current.get(player.id)??[]:[];
        const preceding=rows[rows.length-1];
        if(player&&sourceCard&&attack&&hasBarragePower&&
            prompt.cards.some(value=>value===sourceCard)&&
            preceding?.playerId===player.id&&
            preceding.turn===before.turn&&
            preceding.sourceCard===sourceCard){
          const barragePairId=player.id+':'+before.turn+':'+(rows.length-1);
          preceding.barragePairId=barragePairId;
          preceding.barragePairRole='first';
          barrageFollowup={
            kind:'barrage-followup',
            barragePairId,barragePairRole:'second',
            playerId:player.id,turn:before.turn,
            sourceCard,attack,
            sourceCardName:sourceCard.name,
            sourceCardFullName:sourceCard.fullName,
            attackName:attack.name,
            gxAttack:attack.gxAttack===true,
            copycatAttack:attack.copycatAttack===true
          };
        }
      }
    }

    let result;
    try{
      result=original.call(this,action,clientRoleId);
    }catch(error){
      console.error('AGENT8_HISTORY_DISPATCH_ERROR',{
        action:action?.constructor?.name??null,
        name:action?.name??null,id:action?.id??null,
        result:action?.result?.name??action?.result??null,
        activePlayer:before.activePlayer,turn:before.turn,
        prompts:(before.prompts??[]).map(prompt=>({
          type:prompt.constructor.name,message:prompt.message,id:prompt.id
        })),
        error:String(error)
      });
      throw error;
    }
    if(declared)record(declared.playerId,declared);
    if(barrageFollowup)record(barrageFollowup.playerId,barrageFollowup);

    const after=result??this.state;
    if(beforeActive&&
        (beforeActiveIndex!==after.activePlayer||beforeTurn!==after.turn)){
      const endedPlayerId=beforeActive.id;
      previous.set(endedPlayerId,{
        turn:beforeTurn,attacks:(current.get(endedPlayerId)??[]).slice()
      });
      current.set(endedPlayerId,[]);
    }
    return result;
  }

  store.dispatch=observedDispatch;

  /**
   * @param {number} playerId
   * @returns {object[]}
   */
  const getCurrentTurnAttacks=playerId=>(current.get(playerId)??[]).slice();
  /**
   * A missing snapshot means the tracker has not observed this player's
   * completed turn yet. An empty attacks array means a completed turn with
   * no attacks; callers must preserve this distinction for public receipts.
   * @param {number} playerId
   * @returns {{turn:number,attacks:object[]}|null}
   */
  const getPreviousTurnSnapshot=playerId=>{
    const snapshot=previous.get(playerId);
    return snapshot===undefined?null:{
      turn:snapshot.turn,attacks:snapshot.attacks.slice()
    };
  };
  /** @param {number} playerId @returns {boolean} */
  const hasPreviousTurn=playerId=>previous.has(playerId);
  /** @param {number} playerId @returns {object[]} */
  const getPreviousTurnAttacks=playerId=>
    getPreviousTurnSnapshot(playerId)?.attacks??[];
  /**
   * @param {number} playerId
   * @returns {object[]}
   */
  const getEligiblePreviousTurnAttacks=playerId=>
    getPreviousTurnAttacks(playerId).filter(isMimikyuCopycatEligibleAttack);
  /**
   * Copycat's ordinary case is the opponent's actual last attack, if it is
   * copyable. A verified Barrage pair is the narrow exception: both attacks
   * in that pair are considered, with GX/Mimikyu-Copycat exclusions per row.
   * @param {number} playerId
   * @returns {object[]}
   */
  const getCopycatChoices=playerId=>{
    const history=getPreviousTurnAttacks(playerId);
    const paired=history.filter(row=>typeof row.barragePairId==='string');
    if(paired.length>0){
      const pairId=paired[paired.length-1].barragePairId;
      const pair=history.filter(row=>row.barragePairId===pairId);
      if(pair.length===2)
        return pair.filter(isMimikyuCopycatEligibleAttack);
    }
    const last=history[history.length-1];
    return last&&isMimikyuCopycatEligibleAttack(last)?[last]:[];
  };

  return {
    getCurrentTurnAttacks,
    getPreviousTurnSnapshot,
    hasPreviousTurn,
    getPreviousTurnAttacks,
    getEligiblePreviousTurnAttacks,
    getCopycatChoices,
    restore(){
      if(store.dispatch===observedDispatch){
        if(hadOwn)store.dispatch=original;
        else delete store.dispatch;
      }
    }
  };
}

/**
 * Execute a Copycat action using one explicitly selected prior-turn attack.
 * The pinned helper reads playerLastAttack synchronously at Copycat entry,
 * before any copied-effect prompts are resolved. Restore the actual recorded
 * attack immediately after dispatch so persistent state remains truthful.
 *
 * @param {object} store Pinned Twinleaf Store.
 * @param {number} copycatPlayerId Player using Copycat.
 * @param {object} selected Eligible record from getCopycatChoices.
 * @param {object} action Native AttackAction for Copycat.
 * @returns {any} Native Store dispatch result.
 */
function dispatchCopycatWithSelectedHistory(store,copycatPlayerId,selected,action){
  assert.ok(action instanceof AttackAction,'A native Copycat AttackAction is required');
  assert.equal(action.clientId,copycatPlayerId);
  assert.equal(action.name,'Copycat');
  assert.ok(selected?.sourceCard&&selected?.attack);
  assert.equal(selected.gxAttack,false,'GX attacks cannot be selected');
  assert.ok(!isMimikyuCopycatAttack(selected),
    'Mimikyu cannot copy another Mimikyu Copycat attack');
  assert.equal(selected.attackName,selected.attack.name);
  assert.equal(selected.sourceCardFullName,selected.sourceCard.fullName);
  const state=store.state;
  assert.ok(Number.isSafeInteger(selected.turn)&&selected.turn<state.turn,
    'Selected attack must come from a completed previous turn');
  const opponent=state.players.find(player=>player.id!==copycatPlayerId);
  assert.ok(opponent);
  assert.equal(selected.playerId,opponent.id);
  assert.ok(state.playerLastAttack);
  const history=state.playerLastAttack;
  const prior=history[opponent.id];
  assert.ok(prior,'Copycat selection requires a recorded prior attack');
  history[opponent.id]={attack:selected.attack,sourceCard:selected.sourceCard};
  try{
    return store.dispatch(action);
  }finally{
    history[opponent.id]=prior;
  }
}

module.exports={
  isMimikyuCopycatAttack,
  isMimikyuCopycatEligibleAttack,
  installCopycatMultiAttackHistory,
  dispatchCopycatWithSelectedHistory
};
