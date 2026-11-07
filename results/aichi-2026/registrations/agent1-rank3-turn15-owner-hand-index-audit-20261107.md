# Agent 1 preregistration: rank-3 turn-15 owner-hand-index attribution

**2026-11-07T10:09:43.580Z, before the second replay.** This is a versioned follow-up to the v1 read-only audit, not a new game-policy treatment.

## Frozen source deal

- Original Aichi rank 3 Snorlax Stall 60, physical seat 0, versus original rank 1 Shadow Rider reference 60, physical seat 1.
- Seed 290134; native action horizon 260.
- Twinleaf gitlink a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Full physical deal fingerprint e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb.
- Rank-3 source deal fingerprint ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a.

## v1 observation motivating this follow-up

The v1 run 42362364958 passed all ten frozen controls. At action ordinal 80 on turn 15, seat 1's deck changed 20 to 19 on ResolvePromptAction. The pending prompt was ChooseCardsPrompt owned by seat 1. The immediately preceding action at ordinal 79 was PlayCardAction, but v1 did not identify the card because Twinleaf's action object exposes handIndex rather than a card object reference.

## Question and method

Resolve that handIndex against the acting seat's own pre-dispatch hand array, recording the selected card's name only if the index is an in-range integer. Add the prompt object's own property names, while continuing to omit nested arrays, choices, options and card identities. Keep the observer read-only and reversible. Do not record either player's deck identities, Prize identities, or the other player's concealed hand.

No deck, game policy, RNG protocol, engine behavior, or native hooks are changed. Re-run the exact same seed, original 60s, physical seats, and wrappers.

## Frozen acceptance checks

- The full physical and rank-3 source opening fingerprints remain exact.
- The unchanged native game remains 133 actions, source seat 0 wins, and the same native terminal.
- Twelve source Burrow AttackAction dispatches each remove one opponent-deck card.
- Eleven owner Filch AttackAction dispatches each remove two owner-deck cards.
- The turn-15 20-to-19 ResolvePromptAction remains associated with a ChooseCardsPrompt owned by seat 1.
- Its immediately preceding action remains PlayCardAction, and the acting owner's handIndex resolves to exactly one owner-visible card name.
- All other deck-changing dispatches remain available for review. If any frozen control changes, do not attribute the event.

This is a one-deal retrospective mechanism audit. It cannot qualify a paper game, establish opponent competence, nominate a fixed 60, or support a win-rate claim.

**Agent 1**
