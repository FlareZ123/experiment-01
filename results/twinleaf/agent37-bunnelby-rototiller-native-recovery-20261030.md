# Bunnelby PRC Rototiller: genuine owner discard-to-deck attack-phase prompt

**Agent 37, 30 October 2026.** Evidence from printed card text, pinned engine source, owner-authenticated projection and staged real Store resolution.

## Benchmark relevance

The exact Aichi Open League 2026 source-deck JSON contains **Bunnelby PRC 121** in four recovered Top 32 lists:

| Aichi rank | Archetype | Bunnelby PRC copies |
| --- | --- | --- |
| 2 | Vileplume Control | 2 |
| 3 | Snorlax Stall | 1 |
| 15 | Lopunny Vileplume | 2 |
| 26 | Meloetta Donk | 1 |

The pinned `ptcg-server/src/sets/07-x-and-y/set-primal-clash/bunnelby.ts` defines the Ancient Trait **Ω Barrage**, allowing a second attack in relevant conditions, and the attack **Rototiller**. Rototiller shuffles **one chosen card from the player's discard pile into that player's deck**. That target is a public discard pile, but the card's new destination is the owner's deck. Treating the result as direct retrieval into hand overstates the line's immediate power.

The genuine attack produces a native `ChooseCardsPrompt` with `message='CHOOSE_CARD_TO_DECK'`, source `pending.cards===owner.discard`, `options.min=1/max=1` and `GamePhase.ATTACK`. This is outside the preexisting `CHOOSE_CARD_TO_HAND` selection family and outside the first-turn Exeggcute `CHOOSE_CARD_TO_EVOLVE` decision family.

## New strictly opt-in decision path

[`agent37-attack-recovery-owner-prompt.cjs`](../../simulation/twinleaf/agent37-attack-recovery-owner-prompt.cjs) builds a detached, frozen menu only after confirming the native live prompt is addressed to the authenticated owner, its source object is exactly **that owner's discard**, the native message matches, and each offered card satisfies `pending.validate([card])`. Its actor context comes through `actorObservation`. The selector receives printed card identities and never receives the opponent's concealed deck/hand/Prize contents.

The [existing owner-single-search adapter](../../simulation/twinleaf/agent41-actor-owner-single-search.cjs) supports this **only when** `deps.attackPhaseRecovery:true` or `AGENT37_OWNER_ATTACK_RECOVERY_DEV=true`, with a separate `GamePhase.ATTACK` check. It reuses the genuine Store's `ResolvePromptAction` and a physical native-valid target. The ordinary/default policy remains unchanged. The other two optional attack-phase message families remain separate.

## Reproduction

- [Pure owner-search tests](../../tests/agent37-attack-recovery-owner-prompt.test.cjs) verify that only an authenticated owner can see the discard-to-deck prompt, that the detached menu matches the validator, and that the existing wrapped player invokes a native-typed recovery selection on **both physical seats**. Negative tests preserve default behavior without the opt-in.
- [Native Bunnelby test](../../tests/agent37-bunnelby-rototiller-recovery.native.test.cjs) stages a genuine pinned two-player Store on turn 3, each with an Active. Bunnelby PRC has the required Colorless Energy payment. The owner's discard contains one physically registered `Technical Machine: Evolution PAR`, and each player has six face-down Prizes. Genuine `AttackAction('Rototiller')` produces the owner `CHOOSE_CARD_TO_DECK` prompt in ATTACK phase. The opt-in adapter selects the real discard card and supplies the matching `ResolvePromptAction` to the original pinned Store. On each physical seat **TM: Evolution leaves the owner's discard, enters its actual deck, and increments that deck from 14 to 15 cards**. The test checks the native postcondition, owner-seated acceptance and original opposing Active identity. A narrow test-only `BridgeStore` stages the `AddPlayerAction` authentication handshake; the underlying attack prompt and physical resolution remain on the real Store.
- All new tests passed in [compiled manual CI 41005864518](https://github.com/FlareZ123/experiment-01/actions/runs/41005864518) at pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The canonical workflow remains manually dispatched, with default field policy unmodified.

## Remaining strength question

The current shared `chooseActorSingleSearch` policy selects the first native-valid card after lexical sorting. It solves legal execution, but may choose an insignificant Basic Energy over a critical Tool, Special Energy, ACE SPEC, or Stadium in a concrete control matchup. Recovery also moves a card into the deck rather than putting it directly into hand; future accessibility requires separate draw/search actions. A realistic evaluator must account for matchups, current lock, Supporter use, Bench/Active positioning, Prize knowledge and alternative recovery channels. The submitted human strategic concepts describe those issues as DCI, AMR, connector domination, and K0/K1 information.

The native two-attack Ω Barrage continuation is a separate decision policy and is already studied in [rank-15 native second-attack counterfactual](../aichi-2026/agent30-rank15-native-omega-barrage-confirmation-yes.md). This report validates the **first Rototiller prompt and recovery effect**, not a general competent choice of both attacks or their target cards. It does not reproduce a full opponent game or quantify matchup strength.

**Benchmark:** 29 of 32 exact opposing lists recovered; 0 competitively qualified games; no established single fixed 60-card list with a 99.5% game win rate.
