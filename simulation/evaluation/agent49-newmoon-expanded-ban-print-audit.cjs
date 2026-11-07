'use strict';

const assert=require('node:assert/strict');

const VERSION='agent49-newmoon-English-proxy-expanded-banned-effect-audit-v1';

/**
 * Source-authenticated exact English proxy card identity and paper-ban
 * screening, independent of the native simulator's card-name parser.
 *
 * This only establishes a current bundled-English mechanical *screen*.
 * A Japanese original physical printing still needs distinct dated paper
 * legality and card-text evidence. An English expanded flag is not a
 * substituted official decision about Japan's tournament format.
 *
 * @param {object} proposal A fixed original candidate with entries.
 * @param {object} snapshot A dated explicit Japanese banned-identity list.
 * @param {(id:string)=>object|null} resolveCard Exact English corpus record.
 * @returns {object} Reproducible print-identity screening report.
 */
function auditNewMoonExpandedBanPrintings(proposal,snapshot,resolveCard){
  assert.ok(Array.isArray(proposal?.entries));
  assert.ok(Array.isArray(snapshot?.banned_identities));
  assert.equal(typeof resolveCard,'function');
  const seenIds=new Set(),byName=new Map();
  let copies=0,basicEnergyCopies=0,aceSpecCopies=0;
  const rows=proposal.entries.map(row=>{
    assert.ok(typeof row?.english_proxy_card_id==='string');
    assert.ok(Number.isSafeInteger(row.count)&&row.count>=1);
    assert.ok(!seenIds.has(row.english_proxy_card_id),
      'Duplicate proxy IDs must be merged before verification');
    seenIds.add(row.english_proxy_card_id);
    const card=resolveCard(row.english_proxy_card_id);
    assert.ok(card,'Unresolved exact English proxy '+row.english_proxy_card_id);
    assert.equal(card.id,row.english_proxy_card_id);
    const expectedName=row.english_database_name==='Basic Psychic Energy'?
      'Psychic Energy':row.english_database_name;
    assert.equal(card.name,expectedName);
    assert.equal(card.supertype,row.type);
    const types=card.subtypes??[];
    const basicEnergy=card.supertype==='Energy'&&types.includes('Basic');
    const abilities=(card.abilities??[]).map(x=>x.name);
    const attacks=(card.attacks??[]).map(x=>x.name);
    const bannedMatches=[];
    for(const ban of snapshot.banned_identities){
      if(ban.english_name!==card.name &&
        // Authentic source display may omit the special Flare Gear suffix.
        !(ban.english_name===row.name_en&&card.name===row.name_en+
          ' Team Flare Gear'))continue;
      const sel=ban.selector;
      const matches=sel.type==='trainer_name' &&
        card.supertype==='Trainer'||
        sel.type==='pokemon_name'&&card.supertype==='Pokémon'||
        sel.type==='ability'&&abilities.includes(sel.value)||
        sel.type==='attack'&&attacks.includes(sel.value);
      if(matches)bannedMatches.push({
        banName:ban.english_name,selector:sel.type,
        matchedValue:sel.value??null
      });
    }
    copies+=row.count;
    if(basicEnergy)basicEnergyCopies+=row.count;
    else byName.set(card.name,(byName.get(card.name)??0)+row.count);
    if(types.includes('ACE SPEC'))aceSpecCopies+=row.count;
    return {
      sourceName:row.name_en,sourcePrinting:row.english_proxy_card_id,
      sourceCopyCount:row.count,englishCorpusName:card.name,
      expandedFlag:card.legalities?.expanded??null,
      supertype:card.supertype,subtypes:types,
      abilityNames:abilities,attackNames:attacks,bannedMatches
    };
  });
  assert.equal(copies,60,'Fixed exact proposal is required to be 60');
  const overFour=[...byName].filter(([,count])=>count>4)
    .map(([name,count])=>({name,count}));
  const banned=rows.filter(r=>r.bannedMatches.length>0);
  const expandedNotLegal=rows.filter(r=>r.expandedFlag!=='Legal')
    .map(r=>r.sourcePrinting);
  const radiantCount=rows.filter(r=>r.subtypes.includes('Radiant'))
    .reduce((sum,r)=>sum+r.sourceCopyCount,0);
  const prismViolation=rows.filter(r=>r.subtypes.includes('Prism Star')&&
    r.sourceCopyCount>1).map(r=>r.sourcePrinting);
  return {
    version:VERSION,fixed60Copies:copies,distinctProxyCardIds:seenIds.size,
    snapshotBanIdentities:snapshot.banned_identities.length,
    bannedPrintingsFound:banned,expandedFlagExceptions:expandedNotLegal,
    nonBasicNameCountViolations:overFour,basicEnergyCopies,
    aceSpecCopies,radiantCount,prismViolation,
    proxyPassesListedSourceChecks:banned.length===0&&
      expandedNotLegal.length===0&&overFour.length===0&&
      aceSpecCopies<=1&&radiantCount<=1&&prismViolation.length===0,
    sourcePrintAndMechanicIdsPreserved:true,
    japaneseOriginalPrintLegalityCertified:false,
    nativePlayabilityCertified:false,paperCompetitiveGameQualified:false,
    rows
  };
}

module.exports={VERSION,auditNewMoonExpandedBanPrintings};
