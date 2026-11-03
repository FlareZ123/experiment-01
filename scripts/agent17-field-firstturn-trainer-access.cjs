'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent17-original29-valid-basic-trainer-firstturn-access-v1';
const TYPE_NAMES=Object.freeze(['Item','Pokémon Tool','Supporter','Stadium']);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k)&&k>=0);
  if(k>n)return 0n;
  let value=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    value=value*BigInt(n-i+1)/BigInt(i);
  return value;
}

/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x,y){while(y){const r=x%y;x=y;y=r;}return x;}

/**
 * Exact marginal holding probability for a selected non-Basic card group.
 * A seven-card opening must contain a Basic. Later ordinary draws have the
 * same marginal distribution after six uniformly hidden Prize cards.
 * Physical holding is never a claim of paper legality or strategic utility.
 * @param {number} N Deck size.
 * @param {number} b Number of Basic Pokemon.
 * @param {number} x Number of target non-Basic cards.
 * @param {number} [h] Opening hand size.
 * @param {number} [later] Ordinary draws after opening.
 */
function conditionalPhysicalAccess(N,b,x,h=7,later=0){
  for(const v of [N,b,x,h,later])
    assert.ok(Number.isSafeInteger(v)&&v>=0);
  assert.ok(b>=1&&b+x<=N&&h>=1&&h<N&&
    later<=N-h-6,'Physical 6-Prize model requires valid counts');
  const legal=choose(N,h)-choose(N-b,h);
  const missing=(choose(N-x,h)-choose(N-x-b,h))*
    choose(N-h-x,later);
  const total=legal*choose(N-h,later);
  assert.ok(legal>0n&&missing>=0n&&missing<=total);
  const good=total-missing;
  const divisor=gcd(good,total);
  return {numerator:String(good/divisor),
    denominator:String(total/divisor),
    probability:Number(good)/Number(total)};
}

/**
 * Exact original physical-source access, with printed Basic stage and Trainer
 * type supplied by the existing independently tested source classifiers.
 * @param {object} source Full original Aichi manifest.
 * @param {Map<string,string>} types Historical Trainer type index.
 * @param {Map<string,boolean>} basicPrints Exact print Basic index.
 */
