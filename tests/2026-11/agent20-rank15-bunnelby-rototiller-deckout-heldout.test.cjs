'use strict';

// Bunnelby PRC121 Rototiller returns a discarded card to the deck. If own
// deck count has reached 0/1 during our turn, conserving the next required
// draw can matter more than an optional nonterminal setup play.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const BUN='Bunnelby PRC 121', ELD='Eldegoss V RCL 19';
const card=(printing,extra={})=>({
  printing,tools:[],energies:[],hp:120,damage:0,
  printed:{stage:'BASIC'},...extra
});
function request(seat,{active=BUN,deck=1,discard=['Guzma BUS 115'],
  oppDeck=25,rotOffered=true}={}){
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:10,ownHand:[ELD],
      ownPublic:{active:card(active,{energies:['Grass Energy BLW 105']}),
        bench:[card('Oddish UNB 5')],prizeCount:3,stadium:[],
        deckCount:deck,discard
      },
      opponentPublic:{
        active:card('Shadow Rider Calyrex V CRE 74',{
          hp:210,damage:0
        }),
        bench:[card('Pidgey FLF 75')],prizeCount:3,
        deckCount:oppDeck,stadium:[]
      }
    },
    actionFrontier:{items:[
      ...(rotOffered?[{kind:'attack',token:'recover',
        attackName:'Rototiller'}]:[]),
      {kind:'play-card',token:'eldegoss',actorPrinting:ELD}
    ]}
  };
}
for(const seat of [0,1]){
  for(const [name,options,expected] of [
    ['zero deck cards left after draw must recover',
      {deck:0},'recover'],
    ['one deck card left, stabilize before next draw',
      {deck:1},'recover'],
    ['two deck cards left, setup line preferred',
      {deck:2},'eldegoss'],
    ['no discarded card to return, cannot invoke recovery',
      {deck:0,discard:[]},'eldegoss'],
    ['another active Basic cannot use Rototiller',
      {active:'Pidgey FLF 75',deck:0},'eldegoss'],
    ['without a natively offered Rototiller token, never invent it',
      {deck:0,rotOffered:false},'eldegoss'],
    ['opponent deck zero does not invalidate own deck survival',
      {deck:0,oppDeck:0},'recover']
  ]){
    test('seat '+seat+': '+name,()=>{
      const r=rootDecision(request(seat,options));
      assert.deepEqual(r,{kind:'select-action',token:expected});
    });
  }
}
