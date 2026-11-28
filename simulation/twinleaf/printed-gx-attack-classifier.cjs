'use strict';

/**
 * Printed GX classifier for actor-visible attacks, independent of Twinleaf's
 * optional attack.gxAttack native metadata.
 *
 * Pinned Twinleaf a9905a76 has GX attacks for the 29-source-deck Aichi
 * environment whose native attack objects lack gxAttack:true: Pale Moon-GX,
 * Tingly Return-GX, Strafe-GX and Altered Creation-GX.
 *
 * An attack ending in -GX is a printed GX attack. A printed once-per-game
 * restriction is an independent signal. Unknown attack identity is null;
 * public consumers should fail closed, not treat missing metadata as non-GX.
 *
 * @returns {true|false|null}
 */
function classifyPrintedGXAttack(attack){
  if(attack?.gxAttack===true)return true;
  const name=typeof attack?.name==='string'&&attack.name.trim()?
    attack.name.trim():
    (typeof attack?.attackName==='string'&&attack.attackName.trim()?
      attack.attackName.trim():null);
  if(name===null)return null;
  const text=typeof attack?.text==='string'?attack.text:'';
  const restricted=/\b(?:you|each player)\s+can(?:not|'t|’t)\s+use\s+more\s+than\s+(?:one|1)\s+GX\s+attack\s+in\s+a\s+game\b/i.test(text);
  return /-GX$/i.test(name)||restricted;
}
module.exports={classifyPrintedGXAttack};
