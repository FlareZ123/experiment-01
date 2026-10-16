'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * One Electro Rain AttackAction choosing the same Benched V twice, with two
 * source-valid Unit Energy LPM attached and Telescopic Sight on the attacker.
 * The valid prompt permits two rows for the same target.
 * @param {boolean} corrected
 */
function duplicatedTargetElectroRain(corrected) {
  const f = stagedRaichu(['Unit Energy LPM UPR','Unit Energy LPM UPR'], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const bench = new PokemonCardList();
  bench.cards.push(f.card('Shadow Rider Calyrex V CRE'));
  f.b.bench.push(bench);
  f.a.active.tools.push(f.card('Telescopic Sight VIV'));
  f.a.active.getPokemonCard().id = 1001;
  f.attached.forEach((card,index) => { card.id=1002+index; });
  for (const player of [f.a,f.b]) {
    for(let i=0;i<6;i++) {
      const prize = new CardList();
      prize.cards.push(f.card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }
  const events=[];
  const dispatch = () => {
    f.store.dispatch(new AttackAction(101,'Electro Rain'));
    for(let i=0;i<15;i++) {
      const p=f.state.prompts.find(prompt=>prompt.result===undefined);
      if(!p)break;
      let choice;
      if(p.constructor.name==='ChooseCardsPrompt') {
        choice=[...f.attached];
      }else if(p.constructor.name==='PutDamagePrompt') {
        assert.equal(p.damage,60);
        choice=[
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},damage:30},
          {target:{player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0},damage:30}
        ];
      }else if(p.constructor.name==='WaitPrompt') {
        choice=null;
      }else throw Error('Unexpected prompt '+p.constructor.name);
      assert.ok(p.validate(choice,f.state),
        'Pinned PutDamagePrompt should accept duplicate rows for the same target');
      events.push(p.constructor.name);
      f.store.dispatch(new ResolvePromptAction(p.id,choice));
    }
    assert.ok(!f.state.prompts.some(prompt=>prompt.result===undefined));
    return {corrected,damage:bench.damage,events,discarded:f.a.discard.cards.filter(
      card=>card.fullName==='Unit Energy LPM UPR').length};
  };
  return corrected ? withElectroRainDamageHook(dispatch) : dispatch();
}

function verify() {
  const unpatched=duplicatedTargetElectroRain(false);
  const patched=duplicatedTargetElectroRain(true);
  assert.equal(unpatched.damage,60);
  assert.equal(patched.damage,90,
    'Two 30-point Electro Rain selections to the same Benched V must receive one +30 Sight bonus');
  assert.equal(unpatched.discarded,2);
  assert.equal(patched.discarded,2);
  return {
    kind:'source-printed repeated target and once-per-target damage modifier',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    unpatched,patched,
    caveat:'Staged established attacker and direct damage-choice rows; no full game'
  };
}
if(require.main===module)console.log(JSON.stringify(verify(),null,2));
module.exports={duplicatedTargetElectroRain,verify};
