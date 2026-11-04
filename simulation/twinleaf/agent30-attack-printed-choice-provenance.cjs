'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent30-attack-printed-choice-source-origin-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Read-only exact printed-source provenance observer for two ATTACK
 * ChooseCardsPrompt classes. This NEVER chooses a card, never inspects hidden
 * card identities and always delegates unsupported choices to a caller's
 * outer raw-State-decoder quarantine.
 *
 * @template T
 * @param {()=>T} run Real synchronous native development run.
 * @param {{engine?:(relative:string)=>object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPrintedAttackChoiceProvenance(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(p=>require(path.join(OUTPUT,p)));
  const {TrevenantDusknoirGX}=engine(
    'sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
  const {Girafarig}=engine(
    'sets/08-sun-and-moon/set-lost-thunder/girafarig');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=engine('game/game-message');
  const sourceDefinitions=[
    {klass:TrevenantDusknoirGX,
      source:'Trevenant & Dusknoir-GX SMP',
      attack:'Night Watch',zone:'opponent-private-hand',
      requiresSecret:true,requiresCancel:false},
    {klass:Girafarig,
      source:'Girafarig LOT',
      attack:'Get Lost',zone:'opponent-public-discard',
      requiresSecret:false,requiresCancel:true}
  ];
  const previous=sourceDefinitions.map(s=>
    Object.getOwnPropertyDescriptor(s.klass.prototype,'reduceEffect'));
  const aiDescriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof aiDescriptor?.value,'function');
  assert.equal(aiDescriptor.configurable,true);
  previous.forEach(desc=>{
    assert.equal(typeof desc?.value,'function');
    assert.equal(desc.configurable,true);
  });

  const origins=new WeakMap();
  const audit={version:VERSION,printedSourceInvocations:[],
    exactSourcePromptsStamped:[],blockedPromptOriginEvents:[],
    cardIdentitiesInspected:false,rawStateDecoderExecutedByObserver:false,
    decisionActionsIssuedByObserver:0,competitivelyQualifiedGames:0};
  const wrapped=sourceDefinitions.map((source,index)=>{
    const original=previous[index].value;
    return function sourcePromptMarker(store,state,effect){
      if(effect?.constructor?.name!=='AttackEffect'||
         effect.attack!==this.attacks?.[0])
        return original.call(this,store,state,effect);
      const actor=effect.player;
      const other=state.players.find(p=>p.id!==actor?.id);
      if(!other)return original.call(this,store,state,effect);
      audit.printedSourceInvocations.push({
        source:source.source,attack:source.attack,
        actorSeat:state.players.indexOf(actor),turn:state.turn});
      const zone=source.requiresSecret?other.hand:other.discard;
      const adapter=new Proxy(store,{
        get(target,property){
          if(property==='prompt')return (nextState,prompt,callback)=>{
            if(prompt instanceof ChooseCardsPrompt&&
               prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD&&
               prompt.playerId===actor.id&&
               prompt.cards===zone&&
               prompt.options?.allowCancel===source.requiresCancel&&
               (prompt.options?.isSecret===true)===source.requiresSecret&&
               prompt.options?.min>=0&&prompt.options?.max<=2){
              const proof={source:source.source,attack:source.attack,
                zone:source.zone,actorId:actor.id,
                turn:state.turn,actorSeat:state.players.indexOf(actor),
                offeredCount:zone.cards.length,
                requiredMin:prompt.options.min,
                maximum:prompt.options.max,
                mayCancel:prompt.options.allowCancel,
                isSecret:prompt.options.isSecret??false};
              origins.set(prompt,proof);
              audit.exactSourcePromptsStamped.push(proof);
            }
            return target.prompt(nextState,prompt,callback);
          };
          const value=Reflect.get(target,property,target);
          return typeof value==='function'?value.bind(target):value;
        }
      });
      return original.call(this,adapter,state,effect);
    };
  });

  function readOnlyBlockedPromptOrigin(state){
    const id=this.client?.id;
    const pending=state?.prompts?.find(p=>
      p.playerId===id&&p.result===undefined);
    const origin=pending?origins.get(pending):null;
    if(origin){
      audit.blockedPromptOriginEvents.push({
        ...origin,
        actualPromptTurn:state.turn,
        actualActorSeat:state.players.findIndex(p=>p.id===id),
        pendingNativePromptId:String(pending.id)});
    }
    return aiDescriptor.value.call(this,state);
  }

  sourceDefinitions.forEach((source,i)=>
    Object.defineProperty(source.klass.prototype,'reduceEffect',{
      ...previous[i],value:wrapped[i]}));
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...aiDescriptor,value:readOnlyBlockedPromptOrigin});
  try{
    const result=run();
    return {result,audit};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      readOnlyBlockedPromptOrigin);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      aiDescriptor);
    sourceDefinitions.slice().reverse().forEach((source,i)=>{
      const n=sourceDefinitions.length-1-i;
      assert.strictEqual(source.klass.prototype.reduceEffect,wrapped[n]);
      Object.defineProperty(source.klass.prototype,'reduceEffect',
        previous[n]);
    });
  }
}

module.exports={VERSION,withPrintedAttackChoiceProvenance};
