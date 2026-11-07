# Agent35: isolated native Powerglass end-of-turn prompt precedes KO Prize selection

**7 November 2026 | Pinned Store rules-fidelity investigation | An observed native ordering, not a formal paper-rules ruling.**

## Reproducible isolated experiment

The independent [genuine pinned-Store probe](../../simulation/twinleaf/agent35-powerglass-ko-prize-order-native.cjs) ran successfully in [CI 42344386817](https://github.com/FlareZ123/experiment-01/actions/runs/42344386817), job **isolated-store-rule-order**, against Twinleaf pin **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, without bot policy wrappers. It created a public legal-shape battle state: acting Active **Unown AOR** with one Basic Psychic attached and genuine played **Powerglass SFA**, original opponent Active **Trubbish FST** with 60 damage on 70 HP, and an opponent Benched **Tapu Lele-GX** available to promote. Six face-down Prizes remained on each side. It submitted an actual Store **AttackAction Hidden Power** for 10 damage, then resolved only a native WaitPrompt to inspect the first substantive prompt.

The returned live Store output is:

- Real pending prompts observed in order: **WaitPrompt, AttachEnergyPrompt**.
- **First choice-requiring prompt: AttachEnergyPrompt**, for the end-of-turn Powerglass effect.
- Source Active Pokémon after the attack: **null** (the damaged Trubbish is already physically removed).
- Attacking owner remaining Prizes: **6**. Defending opponent remaining Prizes: **6**. No Prize has yet been selected.
- Diagnostic **PowerglassBeforePrize = true**.
- All actions were actual compiled pinned Store actions. The staged simulation is neither a full game nor a win.

The same interleaving occurs in the independent natural registered rank11 versus New Moon replay [CI 42343871719](https://github.com/FlareZ123/experiment-01/actions/runs/42343871719): candidate **Attack107 → Wait108 → Powerglass AttachEnergy109 → ChoosePrize110 → opposing promotion111**. At that time original defending Trubbish has already left Active, and the candidate still has six Prizes. The game subsequently resolves the candidate's genuine one-Prize Knock Out successfully.

## Paper-rules comparison and confidence

The provided *Advanced Player's Rulebook* v3.4 lays out attack resolution at A-01: step7 checks for Knock Outs after damage and outside-damage effects. Section D, Knock Out, includes the Knock Out process and taking Prize cards in step4. Section **E-21, End of the turn**, defines the end-turn step as timing **after an attack has been completed**, before Pokémon Checkup, explicitly including Powerglass even when no attack was declared.

That strongly suggests ordinary KO and Prize resolution should be completed before a Powerglass E-21 choice. The pinned native Store demonstrably presents the Tool's owner-discard AttachEnergyPrompt *before* Prize-choice and opposing promotion. This is a **repeatable potential paper-order divergence**, now independently observed in a controlled Store test and a physical tournament-list replay. It deserves formal paper-rules confirmation and an engine-hook regression test. The presence of such a prompt alone does not prove a tournament play was illegal, and it does not establish which downstream actions would change if the ordering were repaired.

The concrete Trubbish Knock Out and candidate Prize remain native Store facts. Their interpretation for paper matchups is bounded by this fidelity uncertainty and the more general opponent-policy deficiencies. The stage has zero independently qualified games and supplies no win-rate estimate.

## Recommended follow-up

Implement a targeted minimal simulation adapter regression covering **KO then Prize selection/promotion then E-21 Powerglass**, with an external paper-rules adjudication if needed. Maintain upstream Twinleaf as a pinned vendor submodule and implement any required repair through research-side hooks, preserving exact code revision and before/after native receipts. Re-evaluate edge cases involving opposing promotion-dependent Abilities or affected end-turn Energy recipients. Do not allow the apparent timing to inflate game-win estimates.

Related [Agent35 full Powerglass payoff and root-cap report](agent35-v9-powerglass-actual-prize-root-cap-20261107.md). Shared Aichi field: 29/32 authenticated source inventories, zero competitively qualified games and no demonstrated 99.5% win rate.
