# First-player Exeggcute SSP Precocious Evolution: real Stage 1 and owner prompt fidelity

**Agent 37, 30 October 2026.** Native stage/turn regression, separate from any 60-card competitive claim.

## Printed and engine mechanics

Exeggcute SSP's printed **Precocious Evolution** attack costs one Colorless Energy and explicitly permits use on the first turn when going first. Its native attack object has `canUseOnFirstTurn:true`, and its pinned reducer searches the **owner's deck for a Pokémon evolving from Exeggcute**, puts that Stage 1 **directly onto the Active Exeggcute**, retains attached Energy, and shuffles. The submitted advanced player rulebook's effect-based evolution section permits effect-driven evolution on the usual first-turn/evolution-entry restriction unless the card says otherwise. This contrasts with a normal hand-to-board evolution.

The attack creates `ChooseCardsPrompt` with `message='CHOOSE_CARD_TO_EVOLVE'`, source `pending.cards===owner.deck`, and `GamePhase.ATTACK`. It is a different destination and contract from the `CHOOSE_CARD_TO_HAND` search provided by Sableye LOT's Quick Hunt.

## Pinned native reproduction

[Both-seat native regression](../../tests/agent37-firstturn-exception.native.test.cjs) stages Exeggcute SSP, real Basic Psychic Energy in its starting hand, and exactly one `Alolan Exeggutor ex SSP` Stage 1 in the native source deck. On *each* physical player seat the real Store:

1. Accepts the default owner-root Basic Energy attachment on global turn 1;
2. Selects the printed first-turn exception by the explicitly opted-in root policy;
3. Accepts `AttackAction('Precocious Evolution')` in the phase that generally forbids first-player first-turn attacks;
4. Produces the native owner `CHOOSE_CARD_TO_EVOLVE` prompt while in `GamePhase.ATTACK`;
5. Validates `Alolan Exeggutor ex SSP` as the exact one-card Stage 1 target, then physically evolves Exeggcute while preserving attached Energy and removing that Stage 1 from the deck.

The first direct native prompt-and-evolve version passed [compiled CI 41005056487](https://github.com/FlareZ123/experiment-01/actions/runs/41005056487), head `db42f68a52d9aebd34274383e4af1d21fa48f524`.

## Default-off actor-owned decision

Existing `actorSingleSearchInput` deliberately refuses `CHOOSE_CARD_TO_EVOLVE`, since it models deck-to-hand retrieval. We created a separate [`agent37-attack-evolution-owner-prompt.cjs`](../../simulation/twinleaf/agent37-attack-evolution-owner-prompt.cjs) projection that requires a real native prompt addressed to the owner, `pending.cards===owner.deck`, max one selected card, and the native prompt's exact validator for a legal Stage 1. It exposes an owner-only sorted printing menu. The common [single-search hook](../../simulation/twinleaf/agent41-actor-owner-single-search.cjs) can dispatch a physically matched `ResolvePromptAction` for that menu only under `deps.attackPhaseEvolution:true` or `AGENT37_OWNER_ATTACK_EVOLUTION_DEV=true`, with `GamePhase.ATTACK` authenticated and the original native prompt preserved. The normal/default wrapper does not take ownership of this message.

The [pure test suite](../../tests/agent37-attack-evolution-owner-prompt.test.cjs) checks owner authentication, source identity, menu legality, both-seat typed prompt choice, exact default-off behavior, absence of private opposing-zone content, and rejection of unrelated attack-phase messages. The [native Store suite](../../tests/agent37-firstturn-exception.native.test.cjs) uses the original Stage 1 prompt and dispatches the adapter-selected native action to the actual pinned Store, yielding the genuine 300-HP `Alolan Exeggutor ex SSP` Stage 1 on the Active in both physical seats. A narrow test-only bridge supplies `AddPlayerAction` authentication in staged tests; it does not make the full-game policy qualified.

The originally submitted synthetic pure test failed because its minimal dummy Player lacked an Active and `actorObservation` expected real native field shapes. The test now injects the explicitly defined owner-observation fixture through `deps.evolutionObserve`; the actual pinned native test uses the unmodified real observation. The corrected integrated pure/native suite passed [compiled CI 41005544497](https://github.com/FlareZ123/experiment-01/actions/runs/41005544497), head `86079f21ef4369a6cce292b3ec3296ad0dda190b`. Earlier [41005451948](https://github.com/FlareZ123/experiment-01/actions/runs/41005451948) intentionally remains visible as the detected and fixed synthetic-fixture failure.

## Implications and limits

The engineered first-turn Stage 1 can persist through the opponent's first turn, a board state ordinary turn-one hand evolution could not produce. This may matter for early lock, tank, and attacker plans, but no claimed opponent matchup was established. `Alolan Exeggutor ex` provides 300 HP and substantial future attacks at the cost of conceding two Prizes on Knock Out; those tradeoffs and Energy requirements remain untested here. Neither the lexicographic one-card source selector nor a six-Prize staged board is proof of intelligent 60-card strategy.

**Field score remains 29/32 exact opposing 60s, 0 competitively qualified games, and no demonstrated 99.5% winning list.** More comprehensive source-first and alternative candidate decision policies need to be compared through qualified real-game seeds.
