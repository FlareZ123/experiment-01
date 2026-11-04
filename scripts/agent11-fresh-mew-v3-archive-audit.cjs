/**
 * Reproduce the exact preregistered original rank5/rank11 symmetric Mew v3
 * developmental archive audit. Accepts raw extracted JSON from immutable
 * GitHub Actions artifact 13356787268. Native outcomes are NOT paper wins.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const RESULT_SHA='67b946e466ce8457054f5eef10f178704bcd88e6e8ed96b9c949ca6b4debdc10';
const REG_PATH=path.resolve(__dirname,'../results/aichi-2026/registrations/agent11-owner-resource-tutor-bilateral-v3.json');
/** @param {Buffer|string} data */
function digest(data){return createHash('sha256').update(data).digest('hex');}
/** @param {{seed:number,rank5Seat:number,mode:string}} r */
function key(r){return [r.seed,r.rank5Seat,r.mode].join(':');}
/** @param {Record<string,any>} d @param {Record<string,any>} reg */
function audit(d,reg){
  assert.equal(d.schema,reg.schema);
  assert.equal(d.engine,PIN);
  assert.equal(reg.enginePin,PIN);
  assert.equal(d.registrationSha256,digest(JSON.stringify(reg)));
  assert.deepEqual(d.originalRanks,[5,11]);
  assert.equal(d.scheduledArms,64);
  assert.equal(d.observedArms,64);
  assert.equal(d.rows.length,64);
  assert.equal(reg.arms.length,64);
  assert.equal(d.competitiveQualifiedGames,0);
  assert.equal(d.nativeErrors,1);
  assert.equal(d.nativeCaps,50);
  assert.equal(d.nativeTerminals,13);
  assert.equal(d.sourcePhysicalParityMatched,31);
  assert.equal(d.sourcePhysicalPairs,32);
  assert.equal(d.selectedAcceptedItems,26);
  assert.equal(d.selectedSettledPhysicalTargets,52);
  assert.equal(d.experimentalSymmetricMewCompetence?.commonBothPhysicalSeats,true);
  assert.equal(d.experimentalSymmetricKnownDeadActorRoot,'AGENT7_KNOWN_DEAD_ATTACK_ROOT_DEV=true');
  const registered=new Map(reg.arms.map(a=>[key(a),a]));
  const byKey=new Map();
  const modes={control:[], 'resource-tutor':[]};
  for(const row of d.rows){
    const k=key(row);
    assert(!byKey.has(k),'duplicated row '+k);
    const arm=registered.get(k);
    assert(arm,'unregistered row '+k);
    for(const property of ['id','seed','rank5Seat','mode','maxActions'])
      assert.equal(row[property],arm[property]);
    assert.equal(row.paperGameQualified,false);
    assert(['native-terminal','native-capped','native-error'].includes(row.nativeStatus));
    byKey.set(k,row);
    modes[row.mode].push(row);
  }
  assert.equal(byKey.size,64);
  const pairs=[];
  for(const seed of reg.seeds)for(const rank5Seat of [0,1]){
    const control=byKey.get([seed,rank5Seat,'control'].join(':'));
    const tutor=byKey.get([seed,rank5Seat,'resource-tutor'].join(':'));
    assert(control&&tutor);
    const aborted=tutor.error?.nativeAbortEvidence??null;
    const tutorDeal=tutor.initialFullPhysicalDealDigest??
      aborted?.fullPhysicalDealFingerprint?.digestSha256;
    const tutorFirst=tutor.firstTurnSlot??
      aborted?.initialTurnOrderEvidence?.firstTurnSlot;
    assert(control.initialFullPhysicalDealDigest);
    assert.equal(tutorDeal,control.initialFullPhysicalDealDigest);
    assert.equal(tutorFirst,control.firstTurnSlot);
    pairs.push({seed,rank5Seat,originalFullDealDigest:control.initialFullPhysicalDealDigest,
      primaryPairEvidence:Boolean(tutor.initialFullPhysicalDealDigest),
      nativeControl:control.nativeStatus,nativeTutor:tutor.nativeStatus,
      winnersSame:control.nativeWinner===tutor.nativeWinner,
      tutorAcceptedItems:tutor.tutorAudit?.acceptedItems??null});
  }
  assert.equal(pairs.length,32);
  assert.equal(pairs.filter(p=>p.primaryPairEvidence).length,31);
  assert.deepEqual(pairs.filter(p=>!p.primaryPairEvidence).map(p=>[p.seed,p.rank5Seat]),
    [[1591350664,0]]);
  const failure=byKey.get('1591350664:0:resource-tutor');
  assert.equal(failure.nativeStatus,'native-error');
  assert.match(failure.error?.message??'',/NO_BENCH_SLOTS_AVAILABLE/);
  const publicAbort=failure.error.nativeAbortEvidence;
  assert.equal(publicAbort.attackName,'Call for Family');
  assert.equal(publicAbort.attackingPokemon,'Trubbish FST');
  assert.equal(publicAbort.actingSeat,1);
  assert.equal(publicAbort.actionOrdinal,54);
  assert.equal(publicAbort.preDispatchBoard[1].bench.length,5);

  const cross=[],terminal=[];
  const grouped={};
  for(const mode of Object.keys(modes)){
    const rows=modes[mode];
    assert.equal(rows.length,32);
    const stats={arms:rows.length,status:{},rank5NativeWins:0,rank11NativeWins:0,
      rank5Prizes:0,rank11Prizes:0,rank5CrossDeclarations:0,
      crossSettled:0,crossGenesectDonor:0,crossMewDonor:0,crossNoDonor:0,
      crossNoDonorSettled:0,crossPrizeGain:0,crossCopied210DamageEvents:0,
      acceptedTutorItems:0,physicallyMovedTutorTargets:0};
    for(const r of rows){
      stats.status[r.nativeStatus]=(stats.status[r.nativeStatus]??0)+1;
      if(r.nativeStatus==='native-terminal'){
        if(r.nativeWinner===r.rank5Seat)stats.rank5NativeWins++;
        else if(r.nativeWinner===1-r.rank5Seat)stats.rank11NativeWins++;
        else throw Error('Invalid native winner physical seat '+r.id);
      }
      if(r.prizesRemaining){
        stats.rank5Prizes+=6-r.prizesRemaining[r.rank5Seat];
        stats.rank11Prizes+=6-r.prizesRemaining[1-r.rank5Seat];
      }
      stats.acceptedTutorItems+=r.tutorAudit?.acceptedItems??0;
      stats.physicallyMovedTutorTargets+=r.tutorAudit?.physicalTargetsSettled??0;
      for(const a of r.publicAttackTransitions??[]){
        if(a.triggerPlayerSlot!==1-r.rank5Seat||!a.declarations?.some(x=>x.attackName==='Terminal Period'))continue;
        const target=a.before[r.rank5Seat].active;
        assert.equal(target?.damage,0);
        if(a.settled){
          assert.deepEqual(a.settled.after,a.before);
          assert.deepEqual(a.settled.prizesRemaining,a.beforePrizesRemaining);
        }
        terminal.push({arm:r.id,settled:Boolean(a.settled)});
      }
      const geneTurns=[];
      for(const a of r.publicAttackTransitions??[]){
        if(a.triggerPlayerSlot!==r.rank5Seat||
            !a.declarations?.some(x=>x.attackName==='Cross Fusion Strike'))continue;
        stats.rank5CrossDeclarations++;
        const own=a.before[r.rank5Seat];
        const bench=own.bench.map(x=>x.name);
        const donor=bench.includes('Genesect V')?'Genesect V':
          bench.includes('Mew V')?'Mew V':null;
        if(donor==='Genesect V')stats.crossGenesectDonor++;
        else if(donor==='Mew V')stats.crossMewDonor++;
        else stats.crossNoDonor++;
        const settled=a.settled??null;
        if(settled)stats.crossSettled++;
        const prizes=settled?
          a.beforePrizesRemaining[r.rank5Seat]-settled.prizesRemaining[r.rank5Seat]:null;
        if(prizes!==null)stats.crossPrizeGain+=prizes;
        const opponent=1-r.rank5Seat;
        const bef=a.before[opponent].active,aft=settled?.after?.[opponent]?.active;
        const damage=bef&&aft&&bef.name===aft.name?aft.damage-bef.damage:null;
        if(damage===210)stats.crossCopied210DamageEvents++;
        if(donor===null&&settled){
          stats.crossNoDonorSettled++;
          assert.deepEqual(settled.after,a.before,
            'No-donor Cross should have no board effect '+r.id+'/'+a.actionOrdinal);
          assert.deepEqual(settled.prizesRemaining,a.beforePrizesRemaining);
        }
        if(donor==='Mew V'&&settled){
          const benchedMewIndex=own.bench.findIndex(p=>p.name==='Mew V');
          const energyBefore=own.bench[benchedMewIndex].energyCards;
          const energyAfter=settled.after[r.rank5Seat].bench[benchedMewIndex].energyCards;
          assert.equal(energyAfter.length,energyBefore.length+1);
          assert(energyAfter.includes('Double Colorless Energy'));
          assert.equal(prizes,0);
        }
        if(donor==='Genesect V'&&settled)geneTurns.push(a.turnBefore);
        cross.push({arm:r.id,actionOrdinal:a.actionOrdinal,turnBefore:a.turnBefore,
          donor:donor??'none',settled:Boolean(settled),prizes,damageSameDefender:damage});
      }
      for(let i=1;i<geneTurns.length;i++)
        assert(geneTurns[i]-geneTurns[i-1]>=4,
          'Copied Techno Blast next-turn attack lock potentially violated '+r.id);
    }
    grouped[mode]=stats;
  }
  assert.deepEqual(grouped.control.status,{'native-capped':25,'native-terminal':7});
  assert.deepEqual(grouped['resource-tutor'].status,
    {'native-capped':25,'native-terminal':6,'native-error':1});
  assert.deepEqual([grouped.control.rank5NativeWins,grouped['resource-tutor'].rank5NativeWins],[2,2]);
  assert.deepEqual([grouped.control.rank11NativeWins,grouped['resource-tutor'].rank11NativeWins],[5,4]);
  assert.deepEqual([grouped.control.rank5Prizes,grouped['resource-tutor'].rank5Prizes],[15,15]);
  assert.deepEqual([grouped.control.rank5CrossDeclarations,grouped['resource-tutor'].rank5CrossDeclarations],[17,18]);
  assert.deepEqual([grouped.control.crossSettled,grouped['resource-tutor'].crossSettled],[16,16]);
  assert.deepEqual([grouped.control.crossNoDonorSettled,grouped['resource-tutor'].crossNoDonorSettled],[5,5]);
  assert.deepEqual([grouped.control.crossMewDonor,grouped['resource-tutor'].crossMewDonor],[1,1]);
  assert.deepEqual([grouped.control.crossGenesectDonor,grouped['resource-tutor'].crossGenesectDonor],[10,11]);
  assert.deepEqual([grouped.control.crossPrizeGain,grouped['resource-tutor'].crossPrizeGain],[15,15]);
  assert.equal(cross.length,35);
  assert.equal(terminal.length,66);
  assert.equal(terminal.filter(a=>a.settled).length,64);
  assert.deepEqual(d.rows.filter(r=>r.nativeStatus==='native-terminal'&&
      r.nativeWinner===r.rank5Seat).map(r=>r.seed).sort(),[1511799401,1511799401,1511799401,1511799401]);
  return {schema:'agent11-fresh-mew-v3-exact-archive-audit-v1',
    engine:d.engine,sourceGitSha:d.runGitSha,registeredArms:64,
    initialFullPhysicalPairsProven:32,primaryPairReceipts:31,
    separatelyRecoveredAbortPair:1,nativeQualifiedGames:0,
    byMode:grouped,sourceMewCopiedAttackCounts:{
      declared:35,settled:32,genesectDonor:21,
      mewDonorEnergyMix:2,noEligibleBenchDonor:12,
      noDonorSettledWithoutBoardChange:10,
      GenesectCopiedPrizeGainTotal:30},
    sourceRank11TerminalPeriod:{declared:terminal.length,settled:64,zeroEffectSettle:64},
    distinctNativeRank5WinSeedValues:[1511799401],
    nativeFullBenchCallForFamilyAbort:{
      arm:failure.id,actionOrdinal:54,attackingPokemon:'Trubbish FST',
      paperRule:'Advanced Player Rulebook section C-11: full Bench attack ends before search',
      error:failure.error.message},
    note:'Developmental twinleaf evidence, not paper certification; preserve every capped and errored arm'};
}
if(require.main===module){
  assert.equal(process.argv.length,3,'usage: node audit.cjs extracted-v3.json');
  const bytes=fs.readFileSync(process.argv[2]);
  assert.equal(digest(bytes),RESULT_SHA);
  const registration=JSON.parse(fs.readFileSync(REG_PATH,'utf8'));
  process.stdout.write(JSON.stringify(audit(JSON.parse(bytes.toString('utf8')),registration),null,2)+'\n');
}
module.exports={audit};
