'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  resolveRulebookETerminalOutcome
}=require('../../simulation/twinleaf/agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs');

const cases=[
  {
    name:'neither took all; both can promote; game continues',
    youTookAllPrizes:false,opponentTookAllPrizes:false,
    youCanPromote:true,opponentCanPromote:true,expected:'ONGOING'
  },
  {
    name:'neither took all; you cannot promote',
    youTookAllPrizes:false,opponentTookAllPrizes:false,
    youCanPromote:false,opponentCanPromote:true,expected:'YOU_LOSE'
  },
  {
    name:'neither took all; opponent cannot promote',
    youTookAllPrizes:false,opponentTookAllPrizes:false,
    youCanPromote:true,opponentCanPromote:false,expected:'YOU_WIN'
  },
  {
    name:'neither took all; neither can promote; §E tie',
    youTookAllPrizes:false,opponentTookAllPrizes:false,
    youCanPromote:false,opponentCanPromote:false,expected:'DRAW'
  },
  {
    name:'you alone took all; both can promote; ordinary Prize win',
    youTookAllPrizes:true,opponentTookAllPrizes:false,
    youCanPromote:true,opponentCanPromote:true,expected:'YOU_WIN'
  },
  {
    name:'you alone took all; you cannot promote; opponent can; §E tie',
    youTookAllPrizes:true,opponentTookAllPrizes:false,
    youCanPromote:false,opponentCanPromote:true,expected:'DRAW'
  },
  {
    name:'you alone took all; you can promote; opponent cannot; §E you win',
    youTookAllPrizes:true,opponentTookAllPrizes:false,
    youCanPromote:true,opponentCanPromote:false,expected:'YOU_WIN'
  },
  {
    name:'you alone took all; neither can promote; §E you win',
    youTookAllPrizes:true,opponentTookAllPrizes:false,
    youCanPromote:false,opponentCanPromote:false,expected:'YOU_WIN'
  },
  {
    name:'opponent alone took all; both can promote; ordinary Prize loss',
    youTookAllPrizes:false,opponentTookAllPrizes:true,
    youCanPromote:true,opponentCanPromote:true,expected:'YOU_LOSE'
  },
  {
    name:'opponent alone took all; you can promote; opponent cannot; §E tie',
    youTookAllPrizes:false,opponentTookAllPrizes:true,
    youCanPromote:true,opponentCanPromote:false,expected:'DRAW'
  },
  {
    name:'opponent alone took all; you cannot promote; opponent can; §E you lose',
    youTookAllPrizes:false,opponentTookAllPrizes:true,
    youCanPromote:false,opponentCanPromote:true,expected:'YOU_LOSE'
  },
  {
    name:'opponent alone took all; neither can promote; §E you lose',
    youTookAllPrizes:false,opponentTookAllPrizes:true,
    youCanPromote:false,opponentCanPromote:false,expected:'YOU_LOSE'
  },
  {
    name:'both took all; both can promote; §E tie',
    youTookAllPrizes:true,opponentTookAllPrizes:true,
    youCanPromote:true,opponentCanPromote:true,expected:'DRAW'
  },
  {
    name:'both took all; you can promote; opponent cannot; §E you win',
    youTookAllPrizes:true,opponentTookAllPrizes:true,
    youCanPromote:true,opponentCanPromote:false,expected:'YOU_WIN'
  },
  {
    name:'both took all; you cannot promote; opponent can; §E you lose',
    youTookAllPrizes:true,opponentTookAllPrizes:true,
    youCanPromote:false,opponentCanPromote:true,expected:'YOU_LOSE'
  },
  {
    name:'both took all; neither can promote; §E tie',
    youTookAllPrizes:true,opponentTookAllPrizes:true,
    youCanPromote:false,opponentCanPromote:false,expected:'DRAW'
  }
];

test('Rulebook §E and ordinary terminal outcomes cover all 16 Boolean states',()=>{
  assert.equal(cases.length,16);
  for(const scenario of cases){
    const {name,expected,...conditions}=scenario;
    assert.equal(resolveRulebookETerminalOutcome(conditions),expected,name);
  }
});

test('swapping player perspective inverts wins and preserves draws/ongoing',()=>{
  for(const scenario of cases){
    const swapped=resolveRulebookETerminalOutcome({
      youTookAllPrizes:scenario.opponentTookAllPrizes,
      opponentTookAllPrizes:scenario.youTookAllPrizes,
      youCanPromote:scenario.opponentCanPromote,
      opponentCanPromote:scenario.youCanPromote
    });
    const expected=({
      YOU_WIN:'YOU_LOSE',
      YOU_LOSE:'YOU_WIN',
      DRAW:'DRAW',
      ONGOING:'ONGOING'
    })[scenario.expected];
    assert.equal(swapped,expected,scenario.name);
  }
});

test('requires four explicit Boolean conditions',()=>{
  assert.throws(()=>resolveRulebookETerminalOutcome({
    youTookAllPrizes:1,
    opponentTookAllPrizes:false,
    youCanPromote:true,
    opponentCanPromote:true
  }),/boolean/);
});
