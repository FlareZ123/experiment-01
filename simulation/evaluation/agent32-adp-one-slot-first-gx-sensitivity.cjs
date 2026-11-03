'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const source=require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const {evaluate:firstStarter}=
  require('./agent32-adp-first-gx-physical-window.cjs');
const {evaluate:switchStarter}=
  require('./agent32-adp-switch-first-gx-physical-window.cjs');
const {originalBasicCounts,bonusOffers}=
  require('./agent32-adp-field-mulligan-offers.cjs');

const VERSION='agent32-adp-fixed-v2-one-card-first-gx-sensitivity-v1';
const BASIC=new Set(['sm12-156','swsh12-135','sm2-60','swsh3-104']);
const SCENARIOS=Object.freeze([
  {name:'Frozen v2 source baseline',add:null,remove:null},
  {name:'Third ADP in place of VS Seeker',add:'sm12-156',remove:'xy4-109'},
  {name:'Third ADP in place of Crobat V',add:'sm12-156',remove:'swsh3-104'},
  {name:'Third ADP in place of second Field Blower',add:'sm12-156',remove:'sm2-125'},
  {name:'Fourth Regidrago V in place of VS Seeker',add:'swsh12-135',remove:'xy4-109'},
  {name:'Third Switch in place of VS Seeker',add:'sv1-194',remove:'xy4-109'},
  {name:'Fourth Guzma & Hala in place of VS Seeker',add:'sm12-193',remove:'xy4-109'},
  {name:'Fourth Quick Ball in place of VS Seeker',add:'swsh1-179',remove:'xy4-109'},
  {name:'Second Crobat V in place of VS Seeker',add:'swsh3-104',remove:'xy4-109'},
  {name:'Second Tapu Lele GX in place of VS Seeker',add:'sm2-60',remove:'xy4-109'},
  {name:'Cut one Switch for second VS Seeker',add:'xy4-109',remove:'sv1-194'},
  {name:'Cut one ADP for second VS Seeker',add:'xy4-109',remove:'sm12-156'}
]);

/** @param {{id:string,count:number,name:string}[]} rows */
function hashRows(rows) {
  return createHash('sha256').update(JSON.stringify(
    rows.map(r=>({count:r.count,id:r.id,name:r.name})))
  ).digest('hex');
}

/**
 * Produce one strict 60-card source-printing counterfactual.
 * The cloned list does NOT acquire evidentiary status as a deck candidate.
 * @param {{name:string,add:string|null,remove:string|null}} scenario
 * @returns {{cards:object[],hash:string}}
 */
function substitute(scenario){
  const cards=source.cards.map(row=>({...row}));
  if(scenario.add){
    assert.ok(scenario.add!==scenario.remove);
    const add=cards.find(row=>row.id===scenario.add);
    const remove=cards.find(row=>row.id===scenario.remove);
    assert.ok(add&&remove,'Only existing printed-card rows are screened');
    assert.ok(remove.count>0,'Donor copy missing');
    assert.ok(add.count<4,'No fifth copy allowed');
    add.count++;
    remove.count--;
  }else{
    assert.equal(scenario.remove,null);
  }
  assert.equal(cards.reduce((sum,row)=>sum+row.count,0),60);
  assert.ok(cards.every(row=>Number.isSafeInteger(row.count)&&
    row.count>=0&&row.count<=4));
  return {cards,hash:hashRows(cards)};
}

/** @returns {object} Every registered one-copy screen and baseline deltas. */
function main(){
  assert.equal(hashRows(source.cards),source.canonicalCardsSha256,
    'Original sixty must match v2 canonical hash recipe');
  const field=originalBasicCounts();
  assert.equal(field.length,29);
  const variants=SCENARIOS.map(scenario=>{
    const {cards,hash}=substitute(scenario);
    const basic=cards.reduce((sum,row)=>
      sum+(BASIC.has(row.id)?row.count:0),0);
    const direct=firstStarter(cards);
    const switchPath=switchStarter(cards);
    const sourceBonus=field.reduce((sum,row)=>
      sum+bonusOffers(basic,row.basicCopies)
        .opponentExpectedOfferCount.fraction,0)/field.length;
    const candidateBonus=field.reduce((sum,row)=>
      sum+bonusOffers(row.basicCopies,basic)
        .opponentExpectedOfferCount.fraction,0)/field.length;
    return {
      scenario:scenario.name,
      substitution:{addedCardId:scenario.add,removedCardId:scenario.remove},
      actualScenarioHash:hash,
      basicCopies:basic,
      firstGXDirectOrGHPathPct:direct.combined.percent,
      firstGXWithSwitchPathPct:switchPath.eitherADPStarterOrSwitch.percent,
      switchRescuePercentagePoints:switchPath.switchAdditional.percent,
      avgSourceBonusOffers:sourceBonus,
      avgCandidateBonusOffers:candidateBonus,
      netSourceBonusOffers:sourceBonus-candidateBonus,
      sourceDeckCount:field.length
    };
  });
  const baseline=variants[0];
  assert.equal(baseline.actualScenarioHash,
    source.canonicalCardsSha256);
  return {
    version:VERSION,
    frozenSourceCardIdentity:source.canonicalCardsSha256,
    baseline,
    variants:variants.map(v=>({
      ...v,
      deltaFirstGXAccessPercentagePoints:
        v.firstGXWithSwitchPathPct-baseline.firstGXWithSwitchPathPct,
      deltaNetSourceBonusOffers:
        v.netSourceBonusOffers-baseline.netSourceBonusOffers
    })),
    qualifiedGames:0,
    limitations:'Hypothetical one-copy 60s for marginal physical-screen analysis only; original fixed v2 is unchanged. Removed resource has real unmodeled strategic cost. Does not establish payable routes, player policy, game wins or legal Japanese event equivalence.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,BASIC,SCENARIOS,hashRows,substitute,main};
