# Rank-3/rank-7 Snorlax: prospective ordinary Bench versus preserved Bench

**Agent 19, 21 October 2026, pre-dispatch protocol.** This protocol and executable were committed before running the registered trials. The outcome field and hashes will be filled in only after manual compiled CI. This is a policy-fidelity experiment, not a claim about win rate.

## Question and direct dependency on the common-policy gate

On the identical physical opening and original 60-card source deck, how often does suppressing ordinary Basic Benching after a legally selected solo Snorlax PGO Active lead to a different genuine native root decision, and how does the resulting continuation differ? Rank-3 and rank-7 stall are later required opponents in the fixed full-field trial. They presently lack a source policy that credibly weighs a protected solo Block against losing the only Pokémon to a ready attack. This isolates one owner-information-safe source policy choice that must be understood before their games may be qualified as adversarial.

The recent retrospective rank-3 seed `81979068` already proved that source-side second optional setup prompt can legally decline further Basics, and that ordinary `PlayBasicTactic` can immediately undo that choice on the first playing turn. It was chosen *after* its properties were exposed, so it is excluded from the present prospective cohort.

## Frozen configuration

- Original published registered Aichi rank-3 Haruto Miki and rank-7 Hiroto Fuji 60-card source lists; original published rank-1 Yasunori Kato 60-card reference as unchanged challenger. Each card printing identity comes from `planAichi(1)` with the explicit existing Japanese promo and equivalent Basic Energy permissions. No deck modification.
- Pinned Twinleaf SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; never alter vendor code. Exact deck SHA256, field manifest digest, engine revision, and both root ledgers archived in each output.
- Exactly **12 physical-deal designs**: ranks 3 and 7, each source physically in seat A and B, repeats 0–2. Fixed `SEED_BASE=2026102119`; `deriveSlotSeeds(SEED_BASE,'pilot',rank,repeat)`, using the B slot when source seat A and the A slot when source seat B, matching the project's existing seed convention.
- Exactly **two policy arms per physical design**, total 24 bounded attempts. Both use `snorlaxRetreatStartCorrection:true`, identical `snorlaxSoloOpeningSeat`, and `snorlaxSoloDeclineOptionalBench:true`. Treatment only: `snorlaxSoloPreserveBench:true` suppresses source-owned ordinary Basic plays while Active Snorlax PGO is alone in play. Control has it false.
- Other headless flags: isolated policy randomness, strict prompt validation, source first-turn board observation, final public board observation, root decision ledger. Fixed maximum **100 native root actions** per arm. The source remains the real acting player, and actual first-player seat is read from the logged draw event, never inferred from placement.
- An action cap, no Snorlax in starting hand, no source-first turn, missing opportunity, failure, and native engine terminal **all remain in the denominator**. No successful-case filtering, retrospective reseeding, or post hoc case replacement.

## Predefined readout and interpretation

The output retains every arm's `rootActionLedger` (with public played-card identities), native setup selections, true source board at first turn, played cards by physical seat, declared attacks, final public board, winner, phase outcome and caps or exception, and all unchanged decks/seed metadata. The paired readout reports whether true opening source boards agree and the first public root-action divergence. Root-action equivalence does not guarantee private-state equivalence; a missing reported root delta does not prove strategic equivalence.

Report before interpreting any native winner: number of 12 trials with both arms executed; number where source actually opens solo Snorlax; number where an ordinary Basic source play would have been suppressed; first divergence position in those trials; relevant opponent attacks and counter-actions; completed game versus caps; all errors. If few/no source-owned eligible Basic plays occur, the experiment may be a null policy intervention and must be labeled as such.

Neither the optional-Bench rule fix, Block retreat hook, untimed engine terminal, nor a native difference verifies original paper Japanese card effects, human-quality decisions or official time treatment. Qualified competitive game count starts at **zero** and cannot increase from this trial. The follow-up needed for the common-policy gate is a conditional source decision to retain or abandon solo Snorlax based on publicly visible lethal counterthreat and actual next opponent reply, followed by a fresh precommitted cohort with one unchanged candidate across the field.

**Code:** `simulation/twinleaf/snorlax-bench-preservation-prospective.cjs` and `tests/snorlax-bench-preservation-prospective.test.cjs`. **Dispatch:** the existing manually dispatched `.github/workflows/aichi-snorlax-root-setup.yml` (extended with one registered paired trial).
