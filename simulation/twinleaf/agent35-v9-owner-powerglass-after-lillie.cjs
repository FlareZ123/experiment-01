'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent35-owner-visible-powerglass-after-supporter-pass-v1';
const PRINTING='Powerglass SFA';
const BASIC=/^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy /;
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Owner-only public-board printed KO break-point selector. Existing Lillie
 * remains eligible first; this additional Tool can be selected after the
 * owner has used a Supporter on this same turn.
 * @param {object} view Detached frozen actorObservation.
 * @param {number} colorless Native printed Colorless card type.
 * @returns {{handIndex:number,printing:string,sourceAttack:string}|null}
 */
function choosePowerglassAfterSupporter(view,colorless){
  if(view?.decisionKind!=='owner-root'||
     !(view.ownTurnResources?.supporterPlayedTurn>0)||
     view.ownTurnResources.toolPlayLocked===true||
     view.ownPublic?.publicTurnRestrictions?.toolPlayLocked===true)return null;
  const index=view.ownHand?.indexOf(PRINTING)??-1;
  const owner=view.ownPublic,active=owner?.active,defender=view.opponentPublic?.active;
  if(index<0||!active||!defender||active.tools?.length!==0||
     active.energies?.length!==0||
     !owner.discard?.some(s=>BASIC.test(s)))return null;
  const hp=Number(defender.hp),damage=Number(defender.damage);
  if(!Number.isFinite(hp)||!Number.isFinite(damage)||
     damage<0||hp<=damage)return null;
  const cheap=(active.attacks??[]).find(a=>
    a.cost?.length===1&&a.cost[0]===colorless&&
    Number.isFinite(Number(a.damage))&&Number(a.damage)>=hp-damage&&
    !a.gxAttack&&!a.name.endsWith('-GX'));
  return cheap?{handIndex:index,printing:PRINTING,sourceAttack:cheap.name}:null;
}

/**
 * One real Store game. Reversible root/prompt decoder and physical witness.
 * @template T
 * @param {()=>T} run Synchronous native match.
 * @param {object} [deps] Injectable native seams.
 * @returns {{result:T,audit:object}}
 */
