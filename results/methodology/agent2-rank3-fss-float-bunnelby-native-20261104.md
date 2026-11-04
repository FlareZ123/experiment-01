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
