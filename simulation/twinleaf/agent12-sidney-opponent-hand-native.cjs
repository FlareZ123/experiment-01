'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stagedPainfulSpoons}=
  require('./agent4-rank31-alakazam-movesource-native.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(output,p));
const PRINTING='Sidney FST 241';

/**
 * Native physical opponent-hand selection against an authenticated rank24
 * Iron Thorns source Supporter printing. Opponent represents rank5 Mew.
 * @param {0|1} seat Source owner seat.
 * @param {'legal-two'|'illegal-pokemon-and-basic-energy'|'mixed-illegal'|'no-target'} mode
 * @returns {object} Real prompt validator, dispatch and owner zone receipts.
 */
function probeSidney(seat,mode){
  assert.ok([0,1].includes(seat));
  assert.ok(['legal-two','illegal-pokemon-and-basic-energy',
    'mixed-illegal','no-target'].includes(mode));
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const f=stagedPainfulSpoons(seat);
  f.source.active.cards.splice(0,1,f.card('Iron Thorns ex TWM'));
  f.opponent.active.cards.splice(0,1,f.card('Mew V FST'));
  const sidney=f.card(PRINTING);
  f.source.hand.cards.push(sidney);
  const opponentHand=[
    f.card('Mew V FST'),
    f.card('Psychic Energy SVE'),
    f.card('Double Colorless Energy SUM'),
    f.card('Float Stone BKT'),
    f.card('Sky Field ROS'),
    f.card('Guzma BUS')
  ];
  f.opponent.hand.cards.push(...opponentHand);
  const before={opponentHand:f.opponent.hand.cards.length,
    opponentDiscard:f.opponent.discard.cards.length};
  f.store.dispatch(new PlayCardAction(f.source.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=f.store.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt'&&
    p.message==='CHOOSE_CARD_TO_DISCARD');
  assert.ok(prompt,'Expected actual Sidney opponent-hand ChooseCardsPrompt');
  const selections={
    'legal-two':[opponentHand[2],opponentHand[3]],
    'illegal-pokemon-and-basic-energy':[opponentHand[0],opponentHand[1]],
    'mixed-illegal':[opponentHand[5],opponentHand[4]],
    'no-target':[]
  };
  const reply=selections[mode];
  const validatorAccepted=prompt.validate(reply,f.store.state);
  const nativeBoundaries={min:prompt.options.min,max:prompt.options.max,
    blocked:[...prompt.options.blocked],offerSize:prompt.cards.cards.length,
    printedSource:prompt.sourceCard?.fullName??null,
    sourceOwnerId:prompt.playerId};
  let error=null;
  try{f.store.dispatch(new ResolvePromptAction(prompt.id,reply));}
  catch(e){error=String(e?.message??e);}
  return {
    sourceRank:24,seat,mode,printing:PRINTING,
    originalFieldRanksWithPrinting:[6,24,29],
    nativeBoundaries,validatorAccepted,error,before,
    after:{opponentHand:f.opponent.hand.cards.length,
      opponentDiscard:f.opponent.discard.cards.length},
    physicalOpposingHand:opponentHand.map((c,i)=>({
      printing:c.fullName,index:i,selected:reply.includes(c),
      inHand:f.opponent.hand.cards.includes(c),
      inDiscard:f.opponent.discard.cards.includes(c)})),
    pending:f.store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    competitiveQualifiedGames:0,constructedNative:true
  };
}
if(require.main===module){
  for(const seat of [0,1])
    for(const mode of ['legal-two','illegal-pokemon-and-basic-energy',
      'mixed-illegal','no-target'])
      console.log('AGENT12_SIDNEY_NATIVE '+JSON.stringify(probeSidney(seat,mode)));
}
module.exports={PRINTING,probeSidney};
