
// Rank-17 extension. Concatenate after the immutable rank-4 v2 worker source.
// No imports or native state in the resulting worker. Shared helper functions
// and fixed-attack scoring are inherited from the rank-4 family prototype.
const R17_VERSION = 'agent50-rank17-raichu-electrode-opponent-v1';
const R17_PROFILE = Object.freeze({
  rank: 17,
  sourceListBlobSha1: 'ae773f6201d7aa69d31914dbfee66f3fba692200',
  sourceEntryJsonSha256: '41743dd93f080bff72981d0245b24df7615be3b1d3a03900e673a0dc2b6a2083',
  // SHA256 of compact JSON sorted by [name,set,number,language,count].
  inventoryTupleSha256: '2f23d234c18c648170dca695c51b64554af6f036c800fd9c34eb53b6dcba2ac0',
  familyBaseBlobSha1: '6897cd7f73ad8be8c01eafb97295fed6d74d376e',
  enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  configSha256: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
  config: Object.freeze({})
});

// Within this source-bound actor inventory, each name/set pair is unique.
// Accept actual Twinleaf fullName (normally name + set) and the corresponding
// explicit numbered printing. Reject any different explicit printing.
const R17_PRINT = Object.freeze({
  unown: /^Unown AOR(?: 30)?$/i,
  voltorb: /^Voltorb ROS(?: 21)?$/i,
  electrode: /^Electrode-GX CES(?: 48)?$/i,
  pikachu: /^Pikachu XY(?: 42)?$/i,
  raichu: /^Alolan Raichu UNM(?: 57)?$/i,
  squawk: /^Squawkabilly ex PAL(?: 169)?$/i,
  gengar: /^Gengar & Mimikyu-GX TEU(?: 53)?$/i,
  marshadow: /^Marshadow UNB(?: 81)?$/i,
  klefki: /^Klefki SVI(?: 96)?$/i,
  ditto: /^Ditto (?:♢|◇|Prism Star|\{\*\}) LOT(?: 154)?$/i,
  research: /^Professor['’]s Research JTG(?: 155)?$/i,
  carmine: /^Carmine TWM(?: 145)?$/i,
  vip: /^Battle VIP Pass FST(?: 225)?$/i,
  compressor: /^Battle Compressor(?: Team Flare Gear)? PHF(?: 92)?$/i,
  carrier: /^Rescue Carrier EVS(?: 154)?$/i,
  stretcher: /^Rescue Stretcher GRI(?: 130)?$/i,
  rope: /^Escape Rope BST(?: 125)?$/i,
  mail: /^Trainers['’] Mail ROS(?: 92)?$/i,
  ticket: /^Redeemable Ticket JTG(?: 156)?$/i,
  secret: /^Secret Box TWM(?: 163)?$/i,
  heavy: /^Hisuian Heavy Ball ASR(?: 146)?$/i,
  uturn: /^U-Turn Board UNM(?: 211)?$/i,
  sight: /^Telescopic Sight VIV(?: 160)?$/i,
  pokestop: /^Pok[eé]Stop PGO(?: 68)?$/i,
  reversal: /^Reversal Energy PAL(?: 192)?$/i,
  counter: /^Counter Energy CIN(?: 100)?$/i,
  unit: /^Unit Energy LPM UPR(?: 138)?$/i
});
const R17_BASIC = new Set(['unown','voltorb','pikachu','squawk','gengar','marshadow','klefki','ditto']);
const R17_POKEMON = new Set([...R17_BASIC,'raichu','electrode']);
const R17_ITEM = new Set(['vip','compressor','carrier','stretcher','rope','mail','ticket','secret','heavy']);
const R17_TOOL = new Set(['uturn','sight']);
const R17_SUPPORTER = new Set(['research','carmine']);
const R17_ENERGY = new Set(['unit','reversal','counter']);

function r17Key(value) {
  const text = printingValue(value);
  for (const [key, re] of Object.entries(R17_PRINT)) if (re.test(text)) return key;
  return null;
}
// Fixed own inventory only. K1 inference never consumes opponent hidden
// state, RNG, Prize order, or a native object. Missing/invalid certificate
// and any unresolved ownership discrepancy fail closed.
const R17_COUNTS=Object.freeze({
  unown:4,voltorb:2,electrode:3,pikachu:1,raichu:2,squawk:2,gengar:1,
  marshadow:1,klefki:1,ditto:1,research:3,carmine:1,vip:4,compressor:4,
  carrier:4,stretcher:3,rope:3,mail:2,ticket:1,secret:1,heavy:1,uturn:1,
  sight:1,pokestop:1,reversal:4,counter:4,unit:4
});
function r17CardCounts(rows) {
  if(!Array.isArray(rows))return null;
  const out={};
  for(const c of rows){const k=r17Key(c);if(!k)return null;out[k]=(out[k]||0)+1;}
  return out;
}
function r17SameCounts(a,b) {
  return Object.keys(R17_COUNTS).every(k=>(a[k]||0)===(b[k]||0));
}
function r17KnownOwnZones(view) {
  const p=own(view),k1=view.ownerK1;
  if(view.decisionKind!=='owner-root'||view.pendingPromptType!=null||
     !k1||k1.exactMembershipKnown!==true||k1.invalidationReason!==null||
     !Number.isSafeInteger(k1.epoch)||k1.epoch<0||!Array.isArray(k1.knownPrintings)||
     !Array.isArray(view.ownHand)||!Array.isArray(p.bench)||!Array.isArray(p.prizeSlots)||
     !Number.isSafeInteger(p.deckCount)||p.deckCount<0||
     !Number.isSafeInteger(p.prizeCount)||p.prizeCount<0||p.prizeCount>6||
     p.prizeSlots.length!==p.prizeCount||view.ownHand.length!==p.handCount||
     !Array.isArray(p.resolvingSupporter)||p.resolvingSupporter.length!==0)return null;
  const deck={},publicCounts={},lost={},prizes={...R17_COUNTS},faceUp={};
  function add(into,key,n=1){into[key]=(into[key]||0)+n;}
  function addRows(into,rows){
    const counts=r17CardCounts(rows);if(!counts)return false;
    for(const [k,n] of Object.entries(counts))add(into,k,n);
    return true;
  }
  for(const row of k1.knownPrintings){
    const key=r17Key(row?.printing);
    if(!key||!Number.isSafeInteger(row.copies)||row.copies<=0||
       Object.hasOwn(deck,key))return null;
    deck[key]=row.copies;
  }
  if(Object.values(deck).reduce((n,c)=>n+c,0)!==p.deckCount)return null;
  for(const zone of [view.ownHand,p.discard,p.stadium])
    if(!addRows(publicCounts,zone))return null;
  if(!addRows(lost,p.lostZone))return null;
  for(const slot of [p.active,...p.bench]){
    if(slot===null||slot===undefined)continue;
    const top=r17Key(slot),stack=r17CardCounts(slot.evolutionPrintings),
      energies=r17CardCounts(slot.energies),tools=r17CardCounts(slot.tools);
    if(!R17_POKEMON.has(top)||!stack||!energies||!tools||!(stack[top]>0))return null;
    const pokemon={},stackEnergy={},stackTools={};
    for(const [key,n] of Object.entries(stack)) {
      if(R17_POKEMON.has(key))pokemon[key]=n;
      else if(R17_ENERGY.has(key))stackEnergy[key]=n;
      else if(R17_TOOL.has(key))stackTools[key]=n;
      else return null;
    }
    const depth=Object.values(pokemon).reduce((n,c)=>n+c,0);
    if(depth<1||depth>2||
       Object.keys(energies).some(k=>!R17_ENERGY.has(k))||
       Object.keys(tools).some(k=>!R17_TOOL.has(k))||
       (Object.keys(stackEnergy).length&&!r17SameCounts(stackEnergy,energies))||
       (Object.keys(stackTools).length&&!r17SameCounts(stackTools,tools)))return null;
    // Evolution stack may duplicate attachment projections; count each
    // physical Pokémon and the authoritative attachment lists exactly once.
    for(const counts of [pokemon,energies,tools])
      for(const [key,n] of Object.entries(counts))add(publicCounts,key,n);
  }
  for(const key of Object.keys(R17_COUNTS)){
    prizes[key]-=(deck[key]||0)+(publicCounts[key]||0)+(lost[key]||0);
    if(prizes[key]<0)return null;
  }
  if(Object.values(prizes).reduce((n,c)=>n+c,0)!==p.prizeCount)return null;
  const indices=new Set();
  for(const slot of p.prizeSlots){
    if(!Number.isSafeInteger(slot?.index)||slot.index<0||slot.index>=6||indices.has(slot.index))return null;
    indices.add(slot.index);
    if(slot.printing!=null){
      const key=r17Key(slot.printing);if(!key)return null;add(faceUp,key);
    }
  }
  if(Object.entries(faceUp).some(([key,n])=>n>prizes[key]))return null;
  return {epoch:k1.epoch,deck,prizes,publicCounts,lost};
}
function r17TicketPlan(view) {
  const zones=r17KnownOwnZones(view),p=own(view);
  if(!zones||!itemAvailable(view)||!r17Hand(view,'ticket')||
     p.prizeCount===0||p.deckCount<p.prizeCount)return null;
  const isolated=key=>zones.prizes[key]>0&&(zones.deck[key]||0)===0&&
    (zones.publicCounts[key]||0)===0;
  const compressor=r17Hand(view,'compressor'),stretcher=r17HandCount(view,'stretcher'),
    carrier=r17HandCount(view,'carrier'),vip=r17First(view)&&r17Hand(view,'vip');
  // Ticket puts old Prizes at the bottom, NOT into hand. Require an
  // already-funded subsequent whole-deck search/recovery route.
  const evos=r17EvolutionDemand(view),discard=new Set(r17Discard(view).map(r17Key));
  const existingEvos=evos.filter(k=>discard.has(k)).length;
  for(const key of evos){
    if(isolated(key)&&compressor&&stretcher>existingEvos)
      return {target:key,followup:'compressor-stretcher',epoch:zones.epoch};
  }
  const missing=r17MissingCore(view),existingBases=missing.filter(k=>discard.has(k)).length;
  if(r17Space(view)>existingBases&&!r17Hand(view,'heavy')&&
     (!r17CoreBaseReady(view,'ditto')||r17AbilityBlocked(view,'ditto'))&&
     !(vip&&(zones.deck.ditto||0)>0&&!r17AbilityBlocked(view,'ditto'))){
    for(const key of missing){
      const carrierSlot=2*carrier>existingBases;
      const stretcherSlot=carrier===0&&stretcher>existingEvos+existingBases&&
        r17Hand(view,key==='pikachu'?'raichu':'electrode');
      if(isolated(key)&&(vip||compressor&&(carrierSlot||stretcherSlot)))
        return {target:key,followup:vip?'vip':carrierSlot?'compressor-carrier':'compressor-stretcher',epoch:zones.epoch};
    }
  }
  return null;
}
function r17Board(view,key) { return slots(own(view)).some(p=>r17Key(p)===key); }
function r17Hand(view,key) { return hand(view).some(p=>r17Key(p)===key); }
function r17Discard(view) { return list(own(view).discard); }
function r17Missing(view,basic,evolved) { return !r17Board(view,basic)&&!r17Board(view,evolved)&&!r17Hand(view,basic); }
function r17First(view) { return view.globalTurn===1||view.globalTurn===2; }
function r17Space(view) {
  const sky= [...list(own(view).stadium),...list(opponent(view).stadium)].some(c=>/^Sky Field ROS(?: 89)?$/i.test(printingValue(c)));
  return Math.max(0,(sky?8:5)-benchCount(own(view)));
}
function r17Deck(view) {
  const n=own(view).deckCount;
  return Number.isSafeInteger(n)&&n>=0?n:0;
}
function r17Suppressed(slot,name) {
  return list(slot?.abilitySuppressions).some(x=>x.abilityName===name&&x.suppressed===true);
}
function r17Stadium(view) {
  return [...list(own(view).stadium),...list(opponent(view).stadium)].map(printingValue).find(Boolean)||'';
}
function r17BasicLock(view) {
  if(r17StadiumToolLive(view)&&/^Silent Lab\b/i.test(r17Stadium(view)))return true;
  if(r17Garbotoxin(view))return true;
  if([own(view),opponent(view)].some(player=>r17LiveKlefki(view,active(player))))return true;
  if(slots(opponent(view)).some(p=>/^Alolan Muk\b/i.test(printingValue(p))&&
    list(p.abilities).includes('Power of Alchemy')&&!r17Suppressed(p,'Power of Alchemy')))return true;
  return false;
}
function r17IsWob(p) {return /^Wobbuffet PHF(?: 36)?$/i.test(printingValue(p));}
function r17LiveHood(view,p) {return r17StadiumToolLive(view)&&list(p?.tools).some(t=>/^Stealthy Hood UNB(?: 186)?$/i.test(printingValue(t)));}
function r17Garbotoxin(view) {
  return r17StadiumToolLive(view)&&[own(view),opponent(view)].some(player=>slots(player).some(p=>
    /^Garbodor\b/i.test(printingValue(p))&&list(p.tools).length>0&&
    list(p.abilities).includes('Garbotoxin')&&!r17Suppressed(p,'Garbotoxin')));
}
function r17LiveKlefki(view,p) {
  return r17Key(p)==='klefki'&&!r17Suppressed(p,'Mischievous Lock')&&
    !r17Garbotoxin(view)&&!(r17StadiumToolLive(view)&&/^Silent Lab\b/i.test(r17Stadium(view)));
}
function r17WobLive(view) {
  const wob=active(opponent(view));
  if(!r17IsWob(wob)||r17Suppressed(wob,'Bide Barricade')||r17Garbotoxin(view)||
    r17StadiumToolLive(view)&&/^Silent Lab\b/i.test(r17Stadium(view)))return false;
  // Psychic Klefki is not suppressed by Bide Barricade. Its Basic lock
  // suppresses the opposing Wobbuffet unless live Hood protects it.
  if(r17LiveKlefki(view,active(own(view)))&&!r17LiveHood(view,wob))return false;
  return true;
}
function r17AbilityBlocked(view,key,slot=null,name='') {
  if(slot&&name&&r17Suppressed(slot,name))return true;
  if(r17Garbotoxin(view))return true;
  const oppActive=active(opponent(view));
  if(/^Galarian Weezing\b/i.test(printingValue(oppActive))&&
     list(oppActive?.abilities).includes('Neutralizing Gas')&&!r17Suppressed(oppActive,'Neutralizing Gas'))return true;
  const ruleBox=key==='electrode'||key==='squawk';
  if(ruleBox&&r17StadiumToolLive(view)&&/^Path to the Peak\b/i.test(r17Stadium(view)))return true;
  if(key==='electrode'&&r17StadiumToolLive(view)&&/^Power Plant\b/i.test(r17Stadium(view)))return true;
  if(ruleBox&&/^Iron Thorns ex\b/i.test(printingValue(oppActive))&&
     list(oppActive?.abilities).includes('Initialization')&&!r17Suppressed(oppActive,'Initialization'))return true;
  if(['electrode','ditto','squawk'].includes(key)&&r17WobLive(view))return true;
  if(R17_BASIC.has(key)&&key!=='klefki'&&r17BasicLock(view))return true;
  return false;
}
function r17LiveBombs(view) {
  const o=opponent(view);
  if(!Number.isSafeInteger(o.prizeCount)||o.prizeCount<=2)return [];
  return slots(own(view)).filter(p=>r17Key(p)==='electrode'&&
    !r17AbilityBlocked(view,'electrode',p,'Extra Energy Bomb')).slice(0,Math.min(2,Math.floor((o.prizeCount-1)/2)));
}
function r17DepartingKlefkiRelocks(view) {
  const a=active(own(view)),w=active(opponent(view));
  return r17LiveKlefki(view,a)&&r17IsWob(w)&&!r17LiveHood(view,w)&&
    !r17WobLive(view)&&r17LiveBombs(view).length>0;
}
function r17UnownUseful(view) { return r17Deck(view)>=2&&!r17AbilityBlocked(view,'unown'); }
function r17StadiumToolLive(view) {
  return ![own(view),opponent(view)].some(p=>Number(p.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining)>0);
}
function r17NeedTempleRemoval(view) {
  return r17StadiumToolLive(view)&&/^Temple of Sinnoh\b/i.test(r17Stadium(view));
}
function r17CarrierValue(key,view) {
  if (key==='voltorb'&&r17Missing(view,'voltorb','electrode')) return 300;
  if (key==='pikachu'&&r17Missing(view,'pikachu','raichu')) return 290;
  if (key==='unown'&&r17UnownUseful(view)&&r17Space(view)>0) return 150;
  if (key==='marshadow'&&r17NeedTempleRemoval(view)&&!r17Board(view,key)&&!r17Hand(view,key)) return 210;
  return 0; // Ditto is Lost Zone on discard; never assume it is recoverable.
}
function r17HandCount(view,key) { return hand(view).filter(c=>r17Key(c)===key).length; }
function r17CoreBaseReady(view,key) {
  return r17Board(view,key)||(r17Hand(view,key)&&r17Space(view)>0);
}
function r17EvolutionDemand(view,plannedBasics=[]) {
  const demand=[];
  const ditto=r17CoreBaseReady(view,'ditto')&&!r17AbilityBlocked(view,'ditto');
  let dittoUsed=false;
  // First reserve an actual species-compatible base. Only the remaining
  // demand may consume a single Ditto; one Ditto never supplies two Stage 1s.
  for(const [e,b] of [['raichu','pikachu'],['electrode','voltorb']]) {
    if(r17Board(view,e)||r17Hand(view,e))continue;
    if(r17CoreBaseReady(view,b)||plannedBasics.includes(b))demand.push(e);
  }
  // If a held evolution already needs the single Ditto, reserve it.
  // A second evolution is not a second independent compatible base.
  if(ditto)dittoUsed=[['raichu','pikachu'],['electrode','voltorb']].some(([e,b])=>
    !r17Board(view,e)&&r17Hand(view,e)&&!r17CoreBaseReady(view,b)&&!plannedBasics.includes(b));
  for(const [e,b] of [['raichu','pikachu'],['electrode','voltorb']]) {
    if(!ditto||dittoUsed||r17Board(view,e)||r17Hand(view,e)||demand.includes(e))continue;
    demand.push(e);dittoUsed=true;
  }
  return demand;
}
function r17RecoveryValue(key,view) {
  const evolutions=r17EvolutionDemand(view);
  if(evolutions.includes(key))return key==='raichu'?335:330;
  if(key==='gengar'&&!r17Board(view,key)&&!r17Hand(view,key)&&!gxUsed(view))return 120;
  // A Carrier already in hand can retrieve low-HP Basics for two slots.
  // Do not spend the scarce one-card Stretcher on the same target if
  // Carrier is available; its future role is Stage 1 recovery.
  const basic=r17CarrierValue(key,view);
  if(basic>0&&r17Hand(view,'carrier'))return 0;
  return basic;
}
function r17ChoiceCards(prompt,zone) {
  return list(prompt.choices).filter(c=>c.kind==='card'&&typeof c.token==='string'&&
    metadata(c).ownerSeat==='actor'&&metadata(c).isOwnerVisible===true&&
    (!zone||metadata(c).sourceZone===zone)&&r17Key(c)!==null);
}
const R17_ABSTENTION_MAP=Object.freeze({
  R17_BAD_MULTI_PROMPT:'UNSUPPORTED_PROMPT_TYPE',R17_BAD_MULTI_BOUNDS:'BAD_CARD_SELECTION_BOUNDS',
  R17_INSUFFICIENT_SUPPORTED_CHOICES:'NO_LEGAL_CARD_SET',R17_NO_EMPTY_TOKEN:'NO_SUPPORTED_CARD_SELECTION',
  R17_CORE_COMBO_NOT_IMPLEMENTED:'NO_SUPPORTED_ROOT_ACTION',R17_NO_SUPPORTED_ROOT:'NO_SUPPORTED_ROOT_ACTION',
  R17_OPTION_UNAVAILABLE:'UNRECOGNIZED_SIMPLE_PROMPT',R17_BAD_SETUP:'UNTRUSTED_ENGINE_SETUP_PROMPT',
  R17_NO_GO_FIRST:'UNRECOGNIZED_GO_FIRST_CHOICES',R17_BAD_MULLIGAN_OPTION:'INVALID_MULLIGAN_DRAW_OPTIONS',
  R17_UNSUPPORTED_SETUP:'UNSUPPORTED_ENGINE_SETUP_PROMPT',R17_UNTRUSTED_PROMPT:'UNTRUSTED_PROMPT_SOURCE',
  R17_COMPRESSOR_NO_CARRIER_PLAN:'NO_SUPPORTED_CARD_SELECTION',R17_SECRET_BOX_UNKNOWN_ZONE:'UNTRUSTED_CARD_SELECTION',
  R17_CONFIRM_OPTION_MISSING:'UNRECOGNIZED_SIMPLE_PROMPT',R17_UNSUPPORTED_PROMPT:'UNSUPPORTED_PROMPT_TYPE',
  ROLE_SEAT_BINDING_MISMATCH:'ROLE_SEAT_BINDING_MISMATCH'
});
function r17Abstain(reasonCode) {
  return {kind:'abstain',reasonCode:R17_ABSTENTION_MAP[reasonCode]||'UNSUPPORTED_PROMPT_TYPE'};
}
function r17Multi(prompt,rows,limit=Infinity) {
  const m=metadata(prompt);
  if(m.selectionType!=='card-combination'&&m.selectionType!=='pokemon'&&m.selectionType!=='energy-payment'&&m.selectionType!=='prize-slots')
    return r17Abstain('R17_BAD_MULTI_PROMPT');
  const minimum=m.selectionType==='prize-slots'?m.requiredCount:m.minimumCount;
  const maximum=m.selectionType==='prize-slots'?m.requiredCount:m.maximumCount;
  if(!Number.isSafeInteger(minimum)||!Number.isSafeInteger(maximum)||
      minimum<0||maximum<minimum) return r17Abstain('R17_BAD_MULTI_BOUNDS');
  const selected=rows.slice(0,Math.min(maximum,limit));
  if(selected.length<minimum) return r17Abstain('R17_INSUFFICIENT_SUPPORTED_CHOICES');
  if(selected.length===0) {
    const empty=list(prompt.choices).find(c=>c.kind==='empty-selection');
    return empty?{kind:'select-choice',token:empty.token}:r17Abstain('R17_NO_EMPTY_TOKEN');
  }
  return {kind:'select-choices',tokens:selected.map(c=>c.token)};
}
function r17Rank(choices,score) {
  return choices.map((choice,index)=>({choice,index,score:score(choice)}))
    .filter(x=>Number.isFinite(x.score)&&x.score>0)
    .sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.choice);
}
function r17UniqueCore(rows) {
  const seen=new Set();
  return rows.filter(c=>{
    const k=r17Key(c);
    if(k==='unown')return true;
    if(seen.has(k))return false;
    seen.add(k);return true;
  });
}
function r17TakeKeys(cards,keys,limit=Infinity) {
  const remaining=cards.slice(),rows=[];
  for(const key of keys){
    if(rows.length>=limit)break;
    const i=remaining.findIndex(c=>r17Key(c)===key);
    if(i>=0)rows.push(...remaining.splice(i,1));
  }
  return rows;
}
function r17CarrierChoices(prompt,view,zone='discard') {
  const cards=r17ChoiceCards(prompt,zone),counts=r17CardCounts(cards)||{};
  const plan=r17CoreAccess(view,{}, {carrier:1,discardCounts:{voltorb:counts.voltorb||0,pikachu:counts.pikachu||0}});
  const rows=r17TakeKeys(cards,plan.carrierKeys,2),used=new Set(rows.map(c=>c.token));
  const fill=r17Rank(cards.filter(c=>!used.has(c.token)&&!R17_CORE_KEYS.includes(r17Key(c))),
    c=>r17CarrierValue(r17Key(c),view));
  return r17Multi(prompt,[...rows,...fill],2);
}
function r17StretcherChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'discard'),counts=r17CardCounts(cards)||{},discardCounts={};
  for(const key of R17_CORE_KEYS)discardCounts[key]=counts[key]||0;
  const plan=r17CoreAccess(view,{}, {stretcher:1,discardCounts});
  const rows=r17TakeKeys(cards,plan.stretcherKeys,1);
  if(rows.length)return r17Multi(prompt,rows,1);
  return r17Multi(prompt,r17Rank(cards.filter(c=>!R17_CORE_KEYS.includes(r17Key(c))),
    c=>r17RecoveryValue(r17Key(c),view)),1);
}
function r17MissingCore(view) {
  return [['voltorb','electrode'],['pikachu','raichu']].filter(([b,e])=>r17Missing(view,b,e)).map(([b])=>b);
}
function r17BoardCount(view,key) {return slots(own(view)).filter(p=>r17Key(p)===key).length;}
function r17SecondBombUseful(view) {
  const p=own(view),o=opponent(view);
  // Two Electrode self-KOs cost four opposing Prize cards. Do not set up
  // that second liability solely for the simultaneous combo when it would
  // already lose, or when too little Special Energy remains to benefit.
  const energyLost=list(p.lostZone).filter(c=>R17_ENERGY.has(r17Key(c))).length;
  return (view.phase===1||Number.isSafeInteger(o.prizeCount)&&o.prizeCount>=5&&
    Number.isSafeInteger(p.prizeCount)&&p.prizeCount>=4)&&12-energyLost>=6;
}
const R17_CORE_KEYS=Object.freeze(['voltorb','pikachu','raichu','electrode']);
function r17CoreSequence(n) {
  // First distinct species before duplicate copies, then second copies.
  // This order serves both physical prompt selection and Carrier capacity.
  const result=[];
  for(let i=1;i<=3;i++)for(const k of R17_CORE_KEYS)if((n[k]||0)>=i)result.push(k);
  return result;
}
function r17CoreAccess(view,deckCounts={},extra={}) {
  const desiredE=r17SecondBombUseful(view)?2:1,desiredR=1,space=r17Space(view);
  const b={},h={},d={...(r17CardCounts(r17Discard(view))||{}),...(extra.discardCounts||{})};
  for(const k of [...R17_CORE_KEYS,'ditto']){b[k]=r17BoardCount(view,k);h[k]=r17HandCount(view,k);}
  const carrier=2*(r17HandCount(view,'carrier')+(extra.carrier||0));
  const stretcher=r17HandCount(view,'stretcher')+(extra.stretcher||0);
  const max={
    voltorb:Math.max(0,desiredE-b.electrode-b.voltorb-h.voltorb),
    pikachu:Math.max(0,desiredR-b.raichu-b.pikachu-h.pikachu),
    electrode:Math.max(0,desiredE-b.electrode-h.electrode),
    raichu:Math.max(0,desiredR-b.raichu-h.raichu)
  };
  const budget=Math.min(3,Math.max(0,extra.searchLimit??3));
  const dittoEnabled=!r17AbilityBlocked(view,'ditto');
  let best=null;
  function compare(a,z){
    if(!z)return 1;
    for(let i=0;i<a.length;i++)if(a[i]!==z[i])return a[i]>z[i]?1:-1;
    return 0;
  }
  // Enumerate recovery counts, not card permutations: at most
  // 3*2*2*3=36 vectors. Derive the minimum Compressor search count and
  // exact Carrier/Stretcher consumption for each, then enumerate bench
  // placements and the mutually exclusive assignment of one Ditto.
  for(let v=0;v<=max.voltorb;v++)for(let p=0;p<=max.pikachu;p++)
    for(let r=0;r<=max.raichu;r++)for(let e=0;e<=max.electrode;e++){
      const rec={voltorb:v,pikachu:p,raichu:r,electrode:e},search={};
      const baseRec=v+p,evoRec=r+e,carrierUsed=Math.min(carrier,baseRec),
        stretcherUsed=evoRec+baseRec-carrierUsed;
      if(stretcherUsed>stretcher)continue;
      let valid=true,totalSearch=0;
      for(const key of R17_CORE_KEYS){
        const n=Math.max(0,rec[key]-(d[key]||0));
        if(n>(deckCounts[key]||0)){valid=false;break;}
        search[key]=n;totalSearch+=n;
      }
      if(!valid||totalSearch>budget)continue;
      for(let bv=0;bv<=Math.min(h.voltorb+v,space);bv++)
        for(let bp=0;bp<=Math.min(h.pikachu+p,space-bv);bp++)
          for(let bd=0;bd<=Math.min(dittoEnabled?h.ditto:0,space-bv-bp);bd++){
            const ditto=dittoEnabled?Math.min(1,b.ditto+bd):0;
            for(let de=0;de<=ditto;de++)for(let dr=0;dr<=ditto-de;dr++){
              const baseE=Math.min(desiredE,b.electrode+b.voltorb+bv+de);
              const baseR=Math.min(desiredR,b.raichu+b.pikachu+bp+dr);
              const readyE=Math.min(desiredE,b.electrode+Math.min(b.voltorb+bv+de,h.electrode+e));
              const readyR=Math.min(desiredR,b.raichu+Math.min(b.pikachu+bp+dr,h.raichu+r));
              const combo=Number(readyR>=1&&readyE>=1);
              const objective=[combo,Number(readyR>=1)+Number(readyE>=1),Number(readyR>=1),
                Number(baseR>=1)+Number(baseE>=1),Number(baseR>=1),
                Number(readyE>=2),Number(baseE>=2),
                -totalSearch,-(baseRec+evoRec),-stretcherUsed,-(de+dr),-(bv+bp+bd)];
              if(compare(objective,best?.objective)<=0)continue;
              const basicKeys=r17CoreSequence({voltorb:v,pikachu:p});
              best={objective,desiredE,readyE,readyR,baseE,baseR,
                searchKeys:r17CoreSequence(search),
                carrierKeys:basicKeys.slice(0,carrierUsed),
                stretcherKeys:[...r17CoreSequence({raichu:r,electrode:e}),...basicKeys.slice(carrierUsed)],
                placements:{voltorb:bv,pikachu:bp,ditto:bd},dittoAssignment:{electrode:de,raichu:dr}};
            }
          }
    }
  return best||{searchKeys:[],carrierKeys:[],stretcherKeys:[],placements:{voltorb:0,pikachu:0,ditto:0}};
}
function r17OptimisticDeck(view) {
  const z=r17KnownOwnZones(view);if(z)return z.deck;
  // K0: only upper bounds from own fixed inventory and already visible
  // copies. An actual deck-search prompt supplies exact available counts.
  const result={};
  const d=r17CardCounts(r17Discard(view))||{},lost=r17CardCounts(list(own(view).lostZone))||{};
  for(const k of R17_CORE_KEYS)result[k]=Math.max(0,R17_COUNTS[k]-r17BoardCount(view,k)-r17HandCount(view,k)-(d[k]||0)-(lost[k]||0));
  return result;
}
// Same-turn Energy search is evaluated against the immediate Prize exchange,
// not the number of cards discarded. K0 deck counts are upper bounds only;
// the actual search prompt re-solves against its legal physical choices.
const R17_ENERGY_PRINTING=Object.freeze({reversal:'Reversal Energy PAL',counter:'Counter Energy CIN',unit:'Unit Energy LPM UPR'});
function r17EnergyDeckBounds(view) {
  const z=r17KnownOwnZones(view);if(z)return z.deck;
  const counts={...R17_COUNTS};
  for(const c of [...hand(view),...r17Discard(view),...list(own(view).lostZone),
    ...slots(own(view)).flatMap(p=>list(p.energies))]){
    const key=r17Key(c);if(R17_ENERGY.has(key))counts[key]--;
  }
  return Object.fromEntries([...R17_ENERGY].map(k=>[k,Math.max(0,counts[k]||0)]));
}
function r17LoadPlan(view,p,deckCounts,maxLoad=3,options={}) {
  if(!r17RainWindow(view,p)||!r17LiveBombs(view).length||
    r17NeedTempleRemoval(view)&&!options.ignoreTemple)return null;
  const baseline=r17RainProjection(view,p,options);
  let best=null;
  const bound=k=>Math.max(0,Math.min(4,deckCounts[k]||0,maxLoad));
  for(let r=0;r<=bound('reversal');r++)for(let c=0;c<=bound('counter');c++)
    for(let u=0;u<=bound('unit');u++){
      const n=r+c+u;if(n===0||n>maxLoad)continue;
      const keys=[...Array(r).fill('reversal'),...Array(c).fill('counter'),...Array(u).fill('unit')];
      const projected=r17RainProjection(view,p,{...options,
        extraDiscard:[...list(options.extraDiscard),...keys.map(k=>R17_ENERGY_PRINTING[k])]});
      if(!projected||projected.bombs===0||r17CompareProjection(projected,baseline)<=0)continue;
      const compare=r17CompareProjection(projected,best?.projection);
      if(compare>0||(compare===0&&n<best.keys.length))best={keys,projection:projected};
    }
  return best;
}
function r17ActiveLoadPlan(view,deckCounts=null,searching=false) {
  const p=active(own(view));
  if(r17Key(p)!=='raichu'||!itemAvailable(view))return null;
  // During the choice prompt the current Compressor has left the hand.
  // Plan across distinct held copies, but spend at most three cards now.
  const copies=r17HandCount(view,'compressor')+Number(searching);
  if(copies<1)return null;
  const known=deckCounts||r17EnergyDeckBounds(view);
  const plan=r17LoadPlan(view,p,known,Math.min(12,copies*3));
  return plan?{...plan,now:plan.keys.slice(0,3)}:null;
}
function r17CompressorPlan(view,deckCounts=null,searching=false) {
  if(!itemAvailable(view))return [];
  const core=r17CoreAccess(view,deckCounts||r17OptimisticDeck(view)).searchKeys;
  const load=r17ActiveLoadPlan(view,deckCounts,searching);
  if(!load)return core;
  // A projected same-turn terminal or positive Prize trade precedes future
  // development only when Raichu and Bomb are already ready.
  return [...load.now,...core].slice(0,3);
}
function r17CompressorGain(view) {return r17CompressorPlan(view).length;}
function r17CompressorUseful(view) {
  if(!itemAvailable(view))return false;
  if(r17CompressorGain(view)>0)return true;
  if(!r17Hand(view,'carrier')||r17Space(view)===0)return false;
  if(r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0))return false;
  const z=r17KnownOwnZones(view);
  return r17UnownUseful(view)&&!r17Hand(view,'unown')&&!r17Board(view,'unown')&&(!z||(z.deck.unown||0)>0);
}
function r17CompressorChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'deck');
  const keys=r17CompressorPlan(view,r17CardCounts(cards)||{},true);
  if(keys.length) {
    const remaining=cards.slice(),rows=[];
    for(const key of keys){const index=remaining.findIndex(c=>r17Key(c)===key);if(index>=0)rows.push(...remaining.splice(index,1));}
    return r17Multi(prompt,rows,3);
  }
  const canRecycle=r17Hand(view,'carrier')&&r17Space(view)>0&&
    !r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0);
  return r17Multi(prompt,r17Rank(cards,c=>canRecycle&&
    r17Key(c)==='unown'&&r17UnownUseful(view)?150:0),2);
}
function r17VipValue(key,view) {
  if(key==='voltorb'){
    const n=r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode')+r17HandCount(view,'voltorb');
    if(n===0)return 300;
    if(n===1&&r17SecondBombUseful(view)&&
       (r17CoreBaseReady(view,'pikachu')||r17Board(view,'raichu')||r17CoreBaseReady(view,'ditto')))return 180;
  }
  if(key==='pikachu'&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu')&&!r17Hand(view,'pikachu'))return 290;
  if(key==='ditto'&&!r17Board(view,'ditto')&&!r17Hand(view,'ditto')&&!r17AbilityBlocked(view,'ditto')){
    if(r17MissingCore(view).length>0)return 190;
    if(r17SecondBombUseful(view)&&r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode')+r17HandCount(view,'voltorb')<2)return 165;
  }
  if(key==='unown'&&r17UnownUseful(view))return 150;
  if(key==='marshadow'&&r17NeedTempleRemoval(view)&&!r17Board(view,key))return 210;
  // Squawk and Seize is usable from play on own first turn, not a hand-play trigger.
  if(key==='squawk'&&r17First(view)&&!r17AbilityBlocked(view,'squawk')&&!r17Board(view,key)&&
     !r17Hand(view,key)&&handCount(view)<=2&&r17Deck(view)>=7)return 140;
  return 0;
}
function r17VipChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'deck'),rows=[],used=new Set();
  const heldV=r17HandCount(view,'voltorb'),heldP=r17HandCount(view,'pikachu');
  // Reserve room for already-held missing natural bases. A directly
  // Benched search target must not crowd out the other core line.
  const reserve=Number(heldV>0&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode'))+
    Number(heldP>0&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu'));
  const limit=Math.min(2,Math.max(0,r17Space(view)-reserve));
  const picked=k=>rows.filter(c=>r17Key(c)===k).length;
  const score=c=>{
    const key=r17Key(c);
    const v=r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode')+heldV+picked('voltorb');
    const p=r17BoardCount(view,'pikachu')+r17BoardCount(view,'raichu')+heldP+picked('pikachu');
    if(key==='voltorb')return v===0?300:v===1&&r17SecondBombUseful(view)&&(p>0||picked('ditto')>0||r17Board(view,'ditto'))?180:0;
    if(key==='pikachu')return p===0?290:0;
    if(key==='ditto')return !picked(key)&&!r17Board(view,key)&&!r17Hand(view,key)&&!r17AbilityBlocked(view,'ditto')?
      (p===0||v===0?190:r17SecondBombUseful(view)&&v<2?165:0):0;
    if(key!=='unown'&&picked(key))return 0;
    return r17VipValue(key,view);
  };
  while(rows.length<limit){
    const c=r17Rank(cards.filter(c=>!used.has(c.token)),score)[0];
    if(!c)break;
    rows.push(c);used.add(c.token);
  }
  return r17Multi(prompt,rows,limit);
}
function r17ProtectedHand(view) {
  return hand(view).some(c=>{
    const k=r17Key(c);
    return (k==='pikachu'&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu'))||
      (k==='voltorb'&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode'))||
      (k==='raichu'&&!r17Board(view,'raichu'))||(k==='electrode'&&!r17Board(view,'electrode'));
  });
}
function r17SafeDiscards(cards,view,excluded) {
  const counts=new Map();
  for(const c of hand(view)) {const k=r17Key(c);if(k)counts.set(k,(counts.get(k)||0)+1);}
  if(excluded) counts.set(excluded,Math.max(0,(counts.get(excluded)||0)-1));
  const ordered=cards.filter(c=>r17Key(c)).map((c,i)=>({c,i,k:r17Key(c)}))
    .sort((a,b)=>(Number(b.k==='vip'&&!r17First(view))-Number(a.k==='vip'&&!r17First(view)))||a.i-b.i);
  const picked=[];
  for(const row of ordered) {
    const n=counts.get(row.k)||0;
    if(row.k==='vip'&&!r17First(view)&&n>0 ||
       n>1&&(R17_ITEM.has(row.k)||R17_SUPPORTER.has(row.k)||R17_ENERGY.has(row.k))) {
      picked.push(row.c);counts.set(row.k,n-1);
    }
  }
  return picked;
}
function r17TrainerNeed(key,view) {
  if(key==='vip')return r17First(view)&&r17Space(view)>0?240:0;
  if(key==='carrier')return r17CoreAccess(view,{}, {carrier:1}).carrierKeys.length||
    r17Discard(view).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17CarrierValue(r17Key(c),view)>0)?260:90;
  if(key==='compressor')return r17CompressorUseful(view)?240:25;
  if(key==='stretcher')return r17CoreAccess(view,{}, {stretcher:1}).stretcherKeys.length||
    r17Discard(view).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17RecoveryValue(r17Key(c),view)>0)?230:70;
  if(key==='heavy')return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')?160:40;
  if(key==='research')return supporterAvailable(view)&&!r17Hand(view,'research')&&r17Deck(view)>=8?190:45;
  if(key==='carmine')return supporterAvailable(view)&&!r17Hand(view,'research')&&r17Deck(view)>=6?145:30;
  if(key==='rope')return r17Space(view)<5?90:45;
  if(key==='uturn')return 120;
  if(key==='sight')return 50;
  if(key==='pokestop')return r17Deck(view)>=12&&benchCount(own(view))<=5?110:0;
  return 0;
}
function r17SecretChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'deck'),groups=[R17_ITEM,R17_TOOL,R17_SUPPORTER,new Set(['pokestop'])],rows=[];
  for(const group of groups) {
    const ranked=r17Rank(cards.filter(c=>group.has(r17Key(c))),c=>r17TrainerNeed(r17Key(c),view));
    if(ranked[0])rows.push(ranked[0]);
  }
  return r17Multi(prompt,rows,4);
}
function r17Slot(view,zone,index) {
  if(zone==='active')return active(own(view));
  if(zone==='bench'&&Number.isSafeInteger(index)&&index>=0)return list(own(view).bench)[index];
  return null;
}
function r17OwnAbilitySlot(item,view,benchOnly=true) {
  const m=metadata(item);
  if(m.sourceSeat!=='actor'||benchOnly&&m.sourceZone!=='bench')return null;
  const slot=r17Slot(view,m.sourceZone,m.sourceIndex);
  return slot&&r17Key(slot)===r17Key(item)?slot:null;
}
function r17GengarReady(view,p) {
  if(r17Key(p)!=='gengar'||gxUsed(view)||r17NeedTempleRemoval(view)||
     Number(opponent(view).prizeCount)<=3||!list(p?.energies).some(e=>r17Key(e)==='unit')||
     view.globalTurn===1||own(view).publicTurnRestrictions?.cannotUseGXAttacks===true||
     Number(own(view).publicTurnRestrictions?.attackLockTurnsRemaining)>0||
     p.publicRestrictions?.cannotAttackNextTurn===true||
     list(p.publicRestrictions?.cannotUseAttacksNextTurn).includes('Horror House-GX')||
     p.publicRestrictions?.attackCostIncreaseWhileActive>0||p.publicRestrictions?.attackCostIncreaseNextTurn>0)
     return false;
  return true;
}
function r17FreeRetreat(item,view) {
  const m=metadata(item);
  if(m.freeRetreat===true||m.isFreeRetreat===true||m.retreatEnergyCost===0)return true;
  if(m.freeRetreat===false||m.isFreeRetreat===false||Number(m.retreatEnergyCost)>0)return false;
  const a=active(own(view)),cost=a?.printed?.retreatCost;
  if(!Array.isArray(cost))return false;
  if(cost.length===0)return true;
  return cost.length===1&&r17StadiumToolLive(view)&&list(a.tools).some(t=>r17Key(t)==='uturn');
}
// Narrow public-board tactical pressure model. It deliberately does not
// certify terminal wins: printed HP and visible Tools/Stadium do not prove
// every transient native damage modifier. Only exact known visible
// printings receive a price/hit estimate; other targets fail closed.
const R17_TARGET_ROWS=Object.freeze([
  [/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/i,3,true],
  [/^Shadow Rider Calyrex V CRE(?: 74)?$/i,2,true],
  [/^Lillie['’]s Clefairy ex JTG(?: 56)?$/i,2,false],
  [/^Tapu Lele-GX GRI(?: 60)?$/i,2,true],
  [/^Trevenant & Dusknoir-GX SMP(?: 217)?$/i,3,true],
  [/^Latias ex SSP(?: 76)?$/i,2,false],
  [/^Dialga-GX UPR(?: 100)?$/i,2,true],
  [/^Mimikyu GRI(?: 58)?$/i,1,false],
  [/^Girafarig LOT(?: 94)?$/i,1,false],
  [/^Marshadow UNB(?: 81)?$/i,1,false],
  [/^Radiant Eternatus CRZ(?: 105)?$/i,1,false],
  [/^Wobbuffet PHF(?: 36)?$/i,1,false]
]);
function r17RainWindow(view,p) {
  if(r17Key(p)!=='raichu'||view.globalTurn<2||
     own(view).publicTurnRestrictions?.attackLockTurnsRemaining>0||
     own(view).publicTurnRestrictions?.attackMaxEnergyTurnsRemaining>0||
     p.publicRestrictions?.cannotAttackNextTurn||
     p.publicRestrictions?.attackCostIncreaseNextTurn>0||
     p.publicRestrictions?.attackCostIncreaseWhileActive>0||
     list(p.publicRestrictions?.cannotUseAttacksNextTurn).includes('Electro Rain')||
     p.publicRestrictions?.blockedAttackNameNextTurn==='Electro Rain'||
     p.publicRestrictions?.blockedAttackNameUntilLeavesActive==='Electro Rain'||
     p.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
       p.publicRestrictions.onlyAllowedAttackNameNextTurn!=='Electro Rain'||
     list(p.specialConditions).length>0)return false;
  return true;
}
function r17RainCapacity(view,p,{extraDiscard=[],extraAttached=[],ignoreTemple=false}={}) {
  if(!r17RainWindow(view,p)||r17NeedTempleRemoval(view)&&!ignoreTemple)return [];
  const ownP=own(view).prizeCount,oppP=opponent(view).prizeCount;
  if(!Number.isSafeInteger(ownP)||!Number.isSafeInteger(oppP)||ownP<1||oppP<1)return [];
  const attached=[...list(p.energies),...extraAttached];
  if(attached.some(c=>!R17_ENERGY.has(r17Key(c))))return [];
  const discard=[...r17Discard(view).filter(c=>R17_ENERGY.has(r17Key(c))),...extraDiscard];
  if(discard.some(c=>!R17_ENERGY.has(r17Key(c))))return [];
  const result=[];
  for(let bombs=0;bombs<=r17LiveBombs(view).length;bombs++){
    const post=oppP-2*bombs;if(post<=0)continue;
    if(bombs>0&&discard.length<=5*(bombs-1))continue;
    const supply=c=>r17EnergyProvision(c,ownP,post,false)?.lightning||0;
    const loaded=discard.map(supply).sort((a,b)=>b-a).slice(0,5*bombs);
    const units=attached.reduce((n,c)=>n+supply(c),0)+loaded.reduce((n,c)=>n+c,0);
    if(units>0)result.push({bombs,units});
  }
  return result;
}
function r17VisibleRainTargets(view,p,forceSight=false) {
  const stad=r17Stadium(view);
  if(stad&&!/^(Sky Field ROS|Dimension Valley PHF|Temple of Sinnoh ASR|Pok[eé]Stop PGO)(?: \d+)?$/i.test(stad))return null;
  const sight=r17StadiumToolLive(view)&&(forceSight||list(p?.tools).some(c=>r17Key(c)==='sight'));
  const targets=[];
  for(const [zone,rows] of [['active',[active(opponent(view))]],['bench',list(opponent(view).bench)]]){
    for(let index=0;index<rows.length;index++){
      const q=rows[index];if(!q)continue;
      const row=R17_TARGET_ROWS.find(x=>x[0].test(printingValue(q)));
      if(!row||!Number.isSafeInteger(q.hp)||!Number.isSafeInteger(q.damage)||
         q.hp<=0||q.damage<0||q.damage>=q.hp||
         list(q.tools).some(t=>!/^(Stealthy Hood UNB|Forest Seal Stone SIT|Float Stone BKT)(?: \d+)?$/i.test(printingValue(t))))return null;
      const modifier=zone==='bench'&&sight&&row[2]?30:0;
      targets.push({zone,index,printing:printingValue(q),prizes:row[1],
        hits:Math.max(1,Math.ceil((q.hp-q.damage-modifier)/30))});
    }
  }
  return targets.length?targets:null;
}
function r17CompareProjection(a,b){
  if(!a)return -1;if(!b)return 1;
  const av=[Number(a.terminalProjection),a.netPrizeSwing,a.prizes,-a.bombs,-a.hitsRequired];
  const bv=[Number(b.terminalProjection),b.netPrizeSwing,b.prizes,-b.bombs,-b.hitsRequired];
  for(let i=0;i<av.length;i++)if(av[i]!==bv[i])return av[i]>bv[i]?1:-1;
  return 0;
}
function r17RainProjection(view,p,options={}) {
  const targets=r17VisibleRainTargets(view,p,options.forceSight===true);
  if(!targets||targets.length>9)return null;
  let best=null;
  for(const {bombs,units} of r17RainCapacity(view,p,options)){
    for(let mask=1;mask<(1<<targets.length);mask++){
      let prizes=0,hitsRequired=0,koCount=0;
      for(let i=0;i<targets.length;i++)if(mask&(1<<i)){
        prizes+=targets[i].prizes;hitsRequired+=targets[i].hits;koCount++;
      }
      if(hitsRequired>units)continue;
      const terminalProjection=prizes>=own(view).prizeCount||koCount===targets.length;
      const netPrizeSwing=Math.min(prizes,own(view).prizeCount)-2*bombs;
      if(!terminalProjection&&netPrizeSwing<=0)continue;
      const plan={terminalProjection,prizes:Math.min(prizes,own(view).prizeCount),
        netPrizeSwing,bombs,units,hitsRequired,assumption:'printed-HP-and-visible-tools-only'};
      if(r17CompareProjection(plan,best)>0)best=plan;
    }
  }
  return best;
}
function r17TempleAnswerPossible(view) {
  if(!r17NeedTempleRemoval(view))return true;
  const p=own(view),turn=view.ownTurnResources||{};
  if(r17Hand(view,'pokestop')&&!p.publicTurnRestrictions?.stadiumPlayLocked&&
     turn.stadiumPlayedTurn!==view.globalTurn)return true;
  if(!r17AbilityBlocked(view,'marshadow')&&
     (list(p.bench).some(q=>r17Key(q)==='marshadow'&&!r17AbilityBlocked(view,'marshadow',q,'Resetting Hole')&&
       list(q.energies).length===0&&list(q.tools).length===0)||
       r17Hand(view,'marshadow')&&r17Space(view)>0))return true;
  return false;
}
function r17ClearDepartedLock(slot,departed) {
  if(!slot||!Array.isArray(slot.abilitySuppressions))return slot;
  const names=new Set(departed.map(printingValue));
  return {...slot,abilitySuppressions:slot.abilitySuppressions.map(row=>
    row.suppressed===true&&names.has(row.sourcePrinting)?
      {...row,suppressed:null,reasonCode:null,sourcePrinting:null}:row)};
}
function r17SwitchProjection(view,nextOwn,nextOpponent) {
  const p=own(view),o=opponent(view),oldP=active(p),oldO=active(o);
  const departed=[oldP,oldO].filter((q,i)=>q&&q!==(i===0?nextOwn:nextOpponent));
  const moved=(player,next,old)=>{
    const bench=list(player.bench).map(q=>q===next?old:q);
    return {...player,active:r17ClearDepartedLock(next,departed),
      bench:bench.map(q=>r17ClearDepartedLock(q,departed))};
  };
  return {...view,ownPublic:moved(p,nextOwn,oldP),opponentPublic:moved(o,nextOpponent,oldO)};
}
function r17RopeRainPlan(request) {
  const v=request.observation,p=own(v),o=opponent(v),old=active(p);
  if(!itemAvailable(v)||v.globalTurn<2||r17Key(old)==='raichu'||
     !r17IsWob(active(o))||!list(o.bench).some(Boolean))return null;
  // If current Klefki is the only thing keeping Bomb live and a direct
  // free retreat is already available, preserve the lock until Bomb.
  if(r17DepartingKlefkiRelocks(v)&&list(request.actionFrontier?.items).some(a=>
    a.kind==='retreat'&&r17FreeRetreat(a,v)&&r17Key(a.targetPrinting)==='raichu'))return null;
  let best=null;
  for(const raichu of list(p.bench).filter(q=>r17Key(q)==='raichu')){
    let worst=null,valid=true;
    // Opponent chooses their own replacement. Do not assume they choose
    // the convenient one: every visible legal bench alternative must work.
    for(const next of list(o.bench).filter(Boolean)){
      const projected=r17SwitchProjection(v,raichu,next),nextR=active(own(projected));
      if(!r17LiveBombs(projected).length||!r17TempleAnswerPossible(projected)){valid=false;break;}
      const plan=r17RainProjection(projected,nextR,{ignoreTemple:r17NeedTempleRemoval(projected)});
      if(!plan){valid=false;break;}
      if(!worst||r17CompareProjection(plan,worst)<0)worst=plan;
    }
    if(valid&&worst&&(!best||r17CompareProjection(worst,best.plan)>0))best={raichu,plan:worst};
  }
  return best;
}
function r17RopeScore(request) {
  const v=request.observation;
  const rain=r17RopeRainPlan(request);if(rain)return 315;
  if(!itemAvailable(v)||v.globalTurn===1||!r17First(v)||r17GengarReady(v,active(own(v))))return 0;
  // Horror House locks cards from hand, not attacks/Abilities. Avoid
  // exposing a new three-Prize Active if the opposing public board is
  // already heavily energized. This is a conservative tempo heuristic.
  if(slots(opponent(v)).reduce((n,p)=>n+list(p.energies).length,0)>1)return 0;
  if(!list(own(v).bench).some(p=>r17GengarReady(v,p)))return 0;
  // Free retreat to the ready attacker dominates spending Rope and giving
  // the opponent a choice. Paid-retreat prompts are not allowlisted by the
  // current engine provenance projection; use Rope instead if needed.
  const hasFree=list(request.actionFrontier?.items).some(a=>
    a.kind==='retreat'&&metadata(a).targetSeat==='actor'&&
    r17GengarReady(v,r17Slot(v,'bench',metadata(a).targetIndex??metadata(a).benchIndex))&&r17FreeRetreat(a,v));
  return hasFree?0:230;
}
function r17SwitchValue(p,v) {
  if(r17GengarReady(v,p))return 300;
  const key=r17Key(p);
  const energies=list(p?.energies),units=energies.reduce((n,e)=>n+(r17EnergyProvision(e,own(v).prizeCount,opponent(v).prizeCount,r17NeedTempleRemoval(v))?.total||0),0);
  const lightning=energies.some(e=>(r17EnergyProvision(e,own(v).prizeCount,opponent(v).prizeCount,r17NeedTempleRemoval(v))?.lightning||0)>0);
  if(key==='raichu'&&r17RainProjection(v,p,{ignoreTemple:r17NeedTempleRemoval(v)&&r17TempleAnswerPossible(v)}))return 360;
  if(key==='raichu'&&units>=3&&lightning)return 240;
  if(key==='klefki'&&!r17Board(v,'unown')&&!r17NeedTempleRemoval(v)&&!r17Suppressed(p,'Mischievous Lock'))return 150;
  if(key==='unown')return 110;
  if(key==='marshadow'&&!r17NeedTempleRemoval(v))return 90;
  if(key==='voltorb')return r17Board(v,'electrode')?75:30;
  if(key==='pikachu')return r17Board(v,'raichu')?75:25;
  if(key==='ditto')return 20;
  if(key==='squawk')return 15;
  if(key==='electrode'||key==='raichu'||key==='gengar')return 5;
  return 0;
}
function r17SwitchChoices(prompt,view) {
  const rows=r17Rank(list(prompt.choices).filter(c=>{
    const m=metadata(c);
    if(c.kind!=='pokemon'||m.ownerSeat!=='actor'||m.targetZone!=='bench'||m.isOwnerVisible!==true)return false;
    const p=r17Slot(view,'bench',m.benchIndex);
    return p&&r17Key(p)!==null&&r17Key(p)===r17Key(c);
  }),c=>r17SwitchValue(r17Slot(view,'bench',metadata(c).benchIndex),view));
  return r17Multi(prompt,rows,1);
}
function r17DittoEvolutionScore(key,view) {
  if(key==='raichu'&&!r17Board(view,'raichu')&&!r17CoreBaseReady(view,'pikachu'))return 340;
  if(key==='electrode'){
    const need=(r17SecondBombUseful(view)?2:1)-r17BoardCount(view,'electrode');
    const natural=r17BoardCount(view,'voltorb')+r17HandCount(view,'voltorb');
    if(need>natural&&need>0)return r17Board(view,'electrode')?220:330;
  }
  return 0;
}
function r17ScoreAbility(item,view) {
  const key=r17Key(item),name=metadata(item).abilityName||'';
  if(name==='Extra Energy Bomb')return -1000;
  if(key==='unown'&&name==='Farewell Letter') {
    const slot=r17OwnAbilitySlot(item,view);
    return slot&&r17UnownUseful(view)&&!r17Suppressed(slot,name)&&
      list(slot.energies).length===0&&list(slot.tools).length===0?420:0;
  }
  if(key==='marshadow'&&name==='Resetting Hole') {
    const slot=r17OwnAbilitySlot(item,view);
    return slot&&r17NeedTempleRemoval(view)&&!r17AbilityBlocked(view,'marshadow',slot,name)&&
      list(slot.energies).length===0&&list(slot.tools).length===0?410:0;
  }
  if(key==='squawk'&&name==='Squawk and Seize'){
    const p=r17OwnAbilitySlot(item,view,false);
    return p&&!r17Suppressed(p,name)&&r17First(view)&&r17Deck(view)>=7&&
      handCount(view)<=2&&!r17ProtectedHand(view)&&!r17AbilityBlocked(view,'squawk',p,name)?210:0;
  }
  if(key==='ditto'&&name==='Almighty Evolution') {
    const p=r17OwnAbilitySlot(item,view,false);
    return p&&!r17AbilityBlocked(view,'ditto',p,name)&&
      ['raichu','electrode'].some(k=>r17Hand(view,k)&&r17DittoEvolutionScore(k,view)>0)?220:0;
  }
  return 0;
}
function r17ScorePlay(item,view) {
  const k=r17Key(item),m=metadata(item),t=r17Key(item.targetPrinting);
  if(!k)return 0;
  if(R17_ITEM.has(k)&&!itemAvailable(view))return 0;
  if(R17_SUPPORTER.has(k)&&!supporterAvailable(view))return 0;
  if(k==='unown')return r17Space(view)>0&&r17UnownUseful(view)?240:0;
  if(k==='voltorb'){
    const n=r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode');
    if(r17Space(view)>0&&n===0)return 320;
    const missingP=Number(!r17Board(view,'pikachu')&&!r17Board(view,'raichu')&&!r17Board(view,'ditto'));
    return n===1&&r17SecondBombUseful(view)&&r17Space(view)>missingP?185:0;
  }
  if(k==='pikachu')return r17Space(view)>0&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu')?310:0;
  if(k==='ditto')return r17Space(view)>0&&!r17Board(view,k)&&!r17AbilityBlocked(view,'ditto')?
    (r17MissingCore(view).length>0?190:r17SecondBombUseful(view)&&r17BoardCount(view,'voltorb')+r17BoardCount(view,'electrode')+r17HandCount(view,'voltorb')<2?165:0):0;
  if(k==='electrode'||k==='raichu')return m.targetSeat==='actor'&&
    (k==='electrode'?t==='voltorb'&&r17BoardCount(view,'electrode')<(r17SecondBombUseful(view)?2:1):
      t==='pikachu'&&!r17Board(view,'raichu'))?340:0;
  if(k==='marshadow')return r17Space(view)>0&&r17NeedTempleRemoval(view)&&!r17AbilityBlocked(view,'marshadow')?300:0;
  if(k==='squawk')return r17Space(view)>0&&r17First(view)&&r17Deck(view)>=7&&
    handCount(view)<=3&&!r17ProtectedHand(view)&&!r17AbilityBlocked(view,'squawk')?190:0;
  if(k==='gengar')return r17Space(view)>0&&!r17Board(view,k)&&!gxUsed(view)&&r17Hand(view,'unit')?145:0;
  if(k==='vip'){const z=r17KnownOwnZones(view);return r17First(view)&&r17Space(view)>0&&(!z||Object.keys(z.deck).some(k=>r17VipValue(k,view)>0))?350:0;}
  if(k==='carrier')return r17CoreAccess(view).carrierKeys.length||
    r17Discard(view).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17CarrierValue(r17Key(c),view)>0)?290:0;
  if(k==='compressor')return r17ActiveLoadPlan(view)?395:r17CompressorUseful(view)?(r17CompressorGain(view)>0?305:250):0;
  if(k==='stretcher')return r17CoreAccess(view).stretcherKeys.length||
    r17Discard(view).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17RecoveryValue(r17Key(c),view)>0)?275:0;
  if(k==='mail')return r17Deck(view)>=2?175:0;
  if(k==='heavy')return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')?160:0;
  if(k==='secret')return r17SafeDiscards(hand(view),view,'secret').length>=3?155:0;
  if(k==='research'||k==='carmine')return !r17ProtectedHand(view)&&handCount(view)<=3&&
    r17Deck(view)>=(k==='research'?8:6)?205:0;
  if(k==='pokestop'&&/^Sky Field\b/i.test(r17Stadium(view))&&benchCount(own(view))>5)return 0;
  if(k==='pokestop')return r17Deck(view)>=12&&!r17NeedTempleRemoval(view)&&
    !/^Pok[eé]Stop\b/i.test(r17Stadium(view))?110:r17NeedTempleRemoval(view)?300:0;
  if(k==='uturn') {
    if(!r17StadiumToolLive(view)||own(view).publicTurnRestrictions?.toolPlayLocked===true||view.ownTurnResources?.toolPlayLocked===true)return 0;
    const s=r17Slot(view,m.targetZone,m.targetIndex);
    return m.targetSeat==='actor'&&m.targetZone==='active'&&s&&list(s.tools).length===0&&
      list(s.printed?.retreatCost).length===1&&benchCount(own(view))>0?130:0;
  }
  if(k==='ticket')return r17TicketPlan(view)?390:0;
  if(k==='sight'){
    const p=r17Slot(view,m.targetZone,m.targetIndex);
    if(m.targetSeat!=='actor'||r17Key(p)!=='raichu'||list(p.tools).length||!r17StadiumToolLive(view)||own(view).publicTurnRestrictions?.toolPlayLocked||view.ownTurnResources?.toolPlayLocked)return 0;
    const baseline=r17RainProjection(view,p),boosted=r17RainProjection(view,p,{forceSight:true});
    if(boosted&&r17CompareProjection(boosted,baseline)>0)return 400;
    const bounds=r17EnergyDeckBounds(view),capacity=Math.min(12,3*r17HandCount(view,'compressor'));
    const base=r17LoadPlan(view,p,bounds,capacity),withSight=r17LoadPlan(view,p,bounds,capacity,{forceSight:true});
    return withSight&&r17CompareProjection(withSight.projection,base?.projection)>0?375:0;
  }
  if(k==='klefki')return 0;
  if(k==='rope')return 0; // do not spend irreversible forced switch without the paired opponent response.
  if(R17_ENERGY.has(k)&&m.targetSeat==='actor') {
    const p=r17Slot(view,m.targetZone,m.targetIndex);
    if(t==='raichu'&&r17Key(p)==='raichu'&&r17RainWindow(view,p)&&!r17NeedTempleRemoval(view)){
      const extraAttached=[R17_ENERGY_PRINTING[k]],baseline=r17RainProjection(view,p);
      const immediate=r17RainProjection(view,p,{extraAttached});
      if(immediate&&r17CompareProjection(immediate,baseline)>0)return 390+({reversal:3,counter:2,unit:1}[k]);
      const bounds=r17EnergyDeckBounds(view),capacity=Math.min(12,3*r17HandCount(view,'compressor'));
      const before=r17LoadPlan(view,p,bounds,capacity),after=r17LoadPlan(view,p,bounds,capacity,{extraAttached});
      if(after&&r17CompareProjection(after.projection,before?.projection)>0)return 365+({reversal:3,counter:2,unit:1}[k]);
    }
    if(t==='klefki'&&m.targetZone==='active'&&r17Key(p)==='klefki'&&
      r17IsWob(active(opponent(view)))&&r17LiveHood(view,active(opponent(view)))&&
      list(p.energies).length===0)return 260+({unit:3,counter:2,reversal:1}[k]);
    if(k==='unit'&&t==='gengar')return 210;
    if(t==='raichu'||t==='pikachu')return k==='unit'?190:
      Number.isSafeInteger(own(view).prizeCount)&&Number.isSafeInteger(opponent(view).prizeCount)&&
      own(view).prizeCount>opponent(view).prizeCount?180:0;
  }
  return 0;
}
function r17Score(item,request) {
  const view=request.observation,m=metadata(item);
  if(item.kind==='use-ability')return r17ScoreAbility(item,view);
  if(item.kind==='play-card')return r17Key(item)==='rope'?r17RopeScore(request):r17ScorePlay(item,view);
  if(item.kind==='use-stadium'&&r17Key(item)==='pokestop')return r17Deck(view)>=12&&m.stadiumEffectLive===true?125:0;
  if(item.kind==='attack') {
    const attack=item.attackName||'';
    if(!R17_POKEMON.has(r17Key(item)))return 0;
    if(/^(Electro Rain|Crush and Burn-GX)$/i.test(attack))return -1000;
    // Only these shared rank-4 attacks have an existing decision heuristic.
    if(/^(Horror House-GX|Poltergeist|Electric Ball|Electro Ball|Joust)$/i.test(attack))return scoreAttack(item,view);
    if(/^(Hidden Power|Quick Attack|Nuzzle|Thunder Wave|Red Knuckles|Big Explosion)$/i.test(attack))
      return attack==='Big Explosion'?0:35;
    return 0;
  }
  if(item.kind==='retreat'&&m.targetSeat==='actor'&&m.targetZone==='bench'&&r17FreeRetreat(item,view)) {
    const s=r17Slot(view,'bench',m.targetIndex??m.benchIndex);
    if(r17GengarReady(view,s)&&!r17GengarReady(view,active(own(view))))return 240;
    if(s&&r17Key(s)==='raichu'&&r17SwitchValue(s,view)>=240&&r17SwitchValue(active(own(view)),view)<240){
      // Departing Klefki would reactivate opposing Wob before Bomb.
      // Preserve the live connector if it can supply additional Energy.
      if(r17DepartingKlefkiRelocks(view)&&r17Discard(view).some(c=>R17_ENERGY.has(r17Key(c))))return 0;
      return 115;
    }
  }
  return 0;
}
function r17Best(request) {
  const items=list(request.actionFrontier?.items).filter(i=>EXECUTABLE.has(i.kind));
  const ranked=r17Rank(items,i=>r17Score(i,request));
  if(ranked[0])return {kind:'select-action',token:ranked[0].token};
  if(items.some(i=>r17Score(i,request)<0))return r17Abstain('R17_CORE_COMBO_NOT_IMPLEMENTED');
  const pass=items.find(i=>i.kind==='pass');
  return pass?{kind:'select-action',token:pass.token}:r17Abstain('R17_NO_SUPPORTED_ROOT');
}
function r17Option(prompt,index) {
  const c=list(prompt.choices).find(x=>x.kind==='option'&&metadata(x).choiceIndex===index);
  return c?{kind:'select-choice',token:c.token}:r17Abstain('R17_OPTION_UNAVAILABLE');
}
function r17SetupActiveValue(key,view) {
  const goingSecond=Number.isSafeInteger(view.turnSeat)&&view.turnSeat!==view.actorSeat;
  if(key==='gengar'&&goingSecond&&r17Hand(view,'unit'))return 1000;
  if(key==='klefki'){
    const mobility=r17Hand(view,'rope')||r17Hand(view,'uturn');
    const selfLock=r17Hand(view,'unown')||r17Hand(view,'squawk')||r17Hand(view,'ditto');
    if(mobility||!selfLock)return 800;
    return 400; // avoid trapping the own draw engine behind Basic lock
  }
  if(key==='unown')return 650;
  if(key==='marshadow')return 600;
  // Protect scarce species-compatible bases and multi-Prize support bodies.
  if(key==='voltorb')return 350;
  if(key==='ditto')return 300;
  if(key==='pikachu')return 250;
  if(key==='squawk')return 150;
  if(key==='gengar')return 100;
  return 0;
}
function r17SetupChoices(prompt,view) {
  const cards=r17ChoiceCards(prompt,'hand').filter(c=>R17_BASIC.has(r17Key(c)));
  const m=metadata(prompt),initial=m.minimumCount===1;
  const rows=[],used=new Set();
  const add=c=>{if(c&&!used.has(c.token)){rows.push(c);used.add(c.token);return true;}return false;};
  if(initial){
    if(!add(r17Rank(cards,c=>r17SetupActiveValue(r17Key(c),view))[0]))return r17Abstain('R17_BAD_SETUP');
  }
  const cap=Math.min(m.maximumCount,(initial?1:0)+r17Space(view));
  const count=k=>r17BoardCount(view,k)+rows.filter(c=>r17Key(c)===k).length;
  const find=k=>cards.find(c=>!used.has(c.token)&&r17Key(c)===k);
  const take=k=>rows.length<cap&&add(find(k));
  // Both natural core bases, then a second Electrode base when the four
  // Prize self-KO budget remains viable. A Ditto only fills one deficit.
  if(count('pikachu')+count('raichu')===0)take('pikachu');
  if(count('voltorb')+count('electrode')===0)take('voltorb');
  const needE=r17SecondBombUseful(view)?2:1;
  if(count('voltorb')+count('electrode')<needE&&
     (count('pikachu')+count('raichu')+count('ditto')>0))take('voltorb');
  if(count('ditto')===0&&
    (count('pikachu')+count('raichu')===0||count('voltorb')+count('electrode')<needE))take('ditto');
  const activeKey=initial?r17Key(rows[0]):r17Key(active(own(view)));
  // Keep space for a missing line rather than fill all five Bench slots.
  const reserve=Number(count('pikachu')+count('raichu')===0&&count('ditto')===0)+
    Number(count('voltorb')+count('electrode')===0);
  if(activeKey!=='klefki'){
    while(rows.length<cap-reserve&&count('unown')-(activeKey==='unown'?1:0)<2&&take('unown')){}
  }
  // If there is an actual second Basic available, do not begin with a
  // gratuitously sole Active. Prefer a one-Prize backup to support ex/GX.
  const alreadyBench=benchCount(own(view))+rows.length-(initial?1:0);
  if(alreadyBench===0&&rows.length<cap){
    for(const key of ['unown','marshadow','klefki','voltorb','pikachu','ditto','squawk','gengar'])
      if(take(key))break;
  }
  return r17Multi(prompt,rows);
}
function r17Setup(request) {
  const p=request.prompt,v=request.observation,s=p.source;
  if(v.phase!==1||s.sourcePrinting!==null||s.effectName!==p.description)return r17Abstain('R17_BAD_SETUP');
  if(s.effectName==='GO_FIRST'&&p.promptType==='ConfirmPrompt') {
    const c=list(p.choices).find(x=>x.kind==='confirm'&&x.label==='Yes');
    return c?{kind:'select-choice',token:c.token}:r17Abstain('R17_NO_GO_FIRST');
  }
  if(s.effectName==='WANT_TO_DRAW_CARDS'&&p.promptType==='SelectPrompt') {
    const count=metadata(p).count;
    const c=list(p.choices).find(x=>x.kind==='option'&&metadata(x).choiceIndex===0&&x.label==='Draw '+(count-1)+' card(s)');
    return Number.isSafeInteger(count)&&count>0&&c?{kind:'select-choice',token:c.token}:r17Abstain('R17_BAD_MULLIGAN_OPTION');
  }
  if(s.effectName==='CHOOSE_STARTING_POKEMONS'&&p.promptType==='ChooseCardsPrompt') {
    return r17SetupChoices(p,v);
  }
  return r17Abstain('R17_UNSUPPORTED_SETUP');
}
function r17Prompt(request) {
  const p=request.prompt,v=request.observation,s=p?.source;
  if(!s||s.classification!=='actor-choice')return r17Abstain('R17_UNTRUSTED_PROMPT');
  if(s.sourceKind==='engine')return r17Setup(request);
  if(s.sourceKind!=='card-effect')return r17Abstain('R17_UNTRUSTED_PROMPT');
  const key=r17Key(s.sourcePrinting),effect=s.effectName||'',type=p.promptType;
  if(/Extra Energy Bomb|Electro Rain|Crush and Burn/i.test(effect))return r17Abstain('R17_UNSUPPORTED_PROMPT');
  if(type==='ChooseCardsPrompt') {
    if(key==='carrier')return r17CarrierChoices(p,v);
    if(key==='compressor')return r17CompressorUseful(v)?
      r17CompressorChoices(p,v):r17Abstain('R17_COMPRESSOR_NO_CARRIER_PLAN');
    if(key==='vip')return r17VipChoices(p,v);
    if(key==='stretcher')return r17StretcherChoices(p,v);
    if(key==='mail')return r17Multi(p,r17Rank(r17ChoiceCards(p,'deck'),c=>r17TrainerNeed(r17Key(c),v)),1);
    if(key==='secret') {
      const zone=metadata(p).sourceZone;
      if(zone==='hand')return r17Multi(p,r17SafeDiscards(r17ChoiceCards(p,'hand'),v,null),3);
      if(zone==='deck')return r17SecretChoices(p,v);
      return r17Abstain('R17_SECRET_BOX_UNKNOWN_ZONE');
    }
    if(key==='ditto'&&effect==='Almighty Evolution') {
      return r17Multi(p,r17Rank(r17ChoiceCards(p,'hand'),c=>{
        const k=r17Key(c);
        return r17DittoEvolutionScore(k,v);
      }),1);
    }
    if(key==='heavy')return r17Multi(p,r17Rank(r17ChoiceCards(p,'prizes'),c=>r17VipValue(r17Key(c),v)),1);
  }
  if(key==='rope'&&type==='ChoosePokemonPrompt')return r17SwitchChoices(p,v);
  if(key==='stretcher'&&(type==='SelectOptionPrompt'||type==='SelectPrompt')) {
    // Exact printed option 0 is recover one to hand; shuffle-three mode
    // is deliberately unimplemented rather than guessed at its continuation.
    if(r17CoreAccess(v,{}, {stretcher:1}).stretcherKeys.length||r17Discard(v).some(c=>!R17_CORE_KEYS.includes(r17Key(c))&&r17RecoveryValue(r17Key(c),v)>0))return r17Option(p,0);
  }
  if((key==='unown'&&effect==='Farewell Letter'||key==='marshadow'&&effect==='Resetting Hole'||
      key==='squawk'&&effect==='Squawk and Seize')&&type==='ConfirmPrompt') {
    const ok=key==='unown'?r17UnownUseful(v):key==='marshadow'?r17NeedTempleRemoval(v):
      r17First(v)&&r17Deck(v)>=7&&!r17ProtectedHand(v);
    const c=list(p.choices).find(x=>x.kind==='confirm'&&x.label===(ok?'Yes':'No'));
    return c?{kind:'select-choice',token:c.token}:r17Abstain('R17_CONFIRM_OPTION_MISSING');
  }
  // Host projection for ordinary face-down Prize choice is opaque; no
  // hidden identity is inferred. Use position only for actual Prize-taking,
  // never for a Heavy Ball effect without visible owner-authorized identities.
  if(type==='ChoosePrizePrompt'&&key!=='heavy'&&key!=='ticket') {
    const choices=list(p.choices).filter(x=>x.kind==='prize'&&metadata(x).ownerSeat==='actor');
    if(choices.length&&metadata(p).selectionType==='prize-slots'&&R17_POKEMON.has(key))
      return r17Multi(p,choices,metadata(p).requiredCount);
  }
  return r17Abstain('R17_UNSUPPORTED_PROMPT');
}
function r17CreatePolicy({role,seat,policyVersion,config}) {
  if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==R17_VERSION||
     !config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).length)
    throw Error('AGENT50_RANK17_POLICY_INIT_MISMATCH');
  return Object.freeze({decide(request){
    if(!request||request.role!==role||request.seat!==seat||request.observation?.actorSeat!==seat)
      return r17Abstain('ROLE_SEAT_BINDING_MISMATCH');
    return request.prompt!==null?r17Prompt(request):r17Best(request);
  }});
}

