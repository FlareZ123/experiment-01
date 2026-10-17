'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const engine = moduleName => require(path.join(output,moduleName));

/**
 * Rank-2-relevant Supporter response: Faba removes opponent Garbodor Tool,
 * potentially restoring own Vileplume Item lock within that same turn.
 * @param {{vileplume:boolean,hood:boolean,supporterSpent:boolean,ownerSeat:0|1,switchFirst?:boolean,itemKind?:'switch'|'tag-call'}} options
 */
function probe(options) {
  const cards = initializeCards();
  let nextCardId = 1;
  /** @param {string} name */
  const card = name => {
    const c = cards.getCardByName(name);
    assert.ok(c,'Missing pinned '+name);
    c.id = nextCardId++;
    return c;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} = engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = options.ownerSeat;
  state.gameSettings.format = Format.EXPANDED;
  const owner = new Player(), opponent = new Player();
  owner.id = 101; owner.name = 'Aichi rank2 Vileplume';
  opponent.id = 202; opponent.name = 'Garbodor opponent';
  state.players = options.ownerSeat === 0 ? [owner,opponent] : [opponent,owner];
  owner.active.cards.push(card('Bunnelby PRC'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));

  const flower = new PokemonCardList();
  flower.cards.push(card('Oddish UNB'));
  if (options.vileplume) {
    flower.cards.push(card('Gloom UNB'),card('Vileplume AOR'));
    if (options.hood) flower.tools.push(card('Stealthy Hood UNB'));
  }
  owner.bench.push(flower);
  const trash = new PokemonCardList();
  trash.cards.push(card('Trubbish BKP'),card('Garbodor BKP'));
  const tool = card('Float Stone BKT');
  trash.tools.push(tool);
  opponent.bench.push(trash);

  for (const player of state.players) {
    player.prizes = Array.from({length:6},()=>{
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    player.deck.cards.push(card('Psychic Energy SVE'),card('Psychic Energy SVE'));
  }
  const faba = card('Faba LOT');
  const tagCall=options.itemKind==='tag-call';
  const item = card(tagCall?'Tag Call CEC':'Switch SVI');
  if(tagCall) owner.deck.cards.push(card('Guzma & Hala CEC'));
  owner.hand.cards.push(faba,item);
  if (options.supporterSpent) owner.supporterTurn=state.turn;
  // Failed Store.dispatch may restore a cloned State. Reacquire all live
  // references after every attempted action, including denied Supporters.
  const currentState=()=>store.state;
  const currentOwner=()=>currentState().players.find(p=>p.id===owner.id);
  const currentOpponent=()=>currentState().players.find(p=>p.id===opponent.id);
  /** @param {any} targetCard @param {any} target */
  const play = (targetCard,target) => {
    let error=null;
    try {
      const i=currentOwner().hand.cards.findIndex(c=>c.id===targetCard.id);
      assert.ok(i>=0,'Card must be in hand before attempted action');
      store.dispatch(new PlayCardAction(owner.id,i,target));
    } catch(e) {error=e.message;}
    return error;
  };
  const pending = () => currentState().prompts.find(p=>p.result===undefined);
  /** @param {any} result */
  const answer = result => {
    const prompt=pending();
    assert.ok(prompt,'Expected Faba prompt');
    store.dispatch(new ResolvePromptAction(prompt.id,result));
  };
  const trainerTarget={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const switchTarget={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  const itemTarget=tagCall?trainerTarget:switchTarget;
  // Test both Item-first and Faba-first. Tag Call and Faba are actual
  // rank-2 source cards, while Switch is a simple, separate Item control.
  let earlySwitchError = null;
  let earlySwitchPrompt = null;
  let earlySwitchSelected = false;
  if (options.switchFirst) {
    earlySwitchError = play(item,itemTarget);
    earlySwitchPrompt = pending()?.constructor.name || null;
    if (!earlySwitchError) {
      const choose = pending();
      assert.equal(choose?.constructor.name,
        tagCall?'ChooseCardsPrompt':'ChoosePokemonPrompt');
      const target=tagCall?
        currentOwner().deck.cards.find(c=>c.fullName==='Guzma & Hala CEC'):
        currentOwner().bench[0];
      assert.ok(target,'Expected a live Tag Call search target or Bench target');
      assert.equal(choose.validate([target],currentState()),true);
      answer([target]);
      if(tagCall) {
        assert.ok(currentOwner().hand.cards.some(c=>c.id===target.id),
          'Tag Call must add the real source TAG TEAM Supporter to hand');
        assert.equal(pending()?.constructor.name,'ShowCardsPrompt',
          'Tag Call must reveal the searched TAG TEAM card to the opponent');
        answer(true); // ShowCardsPrompt is a Prompt<true> acknowledgment.
      }
      earlySwitchSelected = true;
    }
    assert.equal(pending(),undefined,'Early Switch must finish before Faba');
  }
  const fabaError = play(faba,trainerTarget);
  const promptNames=[];
  if (!fabaError) {
    const select=pending();
    assert.equal(select?.constructor.name,'SelectPrompt');
    promptNames.push(select.constructor.name);
    answer(0); // Only opposing Tool is a legal Faba target.
    const choose=pending();
    assert.equal(choose?.constructor.name,'ChoosePokemonPrompt');
    assert.equal(choose.validate([currentOpponent().bench[0]],currentState()),true);
    promptNames.push(choose.constructor.name);
    answer([currentOpponent().bench[0]]);
    assert.equal(pending(),undefined,'Faba target resolution must finish');
  }
  const fabaInHand=currentOwner().hand.cards.some(c=>c.id===faba.id);
  const toolInLostZone=currentOpponent().lostzone.cards.some(c=>c.id===tool.id);
  const toolStillOnGarbodor=currentOpponent().bench[0].tools.some(c=>c.id===tool.id);
  const switchError=options.switchFirst?null:play(item,itemTarget);
  return {...options,fabaError,promptNames,earlySwitchError,earlySwitchPrompt,
    earlySwitchSelected,fabaInHand,toolInLostZone,
    toolStillOnGarbodor,supporterTurn:currentOwner().supporterTurn,
    switchError,switchPrompt:pending()?.constructor.name||null,
    itemInHand:currentOwner().hand.cards.some(c=>c.id===item.id)};
}

/** @returns {object} Two-seat temporal intervention matrix. */
function run() {
  const configs=[
    {vileplume:false,hood:false,supporterSpent:false},
    {vileplume:true,hood:false,supporterSpent:false},
    {vileplume:true,hood:true,supporterSpent:false},
    {vileplume:true,hood:false,supporterSpent:true}
  ];
  const rows=configs.flatMap(p=>[0,1].flatMap(ownerSeat=>
    [false,true].flatMap(switchFirst=>
      ['switch','tag-call'].map(itemKind=>probe({...p,ownerSeat,switchFirst,itemKind})))));
  for (const row of rows) {
    const played=!row.supporterSpent;
    assert.equal(row.fabaError,played?null:'SUPPORTER_ALREADY_PLAYED',
      'Faba play-time gate incorrect: '+JSON.stringify(row));
    assert.equal(row.fabaInHand,!played,'Faba must remain in hand if denied');
    assert.equal(row.toolInLostZone,played,'Faba should move opponent Tool to Lost Zone');
    assert.equal(row.toolStillOnGarbodor,!played,'Targeted Tool must leave only on failure');
    if (row.switchFirst) {
      const initiallyLocked=row.vileplume&&row.hood;
      assert.equal(row.earlySwitchError,initiallyLocked?'CANNOT_PLAY_THIS_CARD':null,
        'Pre-Faba Item legality must reflect existing Garbotoxin suppression');
      assert.equal(row.earlySwitchSelected,!initiallyLocked,
        'Pre-Faba Switch prompt should finish only while Item access is live');
      assert.equal(row.earlySwitchPrompt,initiallyLocked?null:
        row.itemKind==='tag-call'?'ChooseCardsPrompt':'ChoosePokemonPrompt');
      assert.equal(row.itemInHand,initiallyLocked,
        'Early successful Switch is spent, denied Switch remains in hand');
      assert.equal(row.switchPrompt,null,'Reverse order must not spend a second Item');
    } else {
      const blocked=row.vileplume&&played;
      assert.equal(row.switchError,blocked?'CANNOT_PLAY_THIS_CARD':null,
        'Vileplume Item lock should re-evaluate immediately');
      assert.equal(row.itemInHand,blocked,'Blocked Switch stays in hand');
      assert.equal(row.switchPrompt,blocked?null:
        row.itemKind==='tag-call'?'ChooseCardsPrompt':'ChoosePokemonPrompt',
        'Unlocked Switch produces target prompt');
    }
  }
  return {
    study:'Faba Supporter removes Garbotoxin Tool and reactivates Item lock',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'Aichi rank2 registered Faba LOT and Tag Call CEC; Switch is an independent control; opponent Garbodor is staged',
    scope:'Injected board actual Store actions, no deck search, decision AI or game win-rate',
    rows
  };
}
if (require.main===module) console.log(JSON.stringify(run(),null,2));
module.exports={probe,run};
