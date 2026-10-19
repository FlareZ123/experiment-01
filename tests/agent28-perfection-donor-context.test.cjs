'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {publicPerfectionPrerequisites} = require(
  '../simulation/twinleaf/agent28-perfection-donor-context.cjs');

const tags = {gx:12,ex:13};

/** @param {string} fullName @param {number[]} types @param {string[]} attacks */
function card(fullName,types=[],attacks=[]) {
  return {fullName,attacks:attacks.map(name=>({name})),
    hasTag:tag=>types.includes(tag)};
}

/** @param {object} pokemon @param {object[]} [energy] @param {object[]} [tools] */
function slot(pokemon,energy=[],tools=[]) {
  return {getPokemonCard:()=>pokemon,energies:{cards:energy},tools};
}

test('excludes discard Mewtwo itself and retains GX donors with attack names',()=>{
  const me={id:202,active:slot(card('Mewtwo & Mew-GX UNM',[12]),
    [card('Psychic Energy MEE')]),
    bench:[slot(card('Gengar & Mimikyu-GX TEU',[12],['Horror House-GX']))],
    discard:{cards:[card('Mewtwo & Mew-GX UNM',[12]),
      card('Trevenant & Dusknoir-GX SMP',[12],['Night Watch']),
      card('Psychic Energy MEE')]},stadium:{cards:[]}};
  const opponent={id:101,active:slot(card('Mega Absol ex MEG',[13])),
    bench:[slot(card('Garbodor BKP'),[],[card('Float Stone BKT')])],
    stadium:{cards:[card('Temple of Sinnoh ASR')]}};
  Object.defineProperties(me,{
    hand:{get(){throw Error('Hidden owner hand accessed');}},
    deck:{get(){throw Error('Hidden owner deck accessed');}},
    prizes:{get(){throw Error('Prizes accessed');}}
  });
  Object.defineProperties(opponent,{
    hand:{get(){throw Error('Opponent hand accessed');}},
    deck:{get(){throw Error('Opponent deck accessed');}},
    prizes:{get(){throw Error('Opponent prizes accessed');}}
  });
  const x=publicPerfectionPrerequisites({players:[opponent,me]},1,tags);
  assert.deepEqual(x.ownVisibleCopySources.map(y=>y.printing),
    ['Gengar & Mimikyu-GX TEU','Trevenant & Dusknoir-GX SMP']);
  assert.equal(x.ownActiveEnergy.length,1);
  assert.equal(x.opponentBoard[1].tools[0],'Float Stone BKT');
  assert.deepEqual(x.publicStadiums,['Temple of Sinnoh ASR']);
  assert.equal(x.gameplayIntervention,false);
});

test('zero donors is only a resource observation, never a legal-attack inference',()=>{
  const me={active:slot(card('Mewtwo & Mew-GX UNM',[12])),
    bench:[slot(card('Unown AOR'))],discard:{cards:[]},stadium:{cards:[]}};
  const opponent={active:slot(card('Iron Thorns ex TWM',[13])),
    bench:[],stadium:{cards:[]}};
  const x=publicPerfectionPrerequisites({players:[me,opponent]},0,tags);
  assert.equal(x.ownVisibleCopySources.length,0);
  assert.equal(x.opponentBoard[0].printing,'Iron Thorns ex TWM');
  assert.equal(x.attackSelectionQualified,false);
});
