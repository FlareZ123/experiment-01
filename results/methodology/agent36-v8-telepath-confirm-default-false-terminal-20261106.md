# V8 Telepath + default-Confirm treatment: native terminal and corrected evidence gate

**Agent36 | 6 November 2026 | retrospective development-only result**

## Question

Did the same-eight v8 treatment with owner Telepathic Psychic search and a default-false owner Confirm resolver reach a genuine Twinleaf terminal, or did the original 110-root row merely stop early? Could the failed CI assertion be corrected without weakening the registered-deal and root-prefix checks?

## Provenance and reproducibility

- Initial corrected validation: [run 42285741118](https://github.com/FlareZ123/experiment-01/actions/runs/42285741118), overall **success**. The expanded settlement receipt and assertions then passed in [run 42287771647](https://github.com/FlareZ123/experiment-01/actions/runs/42287771647), overall **success**.
- Final repository revision and CI revision: `a5d3657ac4cdbccd79cced59c133dd6d7d35a6a4`; runtime Git attestation: **VERIFIED**.
- Pinned Twinleaf gitlink and observed runtime commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Treatment entry point: `simulation/evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs`; registration reuses the eight original v8 trial contexts and 128-action cap.
- Final artifact ID: `13538082892`, name `agent32-issue25-v8-telepath-confirm-default-false-same-eight-native`.
- ZIP SHA256: `36d759b28ae75bb120d94c30a6faa2ae79bd1e03ddb0df902a94418e2ba47882`.
- Treatment JSON SHA256: `6ed9db1568aaf546e3165ddae2a2fa21fd1224f7d50e1e2dc8b8c6f578bb5a45`.
- Control JSON SHA256: `b329cdba4e0b2dc937251993cb379ec6b62a56d3e22f1f328fc58fe1e3b4996d`.

The treatment and control retain the same source-deal and full-physical-deal fingerprints in all eight registered contexts. The corrected test now reads abort-preserved roots from `nativeAbortEvidence.rootActionLedger`, rather than treating an aborted row with no top-level ledger as zero roots. All eight full control root sequences are exact prefixes of their corresponding treatment sequences:

| Registered context | Control roots | Control disposition | Treatment roots | Treatment disposition | Exact prefix |
| --- | ---: | --- | ---: | --- | --- |
| `11:211:A:champion-reference` | 128 | root cap | 128 | root cap | yes |
| `11:211:A:new-moon-lockbreaker-v1` | 88 | engine error | 128 | root cap | yes |
| `1:212:B:champion-reference` | 98 | engine error | 110 | native terminal | yes |
| `1:212:B:new-moon-lockbreaker-v1` | 128 | root cap | 128 | root cap | yes |
| `3:213:A:champion-reference` | 106 | engine error | 128 | root cap | yes |
| `3:213:A:new-moon-lockbreaker-v1` | 93 | engine error | 128 | root cap | yes |
| `6:210:B:champion-reference` | 128 | root cap | 128 | root cap | yes |
| `6:210:B:new-moon-lockbreaker-v1` | 118 | engine error | 128 | root cap | yes |

## Results

- Control: **5 engine errors, 3 root-cap returns**.
- Combined treatment: **7 root-cap returns, 1 native terminal, 0 engine errors**.
- Confirm resolver: **11/11** submitted false answers were accepted and settled; zero rejects and zero unsettled prompts. Across the eight contexts these were eight `GO_FIRST` prompts and three `WANT_TO_USE_ABILITY` prompts.
- The terminal context is `1:212:B:champion-reference`. Its control aborted at action/root 98 with pending `ConfirmPrompt`. The treatment completed at 110 actions/roots with `finished=true`, `endReason=engine-game-end`, winner seat 1, and `terminalWinnerMatchesCandidate=true`.
- Final prize-zone counts are `[6,0]` in seat order: source seat 0 has six remaining, candidate seat 1 has zero remaining. The uploaded Advanced Player's Manual, section E (Win and Loss), defines taking all of the opponent's Prize cards as a win condition. The engine's terminal is consistent with a candidate Prize win.
- Candidate-side attack settlement is now preserved and asserted in the receipt: **4 declarations, 4 settled attacks, all four prompt chains settled**. The Prize-zone transitions are `[6,6] -> [6,5] -> [6,3] -> [6,3] -> [6,0]`, corresponding to deltas of 1, 2, 0 and 3 Prize cards. The public board snapshots show the first attack removing Marshadow, the second removing Tapu Lele-GX, the third leaving Trevenant & Dusknoir-GX Active with 200 damage, and the fourth removing that same Tag Team after the second 200-damage Eon Blade. This is consistent with the card-list text for Eon Blade (200 damage), Tapu Lele-GX's two-Prize rule and Trevenant & Dusknoir-GX's three-Prize TAG TEAM rule. The receipt still explicitly reports `paperRuleAuditPassed=false` and `qualifiedForCompetitiveInference=false`; this consistency check does not certify all paper rules or card implementations.
- The final public board is preserved in the artifact. Seat 1's Active is Latias ex SSP with three Psychic Energy; seat 0 has no Active and four Benched Pokémon. The final prize state and the four settled attack transitions explain the engine's terminal result more concretely than the final board alone.

On this particular terminal arm, the Confirm resolver accepted two seat-0 false answers: `GO_FIRST` at turn 0 and `WANT_TO_USE_ABILITY` at turn 22. The latter is the prompt at which the matching control aborts. The Telepath wrapper recorded one physical Store but **zero Telepath root attempts, zero attachments, zero matching searches and no Telepath events** on this arm. Therefore this specific terminal is a Confirm-resolution/completion witness; it must not be attributed to a successful Telepath search. The default-false answer is a conservative resolver choice, not an optimized strategic decision.

## Corrective changes

1. `simulation/evaluation/agent36-issue25-common-v8.cjs` now exports `summarizeNativeAttempt`, preserving `actionCount`, `finished`, `winner`, `endReason`, `finalPrizes`, `finalBoard`, root count and a candidate-winner consistency flag. It distinguishes native terminal, action-cap and engine-error outcomes.
2. `tests/agent36-issue25-common-v8.test.cjs` covers terminal, cap and error classification.
3. `tests/agent32-v8-confirm-default-false.native.test.cjs` now accepts a verified terminal or exact 128-action cap, checks the known 110-root terminal against the candidate seat, preserves terminal fields in receipts, and compares abort-preserved root ledgers rather than vacuous empty prefixes.
4. The first attempt at rerunning this test passed its v8 step but the overall job later failed in an unrelated, duplicated Agent42 paid-retreat suite. That suite is now gated behind its existing opt-in input, with the duplicate unconditional invocation removed.
5. The manual-only `.github/workflows/twinleaf-completion.yml` had 26 dispatch inputs and could not be triggered through the current Actions API. The separate opt-in for Agent20's cheap pure Pass Tool census was removed and that pure test was folded into an existing unconditional step, restoring the GitHub limit of 25. No new workflow was created.

The final run above executes the corrected root-prefix check and the v8 terminal-or-cap test successfully. The full manual workflow also completes successfully.

## Interpretation and limits

This is a genuine **native engine terminal** under a retrospective combined treatment. It demonstrates that resolving the native Confirm prompt can move this registered context past a deterministic bot-decoder abort and into a natural game end. It does not establish that the default-false prompt policy is strategically good; the source declined a `WANT_TO_USE_ABILITY` prompt, and the opponent policy remains unqualified. The treatment combines Telepath and Confirm layers, so aggregate completion differences cannot be attributed to either layer independently.

The artifact's own development gate remains:

- paper-valid native Store payments: **UNRESOLVED**;
- owner-information noninterference: **UNRESOLVED**;
- prompt randomness per independent game: **UNRESOLVED**;
- official 25-minute match clock: **UNRESOLVED**;
- all 32 original Aichi lists: **FAIL**;
- competitively qualified games: **0**;
- field win rate established: **false**.

The selected v8 common-policy baseline remains developmental. This result is not a deck promotion, matchup sample, paper-game certification, or evidence of a 99.5% win rate.

## Next work

- Have Agent32/Agent50 independently review the terminal receipt and Confirm resolver's strategic behavior.
- Test the Confirm prompt's available options with a frozen owner-only policy rather than assuming `false` is a sound choice.
- Preserve the abort-ledger root-prefix join in future result summaries.
- Keep the candidate list fixed and proceed toward paper-valid source actions, meaningful opponent continuation, full matches, and all 32 original opponents before drawing strength conclusions.
