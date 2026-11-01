'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedRaichu}=require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook}=
  require('./electro-rain-damage-hook.cjs');
const {withPutDamageZeroCapPaperHook}=
  require('./put-damage-zero-cap-paper-hook.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(output,name));

/**
 * Reproduce actual Prize consequences of a printed-illegal 10+20 split from
 * one 30-damage Alolan Raichu Electro Rain packet against two Bench V each
 * with only 10 or 20 HP left. Two full-HP source target identities survive
 * in the opponent's other zones. No complete 60/turn policy is modeled.
 *
 * @param {{split:boolean,guarded:boolean}} option
 * @returns {object}
 */
function probePacketPrizeInflation(option){
  const f=stagedRaichu(['Unit Energy LPM UPR'],null);
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CardList}=engine('game/store/state/card-list');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const {AttackAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const base=f.card('Pikachu LOR');
  f.a.active.cards.unshift(base);
  base.id=1000;
  f.a.active.getPokemonCard().id=1001;
  f.attached[0].id=1002;
  f.b.active.getPokemonCard().id=2000;
  const victims=[200,190].map((damage,i)=>{
    const list=new PokemonCardList();
    const target=f.card('Shadow Rider Calyrex V CRE');
    target.id=2100+i;
    list.cards.push(target);
    list.damage=damage;
    f.b.bench.push(list);
    return {list,target};
  });
  for(const player of [f.a,f.b]){
    player.deck.cards.push(f.card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  const beforePrizes=f.a.getPrizeLeft();
  let putPrompt=null,dispatchError=null;
  const events=[];
  const attack=()=>{
    f.store.dispatch(new AttackAction(f.a.id,'Electro Rain'));
    for(let step=0;step<25;step++){
      const prompt=f.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      let answer;
      const type=prompt.constructor.name;
      if(type==='ChooseCardsPrompt'){
        answer=[...f.attached];
      }else if(type==='PutDamagePrompt'){
        assert.equal(prompt.damage,30);
        assert.equal(prompt.options.damageMultiple,30);
        putPrompt={
          nativeValidatorAccepted:prompt.validate(option.split?[
            {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
              damage:10},
            {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1},
              damage:20}
          ]:[{target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
            damage:30}],f.state)
        };
        answer=option.split?[
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
            damage:10},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:1},
            damage:20}
        ]:[{target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},
          damage:30}];
      }else if(type==='ChoosePrizePrompt'){
        answer=f.a.prizes.filter(prize=>prize.cards.length)
          .slice(0,prompt.options.count);
      }else if(type==='WaitPrompt'){
        answer=null;
      }else{
        throw new Error('Unexpected live Electro Rain event '+type);
      }
      events.push({type,choiceSize:Array.isArray(answer)?answer.length:null});
      f.store.dispatch(new ResolvePromptAction(prompt.id,answer));
    }
  };
  try{
    if(option.guarded){
      withPutDamageZeroCapPaperHook(()=>
        withElectroRainDamageHook(attack));
    }else{
      withElectroRainDamageHook(attack);
    }
  }catch(e){dispatchError=String(e?.message??e);}
  assert.ok(putPrompt,'Must reach actual UNM printed attack prompt');
  return {
    ...option,
    nativeValidatorAccepted:putPrompt.nativeValidatorAccepted,
    dispatchError,
    beforePrizes,afterPrizes:f.a.getPrizeLeft(),
    prizeGain:beforePrizes-f.a.getPrizeLeft(),
    victimKnockedOut:victims.map(({target})=>f.b.discard.cards.includes(target)),
    victimDamageNow:victims.map(({list})=>list.damage),
    pending:f.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    events
  };
}

function run(){
  const legal=probePacketPrizeInflation({split:false,guarded:false});
  const invalid=probePacketPrizeInflation({split:true,guarded:false});
  const blocked=probePacketPrizeInflation({split:true,guarded:true});
  assert.equal(legal.prizeGain,2,
    'One 30 packet can Knock Out exactly one vulnerable Bench V');
  assert.deepEqual(legal.victimKnockedOut,[true,false]);
  assert.equal(invalid.nativeValidatorAccepted,true);
  assert.equal(invalid.dispatchError,null);
  assert.equal(invalid.prizeGain,4,
    'Illegal 10+20 split must expose extra native Prize taking');
  assert.deepEqual(invalid.victimKnockedOut,[true,true]);
  assert.match(blocked.dispatchError,
    /PAPER_PUT_DAMAGE_REJECTED:INVALID_PRINTED_DAMAGE_PACKET/);
  assert.equal(blocked.prizeGain,0);
  assert.deepEqual(blocked.victimKnockedOut,[false,false]);
  const out={
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'Aichi ranks4/17 Alolan Raichu UNM 57',
    scope:'conditional staged printed board and full native KO/Prize effects; no original game',
    legal,invalid,blocked,
    finding:'paper-forbidden-split-inflates-Prizes-by-two-in-this-native-state'
  };
  console.log(JSON.stringify(out,null,2));
  return out;
}
if(require.main===module)run();
module.exports={probePacketPrizeInflation,run};
