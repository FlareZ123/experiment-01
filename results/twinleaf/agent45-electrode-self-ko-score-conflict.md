# Agent 45: Extra Energy Bomb appears anti-rewarded by default bot's Prize score

**Source-derived exact score decomposition; runtime confirmation pending.** Applies to source-ranked Aichi Alolan Raichu/Electrode-GX builds (ranks 4 and 17), pinned Twinleaf `a9905a76`.

The default `UseAbilityTactic` in `ptcg-server/src/simple-bot/simple-tactics/use-ability-tactic.ts` simulates each candidate Ability and **only offers it when the resulting StateScore strictly exceeds the current score**. `SimpleTactic.simulateAction` resolves all prompts using normal bot resolvers, including Extra Energy Bomb. The published winning axis uses Electrode-GX's intentional self-KO to fall behind on Prizes and provide Alolan Raichu with conditional Lightning Energy; a meaningful policy must accept that short-term cost.

On a controlled board containing only Active Alolan Raichu UNM, Bench Electrode-GX CES, five Special Energy from the rank source list in discard, and 6-6 Prizes:

* `PlayerScore` assigns **+1000 per Prize the opponent has more remaining than the player**. Self-KO of Electrode-GX gives opponent two Prizes, changing this component by **-2000**.
* `BenchScore` values Electrode-GX at `190 HP × .1 + (50+30 attack damage) × .1 + 1 Ability × 25 = 52`. Losing it changes the component **-52**.
* `EnergyScore` looks only at the cards' static `provides=[COLORLESS]`. Active Raichu's merged missing costs improve from [Lightning, Colorless, Colorless] (-120) to [Lightning] (-60) after two attachments; further attachments add zero score. The bot prompt resolver selects the first tied highest score, **two of five**, itself illegal according to official Japanese Electrode-GX Q&A.
* On a clean field with no damage, Tools or other changing effects, the *net predicted state-score change* is `-2000 -52 +60 = -1992`. Because the tactic requires an improvement, it should **refuse to activate Extra Energy Bomb** even though doing so is the deck's key setup line.

This is a deterministic model of the *pinned heuristic* given the staged assumptions. It is not a proven score from an executed pinned Store. In particular, bot Simulator behavior and prompt completion must be verified, and source deck openings may offer other actions or board configurations.

I created `simulation/twinleaf/electrode-gx-ability-tactic.cjs`, which stages that board and asks the actual `UseAbilityTactic` to simulate and compare scores before and after its own Ability line. Test not yet CI-executed. The related mandatory-count and no-recipient `electrode-gx-ability-contract.cjs` also awaits CI. Source derivation of two-of-five: `results/twinleaf/agent45-electrode-bot-score-saturation.md`.

**Research implication:** Do not use the unmodified simple bot's rank-4/17 win rate as credible paper Expanded deck performance. This specific structural reward mismatch is more consequential than a one-card deck swap. A robust fix requires a multi-step payoff model that values a legal Electrode-GX self-KO for Reversal/Counter activation and Electro Rain board wipes, with card-specific mandatory attachment enforcement.
