'use strict';
// Research-only stable-state terminal oracle. The caller must certify all
// attack permissions, W/R, damage modifiers/prevention, counter prevention,
// actual Energy units, Prize awards and absence of other relevant effects.
const CATALOG=Object.freeze({
 vmax:[['Max Geist',0,3,'geist']],
 v:[['Shadow Mist',1,0,'mist'],['Astral Barrage',0,3,'astral']],
 clefairy:[['Full Moon Rondo',1,1,'rondo']],
 lele:[['Energy Drive',0,2,'drive']],
 trev:[['Night Watch',3,0,'night']],
 latias:[['Eon Blade',2,1,'eon']],
 girafarig:[['Mind Shock',0,3,'mind']],
 marshadow:[['Red Knuckles',0,1,'red']],
 wobbuffet:[['Psychic Assault',1,1,'assault']],
 // History-dependent Copycat excluded; Dialga and Eternatus cannot pay
 // damaging attacks with Basic Psychic alone.
 mimikyu:[],dialga:[],eternatus:[],other:[]
});
const integer=n=>Number.isSafeInteger(n)&&n>=0;
function validate(m){
 if(!m||m.stable!==true||!Array.isArray(m.own)||!Array.isArray(m.opp)||
    m.own.length<1||m.own.length>9||m.opp.length<1||m.opp.length>9||
    !integer(m.remaining)||m.remaining<1||m.remaining>6)return false;
 for(const p of m.own)if(!Object.hasOwn(CATALOG,p.kind)||!Array.isArray(p.attacks)||
    p.attacks.some(a=>!CATALOG[p.kind].some(x=>x[0]===a)))return false;
 for(const t of m.opp)if(!integer(t.hp)||!t.hp||!integer(t.damage)||!integer(t.award)||!integer(t.energy)||
    ![1,2].includes(t.weak)||!integer(t.resist)||typeof t.ultra!=='boolean'||
    !Array.isArray(t.blockDamage)||!Array.isArray(t.blockCounters)||
    !Array.isArray(t.reduceDamage)||t.reduceDamage.length!==m.own.length||
    t.reduceDamage.some(n=>!integer(n))||
    [...t.blockDamage,...t.blockCounters].some(n=>!integer(n)||n>=m.own.length))return false;
 return true;
}
function payoff(m,placements){
 const ko=placements.filter(x=>x.amount>=m.opp[x.opp].hp).map(x=>x.opp);
 const prizes=ko.reduce((n,i)=>n+m.opp[i].award,0);
 return {ko,prizes,boardOut:ko.length===m.opp.length,terminal:prizes>=m.remaining||ko.length===m.opp.length};
}
function attacks(m,s){
 if(!validate(m)||!s||!integer(s.a)||s.a>=m.own.length||!integer(s.b)||s.b>=m.opp.length||
    !Array.isArray(s.es)||s.es.length!==m.own.length||s.es.some(n=>!integer(n))||![0,1].includes(s.discount))
    return {status:'unsupported',attacks:[]};
 const {a,b,es,discount}=s,own=m.own[a],t=m.opp[b],board=es.reduce((x,y)=>x+y,0),out=[];
 for(const [name,p,c,k] of CATALOG[own.kind]){
  if(!own.attacks.includes(name))continue;
  const cost=p+Math.max(0,c-discount);if(es[a]<cost)continue;
  if(k==='astral'){
   const pairs=[];if(m.opp.length===1)pairs.push([0]);else for(let i=0;i<m.opp.length;i++)for(let j=i+1;j<m.opp.length;j++)pairs.push([i,j]);
   for(const ids of pairs){const placements=ids.map(i=>({opp:i,amount:m.opp[i].blockCounters.includes(a)?0:50,type:'counters'}));out.push({name,cost,targets:ids,placements,...payoff(m,placements)});}
   continue;
  }
  const base=k==='geist'?10+30*board:k==='rondo'?20+20*(m.own.length+m.opp.length-2):k==='drive'?20*(es[a]+t.energy):
    k==='night'?150:k==='eon'?200:k==='mind'?70:k==='red'?10+(t.ultra?60:0):k==='assault'?10+t.damage:10;
  const ignore=k==='drive'||k==='mind';
  const damage=t.blockDamage.includes(a)?0:Math.max(0,base*(ignore?1:t.weak)-(ignore?0:t.resist)-t.reduceDamage[a]);
  const placements=[{opp:b,amount:damage,type:'damage'}];out.push({name,cost,targets:[b],placements,...payoff(m,placements)});
 }
 return {status:'ok',attacks:out};
}
function selfTest(){
 const slot=kind=>({kind,attacks:CATALOG[kind].map(x=>x[0])});
 const model=(own,opp,remaining=2)=>({stable:true,own:own.map(slot),remaining,opp:opp.map(t=>({hp:170,damage:0,award:2,energy:0,weak:1,resist:0,ultra:false,blockDamage:[],blockCounters:[],reduceDamage:Array(own.length).fill(0),...t}))});
 const p=(es,discount=0,a=0,b=0)=>({a,b,es,discount});
 let cases=0;
 function check(label,m,pos,name,expected,terminal,targets){
  const rows=attacks(m,pos).attacks.filter(x=>x.name===name&&(!targets||JSON.stringify(x.targets)===JSON.stringify(targets)));
  if(rows.length!==1||rows[0].placements.reduce((n,x)=>n+x.amount,0)!==expected||rows[0].terminal!==terminal)throw Error(label+': '+JSON.stringify(rows));
  cases++;
 }
 check('Geist 11',model(['vmax','vmax'],[{hp:320,award:3}],3),p([6,5]),'Max Geist',340,true);
 check('Geist 10',model(['vmax','vmax'],[{hp:320,award:3}],3),p([5,5]),'Max Geist',310,false);
 check('Rondo bench',model(['clefairy','v','lele'],[{hp:100},{},{},{}]),p([2,0,0]),'Full Moon Rondo',120,true);
 check('Rondo Fairy Zone',model(['clefairy','v','lele'],[{hp:240,weak:2},{},{},{}]),p([2,0,0]),'Full Moon Rondo',240,true);
 check('Drive units ignores W/R',model(['lele'],[{hp:180,energy:7,weak:2,resist:30}]),p([2]),'Energy Drive',180,true);
 check('Night Watch',model(['trev'],[{hp:150}]),p([3],1),'Night Watch',150,true);
 if(attacks(model(['trev'],[{}]),p([2],1)).attacks.length)throw Error('discount triple Psychic');cases++;
 check('Eon',model(['latias'],[{hp:200}]),p([2],1),'Eon Blade',200,true);
 check('Mind ignores W/R',model(['girafarig'],[{hp:70,weak:2,resist:30}]),p([2],1),'Mind Shock',70,true);
 check('Red Knuckles UB',model(['marshadow'],[{hp:70,ultra:true}]),p([0],1),'Red Knuckles',70,true);
 check('Assault counters',model(['wobbuffet'],[{hp:100,damage:90}]),p([1],1),'Psychic Assault',100,true);
 check('Shadow Mist',model(['v'],[{hp:10}]),p([1],1),'Shadow Mist',10,true);
 check('Astral damage immunity irrelevant',model(['v'],[{hp:30,award:1,blockDamage:[0]},{hp:50,award:1,weak:2,resist:30}]),p([2],1),'Astral Barrage',100,true,[0,1]);
 check('Astral effect protection',model(['v'],[{hp:30,award:1,blockCounters:[0]},{hp:50,award:1}]),p([3]),'Astral Barrage',50,false,[0,1]);
 check('Astral only one',model(['v'],[{hp:50,award:1}],6),p([3]),'Astral Barrage',50,true,[0]);
 check('Astral board out',model(['v'],[{hp:30,award:1},{hp:50,award:1}],6),p([3]),'Astral Barrage',100,true,[0,1]);
 check('Astral distinct',model(['v'],[{hp:90,award:1},{hp:50,award:1},{hp:50,award:1}],2),p([3]),'Astral Barrage',100,true,[1,2]);
 check('Damage prevention',model(['vmax'],[{hp:170,blockDamage:[0]},{hp:170}]),p([6]),'Max Geist',0,false);
 check('Damage reduction',model(['vmax'],[{hp:170,reduceDamage:[30]},{hp:170}]),p([6]),'Max Geist',160,false);
 check('Board-out zero prizes',model(['latias'],[{hp:170,award:0}],6),p([3]),'Eon Blade',200,true);
 check('KO zero prizes',model(['latias'],[{hp:170,award:0},{}],1),p([3]),'Eon Blade',200,false);
 if(attacks(model(['mimikyu'],[{}]),p([2])).attacks.length)throw Error('Copycat unsupported');cases++;
 const m=model(['vmax'],[{}]);m.stable=false;if(attacks(m,p([6])).status!=='unsupported')throw Error('unstable');cases++;
 let pairs=0;
 for(let bits=0;bits<256;bits++)for(let rem=1;rem<=6;rem++){
  const ts=Array.from({length:4},(_,i)=>({hp:(bits>>i)&1?50:60,award:1+i%3,blockCounters:(bits>>(i+4))&1?[0]:[]}));
  const a=attacks(model(['v'],ts,rem),p([3])).attacks.filter(x=>x.name==='Astral Barrage');
  const amounts=ts.map(t=>t.hp<=50&&!t.blockCounters.length?t.award:0).sort((x,y)=>y-x);
  if(a.length!==6||a.some(x=>x.targets[0]===x.targets[1])||a.some(x=>x.terminal)!==(amounts[0]+amounts[1]>=rem))throw Error('pair formula');
  pairs++;
 }
 return {cases,pairFormulaChecks:pairs};
}
module.exports={CATALOG,validate,attacks,selfTest};
if(typeof require!=='undefined'&&require.main===module)console.log(JSON.stringify(selfTest()));
