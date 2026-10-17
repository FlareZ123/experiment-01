## 17 October 2026 update: confirmed, opt-in corrected and headless-integrated

The 16 October text below is preserved as a source-code prediction. Its pending verification is superseded by pinned-engine manual CI:

- [CI 38863421275](https://github.com/FlareZ123/experiment-01/actions/runs/38863421275) and [CI 38863820733](https://github.com/FlareZ123/experiment-01/actions/runs/38863820733): real staged `UseAbilityAction` and `ResolvePromptAction` with 5, 4, 0, and fewer-than-5 transfers, a no-recipient board and `SimpleTacticsAi` decisions. The pinned prompt allows 4/5 and 0/5, and its default bot can select fewer Energy even when five are available; the first failure was a fixture's incomplete Prize prompt, fixed before these passes.
- [CI 39024404276](https://github.com/FlareZ123/experiment-01/actions/runs/39024404276): exposed `electrodeGXEnergyCorrection` as an opt-in `runMatch` flag; established reversible registration and exact source-rank 4/17 60-card bounded headless lifecycle under strict prompt validation. The full-field executor also accepts and checks the echoed flag.
- [CI 39024621252](https://github.com/FlareZ123/experiment-01/actions/runs/39024621252): same 40-action source-rank scenario verifies the Electrode hook can be installed together with the separate Alolan Raichu Electro Rain attack-damage correction without persisting vendor changes.
- [CI 39024825729](https://github.com/FlareZ123/experiment-01/actions/runs/39024825729): corrected upstream greedy `AttachEnergyPromptResolver` **only for Electrode's marked mandatory prompt**, so a legal bot response attaches all five available cards, while the research-owned hook rejects partial/empty submissions and nonexistent recipient boards. The emitted policy suffix is `ElectrodeGXMandatoryEnergyAndBotCount-v2`.
- [CI 39025265068](https://github.com/FlareZ123/experiment-01/actions/runs/39025265068): a constructed same-Store-turn line resolves Electrode's three mandatory transfers (Reversal PAL, Counter CIN, Unit LPM UPR) to Active Alolan Raichu, awards the opponent two Prize cards for Electrode's self-KO, then performs a real `AttackAction('Electro Rain')` against a Benched Shadow Rider Calyrex VMAX with Telescopic Sight. Regression requires **180 attack points in the pinned path and 210 under the separate damage-corrected hook**. This is a staged evolved board and selected transfer/attack line, not a naturally sampled 60-card opening or a competent policy.

Code and tests: [`electrode-gx-energy-hook.cjs`](../../simulation/twinleaf/electrode-gx-energy-hook.cjs), [`electrode-gx-ability-contract.cjs`](../../simulation/twinleaf/electrode-gx-ability-contract.cjs), [`electrode-gx-energy-hook.test.cjs`](../../tests/electrode-gx-energy-hook.test.cjs), and [`headless.cjs`](../../simulation/twinleaf/headless.cjs). All changes are outside pinned `vendor/twinleaf`.

**Remaining qualification blockers:** the opt-in correction does not establish that the bot can avoid declaring the Ability when it lacks a recipient; this currently fails closed if attempted. Its first-five-card selection is simple greedy behavior and may discard better combinations. The source-bounded 40-action smoke establishes hook lifecycle rather than actual Electrode activation frequency. There are still **zero competitively qualified Aichi Top 32 games** and no supported matchup win-rate estimate.

---

# Agent 45: Extra Energy Bomb headless empty-selection chain

**Evidence: pinned source-code control flow, 16 October 2026.** This predicts a legal-looking but paper-illegal action in the research bot. The complete staged action and Prize outcome await the standalone regression.

Source ranks **4 and 17** both play Electrode-GX CES 48. The [official Japanese Pokémon Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%83%9E%E3%83%AB%E3%83%9E%E3%82%A4%E3%83%B3GX&regulation_faq_main_item1=all) requires attaching all five cards when five Energy are available, attaching all available when fewer, and **prohibits activating the Ability if no eligible recipient exists**.

At pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

1. `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts` checks only if *any* Energy is in discard, then creates an `AttachEnergyPrompt` with `min:0,max:5,blockedTo` the player's GX/EX Pokémon. An empty resulting `transfers` array triggers 999 damage to Electrode-GX, just like the nonempty branch.
2. `ptcg-server/src/simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts` **deliberately adds `[]` to its candidate results when `min===0`**. It filters targets against `blockedTo`; when no non-GX/EX receiver exists, `assignToBestTarget` returns `undefined`, and its resolver returns the initial empty candidate.
3. `ptcg-server/src/game/store/prompts/attach-energy-prompt.ts` validates an empty array when `min=0`; its `validate` does not check the forbidden target list.
4. `ptcg-server/src/game/store/store.ts` `reducePrompt` accepts the submitted result without calling its validator.
5. The research headless driver `simulation/twinleaf/headless.cjs` enables a separate `strictPromptValidation` option; both `simulation/evaluation/aichi-campaign-runner.cjs` and `aichi-campaign-execute.cjs` set it true for the serious source-locked campaign. **That guard checks the prompt's own permissive validator, so it does not fix these card-specific counts.**

**Predicted consequence:** if Electrode-GX's Ability is offered while the player's field contains only GX/EX Pokémon, with at least one Energy in discard, a normal bot decision can choose the empty prompt result and self-KO Electrode-GX for two opponent Prize cards, violating the Japanese Q&A. The normal bot can also rank partial transfers by state score, rather than requiring all available up to five. Reachability still requires a real Store-action fixture verifying upstream power checks, resulting KO, and Prize accounting.

Proposed executable: `simulation/twinleaf/electrode-gx-ability-contract.cjs` (new Agent45 file) stages 5, 4 and 0 transfers and an all-GX field. It is not yet CI-executed. Validate both injected prompts and a `SimpleTacticsAi` `decodeNextAction` decision in the no-recipient state; compare strict validation on/off. Correct only with research-owned hooks or scoped card-policy safeguards and retain vendor unchanged.

**Impact:** Without this regression and a credible correction, full-game rank-4/17 outcomes cannot be promoted to paper-accurate win-rate evidence. The discrepancy does not itself prove a numerical bias.
