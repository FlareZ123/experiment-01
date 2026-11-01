'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=require('./agent4-rank31-alakazam-movesource-native.cjs');
const {withPaperPainfulSpoonsSingleSource}=require('./agent4-painful-spoons-single-source-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename @returns {any} */
const native=filename=>require(path.join(output,filename));

/** @param {boolean} guarded */
function runRank31RoxieSpoons(guarded){
  const {PlayCardAction,PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons();
  f.opponent.active.damage=0;
  f.opponent.bench[0].damage=0;
  f.opponent.bench[1].damage=180;
  const victim=f.opponent.bench[1].getPokemonCard();
  const roxie=f.card('Roxie CEC');
  const koffing=f.card('Koffing CEC');
  f.source.hand.cards.push(roxie,koffing);
  const evidence=[];
  const pending=()=>f.state.prompts.find(p=>p.result===undefined);
  const execute=()=>{
    const before=f.source.getPrizeLeft();
    f.store.dispatch(new PlayCardAction(f.source.id,0,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    for(let k=0;k<16;k++){
      const prompt=pending();
      if(!prompt)break;
      const type=prompt.constructor.name;
      let answer;
      if(type==='ChooseCardsPrompt')answer=[koffing];
      else if(type==='ConfirmPrompt')answer=true;
      else if(type==='WaitPrompt')answer=null;
      else throw new Error('Unexpected native Roxie prompt '+type);
      assert.equal(prompt.validate(answer,f.state),true,
        'Native original '+type+' rejected: '+
        JSON.stringify({answer:Array.isArray(answer)?answer.map(c=>c.fullName):answer,
          sourceHand:f.source.hand.cards.map(c=>c.fullName),
          blocked:prompt.options?.blocked,
          promptMin:prompt.options?.min,promptMax:prompt.options?.max,
          sourceDiscard:f.source.discard.cards.map(c=>c.fullName)}));
      evidence.push({phase:'Roxie',type});
      f.store.dispatch(new ResolvePromptAction(prompt.id,answer));
    }
    assert.equal(pending(),undefined,'Roxie and Koffing must settle');
    assert.ok(f.source.discard.cards.includes(koffing));
    const afterBomb=[f.opponent.active.damage,
      f.opponent.bench[0].damage,f.opponent.bench[1].damage];
    assert.deepEqual(afterBomb,[10,10,190]);

    f.store.dispatch(new UseAbilityAction(f.source.id,'Painful Spoons',
      {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));
    for(let k=0;k<4;k++){
      const wait=f.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='WaitPrompt');
      if(!wait)break;
      f.store.dispatch(new ResolvePromptAction(wait.id,null));
    }
    const prompt=f.state.prompts.find(p=>p.result===undefined&&p.constructor.name==='MoveDamagePrompt');
    assert.ok(prompt,'Missing genuine SIT59 movement after native Koffing');
    const reply=[
      {from:{player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0},
        to:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1}},
      {from:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
        to:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1}}
    ];
    const allowed=prompt.validate(reply,f.state);
    let rejected=null;
    try{f.store.dispatch(new ResolvePromptAction(prompt.id,reply));}
    catch(e){rejected=String(e?.message??e);}
    if(!guarded){
      for(let k=0;k<10;k++){
        const p=pending();
        if(!p)break;
        const type=p.constructor.name;
        const answer=type==='WaitPrompt'?null:
          type==='ChoosePrizePrompt'?
            f.source.prizes.filter(x=>x.cards.length).slice(0,p.options.count):undefined;
        assert.notEqual(answer,undefined,'Unexpected native prize prompt '+type);
        assert.equal(p.validate(answer,f.state),true);
        f.store.dispatch(new ResolvePromptAction(p.id,answer));
        evidence.push({phase:'Prize',type});
      }
    }
    return {guarded,afterBomb,allowed,rejected,
      promptPending:prompt.result===undefined,
      physicalKoffingDiscarded:f.source.discard.cards.includes(koffing),
      roxieDiscarded:f.source.discard.cards.includes(roxie),
      victimInDiscard:f.opponent.discard.cards.includes(victim),
      prizesTaken:before-f.source.getPrizeLeft(),
      evidence,
      scope:'actual original rank31 printed line on a prepared Store board; not a source-dealt game'};
  };
  return guarded?withPaperPainfulSpoonsSingleSource(execute):execute();
}
if(require.main===module)console.log(JSON.stringify([
  runRank31RoxieSpoons(false),runRank31RoxieSpoons(true)
],null,2));
module.exports={runRank31RoxieSpoons};
