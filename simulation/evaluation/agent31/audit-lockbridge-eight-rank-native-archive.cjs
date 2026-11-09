'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent31-lockbridge-original-eight-rank-native-decision-audit-v1';
const INPUT=process.env.AGENT31_LOCKBRIDGE_AUDIT_INPUT??
  path.resolve(__dirname,'../../../artifacts/agent31-lockbridge-eight-rank-native.json');
const OUTPUT=process.env.AGENT31_LOCKBRIDGE_AUDIT_OUTPUT??null;
const match=(root,name)=>root.action==='PlayCardAction'&&
  typeof root.card==='string'&&
  (root.card===name||root.card.startsWith(name+' '));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * Count native physical player actions for one printed contender.
 * Only accepted root ledger receipts qualify. A card merely present
 * in the deck or seen in an owner's hand does not count as a play.
 * @param {object} row Native row with accepted root tape.
 */
function gameActions(row){
  assert.ok(row.candidateSeat===0||row.candidateSeat===1);
  assert.ok(Array.isArray(row.rootActionLedger));
  const roots=row.rootActionLedger.filter(x=>x.playerSlot===row.candidateSeat);
  const plays=name=>roots.filter(x=>match(x,name));
  return {
    candidateId:row.candidateId,rank:row.rank,
    trialId:row.id,gameFinished:row.finished,
    nativeDisposition:row.nativeDisposition,
    playerRootCount:roots.length,
    playArven:plays('Arven').length,
    playTemple:plays('Temple of Sinnoh').length,
    playHood:plays('Stealthy Hood').length,
    playWobbuffet:plays('Wobbuffet').length,
    playLillieClefairy:plays("Lillie's Clefairy ex").length,
    playPokemonRanger:plays('Pokémon Ranger').length,
    playVSSeeker:plays('VS Seeker').length,
    playGuzma:plays('Guzma').length,
    playFloatStone:plays('Float Stone').length,
    attackRoots:roots.filter(x=>x.action==='AttackAction').length,
    abilityRoots:roots.filter(x=>x.action==='UseAbilityAction').length,
    passRoots:roots.filter(x=>x.action==='PassTurnAction').length,
    first20Roots:roots.slice(0,20).map(x=>({
      ordinal:x.actionOrdinal,turn:x.turnBefore,
      action:x.action,card:x.card??null,attack:x.attack??null
    }))
  };
}

/** @param {object} original Immutable native archive from prior completed run. */
function audit(original){
  assert.equal(original?.schema,
    'agent31-lockbridge-versus-champion-eight-original-ranks-v1');
  assert.equal(original?.analysis?.summary?.executedNativeAttempts,32);
  assert.equal(original?.analysis?.groups?.length,16);
  const games=original.analysis.groups.flatMap(g=>[
    gameActions(g.champion),gameActions(g.challenger)
  ]);
  const byCandidate=Object.fromEntries(original.printedCandidateIds.map(id=>{
    const rows=games.filter(row=>row.candidateId===id);
    const metrics=['playArven','playTemple','playHood',
      'playWobbuffet','playLillieClefairy','playPokemonRanger',
      'playVSSeeker','playGuzma','playFloatStone',
      'attackRoots','abilityRoots','passRoots'];
    return [id,{games:rows.length,
      nativeTerminals:rows.filter(x=>x.gameFinished).length,
      ...(Object.fromEntries(metrics.map(name=>[
        name,rows.reduce((sum,row)=>sum+row[name],0)
      ]))) }];
  }));
  const contrast=original.analysis.groups.filter(g=>
    g.comparable&&g.bothTerminal&&g.nativeWinReversal)
    .map(g=>({
      group:g.id,rank:g.rank,sourceSeed:g.sourceSeed,
      candidateSlot:g.candidateSlot,
      championWinner:g.champion.nativeWinner,
      challengerWinner:g.challenger.nativeWinner,
      championCandidateWin:g.champion.candidateNativeWon,
      challengerCandidateWin:g.challenger.candidateNativeWon,
      champion:gameActions(g.champion),
      challenger:gameActions(g.challenger)
    }));
  return {
    schema:VERSION,
    sourceSchema:original.schema,
    sourceRun:42579461346,
    realNativeRootActionProvenance:true,
    noResimulation:true,
    noAdditionalSeedSelection:true,
    sameFixedSixties:true,
    originalPhysicalGroups:original.analysis.groups.length,
    sourceAndStarterMatched:
      original.analysis.summary.sourceAndStarterMatched,
    pairedBothTerminal:
      original.analysis.summary.bothNativeTerminalWhenMatched,
    byCandidate,contrast,
    games,
    paperCompetitiveQualified:0
  };
}
/** Persist a small audit atomically and with a lock if output requested. */
function save(output,record){
  fs.mkdirSync(path.dirname(output),{recursive:true});
  const lock=output+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const temp=output+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
    const file=fs.openSync(temp,'r');
    try{fs.fsyncSync(file);}finally{fs.closeSync(file);}
    fs.renameSync(temp,output);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}

if(require.main===module){
  const bytes=fs.readFileSync(INPUT);
  const report=audit(JSON.parse(bytes.toString('utf8')));
  if(OUTPUT)save(OUTPUT,report);
  process.stdout.write('AGENT31_LOCKBRIDGE_ARCHIVE_AUDIT '+
    JSON.stringify({inputSha256:hash(bytes),
      byCandidate:report.byCandidate,contrast:report.contrast.map(x=>({
        group:x.group,rank:x.rank,slot:x.candidateSlot,
        championWin:x.championCandidateWin,
        challengerWin:x.challengerCandidateWin,
        championRoots:x.champion.playerRootCount,
        challengerRoots:x.challenger.playerRootCount,
        championFirst20:x.champion.first20Roots,
        challengerFirst20:x.challenger.first20Roots
      }))})+'\n');
}
module.exports={VERSION,gameActions,audit,save};
