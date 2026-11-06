'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withOwnerHnsQuickBallCost}=
  require('../twinleaf/agent25-owner-quickball-hns-cost.cjs');
const {withOwnerHnsQuickBallCost:withOwnerHnsQuickBallCostV2}=
  require('../twinleaf/agent25-owner-quickball-hns-cost-v2.cjs');
const {withCorrectedHnsDiscardAbilityCount,VERSION:HOOK_VERSION,pin}=
  require('../twinleaf/agent25-hns-discard-ability-lock-paper-hook.cjs');

const root=path.resolve(__dirname,'../..');
const registration=require('../../results/als/registrations/agent25-dhelmise-v2-native-three-lock-smoke-20261101.json');
const candidate=require('../../results/als/agent25-dhelmise-mixed-lock-answers-v2.json');
const sets=require('../../resources/sets/en.json');
const aliasAmendment=require('../../results/als/registrations/agent25-dhelmise-v2-native-print-alias-amendment-20261101.json');
const {normalizeNumber}=require('../twinleaf/card-coverage.cjs');
const aliasById=new Map(aliasAmendment.aliases.map(a=>[a.id,a]));

/** @returns {object[]} Exact English printed-card manifest accepted by the common resolver. */
function toPrintedManifest(){
  const byId=new Map(sets.map(set=>[set.id,set.ptcgoCode]));
  const rows=[];
  for(const row of candidate.cards){
    const dash=row.id.lastIndexOf('-');
    assert.ok(dash>0,'canonical card ID lacks set separator');
    const setId=row.id.slice(0,dash);
    const number=row.id.slice(dash+1);
    const set=byId.get(setId);
    assert.ok(set&&number,'source set code missing '+row.id);
    const pool=JSON.parse(fs.readFileSync(path.join(root,
      'resources/cards/en',setId+'.json'),'utf8'));
    const exact=pool.find(card=>card.id===row.id);
    assert.equal(exact?.name,row.name,'printed card name and ID mismatch');
    const alias=aliasById.get(row.id);
    if(alias){
      assert.equal(alias.originalName,row.name);
      assert.equal(alias.sourceSet,set==='PR-XY'?'XYP':set);
      assert.equal(normalizeNumber(alias.sourceNumber),
        normalizeNumber(number.startsWith('XY')?number.slice(2):number));
    }
    rows.push({category:row.category,count:row.count,
      name:alias?.nativeLookupName??row.name,
      printing:{set:alias?.sourceSet??set,
        number:alias?.sourceNumber??number,language:'en'}});
  }
  assert.equal(rows.reduce((n,row)=>n+row.count,0),60);
  return rows;
}

/** @param {unknown} error @returns {string} */
const describeError=error=>String(error?.stack||error?.message||error);

