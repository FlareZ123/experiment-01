'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const engine = file => require(path.join(output, file));

/**
 * Test the printed Gengar & Mimikyu-GX attack without invoking a Rule-Box
 * Ability. The board is deliberately conditioned; it is not a dealt 60.
 *
 * @param {{opposing:'iron'|'klefki'|'plain', energy:boolean}} options
 */
function nativeHorrorHouse(options) {
  const cards = initializeCards();
  let uid=4000;
  /** @param {string} printing */
  const card = printing => {
    const found=cards.getCardByName(printing);
    assert.ok(found,'Missing pinned card '+printing);
    found.id=uid++;
    return found;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {AttackAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange() {}});
  const state=store.state;
  state.activePlayer=0;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const me=new Player(),opponent=new Player();
  me.id=101;opponent.id=202;
  me.name='New Moon native TAG TEAM attacker';
  opponent.name='Aichi lock opponent';
  state.players=[me,opponent];
  const attacker=card('Gengar & Mimikyu-GX TEU');
  me.active.cards.push(attacker);
  const defender=card(options.opposing==='iron'
    ? 'Iron Thorns ex TWM'
    : options.opposing==='klefki' ? 'Klefki SVI' : 'Pidgey MEW');
  opponent.active.cards.push(defender);
  if(options.energy) {
    const energy=card('Psychic Energy MEE');
    me.active.cards.push(energy);
    me.active.energies.cards.push(energy);
  }
  for(const player of state.players) {
    for(let i=0;i<6;i++) {
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
    for(let i=0;i<10;i++) player.deck.cards.push(card('Psychic Energy MEE'));
  }
  for(let i=0;i<3;i++)opponent.hand.cards.push(card('Psychic Energy MEE'));
  const before={attacker:attacker.fullName,defender:defender.fullName,
    printedGX:attacker.attacks[1]?.name,energy:me.active.energies.cards.length,
    candidateUsedGX:me.usedGX,opponentHand:opponent.hand.cards.length};
  assert.equal(before.printedGX,'Horror House-GX');

  if(!options.energy) {
    assert.throws(()=>store.dispatch(new AttackAction(me.id,'Horror House-GX')),
      'Without the printed Psychic attack cost, Horror House-GX must be rejected');
    return {...options,before,rejectedWithoutEnergy:true,
      scope:'Conditioned printed-card native attack Store action; no physical opening'};
  }
  store.dispatch(new AttackAction(me.id,'Horror House-GX'));
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const promptTypes=[];
  for(let step=0;step<16;step++) {
    const p=pending();
    if(!p)break;
    promptTypes.push(p.constructor.name);
    assert.equal(p.constructor.name,'WaitPrompt',
      'Unexpected prompt after one-Psychic native Horror House-GX');
    store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.equal(pending(),undefined,'Native attack left a pending Store prompt');
  assert.equal(me.usedGX,true,'Native printed GX attack must consume allowance');
  assert.equal(opponent.hand.cards.length,3,
    'One Psychic cannot activate the bonus draw-to-seven Horror House clause');
  assert.equal(opponent.active.damage,0,
    'Printed Horror House is a non-damaging attack');

  return {...options,before,after:{usedGX:me.usedGX,
    opponentHand:opponent.hand.cards.length,damage:opponent.active.damage,
    activePlayer:state.activePlayer,phase:state.phase,promptTypes},
    scope:'Staged real AttackAction against visible Active lock; next-turn inability to play hand cards, source-deal, timing, opponent choices, and win conversion remain untested'};
}

function run() {
  const rows=[
    nativeHorrorHouse({opposing:'plain',energy:true}),
    nativeHorrorHouse({opposing:'iron',energy:true}),
    nativeHorrorHouse({opposing:'klefki',energy:true}),
    nativeHorrorHouse({opposing:'iron',energy:false})
  ];
  assert.equal(rows.filter(row=>row.after?.usedGX).length,3);
  assert.equal(rows[3].rejectedWithoutEnergy,true);
  return {schema:'new-moon-native-gengar-anti-active-ability-lock-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    qualification:'Staged actual printed attack action, not a source-dealt 60-card game',
    rows};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={nativeHorrorHouse,run};
