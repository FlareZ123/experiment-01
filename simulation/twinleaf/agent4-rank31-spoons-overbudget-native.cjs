'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperPainfulSpoonsSingleSource}=
  require('./agent4-painful-spoons-single-source-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} */
const native=file=>require(path.join(output,file));

/**
 * Source-rank31 genuine Radiant Alakazam SIT59 prompt with 0,1,2 or 3
 * counters all moved from one physical opponent Pokémon to another.
 * The destination has 180/210 preexisting damage, so a paper-forbidden
 * three-counter move would KO a two-Prize V whereas two counters cannot.
 * Prepared board only, never a random original 60 game.
 * @param {{count:0|1|2|3,guarded:boolean,seat:0|1}} options
 * @returns {object}
 */
function probePainfulSpoonsCounterBudget(options){
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const f=stagedPainfulSpoons(options.seat);
  const victim=f.opponent.bench[1].getPokemonCard();
  f.opponent.active.damage=30;
  f.opponent.bench[1].damage=180;
  const prizeBefore=f.source.getPrizeLeft();
  const source={player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0};
  const destination={
    player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1
  };
  const rows=Array.from({length:options.count},()=>({
    from:{...source},to:{...destination}
  }));
  const execute=()=>{
    f.store.dispatch(new UseAbilityAction(f.source.id,'Painful Spoons',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const first=f.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='WaitPrompt');
    assert.ok(first,'Need physical original animation WaitPrompt');
    f.store.dispatch(new ResolvePromptAction(first.id,null));
    const prompt=f.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='MoveDamagePrompt');
    assert.ok(prompt,'Need real printed rank31 MoveDamagePrompt');
    const nativeValidatorAccepted=prompt.validate(rows,f.state);
    const nativeOptions={
      min:prompt.options.min,max:prompt.options.max,
      allowCancel:prompt.options.allowCancel
    };
    let storeError=null;
    try{f.store.dispatch(new ResolvePromptAction(prompt.id,rows));}
    catch(e){storeError=String(e?.message??e);}
    const settlement=[];
    if(!options.guarded){
      for(let i=0;i<10;i++){
        const next=f.state.prompts.find(p=>p.result===undefined);
        if(!next)break;
        let answer;
        if(next.constructor.name==='WaitPrompt')answer=null;
        else if(next.constructor.name==='ChoosePrizePrompt')
          answer=f.source.prizes.filter(p=>p.cards.length>0)
            .slice(0,next.options.count);
        else{
          settlement.push({type:next.constructor.name,
            error:'unexpected follow-up; stopped'});
          break;
        }
        const validatorAccepted=next.validate(answer,f.state);
        let error=null;
        try{f.store.dispatch(new ResolvePromptAction(next.id,answer));}
        catch(e){error=String(e?.message??e);}
        settlement.push({type:next.constructor.name,validatorAccepted,error});
        if(error)break;
      }
    }
    return {
      seat:options.seat,count:options.count,guarded:options.guarded,
      ownerPrinted:'Radiant Alakazam SIT59 rank31',
      sourceCard:prompt.sourceCard?.fullName??null,
      nativeOptions,nativeValidatorAccepted,storeError,
      promptPending:prompt.result===undefined,
      victimInDiscard:f.opponent.discard.cards.includes(victim),
      sourceDamage:f.opponent.active.damage,
      targetStillInPlay:f.opponent.bench[1].getPokemonCard()===victim,
      targetDamage:f.opponent.bench[1].damage,
      prizesTaken:prizeBefore-f.source.getPrizeLeft(),
      followUpSettlements:settlement,
      remainingPrompts:f.state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name),
      scope:'Paper-rule 0..3 counter test on conditional original printed Ability; no original 60-game'
    };
  };
  return options.guarded
    ?withPaperPainfulSpoonsSingleSource(execute):execute();
}
if(require.main===module)
  console.log(JSON.stringify([0,1,2,3].map(count=>
    probePainfulSpoonsCounterBudget({count,guarded:false,seat:0})),null,2));
module.exports={probePainfulSpoonsCounterBudget};
