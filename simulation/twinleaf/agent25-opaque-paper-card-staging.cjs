'use strict';

/*
 * Research-owned, fail-closed opaque printing support for LOCALIZED native
 * Store witnesses only. Never use this for a qualified simulated game:
 * unknown printings have NO implemented text, are prohibited from play,
 * and must be quarantined in face-down deck/Prize zones. The original paper
 * identity remains visible to the test harness without pretending Twinleaf
 * supports the effects or substituting a different game card.
 */
const assert=require('node:assert/strict');

const OPAQUE_MARKER=Symbol.for('agent25.paper-opaque-printing-v1');

// The source manifest uses Limitless display "Grand Tree", while the pinned
// engine implements the same SCR 136 ACE SPEC Stadium as "Great Tree".
// Alias ONLY this exact printed set/number pair; never fuzzy-match names or
// substitute a different print with materially different mechanics.
const EXACT_PAPER_PRINTING_ALIASES=Object.freeze({
  'Grand Tree SCR':Object.freeze({
    nativeName:'Great Tree SCR',set:'SCR',number:'136'
  }),
  // Printed accented Pokémon is historically registered under ASCII Pokemon.
  // Agent6's native owner-root Ranger work uses Pokemon Ranger STS.
  'Pokémon Ranger STS':Object.freeze({
    nativeName:'Pokemon Ranger STS',set:'STS',number:'104'
  })
});

// Reprint semantics, not an exact-printing alias. Pinned actor-only Lillie
// studies use the M1L registration; the published Hood 60 uses MEG 119.
// Accept only if the actual native card text is independently equivalent to
// the supplied paper wording. Otherwise keep a quarantined opaque identity.
// No unverified full-game or original-printing equivalence is claimed.
function tryVerifiedLillieReprint(manager,row,requested){
  if(requested!=="Lillie's Determination MEG" ||
     String(row.printing?.number)!=='119')return null;
  const native=manager.getCardByName("Lillie's Determination M1L");
  if(!native)return null;
  const wording=String(native.text??'');
  if(!/shuffle your hand into your deck/i.test(wording) ||
     !/draw 6 cards/i.test(wording) ||
     !/6 Prize cards remaining/i.test(wording) ||
     !/draw 8 cards instead/i.test(wording))return null;
  return {card:native,alias:Object.freeze({
    sourcePrinting:requested,nativePrinting:native.fullName,
    sourcePrintId:'MEG 119',aliasKind:'verified-semantic-reprint',
    nativeEffectText:wording
  })};
}

function resolvePaperPrintedCard(manager,row){
  const requested=row.name+' '+row.printing.set;
  const exact=manager.getCardByName(requested);
  if(exact)return {card:exact,alias:null};
  const verifiedReprint=tryVerifiedLillieReprint(manager,row,requested);
  if(verifiedReprint)return verifiedReprint;
  const known=EXACT_PAPER_PRINTING_ALIASES[requested];
  if(!known)return {card:null,alias:null};
  const candidate=manager.getCardByName(known.nativeName);
  if(!candidate)return {card:null,alias:null};
  assert.equal(String(candidate.set).toUpperCase(),known.set);
  assert.equal(String(Number(candidate.setNumber)),known.number);
  assert.equal(String(Number(row.printing.number)),known.number);
  return {card:candidate,alias:Object.freeze({
    sourcePrinting:requested,nativePrinting:candidate.fullName,
    printId:known.set+' '+known.number
  })};
}


function opaquePaperCard(row,{PokemonCard,TrainerCard,EnergyCard}={}){
  assert.ok(row&&typeof row.name==='string'&&
    typeof row.printing?.set==='string');
  assert.ok(typeof PokemonCard==='function'&&
    typeof TrainerCard==='function'&&typeof EnergyCard==='function');
  const ctor={'Pokémon':PokemonCard,'Trainer':TrainerCard,'Energy':EnergyCard}[row.category];
  assert.ok(ctor,'unsupported paper category: '+row.category);
  const card=new ctor();
  const printing=row.name+' '+row.printing.set;
  Object.defineProperty(card,'name',{
    configurable:true,enumerable:true,writable:true,value:row.name
  });
  Object.defineProperty(card,'fullName',{
    configurable:true,enumerable:true,writable:true,value:printing
  });
  Object.defineProperty(card,OPAQUE_MARKER,{
    configurable:false,enumerable:false,writable:false,
    value:Object.freeze({category:row.category,printing,
      set:row.printing.set,number:row.printing.number??null})
  });
  // A non-participating placeholder can never impersonate a legal effect.
  Object.defineProperty(card,'canPlay',{
    configurable:true,enumerable:false,writable:false,
    value:()=>false
  });
  Object.defineProperty(card,'reduceEffect',{
    configurable:true,enumerable:false,writable:false,
    value:()=>{throw Object.assign(
      new Error('UNIMPLEMENTED_PAPER_PRINTING_EFFECT: '+printing),
      {code:'UNIMPLEMENTED_PAPER_PRINTING_EFFECT'})}
  });
  return card;
}

function getOpaque(card){
  return card&&typeof card==='object'?card[OPAQUE_MARKER]??null:null;
}

function assertOpaqueQuarantined(state){
  assert.ok(Array.isArray(state?.players)&&state.players.length===2);
  let quarantined=0;
  for(const [index,player] of state.players.entries()){
    const visible=[
      ...player.active.cards,
      ...player.active.energies.cards,
      ...player.active.tools,
      ...player.bench.flatMap(slot=>[
        ...slot.cards,...slot.energies.cards,...slot.tools
      ]),
      ...player.hand.cards,...player.discard.cards,
      ...player.stadium.cards,...player.supporter.cards
    ];
    const exposed=visible.filter(getOpaque);
    assert.equal(exposed.length,0,
      'seat '+index+' exposes unsupported opaque printing outside deck/prize: '+
      exposed.map(c=>getOpaque(c).printing).join(', '));
    quarantined+=player.deck.cards.filter(getOpaque).length;
    quarantined+=player.prizes.flatMap(prize=>prize.cards).filter(getOpaque).length;
  }
  return quarantined;
}

module.exports={OPAQUE_MARKER,EXACT_PAPER_PRINTING_ALIASES,resolvePaperPrintedCard,opaquePaperCard,getOpaque,assertOpaqueQuarantined};
