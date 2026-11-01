'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {printIndex}=require('./agent3-rank26-printed-280hp-starter-screen.cjs');
const {joint}=require('./agent3-rank26-coupled-lone-basic-root.cjs');

/**
 * Strict printed-Ability signature classification. Do not infer additional
 * hidden Ability rules from a Pokémon's name or its archetype.
 *
 * @param {object} card Exact English mechanical printing.
 * @returns {string[]}
 */
function directAbilityBarriers(card){
  if(!card.subtypes?.includes('Basic'))return [];
  const text=(card.abilities??[]).map(a=>a.text).join('\n')
    .replace(/\u00a0/g,' ');
  const barriers=[];
  if(/prevent all damage done to this pok[eé]mon by attacks from your opponent's pok[eé]mon ex and pok[eé]mon v/i.test(text))
    barriers.push('EX_ATTACK_DAMAGE_PREVENTION');
  if(/basic pok[eé]mon in play[\s\S]*have no abilities/i.test(text))
    barriers.push('FIRST_TURN_BASIC_ABILITY_LOCK');
  if(/pok[eé]mon with a rule box in play[\s\S]*have no abilities/i.test(text))
    barriers.push('FIRST_TURN_RULEBOX_ABILITY_LOCK');
  return barriers;
}

/**
 * Search the authenticated original Aichi 29 printed 60s for the three
 * precisely defined target-specific ability mechanisms. A forced-lone
 * Pokémon is uniformly distributed over printed Basic copies conditional
 * on the one-Basic event, so multiply the narrow original-source setup
 * intersection by each defending subset's Basic fraction.
 *
 * @returns {object}
 */
function audit(){
  const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const get=printIndex();
  const rows=[];
  for(const deck of source.decks){
    const annotated=deck.cards.filter(c=>c.category==='Pokémon')
      .map(c=>({...c,card:get(c)}))
      .filter(c=>c.card.subtypes?.includes('Basic'));
    const basics=annotated.reduce((sum,c)=>sum+c.count,0);
    const barriers=annotated.flatMap(entry=>
      directAbilityBarriers(entry.card).map(kind=>({
        kind,name:entry.name,printing:entry.printing,
        ability:entry.card.abilities?.find(a=>a.name==='Safeguard'||
          a.name==='Mischievous Lock'||a.name==='Initialization')?.name??null,
        count:entry.count,soleBasicShare:entry.count/basics,
        jointDirectRootAndSolePrintedBarrier:
          joint(basics).conditionalJointSetupAndSourceRoot*entry.count/basics
      })));
    if(barriers.length)rows.push({rank:deck.rank,
      archetype:deck.archetype,basicCount:basics,barriers});
  }
  const match=source.decks.find(d=>d.rank===26);
  const cologne=match.cards.filter(c=>c.name==='Canceling Cologne');
  const ticket=match.cards.filter(c=>c.name==='Redeemable Ticket');
  if(cologne.length!==1||cologne[0].count!==1||
    ticket.length!==1||ticket[0].count!==1)
    throw Error('Original rank26 print inventory changed');
  return {
    schema:'rank26-source29-printed-basic-ability-barrier-v1',
    exactOriginalSourceCount:source.decks.length,
    originalRank26CancelingCologneCount:1,
    originalRank26RedeemableTicketCount:1,
    rows,
    distinction:'Safeguard blocks damage from Meloetta ex. Klefki and Iron Thorns suppress Live Debut first-turn attack permission. Correctly used Canceling Cologne can transiently suppress these opposing Active Abilities. The source has Redeemable Ticket to rotate Prizes; a Prized Cologne is not absolute inaccessible.',
    limits:'One-Basic setup identity and a restrictive source direct-root location event, not actual turn execution or whole game. Further ability blockers and bypasses outside matched exact signatures are unclassified. No paper-qualified games.'
  };
}
module.exports={directAbilityBarriers,audit};
if(require.main===module)
  process.stdout.write(JSON.stringify(audit(),null,2)+'\n');
