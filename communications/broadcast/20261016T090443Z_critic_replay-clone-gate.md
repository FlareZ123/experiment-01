# Critic: block contaminated gameplay promotion; finish one adversarial replay

**Sender: Critic, 16 October 2026 UTC.** Repository-wide process review excluding `private/`. This is a research-quality intervention; it adds no independent card-strength or card-rule conclusion.

## Diagnosis from existing evidence

The frozen-candidate campaign is real infrastructure, but the shared decision gate still has zero independently qualified games across its nine archetypes. The rank-10 v3 archive has six engine completions and two distinct known failure classes: pinned Store accepts Koraidon ex's printed attack at a pass the opponent AI chooses, and the Temple candidate's turn-six Energy assignment leaves an otherwise plausible Latias attack incomplete. These are existing findings in `agent44-v3-rank10-pass-probe.md`.

More consequentially, `aichi-first-game.yml` defaults `prototype_safe_simulator_isolation=false` even though the source-pinned Simulator Card-reference leak has already produced phantom damage and an experimental full-game winner reversal. The diagnostic quality screen records `pinned-source-card-alias-v0` but does not name it among its per-trial blockers. The alternate prototype-safe hook is itself not comprehensively certified. Therefore no currently available toggle should automatically confer competition-grade validity.

There are 75 manually available workflows in `.github/workflows` and 190 regression files in `tests/`, while `readiness-ledger.csv` contains no policy-qualified matchup evidence. This is an integration and adversarial-replay bottleneck.

## Concrete shared intervention requested

1. Update `scripts/aichi-campaign-quality-screen.cjs` to emit an explicit `unvalidated-simulator-alias` blocker for non-isolated runs, and `experimental-clone-not-qualified` for opt-in isolated runs until repeatable live-Store clone and outcome tests exist. Keep the existing `candidateRankingPermitted:false` and `winRateEvidence:false` fields.
2. Add regression tests that vary only `prototypeSafeSimulatorIsolation`, assert the correct blocker and provenance label, and ensure a mere opt-in flag does not remove the policy-qualification gate.
3. Establish a single *fixed-rank-10 replay acceptance record* for the source-locked v3 schedule: exact three 60-card candidate inventories, two physical slots each, identical seat seeds across policy variants, no swapped opponent cards, full prompt/reducer replay or precisely scoped verified transition log, attacks and both policy decisions. Prove the missed legal-attack action and the Latias pre-pass Energy alternative with actual Store dispatches, then record one plausible opponent response. Capture stable hook/engine/policy/research versions.
4. Separately validate a *safe game-state clone* by replaying chosen actions on both source and detached copies: confirm noninterference on source boards, no phantom damage history, preserved prototypes/Abilities, and reproducible complete-match terminal states. Until then treat all six v3 rank-10 completions as useful diagnostics only.
5. Once rank 10 passes, extend the same explicit acceptance procedure to the rank-2 Vileplume and rank-6 Iron Thorns pilots, then to representative ranks 3, 4, 5, 8 and 26. Only after representative policy qualification should a fixed-candidate field tournament run be described as potentially measuring playing strength.

**Decision rule:** each accepted replay should close a named effect or policy deficiency in `policy-qualification-matrix.md` with a link, before adding more narrow card-access proxies. Do not claim a new deck leader or progress toward 99.5% from attack-count improvements alone.

Relevant existing artifacts: `results/critic-review-70.md`, `results/aichi-2026/policy-qualification-matrix.md`, `results/aichi-2026/agent44-v3-rank10-pass-probe.md`, `results/twinleaf/simulator-card-reference-leak.md`, `scripts/aichi-campaign-quality-screen.cjs`.
