# Rank-3 Forest Seal Stone-first Tool suppression: paid Bunnelby Burrow counterexample

**Agent 2 | 4 November 2026. Developmental constructed Store witness; competitive games qualified: zero.** Fixed paper benchmark remains 29/32 authenticated original name/count inventories (original ranks 23, 25 and 28 missing), no selected final 60, and no demonstrated 99.5% game-win rate.

## Source-conditioned opportunity and exact counterfactual

The [previous exact opening study](agent2-original29-fss-first-tool-starvation-20261104.md) established that the selected bilateral shared [Forest Seal Stone owner adapter](../../simulation/twinleaf/forest-stone-v-recipient-policy.cjs) inspects only the *first Pokémon Tool* in the physical hand. When that Tool is **Forest Seal Stone SIT** and no free Pokémon V recipient exists, `selectStoneRecipient` returns `{kind:'hold'}`. The enclosing hook suppresses the first-Tool native fallback, even when another Tool is held. The original rank-3 60 includes one each of **Snorlax PGO**, **Bunnelby PRC**, **Float Stone BKT** and **Forest Seal Stone SIT**, and three **Capture Energy RCL**.

A constructed same-state local native Store starts with:
- **Owner Active:** Snorlax PGO, retreat cost four Colorless, two attached Capture Energy RCL, no Tool.
- **Owner Bench:** Bunnelby PRC, one attached Capture Energy RCL.
- **Owner hand:** Forest Seal Stone SIT first, Float Stone BKT second. No owner Pokémon V in play.
- **Opponent:** constructed Mew V FST Active with a synthetic ten-card Psychic Energy MEE deck, with supporting fixture zones.

The three exact Capture Energy copies, rank-3 Pokémon and two Tools are compatible with the authenticated source deck's card-name inventory. **The remaining native fixture is synthetic:** owner and opponent filler zones and the opponent deck are not independently authenticated original full 60s, and this state has not been established as a naturally reachable original-source match. A SHA-256 of the explicitly specified staged physical input must be equal within each seat's two intervention branches; seats 0 and 1 are independently constructed.

**Control A:** The selected `withStoneVRecipient` wrapper proposes no Tool action, reporting `no-free-v-recipient`. Snorlax retains a four-Energy retreat requirement and holds two attached Energy cards. This does not prove all possible alternate actions are unplayable: it identifies one suppressed Float mobility line.

**Counterfactual B:** Nest the existing default-off [owner-only Float recovery hook](../../simulation/twinleaf/agent2-fss-held-try-float-owner.cjs) inside the same Stone wrapper. The second held Tool becomes a real `PlayCardAction`, accepted by native Store. Float Stone changes Snorlax's retreat requirement **4 → 0**, permitting a real native `RetreatAction` without discarding either Capture Energy. The funded Bunnelby uses the genuine **Burrow** attack; the native opponent discard increases by exactly **one**.

Bunnelby's printed **Ω Barrage** Ancient Trait permits an optional second attack. The test verifies one Burrow's completed discard and deliberately declines the second attack through the pinned native `ConfirmPrompt` with `WANT_TO_USE_ABILITY=false`. An ensuing opponent turn draws one ordinary card. It is vital to separate that draw from the already settled one-card discard. The complete prompt-by-prompt deck and discard chronology is logged in both seats.

## Actual compiled native evidence

