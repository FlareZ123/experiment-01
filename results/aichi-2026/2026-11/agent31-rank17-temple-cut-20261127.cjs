'use strict';
// Exact-list conditional research oracle; NOT an actor-only production policy.
// Opponent identity must be legitimately known before treating this as a proof.
const binding={
  "sourceBlob": "ae773f6201d7aa69d31914dbfee66f3fba692200",
  "candidateBlob": "32557af137c70010970cde8dc5eaa1105935b59d",
  "rank": 17,
  "source": [
    [
      "Unown AOR 30",
      4
    ],
    [
      "Voltorb ROS 21",
      2
    ],
    [
      "Electrode-GX CES 48",
      3
    ],
    [
      "Pikachu XY 42",
      1
    ],
    [
      "Alolan Raichu UNM 57",
      2
    ],
    [
      "Squawkabilly ex PAL 169",
      2
    ],
    [
      "Gengar & Mimikyu-GX TEU 53",
      1
    ],
    [
      "Marshadow UNB 81",
      1
    ],
    [
      "Klefki SVI 96",
      1
    ],
    [
      "Ditto ♢ LOT 154",
      1
    ],
    [
      "Professor's Research JTG 155",
      3
    ],
    [
      "Carmine TWM 145",
      1
    ],
    [
      "Battle VIP Pass FST 225",
      4
    ],
    [
      "Battle Compressor PHF 92",
      4
    ],
    [
      "Rescue Carrier EVS 154",
      4
    ],
    [
      "Rescue Stretcher GRI 130",
      3
    ],
    [
      "Escape Rope BST 125",
      3
    ],
    [
      "Trainers' Mail ROS 92",
      2
    ],
    [
      "Redeemable Ticket JTG 156",
      1
    ],
    [
      "Secret Box TWM 163",
      1
    ],
    [
      "Hisuian Heavy Ball ASR 146",
      1
    ],
    [
      "U-Turn Board UNM 211",
      1
    ],
    [
      "Telescopic Sight VIV 160",
      1
    ],
    [
      "PokéStop PGO 68",
      1
    ],
    [
      "Reversal Energy PAL 192",
      4
    ],
    [
      "Counter Energy CIN 100",
      4
    ],
    [
      "Unit Energy LPM UPR 138",
      4
    ]
  ]
};
const M='Marshadow UNB 81',P='PokéStop PGO 68',T='Temple of Sinnoh ASR 155';
const attackRows=[
 ['Unown AOR 30','Hidden Power','C',10],
 ['Voltorb ROS 21','Thunder Wave','L',0],['Voltorb ROS 21','Big Explosion','LC',60],
 ['Electrode-GX CES 48','Electro Ball','LC',50],['Electrode-GX CES 48','Crush and Burn-GX','LC',null],
 ['Pikachu XY 42','Nuzzle','C',0],['Pikachu XY 42','Quick Attack','CC',30],
 ['Alolan Raichu UNM 57','Electro Rain','L',null],['Alolan Raichu UNM 57','Electric Ball','LCC',90],
 ['Squawkabilly ex PAL 169','Motivate','C',20],
 ['Gengar & Mimikyu-GX TEU 53','Poltergeist','PP',null],['Gengar & Mimikyu-GX TEU 53','Horror House-GX','P',0],
 ['Marshadow UNB 81','Red Knuckles','C',10],['Klefki SVI 96','Joust','C',10]
];
function plan(v){
 const failure=reason=>({certificate:false,reason});
 if(!v.exactRank17Known)return failure('source identity not established');
 if(v.directWin)return {certificate:false,reason:'take immediate win'};
 if(!['hand','stadium'].includes(v.temple))return failure('Temple unavailable');
 if(v.temple==='hand'&&(!v.canPlayTemple||v.stadiumEffectBlocked))return failure('Temple cannot be made live');
 if(v.temple==='stadium'&&v.stadiumEffectBlocked)return failure('Temple not live');
 if(!['stadium','discard','lost'].includes(v.pokestop))return failure('live or unaccounted Stadium answer');
 // Distinct Stadiums cannot be simultaneously in play.
 if(v.temple==='stadium'&&v.pokestop==='stadium')return failure('inconsistent Stadium custody');
 const steps=[];
 if(v.temple==='hand')steps.push('play Temple');
 if(v.marshadow!=='lost'){
   if(v.marshadow!=='discard')return failure('live or unaccounted Resetting Hole');
   if(!v.getLostLegal||v.girafarigAttackCanFail)return failure('cannot cut recovery before opponent turn');
   // Card text: put two cards, or as many as possible if fewer exist.
   if(!Number.isInteger(v.opponentDiscardCount)||v.opponentDiscardCount<1)return failure('invalid public discard');
   const count=v.opponentDiscardCount+Number(v.pokestop==='stadium'&&v.temple==='hand');
   steps.push('Get Lost: Marshadow + '+(count>=2?'best other legal target':'no second card exists'));
 }
 return {certificate:true,steps,meaning:'permanent printed colored-cost denial while preserving Temple, not a win guarantee'};
}
function residualAttacks(){
 return attackRows.filter(r=>!/[LP]/.test(r[2])&&r[0]!==M);
}
function test(){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const base={exactRank17Known:true,temple:'hand',canPlayTemple:true,pokestop:'stadium',marshadow:'discard',getLostLegal:true,opponentDiscardCount:3};
 let n=0;
 for(const temple of ['hand','stadium','discard','lost','deck','prize'])
 for(const pokestop of ['hand','deck','prize','stadium','discard','lost'])
 for(const marshadow of ['hand','deck','prize','active','bench','discard','lost'])
 for(const canPlayTemple of [false,true])
 for(const getLostLegal of [false,true]){
  const v={...base,temple,pokestop,marshadow,canPlayTemple,getLostLegal};
  const expected=(temple==='stadium'&&['discard','lost'].includes(pokestop)||temple==='hand'&&canPlayTemple&&['stadium','discard','lost'].includes(pokestop))&&(marshadow==='lost'||marshadow==='discard'&&getLostLegal);
  assert(plan(v).certificate===expected,JSON.stringify(v));n++;
 }
 for(const v of [{...base,directWin:true},{...base,exactRank17Known:false},{...base,stadiumEffectBlocked:true},{...base,girafarigAttackCanFail:true}]){
  assert(!plan(v).certificate,'guard');n++;
 }
 assert(plan({...base,pokestop:'lost',opponentDiscardCount:1}).steps[1].endsWith('no second card exists'),'single discard');n++;
 assert(plan({...base,marshadow:'lost',getLostLegal:false}).steps.length===1,'no needless attack');n++;
 assert(plan({...base,temple:'stadium',pokestop:'discard',marshadow:'lost'}).steps.length===0,'already established');n++;
 assert(residualAttacks().length===5,'residual attacks');n++;
 return {checks:n,blocked:attackRows.filter(r=>/[LP]/.test(r[2])).map(r=>r.slice(0,2)),residual:residualAttacks()};
}
if(typeof module!=='undefined')module.exports={plan,residualAttacks,test,binding};
if(typeof require!=='undefined'&&require.main===module)console.log(JSON.stringify(test(),null,2));
