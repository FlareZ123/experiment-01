'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu} = require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');
const {withRaichuPrizeAllocationPolicy} =
  require('./raichu-prize-allocation-resolver.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root, name));

/**
 * Actual pinned attack from a conditioned six-Energy, Sight-equipped board.
 * Baseline uses source generic target resolver; alternate uses copied options
 * with the Prize-aware resolver. Both share all other board and rule inputs.
 * @param {boolean} optimize
 * @returns {object}
 */
function compareAllocation(optimize) {
  const f = stagedRaichu([
    'Reversal Energy PAL','Reversal Energy PAL',
    'Reversal Energy PAL','Reversal Energy PAL',
    'Counter Energy CIN','Counter Energy CIN'
  ], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} =
    load('game/store/actions/resolve-prompt-action');
  const {PlayerType, SlotType} =
    load('game/store/actions/play-card-action');
  const definitions = load('simple-bot/simple-bot-definitions');
  const {BotFlipMode, BotShuffleMode} =
    load('game/bots/bot-arbiter');

  const victim = name => {
    const slot = new PokemonCardList();
    const card = f.card(name);
    slot.cards.push(card);
    f.b.bench.push(slot);
    return {slot, card};
  };
  const vmax = victim('Shadow Rider Calyrex VMAX CRE');
  const v = victim('Shadow Rider Calyrex V CRE');
  f.a.active.tools.push(f.card('Telescopic Sight VIV'));
  f.a.active.getPokemonCard().id = 1001;
  f.b.active.getPokemonCard().id = 2001;
  vmax.card.id = 2002;
  v.card.id = 2003;
  f.attached.forEach((energy,i) => {energy.id = 1101 + i;});
  for (const [player,count] of [[f.a,6],[f.b,4]]) {
    player.prizes = Array.from({length:count},() => {
      const slot = new CardList();
      slot.cards.push(f.card('Psychic Energy SVE'));
      return slot;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }

  const original = definitions.allPromptResolvers;
  const baseOptions = {
    tactics: definitions.allSimpleTactics,
    promptResolvers: original,
    scores: definitions.defaultStateScores,
    arbiter: {flipMode:BotFlipMode.RANDOM,shuffleMode:BotShuffleMode.RANDOM}
  };
  const options = optimize ?
    withRaichuPrizeAllocationPolicy(baseOptions) : baseOptions;
  assert.equal(definitions.allPromptResolvers, original);
  const type = optimize ? 'RaichuPrizeAllocationResolver' :
    'PutDamagePromptResolver';
  const cls = options.promptResolvers.find(ctor => ctor.name === type);
  assert.ok(cls, 'Missing resolver class '+type);

  const before = f.a.getPrizeLeft();
  let selectedRows = null;
  const prompts = [];
  const attack = () => {
    f.store.dispatch(new AttackAction(101,'Electro Rain'));
    for (let i=0;i<35;i++) {
      const prompt = f.state.prompts.find(row => row.result===undefined);
      if (!prompt) break;
      let choice;
      const name = prompt.constructor.name;
      if (name === 'ChooseCardsPrompt') choice = [...f.attached];
      else if (name === 'PutDamagePrompt') {
        assert.equal(prompt.damage,480);
        const action = new cls(options).resolvePrompt(f.state,f.a,prompt);
        assert.ok(action);
        choice = action.result;
        selectedRows = choice.map(row => ({
          player:row.target.player,slot:row.target.slot,
          index:row.target.index,damage:row.damage
        }));
      } else if (name === 'ChoosePrizePrompt') {
        choice=f.a.prizes.filter(row => row.cards.length)
          .slice(0,prompt.options.count);
      } else if (name === 'ChoosePokemonPrompt') {
        const chooser = f.state.players.find(row => row.id === prompt.playerId);
        assert.ok(chooser, 'Unrecognized promotion perspective');
        choice = chooser.bench.filter(row => row.getPokemonCard())
          .slice(0, prompt.options.min);
      } else if (name === 'WaitPrompt') choice=null;
      else throw new Error('Unexpected Electro Rain prompt '+name);
      assert.ok(prompt.validate(choice,f.state),
        name+' resolver returned paper-invalid damage allocation');
      prompts.push(name);
      f.store.dispatch(new ResolvePromptAction(prompt.id,choice));
    }
    assert.ok(!f.state.prompts.some(p => p.result===undefined));
  };
  withElectroRainDamageHook(attack);

  assert.ok(selectedRows);
  assert.equal(selectedRows.reduce((n,row)=>n+row.damage,0),480);
  return {
    optimize,
    damageRows:selectedRows,
    prizesTaken:before-f.a.getPrizeLeft(),
    vmaxKO:f.b.discard.cards.includes(vmax.card),
    vKO:f.b.discard.cards.includes(v.card),
    activeSurvived:!!f.b.active.getPokemonCard(),
    prompts,
    sameGlobalResolverArray:definitions.allPromptResolvers===original,
    sourceRanks:[4,17],
    scope:'one conditional six-card Electro Rain attack; not a full source game'
  };
}

function verify() {
  const stock=compareAllocation(false);
  const optimized=compareAllocation(true);
  assert.equal(stock.damageRows.length,1);
  assert.equal(stock.damageRows[0].damage,480);
  assert.ok(stock.prizesTaken < 5);
  assert.equal(optimized.prizesTaken,5);
  assert.equal(optimized.vmaxKO,true);
  assert.equal(optimized.vKO,true);
  assert.equal(optimized.activeSurvived,true);
  const {SlotType} = load('game/store/actions/play-card-action');
  assert.deepEqual(optimized.damageRows.map(row =>
    [row.slot,row.index,row.damage]),[
      [SlotType.BENCH,0,300], [SlotType.BENCH,1,180]
    ]);
  const result={
    stock,optimized,
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    caveat:'Conditioned attacker, Energy, Tool and opposing Bench; not sampled opponent play'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)verify();
module.exports={compareAllocation,verify};
