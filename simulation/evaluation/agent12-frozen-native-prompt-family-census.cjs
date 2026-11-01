'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');

const VERSION='agent12-frozen-native-prompt-family-census-v1';
const PROMPT_ACTION='ResolvePromptAction';

/**
 * Classify actual settled native root-prompt reply counts from the frozen
 * prior 32-arm attempt archive. A root ledger carries a prompt *family* but
 * does not systematically carry the printed source-effect identity or reply
 * objects. Every such event is paper-contract **unverified** in this census.
 *
 * @param {object[]} rows Exact original native archived arms.
 * @returns {object} Auditable complete attempt and prompt denominator.
 */
function censusNativePromptFamilies(rows){
  assert.ok(Array.isArray(rows));
  const groups=new Map();
  const seen=new Set();
  for(const arm of rows){
    const trial=arm.trial;
    assert.ok(trial&&[6,11].includes(trial.rank));
    assert.ok(typeof trial.id==='string'&&!seen.has(trial.id));
    seen.add(trial.id);
    assert.ok(Array.isArray(arm.rootActionLedger));
    if(!groups.has(trial.rank)){
      groups.set(trial.rank,{
        rank:trial.rank,attemptedGames:0,observedPromptReplyActions:0,
        setupPromptReplyActions:0,inTurnPromptReplyActions:0,
        setupByFamily:{},inTurnByFamily:{},
        inTurnChooseCardsPromptCount:0,
        inTurnChooseCardsWithInitiatingRoot:0,
        inTurnChooseCardsWithNamedInitiator:0,
        inTurnChooseCardsByInitiatingAction:{},
        firstInTurnChooseCardsPrompt:null,
        cappedGames:0,engineTerminalGames:0
      });
    }
    const g=groups.get(trial.rank);
    g.attemptedGames++;
    if(arm.finished===true)g.engineTerminalGames++;
    else g.cappedGames++;
    const byOrdinal=new Map(arm.rootActionLedger.map(root=>
      [root.actionOrdinal,root]));
    for(const root of arm.rootActionLedger){
      if(root.action!==PROMPT_ACTION)continue;
      assert.ok(Number.isInteger(root.actionOrdinal)&&
        Number.isInteger(root.turnBefore));
      const setup=root.turnBefore===0;
      const family=root.pendingPrompt??'UNLABELED';
      const tally=setup?g.setupByFamily:g.inTurnByFamily;
      tally[family]=(tally[family]??0)+1;
      g.observedPromptReplyActions++;
      if(setup)g.setupPromptReplyActions++;
      else g.inTurnPromptReplyActions++;
      if(!setup&&family==='ChooseCardsPrompt'){
        g.inTurnChooseCardsPromptCount++;
        const initiating=byOrdinal.get(root.initiatingRootActionOrdinal);
        const named=initiating?.card??initiating?.attack??initiating?.ability;
        if(initiating)g.inTurnChooseCardsWithInitiatingRoot++;
        if(typeof named==='string'&&named.length>0){
          g.inTurnChooseCardsWithNamedInitiator++;
          const source=initiating.action+' / '+named;
          g.inTurnChooseCardsByInitiatingAction[source]=
            (g.inTurnChooseCardsByInitiatingAction[source]??0)+1;
        }
        if(!g.firstInTurnChooseCardsPrompt)
          g.firstInTurnChooseCardsPrompt={
            trial:trial.id,turn:root.turnBefore,
            ordinal:root.actionOrdinal,seat:root.playerSlot,
            initiatingRootOrdinal:root.initiatingRootActionOrdinal??null,
            initiatingAction:initiating?.action??null,
            initiatingName:named??null
          };
      }
    }
  }
  const byRank=[...groups.values()].sort((a,b)=>a.rank-b.rank);
  const totalPromptReplies=byRank.reduce((n,r)=>
    n+r.observedPromptReplyActions,0);
  const inTurnChooseCardsPromptCount=byRank.reduce((n,r)=>
    n+r.inTurnChooseCardsPromptCount,0);
  const inTurnChooseCardsWithInitiatingRoot=byRank.reduce((n,r)=>
    n+r.inTurnChooseCardsWithInitiatingRoot,0);
  const inTurnChooseCardsWithNamedInitiator=byRank.reduce((n,r)=>
    n+r.inTurnChooseCardsWithNamedInitiator,0);
  return {
    version:VERSION,attemptedArms:rows.length,byRank,
    totalPromptReplies,inTurnChooseCardsPromptCount,
    inTurnChooseCardsWithInitiatingRoot,
    inTurnChooseCardsWithNamedInitiator,
    sourcePrintedCardForEachPromptKnown:false,
    individuallyPaperVerifiedPromptCount:0,
    paperEvidenceStatus:'PROMPT_PAPER_UNVERIFIED',
    gameResultsQualifiedForCompetitiveInference:false,
    caveat:'Native root names often recover the initiating Item or attack, but not necessarily exact printed source identity, chosen physical reply or independent paper validity. Correlated games including caps are not independent effects or wins.'
  };
}

/**
 * @param {string} inputPath Archived full frozen result JSON, externally
 * retrieved with preserved artifact provenance.
 */
function runArchive(inputPath){
  const bytes=fs.readFileSync(inputPath);
  const archive=JSON.parse(bytes.toString('utf8'));
  assert.ok(Array.isArray(archive.rows));
  assert.equal(archive.rows.length,32);
  const result=censusNativePromptFamilies(archive.rows);
  assert.equal(result.attemptedArms,32);
  return {...result,
    archiveVersion:archive.version,
    sourceJsonSha256:crypto.createHash('sha256').update(bytes).digest('hex'),
    enginePin:archive.nativePin??null,
    profileSchema:archive.profile?.schema??null};
}

if(require.main===module){
  assert.equal(process.argv.length,3,
    'Supply one authentic frozen result JSON path (extracted from cited artifact)');
  process.stdout.write(JSON.stringify(runArchive(process.argv[2]),null,2)+'\n');
}
module.exports={VERSION,censusNativePromptFamilies,runArchive};
