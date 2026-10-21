# Agent 19: prospective paired source-side solo Snorlax Bench-preservation test

**21 October 2026. Result: every registered arm executed and compiled tests passed.** This tests one source-opponent decision-policy feature against unchanged original rank-1 Shadow Rider. It makes **no competitive win-rate claim**.

## Protocol and immutable provenance

The [precommitted trial protocol](agent19-snorlax-bench-preservation-preregistered-20261021.md) froze all seed and policy choices before execution. The 12 physical deals were rank3 and rank7 original source registrations, each source in both physical seats, three independently derived repeats per seat. Each had two arms on the same seed: (A) solo Snorlax setup with optional Bench declined, ordinary Basic Benching later; (B) identical setup with opt-in `snorlaxSoloPreserveBench:true`. No opponent, card or seed substitutions between arms. Engine Block retreat-start correction and other settings identical. Action cap 100.

- **Successful compiled manual CI:** [GitHub Actions 39611175734](https://github.com/FlareZ123/experiment-01/actions/runs/39611175734), pinned checkout **d1af9692ddac687797d52e59c12cb3858811fa24**; the workflow's original and new tests all passed.
- **Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- **Source field manifest digest:** `653ed6620d742f1f011d729557265e6173902b5fa87c8b4830f886f7be585173`.
- **Reference candidate digest:** `77d91942a34e18fe5dc076eddba2e54602004dede2b0bc44786eefa6ddc94086`.
- **Frozen seed base:** `2026102119`, slot-derived v3; all seeds preserved in machine-readable artifact. **12 pairs / 24 attempts**.
- **Raw CI artifact:** `aichi-snorlax-root-setup`, ID **12350542038**; ZIP SHA256 `f60c2955df404d073cfaf804a32e402d039ec94bbd64edfa70964b73ca103bb0`.
- **Trial JSON:** `aichi-snorlax-bench-prospective.json`, SHA256 `0f3eeac4dea9c219f37cfc73ab51a0c2d8bb273a0a63a8644e31a3ec8c3dcb8b` (923145 original bytes).

## Complete paired outcome census

| Prespecified measure | Observed |
| --- | ---: |
| Physical deals | 12 (rank3 6, rank7 6) |
| Executed bounded native attempts | **24/24**, no errors |
| Same observed source starting board within physical pair | **12/12** |
| Source actually starting first | **7/12** physical pairs |
| Source solo PGO Snorlax first-turn boards | **3/12** (rank3: 3/6; rank7: 0/6) |
| Identical public native root ledgers between arms | **9/12** |
| Different public native root ledgers | **3/12**, exactly the three solo boards |
| Untimed native completions, ordinary Basic arm | **1/12**; 11 capped |
| Untimed native completions, preserve Bench arm | **2/12**; 10 capped |
| Source wins in either arm | **0** native terminals |
| Paper/timed/policy-qualified competitive games | **0** |

**All nonexposure and capped arms remain in the denominator.** The 9 matched cases without root divergence are evidence of the narrow scope of this tested intervention. They are not evidence of equivalence under stronger policies or unseen states. The policy does not guarantee continued empty Bench: Capture Energy and other card effects still work.

## Three actual decision divergences

| Rank3 source-dealt seed | Source physical seat and actual start | First native root difference | Bounded outcomes |
| --- | --- | --- | --- |
| **4276588378** | A, source first | ordinal **12**, ordinary plays **Bunnelby**; preserve plays **Capture Energy** | Both reach 100-root cap, no winner. Later Capture Energy's Bench access and subsequent actions mean preservation did not keep Bench empty; both final source boards have five Benched Pokémon. |
| **4248970588** | B, source second | ordinal **23**, ordinary plays **Galarian Stunfisk**; preserve **passes** | Ordinary arm caps at 100 roots (turn17), rank1 ahead 5 vs source 6 Prizes; preserve arm is an untimed rank1 native win at root58 (turn9). Source final public board has neither Active nor Benched Pokémon after rank1's **Full Moon Rondo** declaration and prompt settlement. |
| **2238730718** | B, source first | ordinal **32**, ordinary plays **Mimikyu**; preserve **passes** | Ordinary arm is a rank1 native win at root70 (turn10), candidate 3 vs source 6 Prizes; preserve arm reaches rank1 native win at root43 (turn6), candidate 5 vs source 6 Prizes. Source final public board again empty following **Full Moon Rondo** declaration and prompt settlement. |

The second and third cases are direct **reproducible counterexamples to unconditional solo-Bench preservation as a safe rule** in these unqualified headless source matches: keeping the last source Pokémon alone allowed the other side to end the native game after one Prize, whereas keeping or eventually creating Bench backup postponed that condition. Each case retains the complete root ledger, printed played-card names, first-turn board, attack declarations, and final public board in the archived JSON. The runner's declared-attack instrumentation is **not independently paper-effect-qualified**; the observed native terminal and empty public source board are narrower facts.

The first case is a separate policy-channel result. The guard only suppresses `PlayBasicTactic`. Normal Energy attachments, special search/Bench effects and prompt resolution remain enabled. The preserve arm played Capture Energy first and later Benched several Pokémon via other mechanisms; a policy researcher must not call this a universally maintained solo Active.

## Inference and next design requirement

One strategy variable, the willingness to Bench a backup Basic, affects multiple axes at once: susceptibility to gusting, survivability of the only Pokémon, continued access to Block when Snorlax is Active, backup attackers, and future Bench search. These three correlated source deals establish tactical **possibility and mechanical policy effects**, not an unconditional ranking of the two policies or a frequency-of-win advantage. The reference bot and source bot are still weak, native outcomes are untimed, Japanese printing/legal interactions remain partially proxied, and rank7 has zero observed solo exposure in this small cohort.

**Next useful investigation:** implement a source-owner-information-safe decision to add a backup when the opponent's public board or previous attack indicates imminent sole-Pokémon knockout, while otherwise preserving solo Snorlax when it offers a meaningful Block lock. Validate decision and actual Store dispatch against these three frozen deals as *retrospective mechanical regressions*, then preregister a **new independent both-seat cohort** for effect testing. Preserve all failures, nonopportunities and strong opponent responses. Only qualified future trials can affect fixed-deck nomination. Overall complete field still **29/32 source 60s**, and **0 verified competitive games**.

## Reproduce

- Runner: [snorlax-bench-preservation-prospective.cjs](../../simulation/twinleaf/snorlax-bench-preservation-prospective.cjs).
- Tests: [snorlax-bench-preservation-prospective.test.cjs](../../tests/snorlax-bench-preservation-prospective.test.cjs).
- Manual CI: [aichi-snorlax-root-setup.yml](../../.github/workflows/aichi-snorlax-root-setup.yml) (no per-commit trigger).
