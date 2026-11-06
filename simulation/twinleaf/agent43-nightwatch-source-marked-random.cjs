'use strict';

const path=require('node:path');
const {seededRandom}=require('./headless.cjs');
const {sampleDistinctHandPositions}=
  require('./agent43-nightwatch-paper-random-resolver.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Default-off exact *source effect*-marked Night Watch paper-index selection.
 * An attack copied by another Pokémon still runs the original card's
 * reduceEffect method through pinned delegated attack machinery. Tracking the
 * prompt at that source-effect boundary avoids misclassifying other effects
 * which happen to use the same broad ChooseCardsPrompt message.
 *
 * Does not modify pinned vendor source, and leaves unrelated choose prompts
 * and owner rules untouched.
 *
 * @template T
 * @param {()=>T} work Actual synchronous native experiment.
 * @param {{seed:number}} options Separate dedicated diagnostic PRNG stream.
 * @returns {{result:T,audit:object}}
 */
function withSourceMarkedPaperRandomNightWatch(work,options){
  const native=p=>require(path.join(OUTPUT,p));
  const {TrevenantDusknoirGX}=native(
    'sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const proto=TrevenantDusknoirGX.prototype;
  const oldReduce=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  const oldReply=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'resolvePrompt');
  const marked=new WeakMap();
  const seed=options.seed>>>0;
  const random=seededRandom(seed);
  const audit={
    version:'agent43-native-source-marked-nightwatch-uniform-index-v1',
    seed,markedSourcePrompts:0,samples:[],
    prototypeRestored:false,qualifiedGames:0
  };
  function sourceMarkedReduce(store,state,effect){
    const oldPrompts=new Set(state.prompts);
    const result=oldReduce.value.call(this,store,state,effect);
    if(effect?.constructor?.name!=='AttackEffect'||
      effect.attack?.name!=='Night Watch')return result;
    const actor=effect.player;
    const opponent=state.players.find(p=>p.id!==actor.id);
    for(const prompt of state.prompts){
      if(oldPrompts.has(prompt)||
        prompt.constructor?.name!=='ChooseCardsPrompt'||
        prompt.message!=='CHOOSE_CARD_TO_DISCARD'||
        prompt.playerId!==actor.id||
        prompt.cards!==opponent?.hand||
        prompt.options?.isSecret!==true||
        prompt.options.min!==prompt.options.max||
        !Number.isInteger(prompt.options.min)||
        prompt.options.min<1||
        prompt.options.min>2)continue;
      marked.set(prompt,{
        sourcePrinting:'Trevenant & Dusknoir-GX SMP',
        declaredAttack:'Night Watch',
        activeUser:actor.active.getPokemonCard()?.fullName??null,
        sourceBoundToCopycat:this.fullName!=='Trevenant & Dusknoir-GX SMP'
      });
      audit.markedSourcePrompts++;
    }
    return result;
  }
  function seededReply(actor,state,prompt){
    const origin=marked.get(prompt);
    if(!origin)
      return oldReply.value.call(this,actor,state,prompt);
    if(actor.id!==prompt.playerId)
      throw new Error('Night Watch origin-marked prompt has wrong actor');
    const count=prompt.options.min;
    const size=prompt.cards.cards.length;
    const indices=sampleDistinctHandPositions(size,count,random);
    const physical=indices.map(i=>prompt.cards.cards[i]);
    if(prompt.validate(physical,state)!==true)
      throw new Error('Random original Night Watch hand indices failed native validation');
    const seat=state.players.findIndex(p=>p.id===actor.id);
    audit.samples.push({
      seat,turn:state.turn,promptId:prompt.id,
      handSize:size,sampledPhysicalIndices:indices,
      ...origin,
      opponentPrivateCardNamesReadForDecision:false,
      nativePromptValidated:true
    });
    return new ResolvePromptAction(prompt.id,physical);
  }
  Object.defineProperty(proto,'reduceEffect',{
    ...oldReduce,value:sourceMarkedReduce});
  Object.defineProperty(SimpleTacticsAi.prototype,'resolvePrompt',{
    ...oldReply,value:seededReply});
  try{
    return {result:work(),audit};
  }finally{
    Object.defineProperty(SimpleTacticsAi.prototype,'resolvePrompt',oldReply);
    Object.defineProperty(proto,'reduceEffect',oldReduce);
    audit.prototypeRestored=
      SimpleTacticsAi.prototype.resolvePrompt===oldReply.value&&
      proto.reduceEffect===oldReduce.value;
  }
}

module.exports={withSourceMarkedPaperRandomNightWatch};
