'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');

/** @typedef {{rank:number,seat:string,seed:number,champion:'0'|'1'|'?'|'X',hood:'0'|'1'|'?'|'X'}} Pair */

/** Parse immutable postgame-native outcomes; the original-run digest is in the header. 
 * @param {string} text */
function parse(text) {
  const rows = text.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const [rank,seat,seed,champion,hood,...extra] = line.trim().split(/\s+/);
      assert.equal(extra.length,0);
      assert.ok(['A','B'].includes(seat));
      assert.ok(['0','1','?','X'].includes(champion));
      assert.ok(['0','1','?','X'].includes(hood));
      assert.equal(champion==='X',hood==='X');
      assert.ok(Number.isSafeInteger(Number(rank))&&Number.isSafeInteger(Number(seed)));
      return {rank:Number(rank),seat,seed:Number(seed),champion,hood};
    });
  const keys=new Set(rows.map(r=>r.rank+':'+r.seat));
  assert.equal(keys.size,rows.length,'one observation per rank and physical candidate seat');
  return rows;
}

/**
 * Sharp matched native Hood-minus-champion win-count envelope without
 * missing-game assumptions. Unmatched physical source deals are excluded.
 * 0/1 is the native candidate loss/win; ? retains errors and root caps.
 * @param {Pair[]} pairs
 */
function analyze(pairs) {
  assert.ok(Array.isArray(pairs)&&pairs.length>0);
  const rows=pairs.map(p=>{
    if(p.champion==='X') return {...p,matched:false,lower:null,upper:null,status:'unmatched'};
    const a=p.champion==='?'?null:Number(p.champion);
    const b=p.hood==='?'?null:Number(p.hood);
    const lower=(b??0)-(a??1);
    const upper=(b??1)-(a??0);
    const status=a===null&&b===null?'both-unresolved':
      a===null?'champion-unresolved':b===null?'hood-unresolved':'both-terminal';
    return {...p,matched:true,lower,upper,status};
  });
  const matched=rows.filter(r=>r.matched);
  const sum=(rs,key)=>rs.reduce((total,r)=>total+r[key],0);
  const perRank=[...new Set(rows.map(r=>r.rank))].sort((a,b)=>a-b)
    .map(rank=>{
      const all=rows.filter(r=>r.rank===rank);
      const valid=all.filter(r=>r.matched);
      const lower=sum(valid,'lower'),upper=sum(valid,'upper');
      return {rank,matched:valid.length,unmatched:all.length-valid.length,
        bothTerminal:valid.filter(r=>r.status==='both-terminal').length,
        lower,upper,ambiguityWidth:upper-lower};
    });
  const counts=Object.fromEntries(['both-terminal','both-unresolved',
    'champion-unresolved','hood-unresolved','unmatched']
    .map(s=>[s,rows.filter(r=>r.status===s).length]));
  const lower=sum(matched,'lower'),upper=sum(matched,'upper');
  return {schema:'agent21-paired-native-win-envelope-v1',
    registered:rows.length,sourceMatched:matched.length,
    sourceUnmatched:rows.length-matched.length,statusCounts:counts,
    knownPairedDifference:sum(rows.filter(r=>r.status==='both-terminal'),'lower'),
    lower,upper,lowerPercentagePoints:100*lower/matched.length,
    upperPercentagePoints:100*upper/matched.length,
    perRank,rows,competitivePaperQualifiedGames:0};
}
if(require.main===module) {
  const file=process.argv[2];
  const data=parse(fs.readFileSync(file,'utf8'));
  process.stdout.write(JSON.stringify(analyze(data),null,2)+'\n');
}
module.exports={parse,analyze};
