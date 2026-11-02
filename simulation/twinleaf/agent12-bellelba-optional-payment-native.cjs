'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(ROOT,p));
const PRINT='Bellelba & Brycen-Man CEC';
const VERSION='agent12-bellelba-three-payment-native-v1';

/**
 * Actual pinned Store: original rank-7 source printings with four real Bench
 * Pokémon per side, three top-deck cards per side, and optional discard.
 * These are constructed states, never native full games.
 * @param {0|1} seat Owner's physical seat.
 * @param {0|1|2|3} offered Other hand cards selected for three-card optional cost.
 * @param {2|3} available Number of actual cards besides Supporter in hand.
 * @returns {object} Native payment, bench effects and prompt receipts.
 */
function probe(seat,offered,available=3){
  assert.ok(seat===0||seat===1);
  assert.ok(Number.isInteger(offered)&&offered>=0&&offered<=available);
  assert.ok(available===2||available===3);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  f.source.active.cards.splice(0,1,f.card('Snorlax PGO'));
  const otherCards=[
    f.card('Team Flare Grunt XY'),
    f.card('N FCO'),
    f.card('Lusamine CIN')
  ].slice(0,available);
  const supporter=f.card(PRINT);
  f.source.hand.cards.push(...otherCards,supporter);
  const originalSourceBench=['Mimikyu PAL','Mimikyu PAL','Regirock XYP','Electrike PRC']
    .map((name,i)=>{
      const pokemon=f.card(name);
      f.source.bench[i].cards.push(pokemon);
      return pokemon;
    });
  const opponentBench=Array.from({length:4},(_,i)=>{
    const pokemon=f.card('Shadow Rider Calyrex V CRE');
    f.opponent.bench[i].cards.push(pokemon);
    return pokemon;
  });
  const begin={
    sourceBench:f.source.bench.filter(b=>b.cards.length).length,
    opponentBench:f.opponent.bench.filter(b=>b.cards.length).length,
    sourceDeck:f.source.deck.cards.length,
    opponentDeck:f.opponent.deck.cards.length,
    sourceHand:f.source.hand.cards.length
  };
  f.store.dispatch(new PlayCardAction(f.source.id,available,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=(type,msg)=>f.store.state.prompts.find(
    p=>p.result===undefined&&p.constructor.name===type&&
    (msg===undefined||p.message===msg));
  const receipts=[];
  const respond=(p,answer)=>{
    assert.ok(p,'Expected authentic native prompt');
    const valid=p.validate(answer,f.store.state);
    let error=null;
    try{f.store.dispatch(new ResolvePromptAction(p.id,answer));}
    catch(e){error=String(e?.message??e);}
    receipts.push({kind:p.constructor.name,message:p.message??null,
      owner:p.playerId,valid,error,replySize:Array.isArray(answer)?answer.length:null});
    return {valid,error};
  };
  const confirms=prompt('ConfirmPrompt');
  if(confirms)respond(confirms,true);
  const costPrompt=prompt('ChooseCardsPrompt','CHOOSE_CARD_TO_DISCARD');
  const selected=otherCards.slice(0,offered);
  let cost=null;
  if(costPrompt)cost=respond(costPrompt,selected);
  const opponentDiscard=prompt('ChoosePokemonPrompt');
  if(opponentDiscard){
    assert.equal(opponentDiscard.playerId,f.opponent.id,
      'Printed effect must ask opponent to choose first');
    respond(opponentDiscard,[f.opponent.bench[0]]);
  }
  const ownerDiscard=prompt('ChoosePokemonPrompt');
  if(ownerDiscard){
    assert.equal(ownerDiscard.playerId,f.source.id);
    respond(ownerDiscard,[f.source.bench[0]]);
  }
  for(let i=0;i<12;i++){
    const p=f.store.state.prompts.find(q=>q.result===undefined);
    if(!p)break;
    if(p.constructor.name==='WaitPrompt')respond(p,null);
    else if(p.constructor.name==='ShowCardsPrompt')respond(p,true);
    else if(p.constructor.name==='ChoosePrizePrompt'){
      const owner=f.store.state.players.find(x=>x.id===p.playerId);
      respond(p,owner.prizes.filter(x=>x.cards.length).slice(0,p.options.count));
    }
    else break;
  }
  const end={
    sourceBench:f.source.bench.filter(b=>b.cards.length).length,
    opponentBench:f.opponent.bench.filter(b=>b.cards.length).length,
    sourceDeck:f.source.deck.cards.length,
    opponentDeck:f.opponent.deck.cards.length,
    sourceHand:f.source.hand.cards.length,
    sourceDiscard:f.source.discard.cards.length,
    opponentDiscard:f.opponent.discard.cards.length
  };
  return {
    version:VERSION,seat,sourceRanksContainingPrinting:[2,7,24],
    constructedBoard:true,competitiveQualifiedGames:0,
    available,offered,paperCanChooseOptional:available>=3,
    paperOptionalPaid:available>=3&&offered===3,
    begin,confirmFound:Boolean(confirms),costPromptFound:Boolean(costPrompt),
    costPromptBounds:costPrompt?{min:costPrompt.options.min,
      max:costPrompt.options.max}:null,
    cost,end,
    originalHandCardStatus:otherCards.map(card=>({
      printing:card.fullName,inHand:f.source.hand.cards.includes(card),
      inDiscard:f.source.discard.cards.includes(card)
    })),
    originalBenchCardStatus:originalSourceBench.map(card=>({
      printing:card.fullName,
      inDiscard:f.source.discard.cards.includes(card)
    })),
    originalOpponentBenchStatus:opponentBench.map(card=>({
      printing:card.fullName,
      inDiscard:f.opponent.discard.cards.includes(card)
    })),
    receipts,
    pending:f.store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
}
function run(){
  const rows=[];
  for(const seat of [0,1]){
    for(const offered of [0,1,2,3])rows.push(probe(seat,offered,3));
    rows.push(probe(seat,2,2));
  }
  return {version:VERSION,pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,competitiveQualifiedGames:0};
}
if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={VERSION,probe,run};
