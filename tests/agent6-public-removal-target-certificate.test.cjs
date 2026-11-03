'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,REMOVAL_PRINTINGS,PROTECTED_PRISM_STADIUMS,
  removalTargetCertificate,withPublicRemovalTargetEvidence
}=require('../simulation/twinleaf/agent6-public-removal-target-certificate.cjs');

/** Owner-visible board only; no deck, Prize identity, or opposing hand. */
function view(hand=['Field Blower GRI'],options={}){
  const owner={
    active:{printing:'Latias ex SSP',tools:['Float Stone BKT']},
    bench:[{printing:"Lillie's Clefairy ex JTG",tools:[]},null],
    stadium:[],publicTurnRestrictions:{itemPlayLocked:false}
  };
  const opponent={
    active:{printing:'Iron Thorns ex TWM',tools:['Tool Jammer BST']},
    bench:[{printing:'Pidgey MEW',tools:[]},null],
    stadium:[],publicTurnRestrictions:{itemPlayLocked:false}
  };
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:5,
    ownHand:hand,ownPublic:owner,opponentPublic:opponent,
    ownTurnResources:{itemPlayLocked:options.itemLocked===true}};
}

test('exact source printing database and native alias register four rule identities',()=>{
  assert.equal(VERSION,'agent6-owner-public-removal-target-certificate-v2');
  assert.deepEqual(Object.keys(REMOVAL_PRINTINGS),[
    'Field Blower GRI','Lost Vacuum LOR',
    'Tool Scrapper RCL','Tool Scrapper DRX'
  ]);
  assert.deepEqual(Object.values(REMOVAL_PRINTINGS)
    .map(x=>x.sourceId),['sm2-125','swsh11-162','swsh2-168','bw6-116']);
});

test('Field Blower identifies opposing Jammer as an exact public removable Tool',()=>{
  const c=removalTargetCertificate(view(),0);
  assert.equal(c.status,'public-target-and-physical-cost-present-unresolved');
  assert.equal(c.eligibleTargetCount,2);
  assert.deepEqual(c.targets.map(x=>[
    x.side,x.zone,x.printing,x.targetClass
  ]),[
    ['own','active','Float Stone BKT','tool'],
    ['opponent','active','Tool Jammer BST','tool']
  ]);
  assert.equal(c.maxTargets,2);
  assert.equal(c.destination,'discard');
  assert.equal(c.paperPlayableCertified,false);
  assert.equal(c.nativeStoreAcceptanceCertified,false);
});

test('Tool Scrapper sees Tools but correctly excludes a Stadium-only board',()=>{
  const v=view(['Tool Scrapper RCL']);
  v.ownPublic.active.tools=[];
  v.opponentPublic.active.tools=[];
  v.opponentPublic.stadium=['Path to the Peak CRE'];
  const c=removalTargetCertificate(v,0);
  assert.equal(c.status,'necessary-condition-failed');
  assert.equal(c.eligibleTargetCount,0);
  assert.deepEqual(c.blockers,['no-public-removal-target']);
  v.ownPublic.bench[0].tools=['Stealthy Hood UNB'];
  const yes=removalTargetCertificate(v,0);
  assert.equal(yes.eligibleTargetCount,1);
  assert.equal(yes.targets[0].zone,'bench');
  assert.equal(yes.targets[0].side,'own');
});

test('Field Blower can use an ordinary Stadium as the only public target',()=>{
  const v=view();
  v.ownPublic.active.tools=[];
  v.opponentPublic.active.tools=[];
  v.opponentPublic.stadium=['Path to the Peak CRE'];
  const c=removalTargetCertificate(v,0);
  assert.equal(c.eligibleTargetCount,1);
  assert.equal(c.targets[0].targetClass,'stadium');
  assert.equal(c.targets[0].side,'opponent');
  assert.equal(c.publiclyProvenBlocker,null);
  assert.equal(c.protectedStadiums.length,0);
});

