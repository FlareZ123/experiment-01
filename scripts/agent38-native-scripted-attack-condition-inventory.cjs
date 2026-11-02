'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const assert=require('node:assert/strict');

const VERSION='agent38-scripted-attack-condition-syntax-inventory-v1';
const REPO_ROOT=path.resolve(__dirname,'..');
const SEARCH_DIRS=['simulation/twinleaf','simulation/evaluation'];
const ATTACK_RE=/\bnew\s+AttackAction\s*\(/g;
const CONDITION_RE=/\bSpecialCondition\b|specialConditions|nativeIncapacitatingStatus|cannotAttack|cannotUseAttack|attackLock|ASLEEP|PARALYZED/;

/** @param {string} dir @returns {string[]} */
function filesUnder(dir){
  const files=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>
    a.name.localeCompare(b.name))){
    const p=path.join(dir,e.name);
    if(e.isDirectory())files.push(...filesUnder(p));
    else if(e.isFile()&&p.endsWith('.cjs'))files.push(p);
  }
  return files;
}

/** @param {string} source @param {number} line */
function proximityEvidence(source,line){
  const lines=source.split('\n');
  const preceding=lines.slice(Math.max(0,line-25),line);
  const following=lines.slice(line,Math.min(lines.length,line+12));
  return {
    localConditionTokensBefore:preceding.some(s=>CONDITION_RE.test(s)),
    localConditionTokensAfter:following.some(s=>CONDITION_RE.test(s)),
    fileHasConditionTokens:CONDITION_RE.test(source)
  };
}

/** AST-free syntax discovery, not an action-validity or coverage certificate. */
function inventoryScriptedNativeAttacks(){
  const found=[];
  let scanned=0;
  for(const dir of SEARCH_DIRS){
    for(const filename of filesUnder(path.join(REPO_ROOT,dir))){
      scanned++;
      const source=fs.readFileSync(filename,'utf8');
      const rel=path.relative(REPO_ROOT,filename).split(path.sep).join('/');
      let match;
      ATTACK_RE.lastIndex=0;
      while((match=ATTACK_RE.exec(source))!==null){
        const line=source.slice(0,match.index).split('\n').length;
        const text=source.split('\n').slice(line-1,line+2).join(' ');
        const evidence=proximityEvidence(source,line);
        found.push({
          path:rel,line,
          lexicalContextSha256:createHash('sha256').update(text).digest('hex'),
          nearbyConditionToken:evidence.localConditionTokensBefore||
            evidence.localConditionTokensAfter,
          fileHasConditionToken:evidence.fileHasConditionTokens,
          followup:'Inspect the entire immediate-actor action path and pinned Store semantics before claiming an illegal attack. A token nearby is neither sufficient nor necessary proof of guarding.'
        });
      }
    }
  }
  assert.ok(scanned>0,'No source files scanned');
  return {
    version:VERSION,scannedJavaScriptModules:scanned,
    explicitAttackConstructors:found.length,
    constructorsWithoutLocalConditionTokens:
      found.filter(x=>!x.nearbyConditionToken).length,
    findingScope:'syntactic inventory of direct new AttackAction(...) only',
    interpretation:'Potential review targets. Wrappers, upstream bot, conditions, conditional scopes, and indirect constructs are not resolved. Counts are not bugs or game outcomes.',
    records:found,
    competitiveQualifiedGames:0
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(inventoryScriptedNativeAttacks(),null,2)+'\n');
module.exports={VERSION,REPO_ROOT,SEARCH_DIRS,filesUnder,proximityEvidence,
  inventoryScriptedNativeAttacks};