/** Run exactly six pre-registered native bounded trials when the 60 resolves. */
function run({donorCompressor=false,ballDonorCost=false,ballDonorCostV2=false}={}){
  assert.equal(typeof donorCompressor,'boolean');
  assert.equal(typeof ballDonorCost,'boolean');
  assert.equal(typeof ballDonorCostV2,'boolean');
  assert.ok(!(ballDonorCost&&ballDonorCostV2));
  assert.ok(!(ballDonorCost||ballDonorCostV2)||donorCompressor,
    'Quick Ball donor payment extension requires same owner Compressor base');
  assert.equal(pin,registration.enginePin);
  const rows=toPrintedManifest();
  const aliasAudit=candidate.cards.flatMap((source,i)=>{
    const alias=aliasById.get(source.id);
    return alias?[{canonicalId:source.id,canonicalPrintedName:source.name,
      nativeLookupName:rows[i].name,nativeSet:rows[i].printing.set,
      nativeNumber:rows[i].printing.number,physicalCopies:source.count}]:[];
  });
  assert.equal(aliasAudit.length,3);
  const registeredSource=require('../../results/aichi-2026/full-decklists.json');
  const plan=planAichi({
    label:'agent25-post-Aichi-dhelmise-v2-original-60',
    player:'Agent25 exploratory challenger',
    archetype:'Dhelmise Hide n Sneak',
    cards:rows
  },registration.options);
  const printing={
    status:plan.candidate.cards?'native-exact-or-explicitly-permitted':'unresolved',
    nativeResolved:plan.candidate.cards!==null,
    nativeOrderedSha256:plan.candidateNativeOrderedSha256,
    candidateDigest:plan.candidateDigest,
    unresolved:plan.candidate.unresolved,
    substitutions:plan.candidate.substitutions,
    totalPhysicalCards:rows.reduce((n,row)=>n+row.count,0),
    researchSideAliases:aliasAudit,identityVerification:null
  };
  if(plan.candidate.cards){
    const {initializeCards}=require('../twinleaf/headless.cjs');
    const manager=initializeCards();
    let position=0;
    for(const row of rows){
      for(let copy=0;copy<row.count;copy++){
        const nativeFullName=plan.candidate.cards[position++];
        const native=manager.getCardByName(nativeFullName);
        assert.ok(native,'Native physical printing missing '+nativeFullName);
        assert.equal(native.name,row.name,'Native name mismatches source alias');
        assert.equal(String(native.set).toUpperCase(),row.printing.set.toUpperCase(),
          'Native set mismatches source');
        assert.equal(normalizeNumber(native.setNumber),
          normalizeNumber(row.printing.number),'Native number mismatches source');
      }
    }
    assert.equal(position,60);
    printing.identityVerification='all-60-native-set-number-and-name-exact';
  }
  const attempts=[];
  for(const rank of registration.sourceRanks){
    const original=registeredSource.decks.find(deck=>deck.rank===rank);
    assert.ok(original,'not a recovered published original 60 for rank '+rank);
    assert.equal(original.cards.reduce((n,x)=>n+x.count,0),60);
    const opponent=plan.opponents.find(x=>x.rank===rank);
    for(const seat of registration.candidateSeatIndices){
      const key=rank+':seat'+seat;
      if(!plan.candidate.cards||opponent?.status!=='ready'){
        attempts.push({key,rank,candidateSeat:seat,
          status:'printing-unresolved-no-game',
          sourceStatus:opponent?.status||'missing',engineTerminal:false,
          competitiveQualified:false});
        continue;
      }
      const request={
        deckA:seat===0?plan.candidate.cards:opponent.cards,
        deckB:seat===1?plan.candidate.cards:opponent.cards,
        seed:registration.seedsByRank[rank],
        maxActions:registration.maximumRootActions,
        label:'agent25-preregistered-'+(ballDonorCostV2?'compressor-ball-staged-v2':(ballDonorCost?'compressor-ball-donor':(donorCompressor?'compressor-policy':'baseline')))+'-'+key,
        ...registration.options,
        ...(donorCompressor?{dhelmiseDonorCompressorSeat:seat}:{}),
        captureStartingBoard:true,captureFinalPublicBoard:true
      };
      try{
        const execution=()=>withCorrectedHnsDiscardAbilityCount(()=>
          runMatch(request));
        const selected=ballDonorCostV2?
          withOwnerHnsQuickBallCostV2(seat,execution):
          (ballDonorCost?withOwnerHnsQuickBallCost(seat,execution):
          {result:execution(),audit:null});
        const wrapped=selected.result;
        const game=wrapped.result;
        attempts.push({key,rank,candidateSeat:seat,status:game.finished?
          'untimed-engine-terminal':'root-action-cap',
          nativeRootActions:game.actions,turns:game.turns,
          actualFirstTurnSlot:game.firstTurnSlot??null,
          candidateFirstTurn:game.firstTurnSlot===seat,
          nativeWinner:game.winner,
          prizesRemaining:game.prizesRemaining,
          startingBoard:game.initialBoardAtFirstTurn??null,
          hnsHookAudit:wrapped.audit,
          ownerBallDonorAudit:selected.audit,
          physicalZoneIntegrity:game.physicalZoneIntegrity??null,
          attackDeclarationsBySeat:(game.attackDeclarationTrace||[]).reduce(
            (acc,row)=>{const s=row.playerSlot??row.seat;
              if(s===0||s===1)acc[s]++;return acc;},[0,0]),
          finalPublicBoard:game.finalPublicBoard??null,
          competitiveQualified:false});
      }catch(error){
        attempts.push({key,rank,candidateSeat:seat,
          status:'native-exception',error:describeError(error),
          errorCode:error?.code??null,
          physicalConservationWitness:error?.physicalConservationWitness??null,
          competitiveQualified:false});
      }
    }
  }
  assert.equal(attempts.length,6);
  return {version:registration.version,enginePin:pin,
    candidate:registration.candidate,
    originalSourceRanks:registration.sourceRanks,
    seedsByRank:registration.seedsByRank,
    policy:ballDonorCostV2?
      'DhelmiseHnsOwnerCompressor-v1 + owner-only staged Quick Ball HNS preference v2 candidate seat':
      (ballDonorCost?
      'DhelmiseHnsOwnerCompressor-v1 + owner-only paid Quick Ball HNS preference candidate seat':
      (donorCompressor?'Twinleaf SimpleTacticsAi + DhelmiseHnsOwnerCompressor-v1 candidate seat':
        'Twinleaf SimpleTacticsAi plus explicitly registered default-off guards')), 
    donorCompressorPolicy:donorCompressor,ballDonorCostPolicy:ballDonorCost,
    ballDonorCostV2Policy:ballDonorCostV2,
    paperHnsHookVersion:HOOK_VERSION,
    printing,attempts,competitivelyQualifiedGames:0,
    noClockModel:true,postAichiNewCardCandidate:true};
}
module.exports={run,toPrintedManifest};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
