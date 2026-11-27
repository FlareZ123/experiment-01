'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const road=require('../simulation/evaluation/2026-11/agent23-rank19-roadblock.cjs');
const mon=printing=>({printing,tools:[],abilitySuppressions:[]});
const bolt=()=>mon('Raging Bolt ex TEF 123');
const clef=()=>mon("Lillie's Clefairy ex JTG 56");
const sudo=()=>mon('Sudowoodo GRI 66');
const wob=suppressed=>({...mon('Wobbuffet PHF 36'),abilitySuppressions:[{abilityName:'Bide Barricade',suppressed}]});
const enemyBench=()=>[mon('Shadow Rider Calyrex V CRE 74'),mon('Shadow Rider Calyrex VMAX CRE 75'),mon('Mimikyu GRI 58'),mon('Latias ex SSP 76'),mon('Girafarig LOT 94')];
const sourceBench=()=>[mon('Galarian Moltres V CRE 97'),mon('Dedenne-GX UNB 57'),mon('Latias ex SSP 76'),mon('Crobat V DAA 104')];
const action={kind:'play-card',actorPrinting:'Sudowoodo GRI 66',token:'sudo',publicMetadata:{handIndex:0,targetSeat:'actor',targetZone:'bench'}};
function req({active=bolt(),foe=clef(),ownBench=[],f=4,sky=false,hand=['Sudowoodo GRI 66'],items=[action]}={}){
 return {role:'opponent',seat:0,observation:{actorSeat:0,ownHand:hand,ownPublic:{active,bench:ownBench,stadium:[]},opponentPublic:{active:foe,bench:enemyBench().slice(0,f),stadium:sky?['Sky Field ROS 89']:[]}},actionFrontier:{items}};
}
const pick=r=>road.root(r)?.token;
test('cap fourth bench proactively',()=>assert.equal(pick(req()),'sudo'));
test('ordinary three benches preserve source slot',()=>assert.equal(pick(req({f:3})),undefined));
test('Sky Field at three benches triggers earlier cap',()=>assert.equal(pick(req({f:3,sky:true})),'sudo'));
test('five bench already exposed still cap',()=>assert.equal(pick(req({f:5})),'sudo'));
test('four occupied source slots preserve final slot',()=>assert.equal(pick(req({ownBench:sourceBench()})),undefined));
test('existing Sudowoodo does not duplicate',()=>assert.equal(pick(req({ownBench:[sudo()]})),undefined));
test('live active Wobbuffet prevents proactive Roadblock',()=>assert.equal(pick(req({foe:wob(false)})),undefined));
test('publicly suppressed Wobbuffet permits Roadblock',()=>assert.equal(pick(req({foe:wob(true)})),'sudo'));
test('unknown Wobbuffet state does not presume suppression',()=>assert.equal(pick(req({foe:mon('Wobbuffet PHF 36')})),undefined));
test('no main attacker preserve development slot',()=>assert.equal(pick(req({active:mon('Dedenne-GX UNB 57')})),undefined));
test('native root must be present',()=>assert.equal(pick(req({items:[]})),undefined));
test('matching visible held card is required',()=>assert.equal(pick(req({hand:['Quick Ball FST 237']})),undefined));
test('foreign target seat is rejected',()=>assert.equal(pick(req({items:[{...action,publicMetadata:{...action.publicMetadata,targetSeat:'opponent'}}]})),undefined));
