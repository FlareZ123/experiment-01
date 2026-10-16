'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} source */
const load=source=>require(path.join(output,source));

/** @returns {object} Actual pinned Store, two-player board and selected Koffing. */
function stagedRoxie() {
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const own=new Player(),opp=new Player();
  own.id=101;own.name='Rank31 Roxie';
  opp.id=202;opp.name='Target';
  state.players=[own,opp];
  state.activePlayer=0;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;

  /** @param {string} id */
  const card=id=>{
    const result=manager.getCardByName(id);
    assert.ok(result,'Pinned printing missing '+id);
    return result;
  };
  own.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opp.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const bench=new PokemonCardList();
  bench.cards.push(card('Shadow Rider Calyrex V CRE'));
  opp.bench.push(bench);
  const roxie=card('Roxie CEC'),koffing=card('Koffing CEC');
  own.hand.cards.push(roxie,koffing);
  assert.ok(koffing.powers.some(p=>p.name==='Blow-Away Bomb'));

  const basicSource=manager.getAllCards().find(c=>c.name==='Psychic Energy');
  assert.ok(basicSource?.fullName);
  for(const player of [own,opp]) {
    for(let i=0;i<6;i++) {
      const prize=new CardList();
      prize.cards.push(card(basicSource.fullName));
      player.prizes.push(prize);
    }
  }
  for(let i=0;i<6;i++)own.deck.cards.push(card(basicSource.fullName));
  return {store,state,own,opp,koffing};
}

/**
 * Run the actual Roxie->Koffing discard->Blow-Away Bomb confirmation path.
 * Compare the pinned default bot's false to a deliberate true response.
 * @param {boolean} optIn
 */
function runRoxie(optIn) {
  const f=stagedRoxie();
  const {PlayCardAction}=load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  const {ConfirmPrompt}=load('game/store/prompts/confirm-prompt');
  const {ConfirmPromptResolver}=
    load('simple-bot/prompt-resolver/confirm-prompt-resolver');
  f.store.dispatch(new PlayCardAction(f.own.id,0));
  const choose=f.state.prompts.find(p=>p instanceof ChooseCardsPrompt &&
    p.result===undefined);
  assert.ok(choose,'Roxie failed to offer discard choice');
  f.store.dispatch(new ResolvePromptAction(choose.id,[f.koffing]));
  const confirm=f.state.prompts.find(p=>p instanceof ConfirmPrompt &&
    p.result===undefined);
  assert.ok(confirm,'Koffing Blow-Away Bomb confirmation missing');

  const original=new ConfirmPromptResolver({});
  const defaultResponse=original.resolvePrompt(f.state,f.own,confirm);
  assert.equal(defaultResponse.result,false,
    'Pinned generic default unexpectedly accepted an optional effect');
  f.store.dispatch(new ResolvePromptAction(confirm.id,optIn));
  return {
    optedIn:optIn,defaultConfirmed:defaultResponse.result,
    activeDamage:f.opp.active.damage,benchDamage:f.opp.bench[0].damage,
    koffingDiscarded:f.own.discard.cards.some(c=>c.name==='Koffing'),
    roxieDrewAtLeastThree:f.own.hand.cards.length>=3
  };
}

function verify() {
  const declined=runRoxie(false),accepted=runRoxie(true);
  assert.equal(declined.activeDamage,0);
  assert.equal(declined.benchDamage,0);
  assert.equal(accepted.activeDamage,10);
  assert.equal(accepted.benchDamage,10);
  assert.ok(accepted.koffingDiscarded);
  return {
    scope:'single source-ranked Koffing/Roxie choice on staged pinned Store',
    sourceRank:31,sourcePrinting:['Koffing CEC 76','Roxie CEC 205'],
    default:declined,manualAcceptance:accepted,
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    note:'No full-game state policy or competitive win-rate inferred'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(verify(),null,2)+'\n');
module.exports={stagedRoxie,runRoxie,verify};
