'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {targetMatch}=require('./owner-public-discard-target-necessary.cjs');

const VERSION='agent15-native-public-exact-print-evidence-v1';

/**
 * Native card's native catalogue set/number is publicly inspectable when
 * that card is in the owner's public discard. It may be a synthetic code for
 * a physically unnumbered Japanese print (Palace Book SMP NAN25).
 * Do NOT describe this as a proven printed physical collector number.
 *
 * @param {object} card Native Card object in owner's public discard.
 */
function publicNativeCardIdentifier(card){
  assert.ok(typeof card?.fullName==='string'&&card.fullName.length>0);
  return {
    printing:card.fullName,
    nativeSet:typeof card.set==='string'?card.set:null,
    nativeSetNumber:card.setNumber===null||
      card.setNumber===undefined?null:String(card.setNumber),
    catalogueNumberIsPhysicalPrintCertified:false
  };
}

/**
 * Build a supplemental English exact native-set/number index.
 * Preserve ambiguous same-set same-number variants (e.g. PRC #60).
 * Keys are catalogue identifiers, not unquestioned Japanese card prints.
 * @param {object[]} sets Bundled English sets.
 * @param {{setId:string,cards:object[]}[]} englishSets Bundled English cards.
 */
function buildBundledExactPublicMetadata(sets,englishSets){
  assert.ok(Array.isArray(sets)&&Array.isArray(englishSets));
  const codes=new Map(sets.map(s=>[s.id,s.ptcgoCode]));
  const rows=new Map();
  for(const {setId,cards} of englishSets){
    const code=codes.get(setId);
    if(typeof code!=='string'||code.length===0)continue;
    assert.ok(Array.isArray(cards));
    for(const card of cards){
      if(card.number===undefined||card.number===null)continue;
      const key=code+'/'+String(card.number);
      const value={supertype:card.supertype,
        subtypes:card.subtypes??[],hp:card.hp??null,
        name:card.name};
      const entry=rows.get(key)??{variants:[]};
      if(!entry.variants.some(old=>JSON.stringify(old)===JSON.stringify(value)))
        entry.variants.push(value);
      rows.set(key,entry);
    }
  }
  return rows;
}

/**
 * @param {string} root Path to public resources/ directory.
 */
function loadBundledExactPublicMetadata(root){
  assert.equal(typeof root,'string');
  const sets=JSON.parse(fs.readFileSync(
    path.join(root,'sets','en.json'),'utf8'));
  const dir=path.join(root,'cards','en');
  const cardSets=fs.readdirSync(dir).filter(f=>f.endsWith('.json'))
    .sort().map(file=>({
      setId:file.slice(0,-5),
      cards:JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'))
    }));
  return buildBundledExactPublicMetadata(sets,cardSets);
}

/**
 * Read-only secondary evidence for every OWN PUBLIC discard card.
 * Any genuine repeated native exact ID with divergent printed classes
 * is UNKNOWN, never guessed from iteration order. Missing metadata remains
 * UNKNOWN and does not fall back to a speculative native effect verdict.
 * @param {object} view Frozen detached owner-root observation.
 * @param {object[]} nativeDiscardCards Genuine owner.discard.cards only.
 * @param {Map<string,object>} exactMetadata Bundled exact metadata.
 * @param {string} target Printed Trainer target category.
 */
function assessExactPublicDiscardTargets(view,nativeDiscardCards,exactMetadata,target){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(view.ownPublic?.discard));
  assert.ok(Array.isArray(nativeDiscardCards));
  assert.ok(exactMetadata instanceof Map);
  assert.equal(view.ownPublic.discard.length,nativeDiscardCards.length);
  return {
    version:VERSION,
    publicDiscardCards:nativeDiscardCards.map((card,index)=>{
      const identity=publicNativeCardIdentifier(card);
      assert.equal(identity.printing,view.ownPublic.discard[index],
        'Native public discard identity must match the detached observation');
      const key=identity.nativeSet&&identity.nativeSetNumber!==null?
        identity.nativeSet+'/'+identity.nativeSetNumber:null;
      const variants=key?exactMetadata.get(key):null;
      // Even with a keyed match, a native mismatch in name would invalidate
      // a claimed exact identity. File metadata aliases may differ by art/
      // translation, so on mismatch preserve UNKNOWN.
      const namesAgree=variants&&variants.variants.every(v=>
        v.name===card.name);
      const resolved=namesAgree?targetMatch(variants,target):null;
      return {...identity,index,exactMetadataKey:key,
        namesAgree:namesAgree===true,
        categoryMatchesTarget:resolved,
        exactCandidateVariants:variants?.variants.length??null,
        nativeEffectSettled:false,
        officialJapanesePrintEquivalent:false};
    }),
    paperLegalPlayCertified:false,
    nativeActionAccepted:false,
    actionPolicyChanged:false,
    opponentHiddenInformationUsed:false
  };
}
module.exports={VERSION,publicNativeCardIdentifier,
  buildBundledExactPublicMetadata,loadBundledExactPublicMetadata,
  assessExactPublicDiscardTargets};
