'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent34-direct-prize-attack-frontier-v1';
const CARDS=path.resolve(__dirname,'../../resources/cards/en');
const SETS=path.resolve(__dirname,'../../resources/sets/en.json');
const DIRECT=/\btake (?:a|an|one|two|[0-9]+) Prize cards?\b/i;
const KO=/\bKnocked Out\b/i;
const MORE=/\btake (?:a|an|one|two|[0-9]+) more Prize cards?\b/i;

/**
 * Enumerate direct own-Prize-taking *attacks*, rather than awarded Prizes
 * from Knock Outs or attacks that merely change damage by Prize count.
 * Card database labels are source hints, never substitute for real paper
 * format legality checks or updated printed effects.
 *
 * @param {string} [cardsDirectory] Card-pool JSON file directory.
 * @param {string} [setsFile] Public set metadata JSON.
 * @returns {object} Exact English printings and semantically distinct texts.
 */
function discoverDirectPrizeAttacks(cardsDirectory=CARDS,setsFile=SETS){
  const sets=new Map(JSON.parse(fs.readFileSync(setsFile,'utf8'))
    .map(row=>[row.id,row]));
  const printings=[];
  for(const file of fs.readdirSync(cardsDirectory).filter(x=>
    x.endsWith('.json')).sort()){
    const setId=file.slice(0,-5);
    const set=sets.get(setId);
    assert.ok(set,'No public set metadata: '+setId);
    const releaseDate=set.releaseDate??null;
    if(releaseDate&&releaseDate<'2011/04/01')continue;
    const cards=JSON.parse(fs.readFileSync(path.join(cardsDirectory,file),'utf8'));
    for(const card of cards){
      if(card.supertype!=='Pokémon')continue;
      for(const attack of card.attacks??[]){
        const effect=attack.text??'';
        if(!DIRECT.test(effect)||KO.test(effect)||MORE.test(effect))
          continue;
        printings.push({
          cardId:card.id,printing:card.name,
          attack:attack.name,cost:attack.cost??[],
          effect,releaseDate,
          setId,
          // A missing per-card legality flag is unknown, never illegal.
          databaseExpanded:card.legalities?.expanded??'Unknown'
        });
      }
    }
  }
  printings.sort((a,b)=>a.cardId.localeCompare(b.cardId,'en'));
  const identities=new Map();
  for(const p of printings){
    const identity=JSON.stringify([p.printing,p.attack,p.cost,p.effect]);
    if(!identities.has(identity))
      identities.set(identity,{
        printing:p.printing,attack:p.attack,cost:p.cost,
        effect:p.effect,printings:[],firstReleaseDate:p.releaseDate});
    const row=identities.get(identity);
    row.printings.push(p.cardId);
    if(p.releaseDate&&p.releaseDate<row.firstReleaseDate)
      row.firstReleaseDate=p.releaseDate;
  }
  return {version:VERSION,
    resource:'provided English card pool, all supported set JSONs',
    sourceSets:sets.size,
    matchingPrintings:printings.length,
    uniqueEffects:identities.size,
    printings,identities:[...identities.values()],
    note:'Potential attack vocabulary only. Excludes KO-based extra Prizes, and does not attest current banned-list status, paper Japanese legality, engine support, Energy readiness, decision policy or matchup win rate.'
  };
}

/**
 * Exact same-turn hand arithmetic for printed Gholdengo Celebration.
 * Assumes the paper rule that taken Prize cards enter the player's hand.
 * After taking two, the attack shuffles *all* hand cards into the deck.
 *
 * @param {number} startingHand Exactly the hand size at attack resolution.
 * @param {number} remainingPrizes The original player's remaining Prize count.
 * @returns {object} Mechanical pre/post transition, no card-access claim.
 */
function gholdengoCelebrationHandReset(startingHand,remainingPrizes){
  assert.ok(Number.isSafeInteger(startingHand)&&startingHand>=0);
  assert.ok(Number.isSafeInteger(remainingPrizes)&&remainingPrizes>=0);
  if(startingHand!==30||remainingPrizes===0)
    return {attackConditionSatisfied:false,
      prizesTaken:0,handAfter:startingHand,gameResolved:false};
  const taken=Math.min(2,remainingPrizes);
  return {attackConditionSatisfied:true,prizesTaken:taken,
    handJustBeforeShuffle:startingHand+taken,
    handAfter:0,gameResolved:remainingPrizes===taken,
    oneTurnLaterNaturalDraw:remainingPrizes===taken?null:1,
    // For the next *consecutive* turn, no retained hand means this many
    // additional cards net must enter hand despite all plays/discards.
    otherNetHandGainForImmediateRepeat:remainingPrizes===taken?
      null:29};
}

if(require.main===module)
  process.stdout.write(JSON.stringify({
    ...discoverDirectPrizeAttacks(),
    cycle:gholdengoCelebrationHandReset(30,6)
  },null,2)+'\n');

module.exports={VERSION,discoverDirectPrizeAttacks,
  gholdengoCelebrationHandReset};
