'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {classifyFirstTurnText,scanFirstTurnAttacks,BW_FORWARD_SET}=
  require('../scripts/agent2-firstturn-attack-vocabulary.cjs');

test('separate first-player attacks, second-player-only, bonuses and prohibition',()=>{
  assert.equal(classifyFirstTurnText(
    'If you go first, you can use this attack on your first turn. Search your deck for a card.'),
    'first-player-attack-exception');
  assert.equal(classifyFirstTurnText(
    'You can use this attack only if you go second, and only during your first turn. Your opponent cannot play Trainers.'),
    'second-player-firstturn-only');
  assert.equal(classifyFirstTurnText(
    "If you go second and it's your first turn, instead search for up to 3 Psychic Energy cards."),
    'second-player-firstturn-modifier');
  assert.equal(classifyFirstTurnText(
    "If you go second, you can't use this attack during your first turn."),
    'second-player-firstturn-prohibition');
  assert.equal(classifyFirstTurnText('This attack does 60 damage.'),null);
});
test('BW-onward candidate set classifier rejects pre-BW prints',()=>{
  assert.equal(BW_FORWARD_SET.test('bw1.json'),true);
  assert.equal(BW_FORWARD_SET.test('sm7.json'),true);
  assert.equal(BW_FORWARD_SET.test('sv6.json'),true);
  assert.equal(BW_FORWARD_SET.test('me1.json'),true);
  assert.equal(BW_FORWARD_SET.test('hgss1.json'),false);
  assert.equal(BW_FORWARD_SET.test('base1.json'),false);
});
test('original card archive yields exact 50 printings in 29 distinct attack families',()=>{
  const data=scanFirstTurnAttacks(path.resolve(__dirname,'..'));
  assert.equal(data.matchingPrintedAttacks,50);
  assert.equal(data.distinctPrintedAttackFamilies,29);
  assert.deepEqual(data.distinctFamiliesByOrientation,{
    'first-player-attack-exception':12,
    'second-player-firstturn-modifier':6,
    'second-player-firstturn-only':10,
    'second-player-firstturn-prohibition':1
  });
  assert.ok(!data.firstTurnAttackFamilies.some(x=>
    x.orientation==='unclassified-firstturn-language'));
  assert.equal(data.competitiveGameQualified,false);
  assert.equal(data.paperLegalCertified,false);
  assert.equal(data.authenticatedOriginalAichiSixties,29);
  assert.equal(data.matchingOriginalSourcePrintedFirstTurnAttackCopies,0);
  assert.deepEqual(data.originalSourceFirstTurnPrintings,[]);
  for(const row of data.firstTurnAttackFamilies){
    assert.ok(row.printings.length>0);
    assert.ok(row.cost.length>=0);
    assert.ok(row.printings.every(x=>typeof x==='string'));
  }
});
test('same Pokemon name is not proof of identical printed first-turn attack',()=>{
  const roster=JSON.parse(require('node:fs').readFileSync(
    require('node:path').resolve(__dirname,
      '../results/aichi-2026/full-decklists.json'),'utf8'));
  const source=roster.decks.find(x=>x.rank===26);
  const exeggcute=source.cards.find(x=>x.name==='Exeggcute');
  assert.equal(exeggcute.printing.set,'PLF');
  assert.equal(exeggcute.printing.number,'4');
  const vocabulary=scanFirstTurnAttacks(
    require('node:path').resolve(__dirname,'..')).firstTurnAttackFamilies;
  const exception=vocabulary.find(x=>x.card==='Exeggcute');
  assert.ok(exception);
  assert.ok(exception.printings.every(id=>!id.startsWith('bw9-')));
});
test('specific candidate effects remain tied to their exact printed first-turn text',()=>{
  const rows=scanFirstTurnAttacks(path.resolve(__dirname,'..'))
    .firstTurnAttackFamilies;
  const by=(card,attack)=>rows.find(x=>x.card===card&&x.attack===attack);
  assert.equal(by('Whismur','Bawl').orientation,
    'second-player-firstturn-only');
  assert.deepEqual(by('Whismur','Bawl').cost,['Colorless']);
  assert.ok(by('Whismur','Bawl').text.includes("can't play any Trainer cards"));
  assert.equal(by('Hisuian Voltorb','Cheerful Charge').cost.length,0);
  assert.ok(by('Hisuian Voltorb','Cheerful Charge').text.includes('Benched Pokémon'));
  assert.equal(by('Sableye','Quick Hunt').orientation,
    'first-player-attack-exception');
  assert.equal(by('Bombirdier ex','Fast Carrier').orientation,
    'first-player-attack-exception');
  assert.ok(by('Terapagos ex','Unified Beatdown').orientation.includes('prohibition'));
  assert.equal(by('Cresselia','Crescent Glow').orientation,
    'second-player-firstturn-modifier');
  assert.ok(by('Cresselia','Crescent Glow').text.includes('up to 3 Psychic Energy'));
  assert.equal(by('Scream Tail ex','Scream').orientation,
    'second-player-firstturn-only');
});
