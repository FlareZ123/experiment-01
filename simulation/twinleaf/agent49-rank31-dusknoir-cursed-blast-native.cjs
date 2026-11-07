'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');
const {rank31Original60}=
  require('./agent49-owner-direct-fog-one-energy-native.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUTPUT,name));

/**
 * Execute the original rank31 Dusknoir PRE Cursed Blast against a staged
 * two-Prize Pokémon. The target's prior damage is a fixture precondition;
 * this proves the native ability/self-KO/Prize exchange, not how that damage
 * was produced or a complete source-dealt game.
 *
 * @param {0|1} [seat=0] Physical source seat.
 * @returns {object} Actual native ability and Prize settlement.
 */
function probeRank31DusknoirCursedBlast(seat=0){
  assert.ok(seat===0||seat===1);
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');

  const f=stagedPainfulSpoons(seat);
  const {source,opponent,store,state}=f;
  assert.equal(state.activePlayer,seat);
  assert.ok(state.turn>1);
  assert.equal(source.bench.length,0);

  const original60=rank31Original60();
  const source60Counts={
    duskullPRE:original60.filter(name=>name==='Duskull PRE').length,
    dusclopsPRE:original60.filter(name=>name==='Dusclops PRE').length,
    dusknoirPRE:original60.filter(name=>name==='Dusknoir PRE').length,
    dusknoirBCR:original60.filter(name=>name==='Dusknoir BCR').length
  };
  assert.equal(original60.length,60);
  assert.deepEqual(source60Counts,{
    duskullPRE:3,dusclopsPRE:3,dusknoirPRE:3,dusknoirBCR:1
  });

  const duskull=f.card('Duskull PRE');
  const dusclops=f.card('Dusclops PRE');
  const dusknoir=f.card('Dusknoir PRE');
  const stack=new PokemonCardList();
  stack.cards.push(duskull,dusclops,dusknoir);
  source.bench.push(stack);

  const targetSlot=opponent.bench[1];
  const target=targetSlot.getPokemonCard();
  assert.equal(target.fullName,'Shadow Rider Calyrex V CRE');
  assert.equal(Number(target.hp),210);
  targetSlot.damage=80;

  const sourcePrizesBefore=source.prizes.filter(x=>x.cards.length>0).length;
  const opponentPrizesBefore=opponent.prizes.filter(x=>x.cards.length>0).length;
  assert.equal(sourcePrizesBefore,6);
  assert.equal(opponentPrizesBefore,6);

  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const trace=[];
  let targetPromptSeen=false;
  let sourcePrizeCardsTaken=0;
  let opponentPrizeCardsTaken=0;
  const actorSide=PlayerType.BOTTOM_PLAYER;

  store.dispatch(new UseAbilityAction(source.id,'Cursed Blast',{
    player:actorSide,slot:SlotType.BENCH,index:0
  }));

  for(let i=0;i<40;i++){
    const prompt=pending();
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let answer;
    if(kind==='WaitPrompt')answer=null;
    else if(kind==='ShowCardsPrompt')answer=true;
    else if(kind==='ChoosePokemonPrompt'){
      assert.equal(prompt.playerId,source.id,
        'Dusknoir owner chooses the opponent target');
      assert.equal(prompt.validate([targetSlot],state),true);
      answer=[targetSlot];
      targetPromptSeen=true;
    }else if(kind==='ChoosePrizePrompt'){
      const chooser=state.players.find(player=>player.id===prompt.playerId);
      assert.ok(chooser,'Prize prompt must identify its physical owner');
      const count=Number(prompt.options?.count??1);
      const selection=chooser.prizes.filter(prize=>prize.cards.length>0)
        .slice(0,count);
      assert.equal(selection.length,count);
      assert.equal(prompt.validate(selection,state),true);
      answer=selection;
      if(chooser.id===source.id)sourcePrizeCardsTaken+=count;
      else if(chooser.id===opponent.id)opponentPrizeCardsTaken+=count;
      else assert.fail('Prize prompt belongs to an unknown player');
    }else if(kind==='ShuffleDeckPrompt'){
      const chooser=state.players.find(player=>player.id===prompt.playerId);
      assert.ok(chooser);
      answer=chooser.deck.cards.map((_,index)=>index);
    }else{
      throw new Error('Unexpected Cursed Blast prompt '+kind);
    }
    trace.push({kind,playerId:prompt.playerId,
      prizeCount:kind==='ChoosePrizePrompt'?Number(prompt.options?.count??1):undefined});
    store.dispatch(new ResolvePromptAction(prompt.id,answer));
  }

  assert.equal(pending(),undefined,'Cursed Blast and all Prize prompts must settle');
  assert.equal(targetPromptSeen,true);
  assert.equal(sourcePrizeCardsTaken,2,
    'Knocking Out a two-Prize V must award two physical Prizes');
  assert.equal(opponentPrizeCardsTaken,1,
    'Dusknoir self-KO must award one physical Prize to opponent');
  assert.equal(opponent.discard.cards.includes(target),true);
  assert.equal(source.discard.cards.includes(duskull),true);
  assert.equal(source.discard.cards.includes(dusclops),true);
  assert.equal(source.discard.cards.includes(dusknoir),true);
  assert.equal(targetSlot.getPokemonCard(),undefined);

  const sourcePrizesAfter=source.prizes.filter(x=>x.cards.length>0).length;
  const opponentPrizesAfter=opponent.prizes.filter(x=>x.cards.length>0).length;
  assert.equal(sourcePrizesAfter,4);
  assert.equal(opponentPrizesAfter,5);

  return {
    version:'agent49-rank31-dusknoir-pre-cursed-blast-native-v1',
    seat,turn:state.turn,source60K0:true,source60Count:original60.length,source60Counts,
    sourceDeckPhysicalComplete:false,opponentDeckPhysicalComplete:false,
    ability:'Cursed Blast',abilityCounters:13,abilityDamage:130,
    sourceStack:['Duskull PRE','Dusclops PRE','Dusknoir PRE'],
    targetPrinting:target.fullName,targetHp:210,targetDamageBefore:80,
    targetExpectedDamageAfter:210,targetKnockedOut:true,
    sourcePrizeCountBefore:sourcePrizesBefore,
    sourcePrizeCountAfter:sourcePrizesAfter,
    sourcePrizeCardsTaken,
    opponentPrizeCountBefore:opponentPrizesBefore,
    opponentPrizeCountAfter:opponentPrizesAfter,
    opponentPrizeCardsTaken,
    netPrizeAdvantage:sourcePrizeCardsTaken-opponentPrizeCardsTaken,
    sourceStackPhysicallyDiscarded:
      source.discard.cards.includes(duskull)&&
      source.discard.cards.includes(dusclops)&&
      source.discard.cards.includes(dusknoir),
    targetPhysicallyDiscarded:opponent.discard.cards.includes(target),
    pendingPrompts:state.prompts.filter(p=>p.result===undefined).length,
    trace,qualifiedGame:false,competitiveResult:false
  };
}

module.exports={probeRank31DusknoirCursedBlast};
