'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {verifyManifest}=require('../simulation/twinleaf/new-moon-lockbreak-validate.cjs');
const {audit,loadBasicIndex}=require('./aichi_opening_audit.cjs');
const {loneBasicProbability,soloAfterBonus}=
  require('./aichi_solo_start.cjs');
const {openingWindow}=require('./aichi-meloetta-stone-pad-bridge.cjs');

/**
 * Verify printed Pokémon stages and HP from the bundled card database.
 * English mechanical proxy IDs are not a Japanese physical-legality claim.
 * @param {string} root
 * @param {{english_proxy_card_id:string}[]} entries
 * @returns {Map<string,object>}
 */
function pokemonByPrint(root,entries) {
  const out=new Map();
  for(const entry of entries) {
    const id=entry.english_proxy_card_id;
    const set=id.split('-')[0];
    const printed=JSON.parse(fs.readFileSync(
      path.join(root,'resources/cards/en',set+'.json'),'utf8'))
      .find(card=>card.id===id);
    if(!printed||printed.supertype!=='Pokémon'||
       !Array.isArray(printed.subtypes)||!Number.isFinite(Number(printed.hp))) {
      throw new Error('Missing source-proxy Pokémon printing '+id);
    }
    out.set(id,printed);
  }
  return out;
}

/**
 * Compare two fixed lists' setup-only lone-Active exposure to rank26.
 * @param {string} root
 * @returns {object}
 */
function assess(root) {
  const validated=verifyManifest();
  const candidate=JSON.parse(fs.readFileSync(
    path.join(root,'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));
  if(candidate.canonical_id_count_sha256!==validated.hash) {
    throw new Error('Frozen candidate identity changed');
  }
  const entries=candidate.entries.filter(row=>row.type==='Pokémon');
  const indexed=pokemonByPrint(root,entries);
  const basics=entries.filter(row=>
    indexed.get(row.english_proxy_card_id).subtypes.includes('Basic'));
  const basicCount=basics.reduce((n,row)=>n+row.count,0);
  const pokemonCount=entries.reduce((n,row)=>n+row.count,0);
  const above280=basics.filter(row=>
    Number(indexed.get(row.english_proxy_card_id).hp)>280)
    .map(row=>row.name_en);
  const klefki=basics.filter(row=>row.name_en==='Klefki')
    .reduce((n,row)=>n+row.count,0);
  const klefkiRow=basics.find(row=>row.name_en==='Klefki');
  const printedKlefki=indexed.get(klefkiRow?.english_proxy_card_id);
  if(basicCount!==17||pokemonCount!==19||klefki!==1||
     !printedKlefki?.abilities?.some(a=>a.name==='Mischievous Lock')||
     above280.length!==0) {
    throw new Error('Challenger Basic, printed HP or Klefki assumptions changed');
  }
  const data=JSON.parse(fs.readFileSync(
    path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const rows=audit(data.decks,loadBasicIndex(path.join(root,'resources/cards/en')));
  const reference=rows.find(row=>row.rank===1);
  const meloetta=rows.find(row=>row.rank===26);
  if(reference?.basicCount!==14||meloetta?.basicCount!==12) {
    throw new Error('Reference or source opponent inventory changed');
  }
  const championSolo=soloAfterBonus(reference.basicCount,meloetta.basicCount);
  const challengerSolo=soloAfterBonus(basicCount,meloetta.basicCount);
  const klefkiSolo=challengerSolo*klefki/basicCount;
  return {
    kind:'Meloetta first-turn setup-only defensive exposure',
    challengerHash:validated.hash,
    japanesePaperLegalityVerified:false,
    referenceRank:1,referenceBasics:reference.basicCount,
    challengerBasics:basicCount,challengerPokemon:pokemonCount,
    basicPrintingsAbove280HP:above280,
    opponentRank:26,opponentBasics:meloetta.basicCount,
    beforeBonus:{
      referenceSolo:loneBasicProbability(reference.basicCount),
      challengerSolo:loneBasicProbability(basicCount)
    },
    afterAllUsableOpponentMulliganBonuses:{
      referenceSolo:championSolo,
      challengerSolo,
      structuralSoloReduction:championSolo-challengerSolo,
      challengerSoloKlefki:klefkiSolo,
      challengerSoloOtherBasic:challengerSolo-klefkiSolo
    },
    meloettaCologneResourceOpportunity:openingWindow(
      meloetta.basicCount,basicCount),
    scope:'Exact setup identities, printed HP and card access; neither first-turn donk execution nor game win probability.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(assess(path.resolve(__dirname,'..')),null,2)+'\n');

module.exports={pokemonByPrint,assess};