// Pure source-family tactical kernel. It is NOT an engine adapter and is not
// called by createPolicy until the shared native Bomb/Rain prompt contract
// supports all mandatory continuations. Only immediate, fully specified
// attack windows are solved. Callers must establish legality, mobility,
// exact public HP/Prize values, and complete target modifiers.
function r17EnergyProvision(printing, ownPrizes, opponentPrizes, temple) {
  const k=r17Key(printing);
  if(!R17_ENERGY.has(k))return null;
  if(temple)return {lightning:0,total:1};
  if(k==='unit')return {lightning:1,total:1};
  if(ownPrizes>opponentPrizes) {
    const n=k==='reversal'?3:2;
    return {lightning:n,total:n};
  }
  return {lightning:0,total:1};
}
function r17Combinations(values,n) {
  const result=[];
  function visit(start,selected) {
    if(selected.length===n){result.push(selected.slice());return;}
    for(let i=start;i<=values.length-(n-selected.length);i++){
      selected.push(values[i]);visit(i+1,selected);selected.pop();
    }
  }
  visit(0,[]);
  return result;
}
function r17RainTargetCost(target,remainingEnergy,remainingSpecial) {
  if(!target.damageAllowed||
     target.requiresNoSpecialAttached&&remainingSpecial>0||
     remainingEnergy<target.minRemainingEnergy)return Infinity;
  // Attack damage, not counters. The flat modifier is applied once to a
  // targeted Pokemon, never multiplied by the number of selected hits.
  return Math.max(1,Math.ceil((target.remainingHp-target.flatDamageModifier)/30));
}
function r17RainCmp(a,b) {
  if(!b)return 1;
  // Within an immediate win, save the self-KOs and resources. Otherwise
  // optimize net immediate Prize swing, then denied threat and Prizes.
  const av=a.win?[1,-a.bombsUsed,-a.discardTokens.length,-a.lightningUnits,a.prizesTaken,a.threatRemoved]:
    [0,a.netPrizeSwing,a.threatRemoved,a.prizesTaken,-a.bombsUsed,-a.discardTokens.length,-a.lightningUnits];
  const bv=b.win?[1,-b.bombsUsed,-b.discardTokens.length,-b.lightningUnits,b.prizesTaken,b.threatRemoved]:
    [0,b.netPrizeSwing,b.threatRemoved,b.prizesTaken,-b.bombsUsed,-b.discardTokens.length,-b.lightningUnits];
  for(let i=0;i<av.length;i++)if(av[i]!==bv[i])return av[i]>bv[i]?1:-1;
  return 0;
}
function r17ValidateRainInput(input) {
  if(!input||input.attackWindowKnown!==true||input.modifiersComplete!==true||
     typeof input.temple!=='boolean'||!Number.isSafeInteger(input.ownPrizes)||
     input.ownPrizes<1||input.ownPrizes>6||
     !Number.isSafeInteger(input.opponentPrizes)||input.opponentPrizes<1||input.opponentPrizes>6||
     !Number.isSafeInteger(input.availableBombs)||input.availableBombs<0||input.availableBombs>2||
     !Array.isArray(input.attached)||!Array.isArray(input.discard)||
     input.attached.length+input.discard.length>12||!Array.isArray(input.targets)||
     input.targets.length<1||input.targets.length>9)return false;
  const tokens=new Set(),counts=new Map();
  for(const card of [...input.attached,...input.discard]){
    const k=r17Key(card?.printing);
    if(!R17_ENERGY.has(k)||typeof card.token!=='string'||!card.token||tokens.has(card.token))return false;
    tokens.add(card.token);counts.set(k,(counts.get(k)||0)+1);
    if(counts.get(k)>4)return false;
  }
  const ids=new Set();
  for(const t of input.targets){
    if(!t||typeof t.id!=='string'||!t.id||ids.has(t.id)||
       !Number.isSafeInteger(t.remainingHp)||t.remainingHp<=0||
       !Number.isSafeInteger(t.prizes)||t.prizes<0||t.prizes>6||
       !Number.isFinite(t.threat)||t.threat<0||
       typeof t.damageAllowed!=='boolean'||!Number.isSafeInteger(t.flatDamageModifier)||
       typeof t.requiresNoSpecialAttached!=='boolean'||
       !Number.isSafeInteger(t.minRemainingEnergy)||t.minRemainingEnergy<0)return false;
    ids.add(t.id);
  }
  return true;
}
function r17PlanRainTurn(input) {
  if(!r17ValidateRainInput(input))return {status:'unsupported-public-window'};
  const {ownPrizes,opponentPrizes,temple,attached,discard,targets}=input;
  if(temple)return {status:'no-lightning-under-temple'};
  let best=null;
  // An optional Bomb cannot be used if its own KO would end the game.
  // Each Bomb moves exactly min(5, available eligible Energy cards).
  // All moved cards are assigned to the single ready Raichu: this solves
  // immediate Rain only, not a future-turn allocation across attackers.
  for(let bombs=0;bombs<=input.availableBombs;bombs++){
    const enemyAfter=opponentPrizes-2*bombs;
    if(enemyAfter<=0)break;
    const nAttach=Math.min(discard.length,5*bombs);
    if(bombs>0&&(nAttach<=5*(bombs-1)))break;
    for(const load of r17Combinations(discard,nAttach)){
      const all=[...attached,...load].map(card=>({...card,...r17EnergyProvision(card.printing,ownPrizes,enemyAfter,temple)}));
      const lightning=all.filter(c=>c.lightning>0);
      if(!lightning.length)continue;
      const totalEnergy=all.reduce((n,c)=>n+c.total,0);
      // Bound: at most 12 exact Energy cards, 2^12 discard subsets and
      // at most 9 opposing Pokemon. Enumerate all feasible card subsets;
      // discard is in cards while Rain's available selections are units.
      for(let em=1;em<(1<<lightning.length);em++){
        const used=lightning.filter((_,i)=>em&(1<<i));
        const units=used.reduce((n,c)=>n+c.lightning,0);
        const remain=totalEnergy-used.reduce((n,c)=>n+c.total,0);
        const special=all.length-used.length;
        const costs=targets.map(t=>r17RainTargetCost(t,remain,special));
        for(let tm=1;tm<(1<<targets.length);tm++){
          let needed=0,prizes=0,threat=0;
          const hitRows=[];
          for(let i=0;i<targets.length;i++)if(tm&(1<<i)){
            needed+=costs[i];
            if(needed>units)break;
            prizes+=targets[i].prizes;threat+=targets[i].threat;
            hitRows.push({targetId:targets[i].id,hits:costs[i]});
          }
          if(needed>units)continue;
          const win=prizes>=ownPrizes||hitRows.length===targets.length;
          // A merely tied/lost Prize trade is not a recommended Bomb line.
          if(!win&&prizes<=2*bombs)continue;
          // All selected Lightning units must be assigned. Extra unavoidable
          // hits go to an already-KO target; never infer a new hidden effect.
          const plan={status:'immediate-ko-plan',win,bombsUsed:bombs,
            opponentPrizesAfterBomb:enemyAfter,attachTokens:load.map(c=>c.token),
            discardTokens:used.map(c=>c.token),lightningUnits:units,
            prizesTaken:Math.min(ownPrizes,prizes),netPrizeSwing:Math.min(ownPrizes,prizes)-2*bombs,
            threatRemoved:threat,allocation:hitRows.map((row,i)=>({...row,hits:row.hits+(i===0?units-needed:0)}))};
          if(r17RainCmp(plan,best)>0)best=plan;
        }
      }
    }
  }
  return best||{status:'no-favorable-immediate-ko'};
}

module.exports = Object.freeze({
  POLICY_VERSION:R17_VERSION,SOURCE_RANK:17,
  SOURCE_LIST_BLOB_SHA1:R17_PROFILE.sourceListBlobSha1,
  SOURCE_ENTRY_JSON_SHA256:R17_PROFILE.sourceEntryJsonSha256,
  ENGINE_PIN:R17_PROFILE.enginePin,PROFILE:R17_PROFILE,createPolicy:r17CreatePolicy,
  scoreAction:r17Score,promptDecision:r17Prompt,bestAction:r17Best,
  planRainTurn:r17PlanRainTurn,knownOwnZones:r17KnownOwnZones,ticketPlan:r17TicketPlan,planCoreAccess:r17CoreAccess,wobbuffetLive:r17WobLive,abilityBlocked:r17AbilityBlocked,liveBombs:r17LiveBombs,rainProjection:r17RainProjection,ropeRainPlan:r17RopeRainPlan,energyProvision:r17EnergyProvision,loadPlan:r17LoadPlan,activeLoadPlan:r17ActiveLoadPlan
});
