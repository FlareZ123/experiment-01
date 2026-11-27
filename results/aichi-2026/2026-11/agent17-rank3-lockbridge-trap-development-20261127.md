# Rank 3: concrete Lockbridge-aware trap decisions (development only)

**Decision enabled:** improve the rank-3 opponent decision policy before any Hood Shield / Lockbridge comparison, so Wobbuffet is not awarded an artificial advantage over an opponent that fails to protect Block or gust an attackless liability.

The original rank-3 60 and both candidate 60s remain unchanged. Base main `c9bcb0cf494e44dae4ce8c61c9fd99f18010a9d5`; original rank-3 worker blob `7706de06082e2c1e2e06dfa1685a8cc06d8b011c`. The branch changes the existing rank-3 worker and adds one focused Node test file. The existing v1.2 dependency manifest remains historical, not a binding for this v1.3 development branch.

## Implemented choices

- On an actor-visible Active Wobbuffet PHF 36, an untooled Active Snorlax PGO 55 can recover Block via Stealthy Hood UNB 186. Prefer that exact Active target over an identically printed Benched Snorlax or attaching Tool Jammer; reserve the singleton Hood without a meaningful window. Defer Jammer on the Active slot when a held or immediately tutor-accessible Hood has this use. Arven's existing Item+Tool prompt now prefers Hood in that window. A visible Tool-effect suppression, retreat prohibition, no opposing Bench or immediate Psychic Assault KO risk suppresses the Hood score. These are deliberately restricted policy conditions, not a universal lock evaluator.
- Prefer a legal Counter Catcher that gusts Benched Dialga-GX UPR 100 while Snorlax is Active over spending Hood on Wobbuffet. Both registered candidate lists use only Basic Psychic Energy, and every Dialga attack requires Metal; with Dialga Active, Wobbuffet is no longer Active and Block can function. A legal Guzma can use the same route if Snorlax is Benched and can be promoted. Preserve the already established Dialga trap instead of gusting out of it. The gust continuation prefers Dialga over an Energy-loaded VMAX; Plumeria and Team Flare Grunt scoring do not inherit this gust-specific target preference.
- The candidate can still escape via switching effects, remove Hood with its Field Blower or break the lock by other legal lines. This is not an asserted inevitable deck-out or matchup result. Unknown future opponent actions, Rotom's Hood alternative, broad tool/ability suppression and non-pair attackers are not solved. No private opponent card or physical-seed input is used.

Card evidence: source pool `pgo-55`, `xy4-36`, `sm10-186`, `sm5-100`; advanced rules A-03/C-03/C-05 and A-02. The exact candidates are Hood Shield `1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924` and Lockbridge `011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642`. Both use 11 Basic Psychic Energy, no Metal. Source-rank identity is unchanged. The original worker's legacy Hood-only manifest is not promoted into a two-candidate signed policy plan.

## Evidence

`tests/2026-11/agent17-rank3-lockbridge-trap-development.test.cjs`: **23/23** direct V8 test cases passed executing the exact modified dependency-free policy module and the exact Node test bodies using a minimal test/assert/require shim. Both actor seats, root actions, Arven and gust continuations, matching-slot ambiguity, suppression, KO risk, loss-of-capability controls and set-only native aliases are covered. No Node test runner, existing full v1.2 regression suite, native Store, workflow, worker IPC, game, policy competence or competitive admission was exercised. The pure action scoring needs independent review and a future exact-release/native gate; do not dispatch or merge on this receipt.

No candidate/deck change, Stage-A patch, frozen PR edit, fixture, workflow or decision-board promotion. This branch is a bounded development proposal, not a new benchmark or parallel harness.

## Counterplay hardening (same development branch)

- A candidate Hood on the prospective Active can itself prevent the opponent Ability effect of Block. Do not value a Wobbuffet-Hood restoration when opposing Wobbuffet already carries a live Hood. Do not promote a Hooded Dialga trap unless the specific Snorlax has live Tool Jammer (or both Tools are suppressed). Guzma with mixed duplicate Snorlax candidates is conservatively not awarded that trap boost. This is a card-text-derived policy assumption (manual C-14), to be validated in a real Store test; it is not a newly certified ruling.
- Collapse against a currently held attackless Dialga is now declined unless it immediately wins by taking the final two Prizes or removing the opponent's last Pokémon. The nonlethal hit can make previously undamaged Dialga eligible for Acerola; a nonwinning KO frees the opponent to promote an actual attacker. This is a conservative stall policy choice, not a calibrated win-rate optimum.
- New tests add opposing Hood, active Jammer, duplicate promotion ambiguity, high-Energy competing target, preserve-trap versus winning-KO decisions, and set-only aliases on the touched Trainer actions. Total **23/23** direct V8 cases passed. Other root aliases and historical policy limitations remain unresolved. No native or Node full regression is claimed.

## Follow-up regression checkpoint — 06:31 UTC

All 49 existing v1.2 test bodies passed against the changed v1.3 development module at `7c0d69636ec10839d357cb87503ed73a1848c47e`, using the exact historical worker validator blob `d51ea95c457d61b50a9ee114d342eb17f4350451` and a direct V8 CommonJS/test/assert shim. This is in addition to the 23 focused new test bodies. An initial shim-only failure was corrected by supporting the optional second argument of assert.throws; the rerun passed 49/49. Neither run invokes Node IPC, Twinleaf, or native legal-action generation; historical assertions are not proof of paper rules correctness.
