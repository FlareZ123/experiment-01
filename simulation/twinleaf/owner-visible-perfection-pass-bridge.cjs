'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load=name=>require(path.join(output,name));

const COPY_PRIORITY=Object.freeze([
  {source:'Gengar & Mimikyu-GX TEU',attack:'Horror House-GX',gx:true},
  {source:'Trevenant & Dusknoir-GX SMP',attack:'Night Watch',gx:false},
  {source:'Gengar & Mimikyu-GX TEU',attack:'Poltergeist',gx:false}
]);

/** @param {object} owner Actual player; only own publicly usable cards inspected. */
function ownerVisibleCopyOptions(owner){
  if(owner.active?.getPokemonCard()?.fullName!=='Mewtwo & Mew-GX UNM')
    return [];
  const donors=new Set([
    ...owner.discard.cards.map(card=>card.fullName),
    ...owner.bench.map(slot=>slot.getPokemonCard()?.fullName).filter(Boolean)
  ]);
  return COPY_PRIORITY.filter(c=>donors.has(c.source)&&
    (!c.gx||owner.usedGX!==true)).map(c=>({source:c.source,attack:c.attack}));
}

/**
 * The real pinned engine prompt owns final copied-attack legality.
 * @param {object} prompt Actual own ChooseAttackPrompt.
 * @param {{source:string,attack:string}[]} choices Public/own donor candidates.
 * @returns {object|null}
 */
function choosePromptCopy(prompt,choices){
  for(const choice of choices){
    const donor=prompt.cards.find(card=>card.fullName===choice.source);
    const attack=donor?.attacks?.find(a=>a.name===choice.attack);
    if(attack&&prompt.validate(attack)===true)return attack;
  }
  return null;
}

/**
 * Same opt-in Pass rescue for either candidate 60. A legally attempted
 * Perfection action must still pass the actual Store copied-attack prompt.
 * The pinned preflight Simulator is not information-set-certified; do not
 * include in a held-out v2 campaign until its cross-hidden-state invariance
 * and full-game action legality have been independently verified.
 *
 * @template T
 * @param {0|1} candidateSeat
 * @param {()=>T} execute Synchronous single-game executor.
 * @param {object} [deps] Test seam for pinned engine dependencies.
 * @returns {{result:T,policyAudit:object}}
 */
function withOwnerVisiblePerfectionPassBridge(candidateSeat,execute,deps={}){
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.equal(typeof execute,'function');
  const {SimpleTacticsAi}=deps.bot??load('simple-bot/simple-tactics-ai');
  const {UseAbilityAction}=deps.actions??load('game/store/actions/game-actions');
  const {ResolvePromptAction}=deps.prompts??load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=deps.target??load('game/store/actions/play-card-action');
  const {GamePhase}=deps.phase??load('game/store/state/state');
  const descriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof descriptor?.value,'function');
  const previous=descriptor.value;
  const actorId=candidateSeat===0?101:202;
  const attempted=new Set();
  let awaiting=null;
  const audit={version:'agent35-owner-visible-perfection-pass-bridge-v0',
    candidateSeat,passes:0,opportunities:0,activated:0,
    selected:0,failedPreflight:0,missingPromptCopy:0,events:[],
    passesByOwnActive:{},activeMewtwoPasses:0,
    activeMewtwoNoDonorPasses:0,
    activeMewtwoNoDonorHeldCompressor:0,
    activeMewtwoNoDonorHeldGengar:0,
    informationSetCertified:false,competitiveGameQualified:false};
  const intercept=function(state){
    const owner=state.players.find(player=>player.id===this.client?.id);
    if(!owner||owner.id!==actorId||state.activePlayer!==candidateSeat)
      return previous.call(this,state);
    if(awaiting&&awaiting.turn!==state.turn)awaiting=null;
    const pending=state.prompts.find(p=>p.result===undefined);
    if(pending){
      if(awaiting&&pending.playerId===owner.id&&
          pending.constructor.name==='ChooseAttackPrompt'){
        const attack=choosePromptCopy(pending,awaiting.choices);
        awaiting=null;
        if(attack){
          audit.selected++;
          audit.events.push({turn:state.turn,event:'selected-copied-attack',
            attack:attack.name});
          return new ResolvePromptAction(pending.id,attack);
        }
        audit.missingPromptCopy++;
      }
      return previous.call(this,state);
    }
    const ordinary=previous.call(this,state);
    if(state.phase!==GamePhase.PLAYER_TURN||
        ordinary?.constructor.name!=='PassTurnAction')return ordinary;
    audit.passes++;
    const active=owner.active.getPokemonCard()?.fullName??'(empty)';
    audit.passesByOwnActive[active]=(audit.passesByOwnActive[active]??0)+1;
    if(active==='Mewtwo & Mew-GX UNM')audit.activeMewtwoPasses++;
    if(attempted.has(state.turn))return ordinary;
    const choices=ownerVisibleCopyOptions(owner);
    if(active==='Mewtwo & Mew-GX UNM'&&choices.length===0){
      audit.activeMewtwoNoDonorPasses++;
      const held=owner.hand?.cards??[];
      if(held.some(card=>card.fullName?.startsWith('Battle Compressor '))){
        audit.activeMewtwoNoDonorHeldCompressor++;
      }
      if(held.some(card=>card.fullName==='Gengar & Mimikyu-GX TEU')){
        audit.activeMewtwoNoDonorHeldGengar++;
      }
    }
    if(!choices.length)return ordinary;
    audit.opportunities++;
    const action=new UseAbilityAction(owner.id,'Perfection',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
    if(!this.isValidAction(state,action)){
      audit.failedPreflight++;return ordinary;
    }
    attempted.add(state.turn);
    awaiting={turn:state.turn,choices};
    audit.activated++;
    audit.events.push({turn:state.turn,event:'owner-pass-to-perfection',
      names:choices.map(choice=>choice.attack)});
    return action;
  };
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...descriptor,value:intercept});
  try{
    return {result:execute(),policyAudit:audit};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,intercept);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',descriptor);
  }
}

module.exports={COPY_PRIORITY,ownerVisibleCopyOptions,choosePromptCopy,
  withOwnerVisiblePerfectionPassBridge};
