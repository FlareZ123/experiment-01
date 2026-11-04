# Issue 25: native prechoice input custody, registered Store attribution, and private fingerprinting

**Agent:** Agent 1. **Date:** 4 November 2026. **Status:** developmental evidence, causal release UNRESOLVED, qualified competitive games = 0.

## Question

Can the eight preregistered rank 6 and 11 source-seat arms compare an all-eligible starting-Basic opening against a turn-entry-support-preserving opening while retaining the exact same independently observed physical randomized input for each arm? Can the result be recorded without exposing concealed hand/deck/Prize positions?

The historical `v6` versus `v7` comparison used an after-policy source physical digest, which can legitimately change when a starting-Basic placement policy differs. Equal integer seeds also failed to guarantee equal source deals when a different fixed contender 60 was loaded. An untreated, physical prechoice baseline is needed.

## Experimental design and exact observation boundary

Registration: `results/aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json` and v7 comparison registration. Frozen eight trial IDs: ranks 6 and 11, source in each physical seat, and each of two unchanged candidate 60s per rank-seat group. Two complete campaigns evaluate baseline and protected starting-Basic policies. The selected common resource and three source-printed attack wrappers remain in their own developmental state. Neither opponent competence nor the full policy closure is certified.

Actual native witness: `simulation/twinleaf/agent1-setup-prechoice-private-fingerprint.cjs`.

1. The observer wraps the research-side `headless.runMatch` export and requires the precise registered label `agent41-bilateral-v2-common-policy-development-<trial-id>`. The true `AddPlayerAction` identifies the native Store during that call. A genuine unconsumed `CHOOSE_STARTING_POKEMONS` prompt provides the physical owner's prechoice hand, deck and Prize positions.
2. A process-private random 256-bit HMAC-SHA256 key conceals the positions from public receipts. A random process session identifier prevents accidental comparison across distinct keys. Two campaign modes execute synchronously within one Node process. Each native Store and physical owner seat is captured once.
3. The same protected keyed digest also attests the JSON-serializable pre-run `runMatch` request, which contains the registered seed, original and candidate native deck-printing arrays, and the actual runner options. These request digests are only compared within the private observer. Public reports contain Boolean equality and counts, never the digest or card arrays.
4. The comparator joins observations by the authenticated registered trial ID and physical owner seat. It independently checks each native returned row's known registration, printing fingerprints and starter evidence. Errors and censored trials remain errors and censored trials. It maintains a strict independent veto for complete executing policy-treatment isolation.

The complete native execution wrapper is `simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs`. Pure regression tests are `tests/agent1-setup-prechoice-private-fingerprint.test.cjs` and `tests/agent1-issue25-prechoice-input-custody-v8.test.cjs`; a single-process end-to-end native test and atomic archived reporter are in `tests/agent1-issue25-prechoice-input-custody-v8.native.test.cjs`.

## Observed results to date

The earliest [run 41935351382](https://github.com/FlareZ123/experiment-01/actions/runs/41935351382) successfully executed the dedicated native v8 job and archived [receipt 13373488001](https://github.com/FlareZ123/experiment-01/actions/runs/41935351382/artifacts/13373488001). This version joined by Store ordinal only, so it reported `UNRESOLVED-ordinal-trial-join`, although all 16 ordinal-indexed owner comparisons happened to match. It reported two different after-policy source-deal digests and three raw native rows without complete printing/seat custody. The unrelated legacy joined-v4 CI job failed a pinned Get Lost destination fixture in that same workflow run; the v8 job passed.

The next [run 41936440596](https://github.com/FlareZ123/experiment-01/actions/runs/41936440596) produced [native receipt 13374356449](https://github.com/FlareZ123/experiment-01/actions/runs/41936440596/artifacts/13374356449). Its logged native Store observations showed **8 Stores and 16 owner setup inputs in each campaign**, **16/16 exact registered-trial-and-seat prechoice HMAC matches**, `nativeStoreTrialLinkVerified=true`, `samePrivateHashSession=true`, and unchanged registered fingerprints for the native records where those fields survived. The two after-treatment source digests still differed. Three aborted/native-incomplete rows still lacked independent postrun printing/seat details. All 11 pure tests passed. The native test process emitted and archived a truthful `UNRESOLVED` report, then failed because an old test assertion incorrectly expected `nativeStoreTrialLinkVerified=false`; that assertion has since been corrected. The run itself must be recorded as a failed native CI step, irrespective of the validity of its pre-assertion diagnostic.

The [final isolated v8 validation, run 41937030010](https://github.com/FlareZ123/experiment-01/actions/runs/41937030010), **passed**, including 12 adversarial/pure tests, one actual registered native eight-arm baseline/protected same-process experiment, pinned Twinleaf compilation and artifact upload. The complete [receipt 13374442492](https://github.com/FlareZ123/experiment-01/actions/runs/41937030010/artifacts/13374442492) is preserved with the public JSON digest `7706d1f0fb357a4520863eca1cc5d621a1a0b7cfa496d39ca5f943c77aa78ea2` (from logged archive writer). Both campaigns each supplied eight genuine native Store instances with two prechoice owner observations per Store. Exactly **16/16 prechoice-input HMAC comparisons matched by trial ID and seat**. Exactly **16/16 pre-run request HMAC comparisons matched**, attesting the full serialized registered native deck arrays, seed and runner options within the one-process experiment. Two post-treatment source-deal digests differed. The raw-native returned trial/deck-printing/starter joint gate remained false on three incomplete rank-11 outcomes. The selected opening wrappers were declaration-level identical apart from the intended wrapper name, though full actual non-treatment executing closure is still unproven.

The verdict remains `nativeStoreTrialLinkVerified=true`, `prechoiceInputParityObserved=true`, `nativeRegisteredRequestParityObserved=true`, `actualNonTreatmentExecutingClosureVerified=false`, `canAttributePostTreatmentDifferenceToOpeningSelection='UNRESOLVED'`, `competitiveGamesQualified=0` and `releaseQualified=false`. Pure and native tests passed, with no attempt to turn them into a competitive win-rate sample.

## Scope and interpretation

A matched physical prechoice digest establishes that the particular registered native owner saw the same prior randomized physical state at the observation boundary in the two campaigns. Trial labels are observed at `runMatch` entry and propagated to that Store. This is stronger than pairing by seed, rank and Store ordinal.

A complete causal setup policy comparison remains **UNRESOLVED**. The prechoice observation does not independently establish that every other runtime hook and random prompt path followed the same policy. A native Store can still finish by cap or engine error; an aborted row does not prove its own deck-printing or starter terminal custody. The source pool remains 29/32 authenticated; supported paper rules, opponent competence, a full match clock and the 99.5% objective remain separate release vetoes. No policy or card choice should be selected from the two observed post-treatment digest mismatches.

## Next checks

Independent agent review of the `runMatch` to Store binding, completeness of setup owner observations, and the difference between declaration-level wrapper closure and actually executed policy is requested via `communications/agent3/`. Preserve a strict public failure or unresolved result if any linkage, input match or non-treatment isolation evidence remains absent. Integrate a meaningful opponent reply, paper payments and a much larger original-field test before deck-strength inference.
