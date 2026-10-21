# Source-first rank11: original-Store turn7 recovery and Crobat V draw confirmation

**Agent 23 | 21 October 2026 UTC | isolated branch `agent23-sourcefirst-turn7-owner-recovery-audit-20261021`.** A **single retrospectively selected physical native game**, no competitive-qualified results.

## Why inspect this particular source decision?

Agent42's source-first historical New Moon `Escape Rope` treatment led to an engine outcome favoring the candidate while the source player left a zero-E Garbodor BKP stranded in Active. This is sensitive to source-opponent competence. Agent23 first independently confirmed the source's own physical turn7 resources and the actual optional draw response, then tested a **single source-owned** native prompt toggle. These interventions do not alter candidate 60, source 60, seed, seats, initial Prize deal, source setup, previous actions or other decision policies.

### Exact native and paper context

- Frozen registered historical trial `11:retrospective-sourcefirst:2:B:new-moon-lockbreaker-v1`, source rank11 Mega Absol/Garbodor seat0, candidate New Moon seat1, seed `482443328`.
- Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Original source-deal digest `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`, full ordered native root-action ledger `b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6`, 175 actions, 36 global turns, native candidate winner seat1, remaining Prize cards [6,0].
- Source Trubbish used Boost Shake to become Garbodor BKP on T1 with Float Stone BKT attached. Candidate's native **Field Blower GRI** removed that Float Stone on T2 (public native policy audit confirms). On T6 candidate Escape Rope forced the now-unequipped Garbodor to Active. Provided card database confirms Garbodor BKP has printed **3 Colorless Retreat**, and Float Stone reduces the attached Pokémon's Retreat Cost to none. After Field Blower it did not still provide free retreat.

## Source-owned T7 cards and actual original response

A reversible decoder audit in a completely recreated native game observed source-only information, **without passing it to either policy**, and independently revalidated exact source deal and full 175-action ledger before interpreting any hand. At source T7 root, source was holding:

| Card printing in source owner's hand | Copies |
| --- | ---: |
| Marnie SSH | 1 |
| Professors Letter BKT | 1 |
| Boost Shake EVS | 1 |
| Garbodor BKP | 1 |
| Shopping Center EVS | 1 |
| Crobat V DAA | 1 |

Original board: source Active Garbodor BKP had no Energy, no Pokémon Tool, no damage, printed Retreat 3; the only occupied source Bench slot was Oranguru V ASR with one Darkness Energy. Garbodor's printed Offensive Bomb costs Psychic and three Colorless and was not payable. Source held **zero Float Stone, Guzma, Escape Rope, VS Seeker or Secret Box** at this decision. It did hold **Marnie**, which offers a possible draw-and-refresh branch requiring its own strategic and native rules evaluation.

The original source action was `PlayCardAction Crobat V`. Native source-owned T7 `ConfirmPrompt` ID33 had message `WANT_TO_USE_ABILITY` and an actual source bot `ResolvePromptAction` response of **false**. The next source root had five cards (`Marnie`, `Professors Letter`, `Boost Shake`, `Garbodor`, `Shopping Center`), after which the bot **passed**. Crobat V DAA-104 printed `Dark Asset` says that when played from hand onto Bench during turn, its owner **may draw until six cards in hand**, subject to the once-per-turn Ability restriction. The original conditional Ability prompt and its exact card identity were not externally proof-linked by prompt text alone; the immediate Crobat play and native yes-rescue test provide strong context.

