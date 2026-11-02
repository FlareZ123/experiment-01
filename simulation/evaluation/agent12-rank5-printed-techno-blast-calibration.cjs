'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent12-ranked5-printed-techno-blast-outcome-calibration-v1';
const FROZEN_ARCHIVE_JSON_SHA256='7b35948d130495f97349ef3f030fcd62a8f33f990c32a8a4973e878b259ec792';
const EXPECTED_ARCHIVE_SCHEMA='agent13-integrated-rank5-v31-corrected-root-release-v1';
const EXPECTED_SOURCE_PRINTED60='a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';
const PINNED_VENDOR='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const PRINTINGS={
  'Mew VMAX':['swsh8','swsh8-114'],
  'Genesect V':['swsh8','swsh8-185'],
  'Dialga-GX':['sm5','sm5-100'],
  'Latias ex':['sv8','sv8-76'],
  'Girafarig':['sm8','sm8-94'],
  'Galarian Articuno V':['swsh6','swsh6-58'],
  'Gengar & Mimikyu-GX':['sm9','sm9-53'],
  'Tapu Lele-GX':['sm2','sm2-60']
};

/**
 * Exact English card-ID printings chosen from the supplied complete card
 * database. Their names, HP, Weakness, Resistance, attacks and Prize rules
 * are verified before comparison with the already archived original Store.
 * @param {string} cardsRoot Path to repository resources/cards/en.
 */
function readSourcePrintings(cardsRoot=path.resolve(__dirname,'../../resources/cards/en')){
  const sets=new Map(),byName=new Map();
  for(const [name,[set,id]] of Object.entries(PRINTINGS)){
    if(!sets.has(set))
      sets.set(set,JSON.parse(fs.readFileSync(path.join(cardsRoot,set+'.json'),'utf8')));
    const card=sets.get(set).find(c=>c.id===id);
    assert.ok(card&&card.name===name,'Exact printed card identity mismatch: '+name);
    byName.set(name,card);
  }
  return byName;
}

function expectedPrintedPrizes(card){
  const printed=(card.rules??[]).join(' ');
  const match=printed.match(/opponent takes (\d+) Prize cards/i);
  return match?Number(match[1]):1;
}

function computedPsychicDamage(base,defender){
  let damage=base;
  for(const weak of defender.weaknesses??[]){
    if(weak.type==='Psychic'){
      assert.ok(/^×[2-9]$/.test(weak.value));
      damage*=Number(weak.value.slice(1));
    }
  }
  for(const resistance of defender.resistances??[]){
    if(resistance.type==='Psychic'){
      assert.ok(/^-[0-9]+$/.test(resistance.value));
      damage+=Number(resistance.value);
    }
  }
  return Math.max(0,damage);
}

/**
 * Read-only paper threshold comparison. This verifies printed-baseline
 * damage and Prize consistency in the bounded eight already-settled source
 * attacks. It cannot rule out unobserved game-state effects or weak actors.
 * @param {object} archive Exact original Agent13 v3.1 native 16-arm archive.
 * @param {object} [options]
 * @param {string} [options.cardsRoot]
 */
