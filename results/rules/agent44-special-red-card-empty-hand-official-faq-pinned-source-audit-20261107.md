# Special Red Card: official Japanese empty-hand ruling versus pinned Twinleaf source path

**Agent 44 | 7 November 2026 | independent paper FAQ + static pinned-source control-flow review. No native Store experiment or competitive games.**

## Paper criterion and the original benchmark

- The [official Japanese Pokémon TCG FAQ for Special Red Card](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B9%E3%83%9A%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%AC%E3%83%83%E3%83%89%E3%82%AB%E3%83%BC%E3%83%89&regulation_faq_main_item1=all) asks if the Item can be played while the opponent has **zero cards in hand** and explicitly answers **no** (`いいえ、できません。`).
- The [official Japanese M4 072 card](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all) restricts use to an opponent with three or fewer Prizes, then instructs putting their shuffled hand on the bottom of the deck and drawing three cards.
- `M4` *Ninja Spinner* released [13 March 2026](https://www.pokemon-card.com/ex/m4/), so it was available for the **10 May 2026** Aichi benchmark.
- The repository's original rank-5 Mew Genesect source contains **two Special Red Card** and rank-26 Meloetta Donk source contains **one**, currently annotated with post-event English equivalent `CRI 82`. See [Agent44 source crosswalk](../aichi-2026/agent44-postevent-nonenergy-english-printing-crosswalk-20261107.md).

## Reproducible pinned native-source inspection

Pinned Twinleaf Git submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

1. [SpecialRedCard class](../../vendor/twinleaf/ptcg-server/src/sets/11-mega-evolution/set-chaos-rising/special-red-card.ts): `canPlay` rejects only if opponent's Prize count exceeds 3. It has **no check for empty opponent hand**. Its `reduceEffect` similarly rejects only Prizes above 3, and guards the opponent's hand move/draw with `if (cardsInHand > 0)`; at zero hand it returns `state` without applying its action.
2. [Pinned PlayCard reducer](../../vendor/twinleaf/ptcg-server/src/game/store/reducers/play-card-reducer.ts) constructs a `PlayItemEffect` from the player's hand and reduces it. The Item branch in [play-trainer-effect](../../vendor/twinleaf/ptcg-server/src/game/store/effect-reducers/play-trainer-effect.ts) moves the played Trainer to `supporter`, processes `TrainerEffect` and performs cleanup to discard after the effect.
3. **Static-source-predicted failure state**: active player holds Special Red Card; opponent has 0 cards in hand and 3 Prizes, no Item lock; player announces the Item. The inspected class would apply zero Special Red Card effect while the common Item cleanup may still discard the Item. This violates the explicit official FAQ if the native Store accepts this action.

### Evidence classifications

- **Official paper prohibition against playing Special Red Card into an empty opponent hand: established**, by the Japanese authoritative FAQ.
- **Pinned special-card class missing this check: established**, by cited source inspection.
- **End-to-end actual native Store acceptance of this exact action: untested**. There may be another generic legal-play veto beyond the inspected path. Preserve this distinction. No effect, payment or board-receipt has been recorded.
- **Competitive impact: unmeasured**. This could create an unlawful resource-burning line or alter bots' available choices, but no occurrence is proven in archived source root traces.

## Minimum integrated verification and correction

The shared Agent36/Agent41 bilateral gate can test this with one reversible research-side hook (keep the submodule untouched) and two precisely registered fixture states:

- Positive: printed Special Red Card in acting hand, opposing three Prizes and **one card in hand**, no lock. Actual native Store must accept, move opponent's one card to deck bottom and allow its stipulated three-card draw.
- Negative: same state except opposing **zero cards in hand**. Both advertised legal-action selection **and actual Store acceptance** must reject the Item. Record the error class and action ordinal, and confirm no card movement.
- Third conditional: opponent at **four Prizes** with a nonempty hand, negative. Confirms pre-existing Prize restriction remains intact.
- If the negative currently accepts, patch through a versioned research-side prototype/method hook that checks the opponent hand before the card leaves the acting hand, and integrate this into the **same shared policy on both seats**. Test original pin, hook revision, source card type identity, and cleanup. Avoid introducing a new isolated CI workflow or making a competitive improvement claim.

The [Advanced Player's Rulebook](../../resources/advanced-players-rulebook.md) B-01 also describes a prohibition on Items that fail to change game state, but the direct official named-card ruling is decisive for the target case.

**Status:** 29/32 authenticated name/count source lists; three originals still missing; zero paper-qualified games; zero proven 99.5% field results. This is a concrete paper-fidelity acceptance task for ranks 5 and 26, not a new candidate or field-strength estimate.
