
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
  if (/^Silent Lab\b/i.test(r17Stadium(view))) return true;
  for (const player of [own(view),opponent(view)]) {
    if (r17Key(active(player))==='klefki'&&!r17Suppressed(active(player),'Mischievous Lock')) return true;
    if (slots(player).some(p=>/^Garbodor\b/i.test(printingValue(p))&&
      list(p.tools).length>0&&list(p.abilities).includes('Garbotoxin')&&!r17Suppressed(p,'Garbotoxin'))) return true;
  }
  return false;
}
function r17UnownUseful(view) { return r17Deck(view)>=2&&!r17BasicLock(view); }
function r17NeedTempleRemoval(view) {
  return /^Temple of Sinnoh\b/i.test(r17Stadium(view));
}
function r17CarrierValue(key,view) {
  if (key==='voltorb'&&r17Missing(view,'voltorb','electrode')) return 300;
  if (key==='pikachu'&&r17Missing(view,'pikachu','raichu')) return 290;
  if (key==='unown'&&r17UnownUseful(view)&&r17Space(view)>0) return 150;
  if (key==='marshadow'&&r17NeedTempleRemoval(view)&&!r17Board(view,key)&&!r17Hand(view,key)) return 210;
  return 0; // Ditto is Lost Zone on discard; never assume it is recoverable.
}
function r17RecoveryValue(key,view) {
  if (key==='electrode'&&!r17Board(view,key)&&!r17Hand(view,key)&&r17Board(view,'voltorb')) return 320;
  if (key==='raichu'&&!r17Board(view,key)&&!r17Hand(view,key)&&r17Board(view,'pikachu')) return 320;
  if (key==='gengar'&&!r17Board(view,key)&&!r17Hand(view,key)&&!gxUsed(view)) return 120;
  return r17CarrierValue(key,view);
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
  if(!Number.isSafeInteger(m.minimumCount)||!Number.isSafeInteger(m.maximumCount)||
      m.minimumCount<0||m.maximumCount<m.minimumCount) return r17Abstain('R17_BAD_MULTI_BOUNDS');
  const selected=rows.slice(0,Math.min(m.maximumCount,limit));
  if(selected.length<m.minimumCount) return r17Abstain('R17_INSUFFICIENT_SUPPORTED_CHOICES');
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
function r17CarrierChoices(prompt,view,zone='discard') {
  const rows=r17UniqueCore(r17Rank(r17ChoiceCards(prompt,zone),c=>r17CarrierValue(r17Key(c),view)));
  return r17Multi(prompt,rows,2);
}
function r17CompressorUseful(view) {
  if(!itemAvailable(view)||!r17Hand(view,'carrier')||r17Space(view)===0) return false;
  if(r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0)) return false;
  return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')||
    (r17UnownUseful(view)&&!r17Hand(view,'unown')&&!r17Board(view,'unown'));
}
function r17VipValue(key,view) {
  if(key==='voltorb'&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode')&&!r17Hand(view,'voltorb'))return 300;
  if(key==='pikachu'&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu')&&!r17Hand(view,'pikachu'))return 290;
  if(key==='ditto'&&!r17Board(view,'ditto')&&!r17Hand(view,'ditto')&&
    (!r17Board(view,'electrode')||!r17Board(view,'raichu')))return 190;
  if(key==='unown'&&r17UnownUseful(view))return 150;
  if(key==='marshadow'&&r17NeedTempleRemoval(view)&&!r17Board(view,key))return 210;
  // Squawk and Seize is usable from play on own first turn, not a hand-play trigger.
  if(key==='squawk'&&r17First(view)&&!r17BasicLock(view)&&!r17Board(view,key)&&
     !r17Hand(view,key)&&handCount(view)<=2&&r17Deck(view)>=7)return 140;
  return 0;
}
function r17VipChoices(prompt,view) {
  const rows=r17UniqueCore(r17Rank(r17ChoiceCards(prompt,'deck'),c=>r17VipValue(r17Key(c),view)));
  return r17Multi(prompt,rows,Math.min(2,r17Space(view)));
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
  if(key==='carrier')return r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0)?260:90;
  if(key==='compressor')return r17CompressorUseful(view)?240:25;
  if(key==='stretcher')return r17Discard(view).some(c=>r17RecoveryValue(r17Key(c),view)>0)?230:70;
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
function r17OwnAbilitySlot(item,view) {
  const m=metadata(item);
  if(m.sourceSeat!=='actor'||m.sourceZone!=='bench')return null;
  const slot=r17Slot(view,m.sourceZone,m.sourceIndex);
  return slot&&r17Key(slot)===r17Key(item)?slot:null;
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
    return slot&&r17NeedTempleRemoval(view)&&!r17Suppressed(slot,name)&&
      list(slot.energies).length===0&&list(slot.tools).length===0?410:0;
  }
  if(key==='squawk'&&name==='Squawk and Seize')return r17First(view)&&r17Deck(view)>=7&&
    handCount(view)<=2&&!r17ProtectedHand(view)&&!r17BasicLock(view)?210:0;
  if(key==='ditto'&&name==='Almighty Evolution') {
    return (r17Hand(view,'electrode')&&!r17Board(view,'electrode')||
      r17Hand(view,'raichu')&&!r17Board(view,'raichu'))?220:0;
  }
  return 0;
}
function r17ScorePlay(item,view) {
  const k=r17Key(item),m=metadata(item),t=r17Key(item.targetPrinting);
  if(!k)return 0;
  if(R17_ITEM.has(k)&&!itemAvailable(view))return 0;
  if(R17_SUPPORTER.has(k)&&!supporterAvailable(view))return 0;
  if(k==='unown')return r17Space(view)>0&&r17UnownUseful(view)?240:0;
  if(k==='voltorb')return r17Space(view)>0&&!r17Board(view,'voltorb')&&!r17Board(view,'electrode')?320:0;
  if(k==='pikachu')return r17Space(view)>0&&!r17Board(view,'pikachu')&&!r17Board(view,'raichu')?310:0;
  if(k==='ditto')return r17Space(view)>0&&!r17Board(view,k)&&
    (!r17Board(view,'electrode')||!r17Board(view,'raichu'))?190:0;
  if(k==='electrode'||k==='raichu')return m.targetSeat==='actor'&&
    (k==='electrode'?t==='voltorb':t==='pikachu')?340:0;
  if(k==='marshadow')return r17Space(view)>0&&r17NeedTempleRemoval(view)&&!r17BasicLock(view)?300:0;
  if(k==='squawk')return r17Space(view)>0&&r17First(view)&&r17Deck(view)>=7&&
    handCount(view)<=3&&!r17ProtectedHand(view)&&!r17BasicLock(view)?190:0;
  if(k==='gengar')return r17Space(view)>0&&!r17Board(view,k)&&!gxUsed(view)&&r17Hand(view,'unit')?145:0;
  if(k==='vip')return r17First(view)&&r17Space(view)>0?350:0;
  if(k==='carrier')return r17Discard(view).some(c=>r17CarrierValue(r17Key(c),view)>0)?290:0;
  if(k==='compressor')return r17CompressorUseful(view)?250:0;
  if(k==='stretcher')return r17Discard(view).some(c=>r17RecoveryValue(r17Key(c),view)>0)?275:0;
  if(k==='mail')return r17Deck(view)>=2?175:0;
  if(k==='heavy')return r17Missing(view,'voltorb','electrode')||r17Missing(view,'pikachu','raichu')?160:0;
  if(k==='secret')return r17SafeDiscards(hand(view),view,'secret').length>=3?155:0;
  if(k==='research'||k==='carmine')return !r17ProtectedHand(view)&&handCount(view)<=3&&
    r17Deck(view)>=(k==='research'?8:6)?205:0;
  if(k==='pokestop'&&/^Sky Field\b/i.test(r17Stadium(view))&&benchCount(own(view))>5)return 0;
  if(k==='pokestop')return r17Deck(view)>=12&&!r17NeedTempleRemoval(view)&&
    !/^Pok[eé]Stop\b/i.test(r17Stadium(view))?110:r17NeedTempleRemoval(view)?300:0;
  if(k==='uturn') {
    const s=r17Slot(view,m.targetZone,m.targetIndex);
    return m.targetSeat==='actor'&&m.targetZone==='active'&&s&&list(s.tools).length===0&&
      list(s.printed?.retreatCost).length===1&&benchCount(own(view))>0?130:0;
  }
  if(k==='sight'||k==='ticket'||k==='klefki')return 0; // tactical paths not yet implemented.
  if(k==='rope')return 0; // do not spend irreversible forced switch without the paired opponent response.
  if(R17_ENERGY.has(k)&&m.targetSeat==='actor') {
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
  if(item.kind==='play-card')return r17ScorePlay(item,view);
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
  if(item.kind==='retreat'&&m.targetSeat==='actor'&&m.targetZone==='bench') {
    const s=r17Slot(view,'bench',m.targetIndex);
    if(s&&r17Key(s)==='raichu'&&list(s.energies).length>=1)return 115;
    if(s&&r17Key(s)==='gengar'&&list(s.energies).some(e=>r17Key(e)==='unit')&&!gxUsed(view))return 150;
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
    const rows=r17ChoiceCards(p,'hand').filter(c=>R17_BASIC.has(r17Key(c)));
    // Native order, not an assertion of optimal Active selection. Avoid
    // setup-only overcommitment of multi-Prize bodies; initial minimum=1.
    let picked=rows.filter(c=>!['gengar','squawk','klefki'].includes(r17Key(c)));
    if(metadata(p).minimumCount===1&&picked.length===0)picked=rows.slice(0,1);
    return r17Multi(p,picked);
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
      r17CarrierChoices(p,v,'deck'):r17Abstain('R17_COMPRESSOR_NO_CARRIER_PLAN');
    if(key==='vip')return r17VipChoices(p,v);
    if(key==='stretcher')return r17Multi(p,r17Rank(r17ChoiceCards(p,'discard'),c=>r17RecoveryValue(r17Key(c),v)),1);
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
        if(k==='raichu'&&!r17Board(v,'raichu'))return r17Board(v,'electrode')||r17Board(v,'voltorb')?240:180;
        if(k==='electrode'&&!r17Board(v,'electrode'))return r17Board(v,'raichu')||r17Board(v,'pikachu')?240:190;
        return 0;
      }),1);
    }
    if(key==='heavy')return r17Multi(p,r17Rank(r17ChoiceCards(p,'prizes'),c=>r17VipValue(r17Key(c),v)),1);
  }
  if(key==='stretcher'&&(type==='SelectOptionPrompt'||type==='SelectPrompt')) {
    // Exact printed option 0 is recover one to hand; shuffle-three mode
    // is deliberately unimplemented rather than guessed at its continuation.
    if(r17Discard(v).some(c=>r17RecoveryValue(r17Key(c),v)>0))return r17Option(p,0);
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
      return r17Multi(p,choices,metadata(p).minimumCount);
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
  planRainTurn:r17PlanRainTurn,energyProvision:r17EnergyProvision
});
