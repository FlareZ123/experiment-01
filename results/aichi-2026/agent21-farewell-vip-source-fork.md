# Rank-11 New Moon: first-turn Farewell Letter → VIP Bench-capacity fork

**Agent 21, 18 October 2026. Experiment registered before compiled execution.** This is a retrospective **policy/action-mechanics** question on the previously selected genuine rank-11 seed **2809154458**. No competitive win rate or proof of better play is proposed.

## Why this fork, and precise source

[Agent 2's compiled source report](agent2-newmoon-real-vip-firstturn-counterfactual.md) records New Moon candidate in physical B, **actually first**. The owner first-turn state is Active **Unown AOR**, Bench **Galarian Articuno V CRE + Unown AOR + Unown AOR**, and two free ordinary Bench slots. Its own hand contains two **Battle VIP Pass FST**, plus Psychic Energy, Fog Crystal and Rescue Carrier. The archived independent VIP intervention legitimately found **Mewtwo & Mew-GX UNM** and **Gengar & Mimikyu-GX TEU**, placing both into those final two Bench positions.

The supplied full card database and pinned [Twinleaf Unown AOR source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-ancient-origins/unown.ts) agree that the **Farewell Letter** Ability allows an Unown on the **Bench** to discard itself (with attached cards) and draw one card. The pinned reducer also refuses this Ability if the owner's deck is empty. The original candidate's two Benched Unown are an independent resource and capacity channel.

**Deterministic Bench arithmetic, conditional on both Abilities legally resolving:** the opening 3/5 Bench becomes 1/5 after two Farewell discards, then 3/5 after VIP benches two targets, leaving **two empty positions**. VIP alone gives 5/5 and zero empty positions. The two spaces can be reserved for later Solrock/Lunatone if accessible. This difference is only a geometric possibility. Farewell sacrifices physical Unown, makes two unknown draws, changes policy information, and may interfere with alternative evolution, discard or attack plans. The printed New Moon Ability protects against Stadium effects when Solrock is in play; it does **not** independently remove Garbotoxin Ability lock.

## Frozen intervention and falsification contract

- Unchanged **New Moon Lockbreaker v1 English-mechanics proxy 60** and authentic registered **rank-11 opponent 60**. No injected cards or altered Prize/deck positions. Printed Japanese source equivalence remains unqualified. Code [pair runner](../../simulation/twinleaf/rank11-newmoon-farewell-vip-source-pair.cjs), [reversible adapter](../../simulation/twinleaf/newmoon-farewell-vip-bench-policy.cjs), [pure unit tests](../../tests/newmoon-farewell-vip-bench-policy.test.cjs).
- Same physical-source seed **2809154458**, rank-11 A, candidate B, full deck SHA-256 identities asserted, actual start confirmed from engine draw log. Pinned engine expected **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, shared branch head recorded by GitHub Actions at runtime.
- **Control:** Agent 2's existing opt-in engine-accepted VIP policy. **Intervention:** up to two engine-validated Farewell Letter Ability actions on unattached Benched Unown *before the exact same VIP wrapper*. No source read beyond own hand, own public Bench and Store action validation before VIP. Actual physical owner deck search is delegated to the existing VIP-prompt handler.
- Falsification: one/both Ability actions rejected, Unown not removed, VIP not accepted or no longer produces the expected Bench target selection, initial own-information state differs between arms, or the matched source match throws. Every observed action/rejection and original policy fallback matters; a green workflow alone is insufficient.
- **Primary outcome:** Count actual source-root Farewell declarations, actual next-root Bench Unown decline and free slot count, then actual post-VIP Bench occupancy. **Secondary:** owner draws, alternate activity, attack declarations. Full-game terminal winner is excluded from performance inference.
- Experimental tools are opt-in to the **existing manually dispatched** workflow rank11-direct-boostshake.yml via farewell_vip_pair=true; no per-commit workflow. Its JSON output is rank11-newmoon-farewell-vip-source-pair.json, retained as an artifact.

## Evidence and verdict

**Status: implementation committed; compiled source-dealt execution pending.** The deterministic capacity arithmetic and K0-only pure policy are separable from the actual engine's action acceptance. Do not promote this hypothesis until the saved artifact shows legally accepted Farewell actions and authentic post-action Bench transition. Independently investigate whether the resulting draw/board state is strategically stronger: the original opponent's response, attacks, hand-lock ALS and later Tool lock are not qualified by this fork.

**Field status unchanged:** 29/32 exact Aichi Top 32 source lists, missing ranks 23/25/28; **zero independently competitive-qualified games**. One retrospectively chosen paired state is not a win-rate denominator.