test('five printed Prism Star Stadiums resist direct Item effects',()=>{
  assert.deepEqual(PROTECTED_PRISM_STADIUMS,{
    'Heat Factory LOT':'sm8-178',
    'Life Forest LOT':'sm8-180',
    'Thunder Mountain LOT':'sm8-191',
    'Black Market TEU':'sm9-134',
    'Wondrous Labyrinth TEU':'sm9-158'
  });
  for(const [printing,sourceId] of
    Object.entries(PROTECTED_PRISM_STADIUMS)){
    for(const item of ['Field Blower GRI','Lost Vacuum LOR']){
      const hand=item==='Lost Vacuum LOR'?
        [item,'Psychic Energy MEE']:[item];
      const v=view(hand);
      v.ownPublic.active.tools=[];
      v.opponentPublic.active.tools=[];
      v.opponentPublic.stadium=[printing];
      const cert=removalTargetCertificate(v,0);
      assert.equal(cert.eligibleTargetCount,0);
      assert.equal(cert.protectedStadiums.length,1);
      assert.equal(cert.protectedStadiums[0].sourceId,sourceId);
      assert.equal(cert.protectedStadiums[0].printing,printing);
      assert.equal(cert.printedProtectionSuppressionUnverified,true);
      assert.equal(cert.publiclyProvenBlocker,null);
      assert.deepEqual(cert.blockers,[]);
      assert.equal(cert.status,
        'protected-prism-star-stadium-effect-unresolved');
      assert.equal(cert.finalTargetDestinationCertified,false);
      const overlay=withPublicRemovalTargetEvidence(v,{
        actorSeat:0,globalTurn:5,rows:[{
          handIndex:0,printing:item,paperPlayable:null,
          necessaryBlockers:[]
        }]
      });
      assert.equal(overlay.rows[0].paperPlayable,null);
      assert.equal(overlay.rows[0].exactTargetEligibility,
        'prism-star-stadium-protection-unresolved');
    }
  }
});

test('an ordinary Tool remains a target alongside protected Prism Star Stadium',()=>{
  const v=view();
  v.opponentPublic.stadium=['Thunder Mountain LOT'];
  const cert=removalTargetCertificate(v,0);
  assert.equal(cert.eligibleTargetCount,2);
  assert.equal(cert.protectedStadiums.length,1);
  assert.equal(cert.status,'public-target-and-physical-cost-present-unresolved');
  assert.deepEqual(cert.targets.map(x=>x.printing),[
    'Float Stone BKT','Tool Jammer BST'
  ]);
});

test('Tool Scrapper still proves no Tool target on Stadium-only board',()=>{
  const v=view(['Tool Scrapper RCL']);
  v.ownPublic.active.tools=[];
  v.opponentPublic.active.tools=[];
  v.opponentPublic.stadium=['Thunder Mountain LOT'];
  const cert=removalTargetCertificate(v,0);
  assert.equal(cert.eligibleTargetCount,0);
  assert.equal(cert.protectedStadiums.length,0);
  assert.deepEqual(cert.blockers,['no-public-removal-target']);
  assert.equal(cert.status,'necessary-condition-failed');
});

test('Lost Vacuum independently checks mandatory other-hand payment',()=>{
  const no=removalTargetCertificate(view(['Lost Vacuum LOR']),0);
  assert.equal(no.eligibleTargetCount,2);
  assert.equal(no.otherHandCardsRequired,1);
  assert.equal(no.handCostPayable,false);
  assert.ok(no.blockers.includes('mandatory-other-hand-card-unavailable'));
  const yes=removalTargetCertificate(
    view(['Lost Vacuum LOR','Psychic Energy MEE']),0);
  assert.equal(yes.handCostPayable,true);
  assert.equal(yes.destination,'lost-zone');
  assert.equal(yes.maxTargets,1);
  assert.equal(yes.paperPlayableCertified,false);
});

test('owner-public Item lock blocks otherwise present and affordable targets',()=>{
  const c=removalTargetCertificate(
    view(['Field Blower GRI'],{itemLocked:true}),0);
  assert.equal(c.eligibleTargetCount,2);
  assert.equal(c.publicItemLocked,true);
  assert.ok(c.blockers.includes('observed-public-item-lock'));
  assert.equal(c.status,'necessary-condition-failed');
});

test('non-registered printing is explicitly unknown, even with public targets',()=>{
  const c=removalTargetCertificate(view(['Computer Search BCR']),0);
  assert.equal(c.printedRuleKnown,false);
  assert.equal(c.status,'unmodeled-exact-printing');
  assert.equal(c.eligibleTargetCount,null);
  assert.equal(c.publiclyProvenBlocker,null);
});

