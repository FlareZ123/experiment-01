'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent6-original-source-native-actor-rondo-retreat-v1';

/**
 * Evaluate one truly owner-visible, originally proposed Pass root.
 * This is deliberately narrow: actual paper/Store legality of Skyliner,
 * retreat, and Rondo is still adjudicated by the native Store.
 *
 * The function accesses only the acting owner's public board and own turn
 * metadata. It does not inspect either player's hand, deck or Prizes.
 *
 * @param {object} state Native State.
 * @param {object} action The ordinary bot's proposed root.
 * @param {number} actorId The decoder's authenticated client ID.
 * @param {{sourceSeat:0|1,targetTurn:number}} config Registered scope.
 * @returns {{index:number,active:string,bench:string,turn:number}|null}
 */
function chooseOwnerRondoRetreatFromPass(state,action,actorId,config){
  if(action?.constructor?.name!=='PassTurnAction'||
     state?.turn!==config.targetTurn||state?.phase!==2||
     state?.activePlayer!==config.sourceSeat||
     state?.prompts?.some(p=>p.result===undefined))return null;
  const owner=state.players?.[config.sourceSeat];
  if(owner?.id!==actorId||owner.retreatedTurn===state.turn)return null;
  const active=owner.active?.getPokemonCard?.();
  if(active?.fullName!=='Latias ex SSP'||!active.powers?.some(
    power=>power.name==='Skyliner'))return null;
  const status=owner.active?.specialConditions??[];
  if(status.includes('ASLEEP')||status.includes('PARALYZED'))return null;
  const bench=owner.bench;
  if(!Array.isArray(bench))return null;
  for(let index=0;index<bench.length;index++){
    const pokemon=bench[index]?.getPokemonCard?.();
    if(pokemon?.fullName!==\"Lillie's Clefairy ex JTG\"||
       !pokemon.attacks?.some(a=>a.name==='Full Moon Rondo'))continue;
    const energy=bench[index].energies?.cards;
    if(!Array.isArray(energy)||energy.filter(e=>
      e.fullName?.startsWith('Psychic Energy ')).length<2)continue;
    return {index,active:active.fullName,bench:pokemon.fullName,
      turn:state.turn};
  }
  return null;
}

/**
 * Install a default-off, reversible original-source actor root preference.
 * It is intentionally outside the shared canonical policy. Whether the
 * canonical chooser delegates a Pass to this native decoder is measured.
 * A selected RetreatAction must still be accepted and settled by the Store.
 *
 * @template T
 * @param {()=>T} execute Original pinned Store game.
 * @param {{sourceSeat:0|1,targetTurn:number,treatment:boolean}} config
 * @returns {{result:T,audit:object}}
 */
function withRank30ActorRondoRetreat(execute,config){
  assert.equal(typeof execute,'function');
  assert.ok(config.sourceSeat===0||config.sourceSeat===1);
  assert.ok(Number.isSafeInteger(config.targetTurn)&&config.targetTurn>0);
  const load=name=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',name));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {RetreatAction}=load('game/store/actions/game-actions');
  const descriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof descriptor?.value,'function');
  const audit={version:VERSION,config,delegatedPassRoots:0,
    selectedRetreatRoots:0,decisions:[],hiddenZonesAccessed:false,
    scope:'retrospective original-source actor-chooses-retreat witness',
    competitiveQualified:false};
  function propose(state,...args){
    const action=descriptor.value.apply(this,[state,...args]);
    if(action?.constructor?.name!=='PassTurnAction')return action;
    const id=this.client?.id;
    const owner=state?.players?.[config.sourceSeat];
    if(owner?.id!==id||state.turn!==config.targetTurn||
       state.activePlayer!==config.sourceSeat)return action;
    audit.delegatedPassRoots++;
    const choice=config.treatment?
      chooseOwnerRondoRetreatFromPass(state,action,id,config):null;
    if(!choice)return action;
    audit.selectedRetreatRoots++;
    audit.decisions.push({...choice,actorId:id,
      originalAction:'PassTurnAction',
      chosenAction:'RetreatAction'});
    return new RetreatAction(id,choice.index);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...descriptor,value:propose});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent6Rank30ActorRondoAudit={...audit,aborted:true};
    throw error;
  }
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,propose);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      descriptor);
  }
}

module.exports={VERSION,chooseOwnerRondoRetreatFromPass,
  withRank30ActorRondoRetreat};
