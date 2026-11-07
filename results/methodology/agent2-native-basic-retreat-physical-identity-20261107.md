# Agent2: genuine native Basic-retreat physical identity and discard settlement

**7 November 2026. Evidence status:** restricted pinned-native Store settlement witness on one *previously selected historical physical opening*. It is **not** a new matchup experiment, not an independent legality decision for all lock/cost interactions, and not a paper-qualified game.

## Registered target and tests

Predeclared conditions: [registration](registrations/agent2-paid-retreat-basic-physical-native-canary-20261107.md). Read-only implementation: `simulation/twinleaf/agent2-retreat-basic-physical-witness.cjs`. Native wiring: `simulation/evaluation/agent2-root-bound-paid-retreat-native-canary.cjs` v3. Unit tests: `tests/agent2-retreat-basic-physical-witness.test.cjs`.

The witness captures, **at exact real-root action selection**, references to the outgoing Active Pokémon, intended Bench Pokémon, each of the outgoing attached Basic Energy cards, the intended Pokémon's attachments/damage, the outgoing Pokémon's damage, and the acting player's public discard pile. It does not inspect opponent hidden cards. After real `store.dispatch(action)` and an accepted-action callback, it verifies physical object identities and the complete exact discard delta. It rejects coincidentally identical printings. Both endpoints are joined to the **same actual typed `RetreatAction` object** using the existing root-identity and accepted-action-receipt guards.

The verifier is deliberately narrow: printed retreat cost of at least two, exactly that many attached known Basic Energy, no Tools. A true result establishes movement, payment to the owner's discard, and preservation of relevant attachments/damage on that native action. It does not prove the absence of Ability or Stadium modifiers, retreat locks, or paper legality generally.

## Evidence

- Pure regression suite [GitHub Actions run 42409411100](https://github.com/FlareZ123/experiment-01/actions/runs/42409411100) passed, including seven tests: exact successful physical transfer, duplicate-printing impostor rejection, wrong discarded Energy identity, lost recipient Energy, gaps in the Bench index, unsupported Special Energy/Tool/payment, and turn mismatch.
- Existing manual workflow run [42409546955](https://github.com/FlareZ123/experiment-01/actions/runs/42409546955), head `cfd0c82a53e185b194c91b4d88547413aa2c8218`, completed **success** for both pure and pinned compiled native jobs. The native canary's process exits nonzero unless all eight gates pass, including exactly one selected and Store-accepted object-identity joined retreat, exactly one `physicalPaymentAudit` receipt with `valid:true`, correct rank-1 actor seat/turn/ordinal, the original complete physical opening, and the unchanged original root-action ledger. This is a successful native **restricted custody** proof.
- Native artifact `agent2-root-bound-native-canary`, ID **13588434718**, GitHub SHA-256 archive digest `6cca5376e3ce3dd297af6b95f165bf5884aaf79995b076ab2a0a709637c3ef5f`. Historical fixed seed **290134**, original rank-3 seat0 / original rank-1 seat1, original frozen rank1 selected retreat turn **33** and action ordinal **155**. Pinned vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Regression `tests/agent2-retreat-basic-physical-witness.test.cjs` subsequently gained a separate demonstration that the earlier `retreatTransitionEvidence` accepts a same-printing substitute. That addition was committed after the above native run and requires its own CI verification.

## Why this changes the evidence boundary

`simulation/twinleaf/retreat-transition-evidence.cjs` previously compared only `printing` strings, which can be equal for different physical Pokémon; `publicBoardSnapshot` also filters empty Bench slots before passing a Bench index. Those observations are valuable public **descriptions**, but the printed-match boolean is logically insufficient to prove exact physical target movement. The new native witness closes that specific evidence gap for its restricted positive example. A duplicate-printing situation with different physical objects must now fail.

## Outstanding blockers

The verifier is only a component for future frozen releases. It is not yet installed by default in v8 or a successor common policy, and it has been validated in one retrospectively chosen historical native case. An independent paper-rule permission/effective-cost assessment, full Store prompt/target/response continuation, meaningful original opponent policy, official clock, and **all 32 original Aichi opponents** still need qualification. The collective decision remains 29/32 authenticated inventories, zero competitively qualified games, no final fixed 60 and no demonstrated 99.5% field win rate.