function fieldTrainerOpeningAccess(source,types,basicPrints){
  assert.ok(Array.isArray(source?.decks));
  assert.ok(types instanceof Map&&basicPrints instanceof Map);
  const ranks=new Set();
  const rows=source.decks.map(deck=>{
    assert.ok(Number.isSafeInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
    assert.ok(!ranks.has(deck.rank),'Duplicate authentic rank');
    ranks.add(deck.rank);
    assert.equal(deck.cards.reduce((n,c)=>{
      assert.ok(Number.isSafeInteger(c.count)&&c.count>0);
      return n+c.count;
    },0),60,'Source must be an original complete 60');
    const byType={Item:0,'Pokémon Tool':0,Supporter:0,Stadium:0};
    let b=0,t=0,carmine=0;
    for(const card of deck.cards){
      if(card.category==='Pokémon'){
        const key=JSON.stringify([card.printing.set,
          String(card.printing.number),card.name]);
        assert.ok(basicPrints.has(key),'Unknown source Pokémon print '+key);
        if(basicPrints.get(key))b+=card.count;
      }else if(card.category==='Trainer'){
        const subtype=types.get(card.name);
        assert.ok(TYPE_NAMES.includes(subtype),
          'Unknown source Trainer type '+card.name);
        byType[subtype]+=card.count;
        t+=card.count;
        if(card.name==='Carmine'){
          assert.equal(subtype,'Supporter');
          carmine+=card.count;
        }
      }else assert.equal(card.category,'Energy');
    }
    assert.equal(TYPE_NAMES.reduce((n,type)=>n+byType[type],0),t);
    const items=byType.Item;
    const nonSupporters=t-byType.Supporter;
    const itemOrSupporter=items+byType.Supporter;
    const firstTurnPotential=nonSupporters+carmine;
    const seen=(cards,extra)=>conditionalPhysicalAccess(60,b,cards,7,extra);
    return {
      rank:deck.rank,archetype:deck.archetype,basicCopies:b,
      trainerCopies:t,...byType,carmineExceptionCopies:carmine,
      firstTurnPotentialClassCopies:firstTurnPotential,
      firstSeven:{
        anyTrainer:seen(t,0),anyItem:seen(items,0),
        anyNonSupporter:seen(nonSupporters,0),
        anyFirstTurnPotentialClass:seen(firstTurnPotential,0),
        anyItemOrSupporter:seen(itemOrSupporter,0)
      },
      firstEight:{
        anyTrainer:seen(t,1),anyItem:seen(items,1),
        anyNonSupporter:seen(nonSupporters,1),
        anyItemOrSupporter:seen(itemOrSupporter,1)
      }
    };
  }).sort((a,b)=>a.rank-b.rank);
  const missing=source.missing_full_lists.map(d=>d.rank).sort((a,b)=>a-b);
  assert.equal(new Set([...ranks,...missing]).size,32);
  assert.equal(rows.length+missing.length,32);
  const names=['trainerCopies','Item','Pokémon Tool','Supporter',
    'Stadium','carmineExceptionCopies'];
  const totals=Object.fromEntries(names.map(name=>
    [name,rows.reduce((n,r)=>n+r[name],0)]));
  assert.equal(totals.trainerCopies,totals.Item+totals['Pokémon Tool']+
    totals.Supporter+totals.Stadium);
  const r11=rows.find(r=>r.rank===11);
  if(r11){
    assert.equal(r11.basicCopies,11);
    assert.equal(r11.Item,21);
    assert.equal(r11.Supporter,8);
  }
  const r5=rows.find(r=>r.rank===5);
  if(r5)assert.equal(r5.trainerCopies,42);
  return {
    version:VERSION,originalLists:rows.length,missingOriginalRanks:missing,
    copiesByType:totals,rows,
    evidenceBoundary:{
      sample:'Uniform seven-card source opening conditioned on a printed Basic; later normal draw marginalizes six hidden Prizes',
      holdingVsPlay:'Physical Trainer presence only. Paper legal plays, card-specific costs and targets, native selection and settlement, policy, locks, effects, opponent replies and win rates unverified.',
      firstTurnPotential:'Non-Supporters and Carmine exception are broad printed categories only. This is not a playable-action upper bound in a particular game state.',
      excludes:'Opponent mulligan compensation, other draws, turn order choices, hidden Prize knowledge, actual future owner hands',
      competitiveQualifiedGames:0,estimatedWinRate:null
    }
  };
}

/** @param {string} [root] */
function fromRepository(root=path.resolve(__dirname,'..')){
  const bytes=fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'));
  const source=JSON.parse(bytes.toString('utf8'));
  const {loadTrainerTypes}=
    require('./agent3-jellicent-field-exposure.cjs');
  const {sourceBasicPrintingIndex}=
    require('./agent18-original-source-supporter-opening.cjs');
  const types=loadTrainerTypes(path.join(root,'resources/cards/en'));
  const slots=source.decks.flatMap(d=>
    d.cards.filter(c=>c.category==='Pokémon'));
  const basicPrints=sourceBasicPrintingIndex(root,slots);
  const result=fieldTrainerOpeningAccess(source,types,basicPrints);
  assert.equal(result.originalLists,29);
  assert.deepEqual(result.missingOriginalRanks,[23,25,28]);
  assert.equal(result.copiesByType.trainerCopies,1035);
  return {...result,sourceManifestSha256:createHash('sha256')
    .update(bytes).digest('hex')};
}

if(require.main===module)process.stdout.write(
  JSON.stringify(fromRepository(),null,2)+'\n');
module.exports={VERSION,choose,conditionalPhysicalAccess,
  fieldTrainerOpeningAccess,fromRepository};