[Original physical source-owned T7 replay, compiled CI 39675936616](https://github.com/FlareZ123/experiment-01/actions/runs/39675936616) with [artifact 12382805740](https://github.com/FlareZ123/experiment-01/actions/runs/39675936616/artifacts/12382805740). [Native prompt-response replay, compiled CI 39677019695](https://github.com/FlareZ123/experiment-01/actions/runs/39677019695) with artifact `12382683121`. The latter shows exact prompt response false, owner-hand printing counts, two source T7 roots and complete original physical replay. One intermediate pure mock regression run `39676720046` failed because the assertion compared `structuredClone`'s removed mock class prototype; it was corrected and the subsequent compiled job succeeded. No physical-game failure was censored.

## Controlled one-response native counterfactual

Registered **before** altering the native policy wrapper in `results/aichi-2026/registrations/agent23-source-t7-crobat-draw-counterfactual-20261021.md`. We ran the same physical rank11 game twice. Control completely reproduced the original 175-action record and source deal. The source-only treatment changed one prompt at native source turn7 from the original bot's `false` to **`true`**, on the real source-owned `WANT_TO_USE_ABILITY` prompt with Crobat V now on its Bench, source hand below six, unequipped Garbodor Active, and native `pending.validate(true,state)===true`. The real Store accepted the `ResolvePromptAction(true)`; the source hand immediately grew from five to **six**. No candidate code or opponent hidden card was read to choose the action.

| Native game measure | Original source policy | Accept Crobat confirmation |
| --- | ---: | ---: |
| Same physical initial source deal | Yes | Yes |
| Selected root-response deviation | Original false | True at T7 |
| Native candidate winner | Seat 1 | Seat 1 |
| Remaining Prize cards (source, candidate) | [6,0] | [6,0] |
| Total global turns | 36 | 32 |
| Native root actions | 175 | 154 |
| Settled public attacks | 8 | 6 |
| Source settled attacks | 0 | 0 |

The first subsequent differing native root after that same prompt occurred at **ordinal 46, source turn7**: the source played **Darkness Energy** in the treatment, while in the original it passed. The result establishes that the one prompted draw caused an actual native gameplay divergence. It **did not rescue the original stranded source**, produce a source attack, or change the native winner. Less settled attacks in a shorter game cannot be interpreted as a better general strategic result.

[Compiled paired native CI 39678330419](https://github.com/FlareZ123/experiment-01/actions/runs/39678330419), successful with both pure observer and counterfactual tests, original pinned compiled engine, exact archive checksum gate, independent source deal equality, and native accepted yes response. [Complete paired JSON artifact 12382384099](https://github.com/FlareZ123/experiment-01/actions/runs/39678330419/artifacts/12382384099), ZIP SHA-256 `d84b88e885b1bc14180e1ec24ce819910f32341828d7cb4555ca9a81a58c69f0`.

## Implications and limits

1. The **initial no-immediate-switch** observation was narrower than a complete escape-line audit. Source held Marnie; possible redraw lines and remaining search connectors must be evaluated, including Supporter contention, K1 and Prize state. A separate source policy could deliberately seek mobility on T7.
2. The exact native control established an **actual declined optional draw**, and a native-accepted single response was executable using source-owned visible information. The source's original fixed `SimpleTacticsAi` and actor-only composition are incomplete decision policies. This strengthens the case for source-adversarial policy benchmarks before attributing win strength to the candidate's Escape Rope.
3. A **single positive native draw** does not guarantee a tactical rescue. In this frozen deal it produced one Darkness Energy and a source attachment, then both games still ended candidate-winning with source zero attacks. The wider 99.5% full Aichi benchmark remains **unmeasured**.
4. This investigation adds **zero competitively qualified games** and does not supply a general policy or full opponent hidden-information certificate. The official 32-source fixture still has three missing exact decklists (ranks 23, 25, 28), so no denominator inflation is justified.

### Code and reproducibility

- Source owner read-only hooks: `simulation/twinleaf/agent23-source-owner-turn7-read-observer.cjs`.
- Source native optional prompt control: `simulation/twinleaf/agent23-source-crobat-confirm-counterfactual.cjs`.
- Two exact-source runner entrypoints: `simulation/evaluation/agent23-sourcefirst-r11-turn7-recovery.cjs` and `simulation/evaluation/agent23-sourcefirst-r11-crobat-counterfactual.cjs`.
- Unit tests: `tests/agent23-source-owner-turn7-read-observer.test.cjs` and `tests/agent23-source-crobat-confirm-counterfactual.test.cjs`.
- Branch-only manual input `agent23_source_turn7` or `agent23_source_crobat_counter` in the existing `twinleaf-smoke.yml` workflow. No push-triggered jobs or Twinleaf/vendor edits.
- All comparative roots, policy response, source-owned hand evidence, engine accepted prompt and full terminal outcomes are preserved in the cited artifacts.

**Recommended next discriminating work:** On a separately preregistered source-first seed, create a conservative source-owner **mobility/resource-draw policy** that evaluates Marnie and legal recovery connectors before passing with a stranded Active Pokémon. Use that source policy identically in baseline and Rope arms, authenticate information sets and native action legality, and measure full-field matchups only after such policy gates stabilize.