test('two Stadium zones trigger fail-closed inconsistent public-board witness',()=>{
  const v=view();
  v.ownPublic.stadium=['Sky Field ROS'];
  v.opponentPublic.stadium=['Path to the Peak CRE'];
  const c=removalTargetCertificate(v,0);
  assert.equal(c.boardInconsistent,true);
  assert.ok(c.blockers.includes('multiple-stadium-zones-inconsistent'));
});

test('owner-information invariance under changes to concealed opponent fields',()=>{
  const a=view(['Field Blower GRI','Psychic Energy MEE']);
  const b=structuredClone(a);
  b.opponentPublic.secretHand=['Iono PAL','Ultra Ball SVI'];
  b.opponentPublic.secretDeck=['Battle VIP Pass FST'];
  b.opponentPublic.secretPrizes=['Forest Seal Stone SIT'];
  b.ownPublic.secretDeck=['Field Blower GRI'];
  const c=removalTargetCertificate(a,0);
  const d=removalTargetCertificate(b,0);
  assert.deepEqual(c,d);
  assert.equal(c.opponentConcealedInformationRead,false);
});

test('overlay remains read-only, preserves unresolved paper eligibility',()=>{
  const v=view(['Field Blower GRI','Lost Vacuum LOR','Quick Ball SSH']);
  const census={actorSeat:0,globalTurn:5,rows:[
    {handIndex:0,printing:'Field Blower GRI',
      paperPlayable:null,necessaryBlockers:[]},
    {handIndex:1,printing:'Lost Vacuum LOR',
      paperPlayable:null,necessaryBlockers:[]},
    {handIndex:2,printing:'Quick Ball SSH',
      paperPlayable:false,necessaryBlockers:['item-lock']}
  ],provenNecessaryConditionFailures:1,remainingUnresolvedCopies:2};
  const original=structuredClone(census);
  const result=withPublicRemovalTargetEvidence(v,census);
  assert.equal(result.rows[0].exactTargetEligibility,'public-target-present');
  assert.equal(result.rows[0].paperPlayable,null);
  assert.equal(result.rows[1].paperPlayable,null);
  assert.equal(result.rows[2].paperPlayable,false);
  assert.equal(result.provenNecessaryConditionFailures,1);
  assert.equal(result.remainingUnresolvedCopies,2);
  assert.deepEqual(census,original);
  assert.equal(result.allRemainingArePaperLegal,false);
});

test('overlay adds necessary no-target and unpaid-hand-cost failures',()=>{
  const v=view(['Field Blower GRI','Lost Vacuum LOR']);
  v.ownPublic.active.tools=[];
  v.opponentPublic.active.tools=[];
  const census={actorSeat:0,globalTurn:5,rows:[
    {handIndex:0,printing:'Field Blower GRI',
      paperPlayable:null,necessaryBlockers:[]},
    {handIndex:1,printing:'Lost Vacuum LOR',
      paperPlayable:null,necessaryBlockers:[]}
  ],provenNecessaryConditionFailures:0,remainingUnresolvedCopies:2};
  const r=withPublicRemovalTargetEvidence(v,census);
  assert.equal(r.provenNecessaryConditionFailures,2);
  assert.equal(r.remainingUnresolvedCopies,0);
  assert.equal(r.rows[0].paperPlayable,false);
  assert.equal(r.rows[1].paperPlayable,false);
  assert.equal(r.rows[1].exactTargetEligibility,'proven-no-public-target');
  assert.ok(r.rows[1].necessaryBlockers
    .includes('printed-removal-target:no-public-removal-target'));
});

test('invalid hand index or owner-root boundary fails closed',()=>{
  assert.throws(()=>removalTargetCertificate(view(),1));
  const v=view();
  v.decisionKind='owner-prompt';
  assert.throws(()=>removalTargetCertificate(v,0));
});

test('public target overlay rejects source rows with a mismatched owner index',()=>{
  const v=view(['Field Blower GRI']);
  const census={actorSeat:0,globalTurn:5,rows:[{
    handIndex:0,printing:'Lost Vacuum LOR',
    paperPlayable:null,necessaryBlockers:[]
  }]};
  assert.throws(()=>withPublicRemovalTargetEvidence(v,census),
    /authenticated physical owner hand index/);
});