function calibrateRank5TechnoBlast(archive,options={}){
  assert.equal(archive.schema,EXPECTED_ARCHIVE_SCHEMA);
  assert.equal(archive.enginePin,PINNED_VENDOR);
  assert.equal(archive.actualSourcePrinted60Sha256,EXPECTED_SOURCE_PRINTED60);
  assert.equal(archive.attempted,16);
  assert.equal(archive.competitiveQualifiedGames,0);
  assert.ok(Array.isArray(archive.comparisons)&&archive.comparisons.length===8);
  const cards=readSourcePrintings(options.cardsRoot);
  const mew=cards.get('Mew VMAX'),genesect=cards.get('Genesect V');
  assert.deepEqual(mew.types,['Psychic']);
  assert.equal(mew.attacks[0].name,'Cross Fusion Strike');
  assert.equal(genesect.attacks[0].name,'Techno Blast');
  const baseDamage=Number(genesect.attacks[0].damage);
  assert.equal(baseDamage,210);
  assert.match(genesect.attacks[0].text,/During your next turn, this Pokémon can't attack/);
  const events=[];
  for(const comparison of archive.comparisons){
    assert.equal(comparison.controlledSameSourceDeal,'EXACT_SOURCE_DEAL_MATCH');
    const integrated=comparison.integratedV3,seat=integrated.sourceSeat;
    assert.ok(seat===0||seat===1);
    const settlements=integrated.sourceAttackSettlement;
    assert.equal(settlements.declarations,
      integrated.originalSourceAttackDeclarations);
    assert.equal(settlements.settled,settlements.declarations);
    for(const attack of settlements.attacks){
      assert.equal(attack.attackName,'Cross Fusion Strike');
      const before=attack.publicBoardBefore,after=attack.publicBoardAfter;
      const attacker=before[seat].active,defender=before[1-seat].active;
      assert.equal(attacker.name,'Mew VMAX');
      const targetCard=cards.get(defender.name);
      assert.ok(targetCard,'Target has no exact registered printed-card mapping');
      const donorOnBench=before[seat].bench.some(p=>p.name==='Genesect V');
      const paidColorless=attacker.energyCards.includes('Double Colorless Energy');
      const donorChosen=integrated.ownerSourceGenesectCopiedSelections.filter(
        x=>x.turn===attack.turnBefore&&x.sourceIndex===1&&x.attackIndex===0
      ).length===1;
      const printedDamage=computedPsychicDamage(baseDamage,targetCard);
      const targetHP=Number(targetCard.hp);
      const expectedKO=Number(defender.damage)+printedDamage>=targetHP;
      const afterActive=after[1-seat].active;
      const prizeBefore=attack.prizesBefore[seat],
        prizeAfter=attack.prizesAfter[seat];
      const printedPrizes=expectedPrintedPrizes(targetCard);
      const expectedTaken=expectedKO?
        Math.min(prizeBefore,printedPrizes):0;
      const observedTaken=prizeBefore-prizeAfter;
      const observedKO=expectedKO?
        (afterActive===null||afterActive.name!==defender.name):
        (afterActive?.name===defender.name&&
          afterActive.damage===Number(defender.damage)+printedDamage);
      const paperBaselineConsistent=
        donorOnBench&&paidColorless&&donorChosen&&
        attack.settledPromptChain&&
        !attack.settlementCrossesClockReset&&
        observedKO&&observedTaken===expectedTaken;
      events.push({
        trial:comparison.trial.id,sourceSeat:seat,
        rootOrdinal:attack.actionOrdinal,turn:attack.turnBefore,
        attacker:attacker.name,copiedDonor:genesect.name,
        copiedAttack:genesect.attacks[0].name,
        target:defender.name,targetExactPrinting:targetCard.id,
        targetHP,damageBefore:Number(defender.damage),
        expectedPsychicDamage:printedDamage,
        expectedKO,observedKO,
        printedPrizeValue:printedPrizes,
        sourcePrizesBefore:prizeBefore,
        expectedPrizesTaken:expectedTaken,
        observedPrizesTaken:observedTaken,
        donorOnBench,paidCFSWithDCE:paidColorless,
        ownerVisibleGenesectTechnoBlastChosen:donorChosen,
        originalNativePromptChainSettled:attack.settledPromptChain,
        paperBaselineConsistent
      });
    }
  }
  return {version:VERSION,sourceOriginalRank:5,
    originalSourcePrinted60Sha256:EXPECTED_SOURCE_PRINTED60,
    enginePin:PINNED_VENDOR,
    developmentalArms:archive.attempted,
    exactWithinCandidateSourceDealPairs:archive.comparisons.length,
    sourcePrintedAttackEvents:events.length,
    baselinePaperOutcomesConsistent:events.filter(x=>
      x.paperBaselineConsistent).length,
    printedTargetKnockouts:events.filter(x=>x.expectedKO).length,
    printedTargetDamageWithoutKnockout:events.filter(x=>!x.expectedKO).length,
    printedPrizesTaken:events.reduce((n,x)=>n+x.observedPrizesTaken,0),
    allEightConsistent:events.length===8&&
      events.every(x=>x.paperBaselineConsistent),
    fullPaperEffectCorrectnessCertified:false,
    independentOpponentPolicyQualified:false,
    tournamentClockQualified:false,
    competitivelyQualifiedGames:0,
    events};
}

if(require.main===module){
  const input=process.argv[2];
  assert.ok(input,'Expected the actual original Agent13 v3.1 archive JSON path');
  const bytes=fs.readFileSync(input);
  const sha256=createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha256,FROZEN_ARCHIVE_JSON_SHA256,
    'Archived original rank5 16-arm SHA-256 identity mismatch');
  const archive=JSON.parse(bytes.toString('utf8'));
  process.stdout.write(JSON.stringify({originalArchiveSha256:sha256,
    ...calibrateRank5TechnoBlast(archive)},null,2)+'\n');
}

module.exports={VERSION,FROZEN_ARCHIVE_JSON_SHA256,PRINTINGS,readSourcePrintings,
  expectedPrintedPrizes,computedPsychicDamage,calibrateRank5TechnoBlast};
