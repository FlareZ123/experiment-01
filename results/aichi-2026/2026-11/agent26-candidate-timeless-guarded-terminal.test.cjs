const assert=require("node:assert/strict");
const {plan}=require("./agent26-candidate-timeless-guarded-terminal.cjs");
const target=(id,hp,prizes,dragon,effect=null)=>({id,hp,prizes,dragon,effect});
const base={board:[target("protected",280,2,true,"rolling"),target("second",280,2,true),target("Budew",30,1,false)],active:0,gust:1,ranger:0,gustExecutable:[true,true],fairy:true,gxUnused:true,radiantDonor:false,secondCopycat:true,maxGeist:true,psychic:5,rondo:false,ownBench:3,need:4};
const checks=[];
function ck(label,s,want){let a=plan(s);assert.equal(a.guaranteed,want,label);checks.push({label,guaranteed:a.guaranteed,example:a.winning[0]||a.routes[0]})}
ck("Rolling Iron, single gust, no Ranger",base,3);
ck("Hood Ranger first, saved gust second",{...base,ranger:1},4);
ck("Two independently executable Guzma turns",{...base,gust:2},4);
ck("Ranger but second gust unavailable",{...base,ranger:1,gustExecutable:[true,false]},3);
ck("No Fairy Zone",{...base,ranger:1,fairy:false},2);
ck("Covert Flight, one gust, no Ranger",{...base,board:[{...base.board[0],effect:"covert"},...base.board.slice(1)]},3);
ck("Covert Flight, Ranger first",{...base,board:[{...base.board[0],effect:"covert"},...base.board.slice(1)],ranger:1},4);
ck("No decoy, first gust leaves mandatory protected promotion",{...base,board:base.board.slice(0,2)},4);
ck("GX spent",{...base,gxUnused:false,ranger:1},1);
ck("Rondo after first KO, 5 combined bench fails full 280",{...base,ranger:1,maxGeist:false,rondo:true,ownBench:4},3);
ck("Rondo after first KO, 6 combined bench succeeds",{...base,ranger:1,maxGeist:false,rondo:true,ownBench:5},4);
ck("Radiant donor makes second Copycat competitive",{...base,ranger:1,maxGeist:false,radiantDonor:true},4);
console.log(JSON.stringify(checks,null,2));
