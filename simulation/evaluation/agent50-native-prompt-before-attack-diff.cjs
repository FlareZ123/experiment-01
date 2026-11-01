'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const SCHEMA='agent50-native-prompt-pre-fork-selected-printings-v1';

/**
 * Read only settled original native postgame prompt receipts strictly
 * BEFORE a first diverging root. Keep unknown names explicit. This is not
 * an actor input and cannot certify the paper physical custody of unnamed
 * selections or the completeness of the original prompt observer.
 * @param {object|null} sidecar
 * @param {number} beforeOrdinal
 * @returns {object}
 */
function promptPrefix(sidecar,beforeOrdinal){
  assert.ok(Number.isSafeInteger(beforeOrdinal)&&beforeOrdinal>=0);
  if(!sidecar||!Array.isArray(sidecar.events)){
    return {available:false,events:[],count:0,unknownNames:0,
      allPhysicalSelectionsNamed:false};
  }
  const events=sidecar.events.filter(x=>x.ordinal<beforeOrdinal)
    .map(x=>{
      assert.ok(Number.isSafeInteger(x.ordinal));
      assert.equal(typeof x.kind,'string');
      assert.ok(x.selectedCards==null||Array.isArray(x.selectedCards));
      return {ordinal:x.ordinal,kind:x.kind,
        sourceZone:x.sourceZone??null,
        sourcePlayerSlot:x.sourcePlayerSlot??null,
        selectedPrintingNames:x.selectedCards??null,
        selectedIndices:x.selectedIndices??null,
        sourceZoneCardCountBefore:x.sourceZoneCardCountBefore??null};
    }).sort((a,b)=>a.ordinal-b.ordinal);
  for(let i=1;i<events.length;i++)
    assert.notEqual(events[i].ordinal,events[i-1].ordinal,
      'Duplicate native prompt ordinal before first policy divergence');
  const unknown=events.filter(x=>x.selectedPrintingNames===null).length;
  return {available:true,events,count:events.length,
    unknownNames:unknown,allPhysicalSelectionsNamed:unknown===0};
}

/**
 * Compare only the original postgame native prompt-selection prefix shared
 * by a baseline/treatment pair. Equal compact action labels alone do not
 * establish equal selected cards in concealed zones.
 * @param {object} packet Full native paired Store packet.
 * @returns {object} Auditable all-attempt physical name parity and vetoes.
 */
function auditNativePreForkSelections(packet){
  assert.ok(Array.isArray(packet.pairs));
  const before=packet.raw?.baseline?.rows??[];
  const after=packet.raw?.treatment?.rows??[];
  assert.equal(before.length,packet.pairs.length);
  assert.equal(after.length,packet.pairs.length);
  const a=new Map(before.map(x=>[x.trial.id,x]));
  const b=new Map(after.map(x=>[x.trial.id,x]));
  assert.equal(a.size,packet.pairs.length);
  assert.equal(b.size,packet.pairs.length);
  const cases=packet.pairs.map(pair=>{
    const left=a.get(pair.id),right=b.get(pair.id);
    assert.ok(left&&right,'Missing original native game for '+pair.id);
    const root=pair.firstRootDifference;
    const ordinal=Math.min(root?.baseline?.actionOrdinal??Infinity,
      root?.treatment?.actionOrdinal??Infinity);
    if(!Number.isSafeInteger(ordinal)||ordinal<0)return {
      id:pair.id,firstDivergentOrdinal:null,
      status:'no-common-first-root-ordinal',
      equalReportedPrefix:false,
      fullNamedPrintingPrefixCertified:false,
      competitiveGameQualified:false};
    const baseline=promptPrefix(left.nativePromptChoices??null,ordinal);
    const treatment=promptPrefix(right.nativePromptChoices??null,ordinal);
    const bothAvailable=baseline.available&&treatment.available;
    const parity=bothAvailable&&
      JSON.stringify(baseline.events)===JSON.stringify(treatment.events);
    const allNames=bothAvailable&&baseline.allPhysicalSelectionsNamed&&
      treatment.allPhysicalSelectionsNamed;
    const attackFork=root?.baseline?.action==='AttackAction'&&
      root?.treatment?.action==='AttackAction'&&
      root.baseline.actionOrdinal===root.treatment.actionOrdinal&&
      root.baseline.playerSlot===root.treatment.playerSlot;
    return {id:pair.id,firstDivergentOrdinal:ordinal,
      firstDivergenceWasSameActorAttack:Boolean(attackFork),
      sameRegisteredInitialPhysicalDeal:pair.samePhysicalInput===true,
      status:!bothAvailable?'missing-original-prompt-sidecar':
        parity?(allNames?'all-named-prompt-prefix-matched':
          'known-prompt-prefix-matched-with-unnamed-selections'):
          'reported-physical-prompt-prefix-diverged',
      equalReportedPrefix:parity,
      fullNamedPrintingPrefixCertified:parity&&allNames,
      baseline:{count:baseline.count,unknownNames:baseline.unknownNames},
      treatment:{count:treatment.count,unknownNames:treatment.unknownNames},
      // Explicit postgame-only coverage: other unobserved prompts,
      // hidden information and rules still prevent competitive release.
      competitiveGameQualified:false};
  });
  return {schema:SCHEMA,originalAttemptPairs:cases.length,cases,
    reportedPromptPrefixParityCases:
      cases.filter(x=>x.equalReportedPrefix).length,
    fullyNamedReportedPromptPrefixCases:
      cases.filter(x=>x.fullNamedPrintingPrefixCertified).length,
    noFirstRootOrdinalCases:cases.filter(x=>
      x.status==='no-common-first-root-ordinal').length,
    competitiveQualifiedGames:0,
    caveat:'Only native postgame-reported physical card-name selections before first changed root. No assertion of complete paper prompts, hidden-information-safe bot, or competitive outcomes.'};
}

if(require.main===module){
  const file=process.argv[2];
  assert.ok(file,'A complete previously archived paired native JSON is required');
  process.stdout.write(JSON.stringify(auditNativePreForkSelections(
    JSON.parse(fs.readFileSync(file,'utf8'))),null,2)+'\n');
}

module.exports={SCHEMA,promptPrefix,auditNativePreForkSelections};
