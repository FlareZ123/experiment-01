'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {projectPrompt}=require('./agent36-prompt-projection.cjs');
const {hisuianHeavyBallPrompt}=require('./agent8-rank30-clefairy-opponent-policy.cjs');

class ChooseCardsPrompt {
  constructor(playerId,cards) {
    this.id='agent8-heavy-ball-projector-smoke';
    this.playerId=playerId;
    this.result=undefined;
    this.message='CHOOSE_CARD_TO_HAND';
    this.cards={cards};
    this.options={min:0,max:1,allowCancel:false};
  }
  getPerspectivePlayerId(){return this.playerId;}
  decode(raw){return raw;}
  validate(raw){return Array.isArray(raw)&&raw.length<=1;}
}

function fixture() {
  const heavyBall={fullName:'Hisuian Heavy Ball ASR 146'};
  const activeClefairy={fullName:"Lillie's Clefairy ex JTG 56"};
  const prizeClefairy={fullName:"Lillie's Clefairy ex JTG 56"};
  const prizeLatias={fullName:'Latias ex SSP 76'};
  const state={
    phase:2,
    turn:4,
    players:[
      {
        id:'p0',
        hand:{cards:[]},
        deck:{cards:[]},
        discard:{cards:[]},
        lostzone:{cards:[]},
        stadium:{cards:[]},
        supporter:{cards:[heavyBall]},
        active:{cards:[activeClefairy],energies:{cards:[]},tools:[]},
        bench:[],
        prizes:[
          {cards:[prizeClefairy],faceUpPrize:true},
          {cards:[prizeLatias],faceUpPrize:true}
        ]
      },
      {
        id:'p1',
        hand:{cards:[]},
        deck:{cards:[]},
        discard:{cards:[]},
        lostzone:{cards:[]},
        stadium:{cards:[]},
        supporter:{cards:[]},
        active:{cards:[],energies:{cards:[]},tools:[]},
        bench:[],
        prizes:[]
      }
    ]
  };
  const prompt=new ChooseCardsPrompt('p0',[prizeClefairy,prizeLatias]);
  const projected=projectPrompt({
    prompt,
    state,
    actorSeat:0,
    native:{},
    provenanceHook:{
      getPromptProvenance:()=>({
        sourceKind:'card-effect',
        sourceCard:heavyBall,
        effectName:'HisuianHeavyBall'
      })
    }
  });
  const observation={
    actorSeat:0,
    globalTurn:4,
    decisionKind:'owner-root',
    ownHand:[],
    ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{
      active:{printing:activeClefairy.fullName,energies:[]},
      bench:[],
      discard:[],
      prizeCount:3,
      deckCount:20
    },
    opponentPublic:{active:{printing:'Shadow Rider Calyrex VMAX CRE 75'},bench:[]}
  };
  return {projected,observation,prizeClefairy,prizeLatias};
}

test('rank30 Heavy Ball consumes the current V3 actor-visible Prize projection',()=>{
  const {projected,observation,prizeClefairy}=fixture();
  const prompt=projected.promptProjection;
  assert.equal(projected.hostOnly,false);
  assert.equal(prompt.promptType,'ChooseCardsPrompt');
  assert.equal(prompt.source.sourcePrinting,'Hisuian Heavy Ball ASR 146');
  assert.equal(prompt.publicMetadata.sourceZone,'prizes');
  assert.equal(prompt.publicMetadata.ownerSeat,'actor');
  assert.equal(prompt.publicMetadata.isOwnerVisible,true);
  assert.equal(prompt.publicMetadata.minimumCount,0);
  assert.equal(prompt.publicMetadata.maximumCount,1);
  assert.equal(prompt.choices.find(choice=>choice.kind==='empty-selection')!==undefined,true);
  const decision=hisuianHeavyBallPrompt({observation,prompt});
  assert.deepEqual(decision,{kind:'select-choices',tokens:['prompt-0']});
  assert.equal(projected.choiceByToken.get(decision.tokens[0]),0);
  assert.equal(prompt.choices[0].printing,prizeClefairy.fullName);
});