function withOwnerPowerglassAfterSupporter(run,deps={}){
  assert.equal(typeof run,'function');
  const load=p=>require(path.join(output,p));
  const {SimpleTacticsAi}=deps.bot??load('simple-bot/simple-tactics-ai');
  const {Store}=deps.store??load('game/store/store');
  const {PlayCardAction,PlayerType,SlotType}=deps.play??load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=deps.prompt??load('game/store/actions/resolve-prompt-action');
  const {CardType,EnergyType,SuperType}=deps.cardTypes??load('game/store/card/card-types');
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??choosePowerglassAfterSupporter;
  const previousDecode=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  const previousDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previousDecode?.value,'function');
  assert.equal(typeof previousDispatch?.value,'function');
  const intended=new WeakMap(),promptIntended=new WeakMap();
  const equippedByOwner=new Map();
  let live=null;
  const audit={schema:VERSION,bothSeats:true,sourceIndependent:true,
    liveStoreDetected:false,rootProposals:0,rootAccepted:0,rootRejected:0,
    sourcePromptOffers:0,promptAssignments:0,promptAccepted:0,
    attachedFromDiscard:0,events:[],promptEvents:[],
    opponentConcealedRead:false,ownerDeckIdentityRead:false,
    qualifiedCompetitiveGames:0};

  function decode(state){
    const seat=state.players?.findIndex(p=>p.id===this.client?.id);
    if(state===live?.state&&(seat===0||seat===1)){
      const owner=state.players[seat];
      const pending=state.prompts?.find(p=>p.result===undefined&&
        p.playerId===owner.id);
      if(pending?.constructor?.name==='AttachEnergyPrompt'&&
         equippedByOwner.has(owner.id)&&
         owner.active.tools.some(card=>card.fullName===PRINTING)&&
         pending.cardList===owner.discard&&
         pending.playerType===PlayerType.BOTTOM_PLAYER&&
         pending.slots?.includes(SlotType.ACTIVE)&&
         (pending.max??pending.options?.max)===1&&
         (pending.min??pending.options?.min)===0&&
         typeof pending.validate==='function'){
        audit.sourcePromptOffers++;
        const card=owner.discard.cards.find(c=>
          c.superType===SuperType.ENERGY&&c.energyType===EnergyType.BASIC);
        const proposed=card?[{card,to:{player:PlayerType.BOTTOM_PLAYER,
          slot:SlotType.ACTIVE,index:0}}]:[];
        if(pending.validate(proposed,state)===true){
          const action=new ResolvePromptAction(pending.id,proposed);
          promptIntended.set(action,{seat,ownerId:owner.id,prompt:pending,
            physicalCard:card,turn:state.turn});
          audit.promptAssignments++;
          return action;
        }
      }
    }
    const native=previousDecode.value.call(this,state);
    if(native?.constructor?.name!=='PassTurnAction'||state!==live?.state||
       seat!==state.activePlayer||
       state.prompts?.some(p=>p.result===undefined))return native;
    const view=observe(state,seat);
    const decision=choose(view,CardType.COLORLESS);
    if(!decision)return native;
    const owner=state.players[seat];
    const target=owner.hand.cards[decision.handIndex];
    assert.equal(target?.fullName,PRINTING);
    const action=new PlayCardAction(owner.id,decision.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
    intended.set(action,{seat,ownerId:owner.id,turn:view.globalTurn,
      printing:decision.printing,sourceAttack:decision.sourceAttack,target});
    audit.rootProposals++;
    return action;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!live){
      live=this;audit.liveStoreDetected=true;
    }
    const track=this===live?intended.get(action):null;
    const promptTrack=this===live?promptIntended.get(action):null;
    const beforeOwner=promptTrack?this.state.players[promptTrack.seat]:null;
    const wasDiscarded=promptTrack?.physicalCard&&
      beforeOwner.discard.cards.includes(promptTrack.physicalCard);
    try{
      const result=previousDispatch.value.call(this,action,...args);
      if(track){
        const owner=this.state.players[track.seat];
        const physical=owner.active.tools.includes(track.target)&&
          !owner.hand.cards.includes(track.target);
        if(!physical)throw Error('AGENT35_POWERGLASS_ROOT_NOT_PHYSICALLY_EQUIPPED');
        equippedByOwner.set(owner.id,{seat:track.seat,turn:track.turn});
        audit.rootAccepted++;
        audit.events.push({seat:track.seat,turn:track.turn,
          printing:PRINTING,sourceAttack:track.sourceAttack,physicallyEquipped:true});
      }
      if(promptTrack){
        const owner=this.state.players[promptTrack.seat];
        const settled=promptTrack.prompt.result===action.result;
        const moved=!!wasDiscarded&&
          owner.active.energies.cards.includes(promptTrack.physicalCard)&&
          !owner.discard.cards.includes(promptTrack.physicalCard);
        const empty=promptTrack.physicalCard===undefined&&
          Array.isArray(action.result)&&action.result.length===0;
        if(!settled||(!moved&&!empty))
          throw Error('AGENT35_POWERGLASS_PROMPT_NOT_PHYSICALLY_RESOLVED');
        audit.promptAccepted++;
        if(moved)audit.attachedFromDiscard++;
        audit.promptEvents.push({seat:promptTrack.seat,turn:promptTrack.turn,
          printing:promptTrack.physicalCard?.fullName??null,
          settled:true,physicallyAttached:moved,emptyOptional:empty});
        // An attached Powerglass may activate again on later turns.
        // Keep its owner marker until a different physically attached Tool is observed.
      }
      return result;
    }catch(error){
      if(track)audit.rootRejected++;
      if(error&&typeof error==='object')error.agent35PowerglassAudit={...audit};
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...previousDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...previousDispatch,value:dispatch});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent35PowerglassAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previousDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',previousDecode);
  }
}
module.exports={VERSION,PRINTING,choosePowerglassAfterSupporter,
  withOwnerPowerglassAfterSupporter};