- **Reproducible test:** [`tests/agent2-fss-float-actual-store.native.test.cjs`](../../tests/agent2-fss-float-actual-store.native.test.cjs), under the already existing [manual-only rank3 native workflow](../../.github/workflows/agent2-fss-float-rank3-native.yml). Exact repository checkout `b300907c2e2617949626c5cce0307e71ab2782f6`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **PASS:** [GitHub Actions run 41909443827](https://github.com/FlareZ123/experiment-01/actions/runs/41909443827), native regression **16/16 passing**, zero failures; earlier pure invariants **9/9 passing**. Actual two-seat counterfactual line and prompt chronology each printed under `AGENT2_RANK3_NECESSARY_FLOAT_BURROW` and `AGENT2_RANK3_BURROW_NATIVE_CHRONOLOGY`.
- **Downloadable native stdout:** [artifact 13360943399](https://github.com/FlareZ123/experiment-01/actions/runs/41909443827/artifacts/13360943399), uploaded ZIP provider digest `sha256:60caaf2c4298763f4c77f66e76ef8b601113442327af84e269ffabe10e96bf76`. This is a test transcript artifact, not a full-game tournament receipt.
- **Physical input fingerprints:** actual seat 0 `25e5e048f92d3f4fae7be85fc9a998ad83f1cb05f180b35e94fb1c177196d9d5`, seat 1 `ffa0c371f91a8159a724deb2be0f534e43bac166c9124aff8a2b107a582d4a7b`. Each is reused unchanged between its same-seat A and B arms. They encode the staged card identities and physical seat, not the omitted entire random deck.

### Important CI false-green discovered and repaired

The earlier [run 41907157559](https://github.com/FlareZ123/experiment-01/actions/runs/41907157559) **showed GitHub Actions SUCCESS despite the native test output reporting 14 passes and 2 failures**. The workflow used `node --test ... | tee transcript.txt` without a pipeline failure-propagation guarantee; the successful `tee` exit status concealed Node's nonzero status. Repaired the existing workflow with explicit `shell: bash`, whose GitHub Actions execution uses `-e -o pipefail`. The subsequent [run 41907774446](https://github.com/FlareZ123/experiment-01/actions/runs/41907774446) correctly returned **FAIL** for a real test failure, proving the CI exit-code fix. Intermediate failing runs are retained. The final successful run separately checks all 16 tests, therefore avoids this false-green.

The first test failure also caught an incorrect assumption that Float Stone reduces retreat cost by two; its actual printed effect eliminates the entire retreat requirement. Another failure revealed the second-attack confirmation, and a later failure distinguished the first Burrow discard from the next player's normal draw. These were fixed against the pinned source and native transition traces. No upstream Twinleaf file was modified.

## Consequence and remaining limits

This is a real **choice-set omission with a demonstrated tactical benefit in a constructed native state**. Its treatment branch restores a legal-looking Tool/retreat/printed attack line to a source-neutral owner algorithm, including a discrete **zero-damage control effect** that a damage-focused heuristic could undervalue. The complete two-Burrow native continuation is now verified below. Optimal root choice against alternatives, natural source hand frequency, matchup prevalence, opponent's competent response, historical original source full-card legality, a common-policy release and 25-minute adjudication remain unqualified.

Do not incorporate the default-off recovery automatically in every matchup merely because one Store scenario improves. Submit it as one controlled policy feature to the Issue #25 integration steward, and require same-owner observation noninterference, complete payment/targets, native accepted transitions, owner prompt choices, actual opposite reply and regression on Tool Jammer and no-bench negative controls. Keep this staged result outside any competitive game-win denominator.


## Follow-up: genuine two-attack Omega Barrage payoff, both seats

The original one-Burrow test deliberately declined its optional second attack. The positive branch was subsequently compiled and verified with the pinned Store's actual second-attack `ConfirmPrompt` and `ChooseAttackPrompt`. The Store expects a **decoded native Attack object** as the direct `ResolvePromptAction` argument; the client's serialized `{index,attack}` format must first be decoded. An intermediate [run 41910287613](https://github.com/FlareZ123/experiment-01/actions/runs/41910287613) failed with `BLOCKED_BY_EFFECT` when the test incorrectly passed the serialized object directly, a **test-harness integration error** with no demonstrated vendor rules defect. The corrected test checks `prompt.validate(selectedAttack) === true` and passes the exact printed Bunnelby `Burrow` Attack object from the owner prompt.

[**Native run 41910908043**](https://github.com/FlareZ123/experiment-01/actions/runs/41910908043) (checkout `2ee22823075f15ca084e3eed6eb94059e2f92561`) **SUCCESS, 18/18 native tests, 0 fails**, with two positive Omega Barrage receipts, one per physical seat. Both receipts show two completed printed Burrow attacks with **exactly two cards added to opponent discard**, two Capture Energy still on Snorlax after the actual free retreat, and one separate ordinary next-turn opponent draw. The actual prompts are `WaitPrompt, ConfirmPrompt, ChooseAttackPrompt, WaitPrompt, WaitPrompt, WaitPrompt`. This doubles the constructed native payoff to **two milled cards**, while continuing to score **zero competitively qualified games**.

Raw CI artifact: [13361214531](https://github.com/FlareZ123/experiment-01/actions/runs/41910908043/artifacts/13361214531), uploaded ZIP SHA-256 provider digest `98ecc4dba6b3251dc336e461b9d11c7e56e8b308af1175caa041c175b3918070`. No full source 60s or actual metagame matchup was reconstructed.


## Source-neutral opponent-deckout frontier, paired terminal Store result

The same printed resource line has a sharply nonlinear payoff at **two cards remaining in the opponent's deck**. An unmodified zero-damage mobility selector [`agent14-generic-funded-floatstone-frontier.cjs`](../../simulation/twinleaf/agent14-generic-funded-floatstone-frontier.cjs) requires `projectedPrintedDamage >= 80` to consider the Benched target. Bunnelby's Burrow has printed damage 0 and a discrete opponent-deck discard. In the identical constructed owner observation, the existing damage-gated selector consequently returns `null`.

A new **default-off and source-independent** [owner-only imminent-deckout selector](../../simulation/twinleaf/agent2-bunnelby-deckout-float-frontier.cjs) consumes detached `actorObservation` plus public static printing/catalog metadata. It recognizes Bunnelby PRC's printed Ω Barrage + Burrow, publicly payable Colorless cost (one attached Capture Energy), an opponent **public deck count of 1 or 2**, a nonzero printed Active retreat requirement and available Float Stone. It respects visible attachment, Tool Jammer, Jamming Tower, attack/retreat and Tool-play locks. It proposes the existing native-neutral `attach-emergency-floatstone` (or `retreat-emergency-floatstone` if already attached) action kind, marked `paperQualified:false`. It reads neither opponent concealed hand identities nor Prize identities nor deck contents. It is a **conditional tactic**; checkup effects, unusual modifiers, replacement effects, other winning moves and complete policy competence still need evaluation.

The [paired native terminal regression](../../tests/agent2-fss-float-actual-store.native.test.cjs) starts from the same constructed physical source subset and moves eight opponent synthetic filler Energy cards from deck to discard in both arms, leaving **exactly two** face-down opponent deck cards. The input physical printed identities and deck contents are identical within each physical seat. The opponent uses a synthetic Mew V FST Active and a nonoriginal late-game filler history, so this is a **deliberately constructed terminal test, never a registered original-60 game**.

- **Control:** FSS-first Stone policy returns HOLD; Snorlax PGO still has retreat four with only two attached Capture Energy. A genuine `PassTurnAction` moves to opponent's normal turn, one card is drawn, the opponent has **one deck card left**, and native `GameWinner.NONE` (`-1`) remains. A pass is one comparator to establish this particular lost line, not a proof that the optimal control policy must pass.
- **Treatment:** The owner-only zero-damage selector proposes the actual second-held Float attachment; the existing experimental recovery wrapper emits its matching `PlayCardAction`. The native Store accepts Tool and free `RetreatAction`, retains both attached Capture on the Benched Snorlax, and executes first **Burrow** plus the explicitly confirmed, decoded **second Burrow**. Exactly **two** cards physically enter opponent discard. With the opponent deck now empty, the subsequent mandatory start-of-turn draw check ends the game for the acting player. Native `GamePhase.FINISHED=7`; actual `GameWinner=0` for seat0 and `1` for seat1.

**Verified latest CI:** [GitHub Actions run 41911882216](https://github.com/FlareZ123/experiment-01/actions/runs/41911882216), repository HEAD `bf01e3e1d80853bb3e294ceec1ad99afe5d883f0`, vendor pin unchanged `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **17/17 pure tests** including the new [eight-condition owner-view regression matrix](../../tests/agent2-bunnelby-deckout-float-frontier.test.cjs) and **20/20 compiled native tests** passed, 0 failures. Exact terminal result and both physical seats printed under `AGENT2_RANK3_FLOAT_DOUBLE_BURROW_TERMINAL`; the earlier single/double-Burrow receipts also remain. [Native ZIP artifact 13362927247](https://github.com/FlareZ123/experiment-01/actions/runs/41911882216/artifacts/13362927247), provider SHA-256 digest `46cc3e54dc8c8f566dbd698f76e1996f43262f865a241ddc716abca80d06c2fc`.

**Research interpretation:** A public, zero-damage attack can directly change a game terminal state, illustrating how an 80-damage cutoff misses an available high-impact tactic. The paired comparison is **one synthetic tactical state tested on two seats**, not two qualifying games, not a statistically representative natural source deal, not a demonstrated matchup advantage, and not a general policy-selection proof. It warrants an opt-in future integration test under the canonical owner-only, bilateral, alternate-actions and genuine opposing-policy gates.


## Exact opening-seven frequency bound for the specific pair

The previous [original-29 deck census](agent2-original29-fss-first-tool-starvation-20261104.md) counted **any alternate Tool**, producing a **1.1923%** rank-3 legal-opening-seven fraction for FSS-first, another Tool and no Basic V. Our rank-3 **Float-specific** prerequisite is narrower. Rank 3 has **one FSS, one Float, two other Tools, ten non-V Basics, one Basic V, and 45 cards from all other categories**. With seven physically randomized starting cards, require FSS and Float in the hand, at least one non-V Basic, no Basic V, and FSS preceding every held Tool in hand order. Its exact conditional probability among valid starting sevens is:

\[
\frac{\displaystyle\sum_{u=0}^{2}\sum_{b=1}^{10}
\binom{2}{u}\binom{10}{b}\binom{45}{7-2-u-b}\frac{1}{2+u}}
{\binom{60}{7}-\binom{49}{7}}
=\frac{152673}{36400768}
\approx0.004194224693281197
\]

Here \(u\) counts other Tools, \(b\) held non-V Basics; out-of-range binomial coefficients are zero. The first-tool factor is \(1/(2+u)\), since FSS is uniquely first among FSS, Float and the \(u\) additional Tools in a uniformly ordered hand. Independently verified with exact integer/rational `math.comb` and `fractions.Fraction`, this is **0.4194224693% of valid opening sevens**. The unconditioned probability is **0.3261340449% of all shuffled sevens**.

**This frequency applies only to that exact first-seven event**, before Mulligan repeats, extra draws, Item searches, Prize-card inspection or later turn changes. It is neither an upper nor a lower bound on the chance of the late-game Bunnelby/Float opportunity. The constructed terminal witness demands additional late-game board setup and an opponent deck count of at most two; no occurrence frequency or matchup-win improvement has been estimated from opening combinatorics alone.


## Verified original-field relevance and source specificity

The authenticated 29 original sixties contain **Bunnelby PRC 121** in exactly four source ranks: **rank 2 (two copies), rank 3 (one), rank 15 (two), rank 26 (one)**. Of those four, rank **3, 15 and 26** each include a **Float Stone BKT**. Only **ranks 3 and 26** combine that Bunnelby, Float, and Forest Seal Stone SIT in one original 60. Rank 3 further includes three Capture Energy RCL and rank 15 includes one; rank 2 includes two but no Float. Rank 26 contains no Capture Energy. These are exact card-name, set and number counts from [`full-decklists.json`](../aichi-2026/full-decklists.json), **not** claims of natural attack readiness or strategically rational use.

Thus **4/29** known source sixties (13.79%) have the printed double-Burrow attacker, **3/29** (10.34%) have Bunnelby plus Float, and **2/29** (6.90%) have the specific three-card FSS/Bunnelby/Float interaction. These are *source inventory frequencies*, never matchup odds. The three unpublished Top-32 ranks remain unclassified. A source-neutral owner algorithm should consider the opponent's ability to mill with zero printed damage as a real potential source threat in those confirmed inventories, subject to public board, Energy and position gates.


## Genuine original-source passive exposure audit: eight matched field games, zero observed pair roots

To evaluate whether the staged tactical failure is encountered at all under a current shared bot, the [preregistered original-rank3 read-only census](../../simulation/evaluation/agent2-rank3-original-fss-float-census.cjs) ran **eight** non-selected original-rank3 Snorlax Stall vs original-rank1 Shadow Rider Calyrex converted full-60 games. Fixed disclosed seed array `[290126,290127,290128,290129]`, both candidate physical seats, **260** action cap, unchanged source/candidate 60s, same existing canonical actor-only policy and native paper-Supporter/attachment guards in all cells. A reversible **read-only** native `Store.prototype.dispatch` observer counted all rank3-source owner roots when the source had first-Tool FSS followed by any held Float Stone and its owner-only Stone policy would hold, then examined own visible active/Bench/funding and publicly known opponent deck size. The observer did not select, veto, attach or switch a single card. Note the policy itself is the development-level shared bot and not a skilled paper agent.

**Native reproducible result:** [CI 41914381762](https://github.com/FlareZ123/experiment-01/actions/runs/41914381762), repository code checkout `4368593771909913a83c6fa5c81edabc3228a392`, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, **20/20 pure and 20/20 compiled native tests PASS** before the original-source audit. The full native audit then returned eight rows and zero errors; workflow succeeded. [Original source raw JSON and native-test archive, artifact 13365115558](https://github.com/FlareZ123/experiment-01/actions/runs/41914381762/artifacts/13365115558), provider ZIP SHA-256 `cc425b558f2126a0cf91e2c86672c19d5ba8f58f938819f161559dad54aba383`. Original rank3 converted card-array SHA-256 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`; original rank1 reference converted card-array SHA-256 `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`. The converter uses documented equivalent printings for some original cards; it preserves their registered names/counts.

| Original rank3 source seat | Fixed physical seed | Native status | Actions | Rank3 owner root actions | FSS-first Float-held states |
| ---: | ---: | --- | ---: | ---: | ---: |
| 1 | 290126 | capped | 260 | 35 | 0 |
| 1 | 290127 | terminal | 151 | 21 | 0 |
| 1 | 290128 | terminal | 47 | 6 | 0 |
| 1 | 290129 | capped | 260 | 33 | 0 |
| 0 | 290126 | terminal | 220 | 29 | 0 |
| 0 | 290127 | terminal | 236 | 35 | 0 |
| 0 | 290128 | terminal | 185 | 26 | 0 |
| 0 | 290129 | capped | 260 | 44 | 0 |
| **Total** | **8 attempted** | **5 terminal; 3 capped** | | **229** | **0** |

The exact counters were: **0 FSS-first-plus-Float roots**, **0 owner FSS holds with that pair**, **0 printed Float mobility opportunities with that pair**, **0 funded Bunnelby follow-up candidate roots**, and **0 imminent deck-out roots**. Therefore there was **no legitimate causal treatment opportunity to compare inside these eight original-source games**. Do not count the staged synthetic terminal as a win in this original field. The pilot has zero native exceptions; a previous [CI 41913798828](https://github.com/FlareZ123/experiment-01/actions/runs/41913798828) failed immediately with a syntax typo before original games started and therefore does not count as another cohort.

**Inference boundary:** These are eight different original full-physical deals under incomplete bots, with repeated action roots in the same game. The 229 roots are **dependent within games** and cannot be analyzed as 229 independent Bernoulli exposures. Zero observed pairs in eight particular deals does not establish impossibility, true source-hand incidence, a statistically reliable rate, or absence in future original games. Moreover the strict first-Tool ordering is just one path to a Flat Stone choice. The native tactical comparison remains a valid counterexample to an unconditional zero-damage utility threshold, while no impact on complete-field winning percentage is supported by these observations.
