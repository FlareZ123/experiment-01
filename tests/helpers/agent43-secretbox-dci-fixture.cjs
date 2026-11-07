'use strict';
const BOX='Secret Box TWM';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const LILLIE="Lillie's Determination M1L";
const POWERGLASS='Powerglass SFA';
function card(fullName){return {fullName};}
function fixture(){
  const hand=[card(VIP),card(BOX),card(CARRIER),card(VIP),card(CARRIER),
    card(LILLIE),card(LILLIE),card(POWERGLASS),
    card('Forest Seal Stone SIT'),card('Mysterious Treasure FLI')];
  const owner={id:'candidate-seat1',hand:{cards:hand},
    discard:{cards:[card('Psychic Energy MEE'),card('Psychic Energy MEE')]},
    active:{energies:{cards:[]}},bench:[],supporterTurn:0};
  const state={turn:14};
  const prompt={sourceCard:{fullName:BOX},message:'CHOOSE_CARD_TO_DISCARD',
    playerId:owner.id,options:{min:3,max:3},
    cards:{cards:hand.filter(x=>x!==hand[1])},
    validate(selection,currentState=state){
      return currentState===state&&selection.length===3&&
        new Set(selection).size===3&&selection.every(x=>
          this.cards.cards.includes(x)&&owner.hand.cards.includes(x));
    }};
  return {hand,owner,state,prompt};
}
module.exports={BOX,VIP,CARRIER,LILLIE,POWERGLASS,fixture};
