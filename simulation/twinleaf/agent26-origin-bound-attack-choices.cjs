'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {sampleUniformPositions}=
  require('./agent12-nightwatch-paper-random-chooser.cjs');

const VERSION='agent26-origin-bound-attack-choices-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Narrow developmental bridge for two printed ATTACK ChooseCards prompts.
 * It never delegates a source-attributed opponent-private hand choice to
 * the native bot's hidden-information scorer. Paper-random Night Watch
 * samples opaque physical positions using the independently audited Agent12
 * sampler. Get Lost chooses two cards from a PUBLIC discard pile, with an
 * explicitly neutral chronological choice policy. An unknown or unaffordable
 * prompt delegates into the caller's fail-closed raw-State quarantine.
 *
 * @template T
 * @param {()=>T} run Synchronous genuine Store experiment.
 * @param {{committedSeed:string,engine?:(relative:string)=>object}} options
 * @returns {{result:T,audit:object}}
 */
function withOwnerOriginBoundAttackChoices(run,options){
  assert.equal(typeof run,'function');
  assert.ok(typeof options?.committedSeed==='string'&&
    options.committedSeed.length>0);
  const engine=options.engine??(p=>require(path.join(OUTPUT,p)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {TrevenantDusknoirGX}=engine(
    'sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
  const {Girafarig}=engine('sets/08-sun-and-moon/set-lost-thunder/girafarig');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const definitions=[
    {klass:TrevenantDusknoirGX,kind:'night-watch',
      printing:'Trevenant & Dusknoir-GX SMP',attack:'Night Watch',
      zone:'hand',secret:true,allowCancel:false},
    {klass:Girafarig,kind:'get-lost',
      printing:'Girafarig LOT',attack:'Get Lost',
      zone:'discard',secret:false,allowCancel:true}
  ];
  const previous=definitions.map(d=>Object.getOwnPropertyDescriptor(
    d.klass.prototype,'reduceEffect'));
  const oldAi=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  for(const d of [...previous,oldAi]){
    assert.equal(typeof d?.value,'function');
    assert.equal(d.configurable,true);
  }
  const origins=new WeakMap();
  const audit={version:VERSION,printedSourceInvocations:[],
    markedPrompts:[],selected:[],declined:[],
    privateCardIdentityInspectedForPolicy:false,
    sourceQualifiedCompetitiveGames:0};

  const wrappers=definitions.map((definition,i)=>{
    const original=previous[i].value;
    return function exactPrintedSource(store,state,effect){
      if(this.fullName!==definition.printing||
         effect?.constructor?.name!=='AttackEffect'||
         effect.attack!==this.attacks?.[0])
        return original.call(this,store,state,effect);
      const ownerId=effect.player?.id;
      const opposing=state.players?.find(p=>p.id!==ownerId);
      if(!opposing)return original.call(this,store,state,effect);
      const expectedZone=opposing[definition.zone];
      const sourceTurn=state.turn;
      audit.printedSourceInvocations.push({printing:definition.printing,
        attack:definition.attack,sourceTurn});
      const proxy=new Proxy(store,{get(target,property){
        if(property==='prompt')return (nextState,prompt,callback)=>{
          if(prompt instanceof ChooseCardsPrompt&&
             prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD&&
             prompt.playerId===ownerId&&prompt.cards===expectedZone&&
             prompt.options?.allowCancel===definition.allowCancel&&
             (prompt.options?.isSecret===true)===definition.secret&&
             prompt.options?.min>=0&&prompt.options?.max<=2&&
             Object.keys(prompt.filter??{}).length===0){
            origins.set(prompt,{definition,ownerId,sourceTurn});
            audit.markedPrompts.push({printing:definition.printing,
              kind:definition.kind,sourceTurn});
          }
          return target.prompt(nextState,prompt,callback);
        };
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }});
      return original.call(this,proxy,state,effect);
    };
  });

  function decodeNextAction(state){
    const actorId=this.client?.id;
    const prompt=state?.prompts?.find(p=>
      p.playerId===actorId&&p.result===undefined)??null;
    const origin=prompt?origins.get(prompt):null;
    if(!origin||origin.ownerId!==actorId)
      return oldAi.value.call(this,state);
    const opponent=state.players.find(p=>p.id!==actorId);
    const zone=opponent?.[origin.definition.zone];
    if(!zone||prompt.cards!==zone||
       !Number.isSafeInteger(state.turn)||state.turn<0){
      audit.declined.push({kind:origin.definition.kind,
        reason:'owner-zone-or-turn-not-established'});
      return oldAi.value.call(this,state);
    }
    const n=zone.cards.length;
    const k=Math.min(2,n);
    let positions;
    if(origin.definition.kind==='night-watch'){
      if(prompt.options.min!==k||prompt.options.max!==k){
        audit.declined.push({kind:'night-watch',reason:'wrong-cardinality'});
        return oldAi.value.call(this,state);
      }
      assert.ok(typeof prompt.id==='string'||
        Number.isSafeInteger(prompt.id));
      const nonce=JSON.stringify([state.turn,String(actorId),
        String(prompt.id)]);
      positions=sampleUniformPositions(n,k,options.committedSeed,nonce);
    }else{
      // Separate source-level paper correction is required below two.
      if(n<2||prompt.options.min!==2||prompt.options.max!==2){
        audit.declined.push({kind:'get-lost',reason:'needs-paper-count-hook'});
        return oldAi.value.call(this,state);
      }
      positions=[0,1];
    }
    const choices=positions.map(index=>zone.cards[index]);
    assert.equal(prompt.validate(choices),true,
      'Source-marked owner prompt rejected printed-source selection');
    audit.selected.push({kind:origin.definition.kind,
      printing:origin.definition.printing,actorSeat:state.players.findIndex(p=>
        p.id===actorId),turn:state.turn,count:k,positions,
      privateCardIdentitiesExposed:false});
    return new ResolvePromptAction(prompt.id,choices);
  }

  definitions.forEach((definition,i)=>Object.defineProperty(
    definition.klass.prototype,'reduceEffect',{
      ...previous[i],value:wrappers[i]}));
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...oldAi,value:decodeNextAction});
  try{
    const result=run();
    return {result,audit};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      decodeNextAction);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldAi);
    definitions.forEach((definition,i)=>{
      assert.strictEqual(definition.klass.prototype.reduceEffect,wrappers[i]);
      Object.defineProperty(definition.klass.prototype,'reduceEffect',previous[i]);
    });
  }
}
module.exports={VERSION,withOwnerOriginBoundAttackChoices};
