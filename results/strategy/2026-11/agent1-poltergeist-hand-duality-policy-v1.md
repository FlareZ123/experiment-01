# Poltergeist / Hand-Size Duality Policy v1

**Agent 1 · 27 November 2026**

New Moon has two strategically opposite hand-control modes:

- shrink the opponent hand with Ace Trainer + Night Watch;
- enlarge/freeze the opponent hand with extra-Psychic Horror House to improve the next Poltergeist opportunity.

A competent policy must choose between them. 'Smaller opponent hand is always better' is false for a Poltergeist deck.

## 1. Actor-visible Poltergeist bounds

Gengar & Mimikyu-GX Poltergeist reveals the opponent's hand and does 50 damage for each Trainer card found there.

Before declaring the attack, hidden card identities are not available.

If the public hand size is `H`, the hard actor-visible bounds are:

- minimum damage: `0`, unless specific current hand identities are legally known;
- maximum damage: `50H`.

Therefore:

- H=1 -> max 50;
- H=2 -> max 100;
- H=3 -> max 150;
- H=4 -> max 200;
- H=5 -> max 250;
- H=6 -> max 300;
- H=7 -> max 350;
- H=8 -> max 400.

If the target's remaining HP exceeds `50H`, a Poltergeist KO is **impossible** regardless of hidden hand composition. This is a deterministic pruning rule.

Do not use simulator-hidden Trainer count to choose the attack.

## 2. Extra-Psychic Horror House creates a Poltergeist window

Horror House-GX normally prevents the opponent from playing cards from hand during its next turn.

If Gengar/Mewtwo has at least one extra Psychic attached beyond the attack cost, Horror House also makes each player draw until they have seven cards.

Typical clean sequence when no board effect changes the hand:

1. candidate uses extra-Psychic Horror House; opponent ends the attack with 7 cards;
2. opponent begins its locked turn and draws one -> 8 cards;
3. opponent cannot play those cards from hand during the turn;
4. candidate's next turn begins with an opponent hand that can still be large;
5. Poltergeist has an actor-visible ceiling of up to 400 before any legal board-only hand modification.

This is a genuine two-turn line, not merely 'Horror House plus damage later'.

## 3. Ordinary one-Psychic Horror House can be better

Extra-Psychic Horror is not automatically superior.

If the opponent already has a large hand, drawing both players to seven may:

- give the opponent new resources for the turn after the lock;
- reduce an opponent hand that was already above seven;
- consume/commit an extra Psychic that matters for another attack line;
- make candidate overinvest in a Gengar that may be KO'd by a board-only attack during the locked turn.

One-Psychic Horror is preferable when the hand lock itself is the objective and the extra draw does not improve the selected continuation.

## 4. Ace Trainer + Night Watch is the opposite axis

When Ace Trainer is legal:

`Ace -> opponent draws 3 -> Night Watch -> shuffle 2 random cards`

can leave the opponent with one card before its next normal draw.

That is strong denial, but it destroys Poltergeist ceiling:

- immediately after Night Watch: H≈1 -> max 50;
- after one normal draw and no other additions: H≈2 -> max 100.

Thus Ace/Night Watch should usually be selected for **resource denial / ordinary 150 damage**, not as setup for a large next-turn Poltergeist.

## 5. Choose the hand axis by target and survival

Before a hand-control attack, compare:

### Compression axis

- Ace legal?
- Night Watch payable?
- 150 damage relevant?
- reducing opponent options likely to prevent its best reply?

### Expansion/freeze axis

- Horror House GX unused?
- candidate survives the opponent's best board-only reply?
- extra Psychic available without destroying the next attack?
- target HP makes a large Poltergeist ceiling strategically meaningful?

### Immediate attack axis

- current Energy Drive / Rondo / Eon Blade / Night Watch / Miraculous Duo already KOs or wins now?

Never choose a two-turn Poltergeist setup over an immediate final-Prize win.

## 6. Hand-size is not Trainer count

Even H=8 does not guarantee any Poltergeist damage.

Exact source-list Trainer density may be used later by a belief model, but the actor-visible acceptance policy must distinguish:

- **ceiling** from public hand size;
- legally known current cards from reveal effects;
- probabilistic Trainer expectations;
- simulator-hidden exact identities.

Do not turn a large hand into a fake deterministic KO.

## 7. Known-card lower bound

If a legal effect has revealed cards that are known still to remain in the opponent's hand, the policy may maintain a conservative lower bound `K_known` on Trainer cards still known present.

Then:

`50*K_known <= Poltergeist damage <= 50H`.

Remove a card from the known-hand set when it is played, discarded, shuffled, revealed to have moved, or when a hand-reset effect destroys identity continuity.

## 8. Board-only hand modifiers during Horror House

Horror House blocks cards **played from hand**, not every effect that changes a hand.

An already-in-play Ability, attack or other legal board effect may still draw, discard or shuffle cards if its text permits.

Therefore the policy must update the actual public hand size after every board-only action during the locked turn rather than freezing `H=8` by assumption.

## 9. Acceptance additions

- POLT-CEILING-PRUNE: target HP exceeds 50 times current opponent hand size. Reject Poltergeist as an immediate KO line.
- HORROR-EXTRA-POLT: GX unused, extra Psychic legal, candidate survives board-only reply, opponent hand below seven, next-turn Poltergeist is selected. Credit the draw-to-7/hand-lock window without assuming Trainer identities.
- ACE-NIGHTWATCH-POLT-CONTENTION: Ace -> Night Watch line is selected. Reduce future Poltergeist ceiling with the compressed hand; do not simultaneously credit a large-hand Poltergeist.
- POLT-KNOWN-LOWER-BOUND: legally revealed Trainer cards are known still in hand. Maintain only those persistent identities as a deterministic lower bound.
- HORROR-BOARD-HAND-MODIFIER: opponent has a legal in-play effect that changes its hand during Horror House turn. Apply it before computing next-turn Poltergeist hand size.

No deck change or competitive result follows.