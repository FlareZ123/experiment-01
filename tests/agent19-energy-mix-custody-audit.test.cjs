'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {attachedEnergyCount,addedEnergyNames,auditSourceEnergyMixCustody}=
  require('../simulation/evaluation/agent19-energy-mix-custody-audit.cjs');

/** @param {object} [options] Synthetic native record with no concealed zones. */
function fixture(options={}){
  const seat=options.seat??1;
  const board=after=>{
    const owner={active:{energyCards:['Double Colorless Energy SUM']},
      bench:[{energyCards:after?['Double Colorless Energy SUM']:[]}]};
    const opponent={active:{energyCards:[]},bench:[]};
    return seat===0?[owner,opponent]:[opponent,owner];
  };
  const recordedChange=options.gain===false?[]:[{
    seat,position:'bench',index:0,
    before:{pokemon:'Mew V FST',energies:[],tools:[]},
    after:{pokemon:'Mew V FST',
      energies:['Double Colorless Energy SUM'],tools:[]}
  }];
  const root=options.root??40;
  const copy=options.copy??'Energy Mix';
  return {
    trial:{id:'5:1:B:champion-reference'},
    sourceSeat:seat,
    rootActionLedger:[
      {actionOrdinal:root,action:'AttackAction',playerSlot:seat,
        attack:'Cross Fusion Strike'},
      {actionOrdinal:root+1,pendingPrompt:'ChooseAttackPrompt',
        initiatingRootActionOrdinal:root,
        attackChoice:{printing:options.printing??'Mew V FST',
          attackName:copy}},
      {actionOrdinal:root+2,pendingPrompt:'AttachEnergyPrompt',
        initiatingRootActionOrdinal:root}
    ],
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:root,turnBefore:7,attackName:'Cross Fusion Strike',
      settledPromptChain:options.settled!==false,
      settlementCrossesClockReset:options.clockCrossed===true,
      completionRootOrdinal:root+3,
      publicBoardBefore:board(false),
      publicBoardAfter:board(options.gain!==false)
    }]},
    nativeAcceptedEnergyPromptSidecar:{events:[{
      dispatchOrdinal:root+2,turnBefore:7,playerSlot:seat,
      promptType:'AttachEnergyPrompt',action:'ResolvePromptAction',
      nativeDispatchAccepted:true,publicAfterDispatch:true,
      publicChanges:recordedChange
    }]}
  };
}

test('positive same-root owner Energy Mix gains one publicly attached DCE',()=>{
  const result=auditSourceEnergyMixCustody(fixture());
  assert.equal(result.selectedEnergyMixCopies,1);
  assert.equal(result.publicDceGains,1);
  assert.equal(result.noPublicEnergyGains,0);
  assert.equal(result.records[0].classification,'PUBLIC_DCE_GAIN_CONFIRMED');
  assert.equal(result.records[0].hiddenDeckCardIdentityVerified,false);
  assert.equal(result.competitiveQualifiedGames,0);
});

test('paid or accepted native prompt with empty selection gains zero public Energy',()=>{
  const result=auditSourceEnergyMixCustody(fixture({gain:false}));
  assert.equal(result.noPublicEnergyGains,1);
  assert.equal(result.publicDceGains,0);
  assert.equal(result.records[0].nativePromptReceiptCount,1);
});

test('both physical source seats use correct owner board',()=>{
  for(const seat of [0,1])
    assert.equal(auditSourceEnergyMixCustody(fixture({seat})).publicDceGains,1);
});

test('different copied attack cannot be credited as Energy Mix',()=>{
  for(const [printing,copy] of [['Genesect V FST','Techno Blast'],
    ['Mew VMAX FST','Max Miracle']]){
    const result=auditSourceEnergyMixCustody(fixture({printing,copy}));
    assert.equal(result.selectedEnergyMixCopies,0);
  }
});

test('wrong owner, absent physical prompt and cross-epoch settlement are unverified',()=>{
  const wrongOwner=fixture();
  wrongOwner.nativeAcceptedEnergyPromptSidecar.events[0].playerSlot=0;
  const absent=fixture();
  absent.nativeAcceptedEnergyPromptSidecar.events=[];
  for(const row of [wrongOwner,absent,fixture({clockCrossed:true}),
    fixture({settled:false})]){
    const result=auditSourceEnergyMixCustody(row);
    assert.equal(result.unverified,1);
    assert.equal(result.publicDceGains,0);
  }
});

test('same-root ambiguous multiple copy-menu choices are excluded',()=>{
  const row=fixture();
  row.rootActionLedger.push({...row.rootActionLedger[1],actionOrdinal:99});
  assert.equal(auditSourceEnergyMixCustody(row).selectedEnergyMixCopies,0);
});

test('unknown count / malformed target delta never becomes a proven gain',()=>{
  const row=fixture();
  row.nativeAcceptedEnergyPromptSidecar.events[0].publicChanges[0].after
    .energies=['Water Energy SVE'];
  const result=auditSourceEnergyMixCustody(row);
  assert.equal(result.unverified,1);
  assert.equal(result.publicDceGains,0);
});

test('energy multiset preserves identical DCE values and identifies replacements',()=>{
  assert.deepEqual(addedEnergyNames(['DCE'],['DCE','DCE']),
    {added:['DCE'],removed:[]});
  assert.deepEqual(addedEnergyNames(['DCE'],['Water']),
    {added:['Water'],removed:['DCE']});
  assert.equal(addedEnergyNames(null,[]),null);
  assert.equal(attachedEnergyCount(null,1),null);
});
