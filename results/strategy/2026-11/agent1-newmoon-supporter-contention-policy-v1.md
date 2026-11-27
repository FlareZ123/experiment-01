# New Moon Supporter Contention Policy v1

**Agent 1 · 27 November 2026**

New Moon's exact 60 contains only four Supporters: 2 Lillie's Determination and 2 Ace Trainer. The policy must treat the once-per-turn Supporter slot as a scarce action channel, not merely choose the highest draw count.

## 1. Ace Trainer is a state transition, not a generic draw Supporter

Ace Trainer is legal only while the candidate has **more Prize cards remaining** than the opponent.

When legal it simultaneously:

- shuffles the candidate hand into deck and draws 6;
- shuffles the opponent hand into deck and draws 3.

Its value is therefore highest when:

- candidate genuinely needs a hand reset;
- opponent has a large/high-value public or inferred hand size without relying on hidden identities;
- the line follows a Prize-state transition such as a non-KO Cursed Blast self-KO;
- the candidate can still attack after spending the Supporter.

Do not use Ace merely because it is legal if the current hand already contains the deterministic winning line.

## 2. Lillie's Determination is the unconditional reset

Lillie's Determination shuffles the entire hand into deck and draws 6, or 8 while the candidate has exactly six Prize cards remaining.

That gives it a strong turn-one / pre-Prize-taking ceiling, but the eight-card mode can disappear after **any** candidate Prize is taken.

Before taking an optional low-value early Prize, compare whether losing the draw-8 mode matters more than the Prize tempo. Do not decline a decisive/final Prize merely to preserve draw mode.

## 3. Cursed Blast -> Ace sequencing

From tied Prizes, candidate Dusclops Cursed Blast enables Ace only if the target **survives** the 50 counters or the candidate remains behind after all simultaneous Prize events.

Correct ordering:

1. choose Blast target using post-KO Prize arithmetic;
2. settle all KOs/Prize cards;
3. check Ace legality;
4. if legal, compare Ace against Lillie's Determination and no-Supporter continuation;
5. only then play a Supporter.

Do not reserve Ace before knowing whether the selected Cursed Blast target makes it legal.

## 4. Ace Trainer vs Night Watch hand pressure

Night Watch does 150 and shuffles two random cards from the opponent's hand into their deck.

If the candidate can legally play Ace first, the hand-compression sequence is:

`Ace -> opponent draws 3 -> Night Watch -> shuffle 2 random cards`.

That can leave the opponent with a one-card hand before its next normal draw, subject to any effects that add cards later.

This is a discrete control line. Its value is not captured by 'Ace draws six'.

Compare it against:

- Lillie's Determination draw 6/8 without opponent compression;
- immediate KO / final Prize;
- Horror House if preventing hand plays is stronger than shrinking the hand;
- a native/direct line when Perfection is suppressed.

## 5. Secret Box -> Supporter does not erase Supporter contention

Secret Box can search a Supporter, but the fetched Supporter still consumes the one Supporter play for the turn.

Reject Box value inflation when:

- a Supporter has already been played;
- Stoutland Sentinel is active;
- Ace is not legal after the actual Prize transition;
- the fetched Supporter is less valuable than preserving the three Box discards.

Under Stoutland lock, the Supporter search category can be immediate dead value even while the other Box categories are useful.

## 6. Supporter lock planning

Against rank 2, once Active Stoutland Sentinel is established:

- both Ace and Lillie's Determination are unusable;
- any hand plan that needs a Supporter must be executed **before** Stoutland becomes Active or after Stoutland leaves Active;
- the in-lock plan must use Energy/Tools/Stadiums/Abilities/attacks instead.

Therefore the turn before expected Stoutland promotion is a disappearing Supporter window.

## 7. Do not invent generic Expanded Supporters

The exact retained 60 has no Guzma, Professor's Research, N, Ranger or other generic Supporter answer.

Policy reasoning must remain fixed-list exact. If a line requires one of those cards, that is a deck-redesign proposal, not a legal current continuation.

## 8. Supporter-selection order

For every legal Supporter turn:

1. check immediate win / forced survival;
2. settle Prize transitions and determine Ace legality;
3. determine whether the Supporter window disappears next turn (e.g. Stoutland);
4. compare Ace / Lillie's / no-Supporter line by complete continuation, not draw count;
5. preserve the hand if it already contains the deterministic line;
6. only shuffle when the expected continuation improves.

## 9. Acceptance additions

- SUPPORTER-ACE-NIGHTWATCH: Ace legal and Night Watch payable. Credit the 3-card reset followed by two-card random shuffle as a distinct control line.
- SUPPORTER-LILLIE-EIGHT: candidate has exactly six Prizes and Lillie's Determination is legal. Use draw-8 value in the comparison; remove it after a Prize is taken.
- SUPPORTER-KEEP-WINNING-HAND: draw Supporter legal but current hand already contains a deterministic winning continuation. Do not shuffle solely for nominal card count.
- SUPPORTER-STOUTLAND-WINDOW: Stoutland is likely to become Active next opponent turn and candidate has a meaningful Supporter action now. Price the disappearing window before passing.
- BOX-SUPPORTER-SPENT: Secret Box available after Supporter already used. Do not count its Supporter category as playable this turn.

No deck change or competitive result follows.