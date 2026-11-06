# Agent42: actual Perfection -> copied Night Watch crosses the direct-only randomness boundary

**6 November 2026. Source-grounded, two-seat compiled pinned-Store test. Developmental paper-fidelity gate only. Zero qualified games.**

## Decision finding

The existing direct-only Night Watch correction checks that the Active Pokémon is **Trevenant & Dusknoir-GX SMP**. The printed **Mewtwo & Mew-GX UNM 71** has Perfection, which can use attacks of the owner's benched or discarded Pokémon-GX/EX if their Energy costs are met. When it copies **Night Watch** from **Trevenant & Dusknoir-GX SMP SM217**, the original attack text requires **two random opponent-hand cards**, even though Mewtwo is the Active Pokémon. The pinned engine exposes the transferred attack as an attacker-owned ChooseCardsPrompt. The direct-only correction cannot recognize that prompt because the Active is Mewtwo.

**New native result:** The existing research-owned source-reducer marker, originally created by Agent43, does recognize this additional *Perfection* delegation. A new real-Store two-seat regression follows the actual `UseAbilityAction('Perfection')`, the actual `ChooseAttackPrompt`, the actual printed `Night Watch` choice, and the subsequent hand-card selection and physical move into the defender's deck. The old direct-only predicate is **false** at precisely the same pending native hand prompt in each physical seat. The source-marked handler is **true** and samples indices without card-identity scoring. Both test cases pass.

This extends the existing Agent43 **direct and Mimikyu GRI Copycat** staged coverage to a third independently initiated mechanism, Perfection. It leaves Agent43's original tests and source patch unchanged.

## Printed, candidate, and field provenance

- Supplied English card pool: `cards/en/sm11.json`, `sm11-71` Mewtwo & Mew-GX, **Perfection**; `cards/en/smp.json`, `smp-SM217` Trevenant & Dusknoir-GX, **Night Watch**, printed three Psychic Energy, 150 damage, random opponent-hand two-card shuffle. Advanced Player's Rulebook, II C-18, describes copied attack effects; the actual pinned Perfection rule additionally retains the copied attack's Energy requirement.
- The **unchanged, already published proposed New Moon Lockbreaker v1** has exactly **two Mewtwo & Mew-GX UNM 71** and **one Trevenant & Dusknoir-GX SMP SM217**, with six printed Energy: [candidate exact proxy inventory](../als/new-moon-lockbreak-english-proxy-60.json). This is a real deckbuilding reason to audit the Perfection channel, but this report does not establish that it becomes payable in a naturally dealt game.
- The authenticated 29 Aichi Top32 original named sixties contain the **direct Night Watch donor at rank 1**, one copy, and **Mimikyu GRI 58** Copycat at ranks **1 and 30**, one each. The Mimikyu PAL 97 cards in ranks 3 and 7 are different printings and must not be counted as Copycat. Exact source list: [29 originals](../aichi-2026/full-decklists.json). No opponent-copy line or tactical effectiveness is inferred from inventory alone.
- Pinned upstream source: [Mewtwo Perfection](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/mewtwo-and-mew-gx.ts) and [source attack delegation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-delegation.ts), gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Native exact-stage design and observed receipts

[New standalone two-seat regression](../../tests/agent42-perfection-nightwatch-source-marked.native.test.cjs) uses the existing [source-marked owner-safe observer](../../simulation/twinleaf/agent43-nightwatch-source-marked-random.cjs) without modifying upstream or any 60. The native state has an Active Mewtwo & Mew-GX with three **real Psychic Energy SVE cards**; own Trevenant & Dusknoir-GX is **physically in the owner's discard**; opposing Active is Rotom V LOR; opposing hand is three distinct physical Energy cards (Psychic, Water, Grass). Native turn 4, two valid opposite seat placements. Both players have physical Prize and deck cards so the Stage is well-formed.

For each attacker seat:

1. An actual Store `UseAbilityAction` selects Perfection, producing the native actor-owned `ChooseAttackPrompt`. Source Trevenant & Dusknoir is the exact discarded physical donor, and `Night Watch` passes `prompt.validate`.
2. Resolving this source attack yields an actual `ChooseCardsPrompt` referencing the **opponent's exact hand object**, `min=max=2`. The legacy `isDirectNightWatchHandPrompt` evaluates **false** while Mewtwo is Active. The printed source marker accepts it.
3. Under fixed diagnostic indices `[0,1]` for each of two different dedicated seeds, `ResolvePromptAction` is native validated and applied; two exact selected Card objects leave the opponent's hand and enter the opponent's actual deck, leaving one. Source marker audit records `sourceBoundToCopycat=true`, `activeUser='Mewtwo & Mew-GX UNM'`, `opponentPrivateCardNamesReadForDecision=false`, and restored original bot and source prototypes.
4. Native **ShowCardsPrompt remains pending** at the observation boundary. Subsequent ShuffleDeck settlement, damage, Knock Out, later opponent play and game terminal are not proved by this test.

The two fixed seeds producing the same observed index pair are **not** two independent random-game draws, nor a test of the random distribution. This research uses the source-origin marker to prevent choosing opponent-hand **card identities**, and tests physically distinct index selections through the pinned prompt and Store.

- First fully completed existing-workflow CI: [42146814378, SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/42146814378), pinned test at commit `6f7d6d2017a36a2d5b0f7e719f586ca4cb233957`. Dedicated result `2/2 PASS`, exact console reports seat 0 and 1, marker count 1 per seat, sampled indices `[0,1]`, next prompt `ShowCardsPrompt`. Full workflow passed.
- Stronger negative-control amendment: commit `2e98577cddacea941a7c1986ac7a0848adee2db1` asserts the *actual copied prompt* is rejected by the direct-only filter. [42147181711, SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/42147181711), dedicated Perfection step passed with the new negative assertion and the same physical success. Existing manual [workflow](../../.github/workflows/agent43-guzma-recipient-native.yml) gained one test step; **no new workflow** or default gameplay change.

## Release implications and bounded next step

The selected bilateral Issue25 v4 remains **unchanged** and unqualified. A future common-policy release should bind paper-random hand selection to the original **attack effect source**, including direct attacks, Mimikyu Copycat, and actual Mewtwo Perfection, rather than the Active Pokémon's species or a generic opponent-hand prompt shape. This evidence is a necessary engine-interaction gate, not a sufficient pass of owner-hidden-information noninterference for the entire game.

The next meaningful audit is a native original-source or frozen challenger opportunity whose actor **actually funds** the copy, followed by native ShowCards/Shuffle settlement, resulting 150 attack damage, a genuine opposing counterdecision, and a coherent root ledger. In particular, Perfection is initiated by `UseAbilityAction`, so any attack-only measurement based solely on `AttackAction` roots should explicitly assess whether it excludes an actually resolved Perfection copied attack; that ledger issue is currently **hypothesis**, not an independently demonstrated full-game undercount. Ability lock and Energy shortage can eliminate the line in an actual matchup.

**Benchmark status:** 29/32 authenticated original 60s, three source decklists still missing (23/25/28), no nominated fixed optimized 60, **zero** competitively qualified complete games, and no demonstrated 99.5% win rate.
