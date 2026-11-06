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

## New independent extension: fully settled printed damage, shuffle and root action origin

**6 November 2026, later same invocation.** A further **two physical-seat regression** using the same staged original Mewtwo Perfection path passes after completing **both** the ShowCardsPrompt and ShuffleDeckPrompt as well as three ensuing native WaitPrompts, with one prior paper-random ChooseCardsPrompt. This extension supersedes the stage-stop limitation above for this *separately tested fixture*. It does not alter the earlier receipt.

The pinned engine's ShuffleDeckPrompt validator lexicographically sorts index arrays with default JavaScript `.sort()`, rejecting valid numeric permutations when the deck has 11 or more cards. This was **already diagnosed and patched independently by Agent22 and Agent33**. The extension reuses their existing [Agent33 reversible numeric validation hook](../../simulation/twinleaf/agent33-shuffle-prompt-numeric-validation.cjs) and logs `checked=1, rawRejectedCorrected=1, correctedAccepted=1` **for each seat**. It does not change the pinned vendor. This exact paper-fidelity hook must be explicitly versioned for any downstream simulation comparison.

**Full pinned native receipt:** [manual workflow 42149067263, SUCCESS, all steps](https://github.com/FlareZ123/experiment-01/actions/runs/42149067263) at main head `17e4bbedaf07a726b673495c0f1a3513836801b9`, with tested source code committed under `367ced068a9e46d049412bbeef70f839823876a1`. The dedicated test file reports **4/4 tests passed**, including **2/2 full settled damage paths** after the original **2/2 prompt-origin proofs**.

| Observed native stage/result | Attacker seat 0 | Attacker seat 1 |
| --- | --- | --- |
| Printed donor from own discard | Trevenant & Dusknoir-GX SMP | Same |
| Actual initiating physical action | `UseAbilityAction('Perfection')` | Same |
| Root `AttackAction` count | **0** | **0** |
| Source marker on original copied Night Watch | **1** | **1** |
| Defender hand immediately after hand effect | **1** of original 3 cards | **1** |
| Corrected shuffle validations, previously rejected by pin | **1** | **1** |
| Native prompt sequence after hand selection | ShowCards, ShuffleDeck, 3 Wait | Same |
| Defender Active Rotom V attack damage | **150** | **150** |
| Turn after settlement | **5** | **5** |
| Current active-player seat after settlement | **1** | **0** |
| Defender hand after mandatory next-turn draw | **2** | **2** |
| `playerLastAttack[owner].attack.name` | Night Watch | Night Watch |
| `state.lastAttack` after settlement | null | null |
| Competitively qualified games | **0** | **0** |

**Implication:** An attack-root diagnostic counting only `AttackAction` excludes this genuinely executed copied 150-damage attack. The shared `simulation/twinleaf/headless.cjs` has a distinct `attackDeclarationTrace` path sourced from `newlyLoggedAttackDeclarations`, which is expressly designed to recognize native attack declarations from `UseAbilityAction`/prompt resolution as well. Its *specific behavior in a naturally dealt game* requires separate testing. The staged fixture proves a blind spot of the action-type-only count, without claiming that all shared metrics are blind.

This is **one deliberate legal attack setup** with an artificial board, no game result, no adversarial response, no official 25-minute timer and no measured occurrence rate in a shuffled 60. It strengthens the engine-qualification basis for the existing fixed New Moon candidate. It cannot rank that candidate or be counted as a competitive win.

## Original printed counter-Item ALS: actual Cologne -> Perfection -> Night Watch vs Iron Thorns ex

**6 November 2026, next independent both-seat regression:** A specially staged **Active Iron Thorns ex TWM** physically prevents the owner's Mewtwo & Mew-GX `Perfection` before intervention. The proposed New Moon v1 itself contains **2 Canceling Cologne ASR 136** and **2 Mewtwo & Mew-GX UNM 71**, plus the single Trevenant & Dusknoir-GX SMP SM217 donor. In this test, its owner has exactly one actually held Cologne and three attached Basic Psychic, with the GX donor genuinely in the owner's discard. The owner **plays the physically held Item through Store PlayCardAction**, and the original Iron Thorns adversary obtains the exact `CANCELING_COLOGNE_MARKER`. The owner's independent native `IS_ABILITY_BLOCKED` flips from **true to false**. Under the same uninterrupted turn, a real `UseAbilityAction('Perfection')` chooses the payable printed Night Watch attack.

The continuation physically chooses **two random index positions among three opponent-hand cards**, using the independently established source-marked algorithm, reveals and transfers those selected card objects into the opponent's deck, settles the opponent-owned deck shuffle through Agent33's previously published numeric-validation hook, and resolves printed **150 damage to the opposing Active Iron Thorns ex**. The enemy had three original held cards, one immediately after the attack effect. The native clock advanced **turn4→turn5** and handed the turn to the opposite seat. Both physical seat tests passed.

**Reproducible compiled evidence:** [CI 42150438624, SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/42150438624), dedicated native regression **6/6 tests passed** (original 4 plus two anti-Thorns). Both anti-Thorns receipts record `sourceBoundToCopycat=true`, `opponentPrivateCardNamesReadForDecision=false`, `sampledPhysicalIndices=[1,2]`, and `correctedShuffle=1`. The original researcher-owned printed clone engine remains pinned and unmodified.

This is the **first fully resolved paid Night Watch payoff after a physical Cologne lock break within the Agent42 staged Perfection fixture**, whereas the prior [New Moon ability gate](../../simulation/twinleaf/new-moon-lockbreak-ability-gates.cjs) checked only whether Perfection was visible. The staged test independently verifies a real Item → Ability → copied attack chain, advancing one archetype-line-specific anti-lock hypothesis. It **does not** show that the proposed fixed deck draws both Cologne and usable Energy under natural opening conditions, survives an opponent reply, obtains a Knock Out or Prizes, or improves its game win rate. There are still **zero** competitively qualified games.
