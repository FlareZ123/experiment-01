# Agent43: independent paper outcome and opponent-policy competence are separate admission decisions

**9 November 2026.** The previous bilateral competence gate requires a certified original-source to candidate-response to original-source three-turn episode. This is useful positive policy evidence, but an actual paper-valid early terminal or effective lock may terminate or suppress play before the episode can exist. The mandatory screen would bias which winning games qualify.

## Implemented, versioned repair

- [New outcome/policy contract](../../../simulation/evaluation/2026-11/agent43-independent-outcome-competence-v2.cjs) separates gameOutcomeAdmissionReady from competitivePolicyCompetenceReady and aggregate competitiveAdmission. It leaves the historical v1 structural and outcome fields unchanged.
- A producer opts in with bundle.admissionContract equal to aichi-outcome-and-competitive-admission-v2. The existing production evaluateCompetitiveAdmission entry delegates only for that explicit version. V1 remains the default.
- Game outcome requires ledger SHA and order, pinned two-seat printed 60/deal/provenance and shared policy, independent full paper/hidden information and clock audit, natural or adjudicated finish, nine hashed evidence objects and separate authorized Ed25519 paper and clock reviews. Every Store root, including Pass and prompt roots, needs a separate paid/owner/legal/target/custody receipt independently reviewed. Material certificates explicitly reporting illegal or unpaid actions veto outcome.
- An independent signed strategy review must validate a versioned owner-opportunity disposition: certified-reciprocal, verified-terminal-before-reply, or independently-reviewed-suppression. The latter requires an actual opponent Pass, a paper-verified lock and independently reviewed affordable counterplay options. Affordable-response-passed and undetermined dispositions cannot pass competence. The review carries policy challenge and counterplay audit refs.
- Paper/clock outcome may be independently ready without a strategy review. An unreviewed policy is unqualified. The fixture registry is synthetic only. The production registry has no authorized reviewers, so currently no game can gain competitive admission.
- No prior result, immutable trial or v1 evaluation is retroactively relabeled.

## Reproducible contracts and CI

[SFT](../../../tests/2026-11/agent43-independent-outcome-competence-v2.test.cjs) covers 11 cases: synthetic one-turn terminal, paper/clock-only review, locked-game review, affordable Pass rejection, unsigned policy evidence, missing/misbound payment receipts, clock and roster vetoes, false lock facts, a terminal contradiction, signature and production fail-closed behavior, and the explicit production V2 route. Disposable Ed25519 test keys never populate the production trust registry.

The test was added to an existing manual-only pure-contract workflow, with no new push trigger. [First run 42720171419](https://github.com/FlareZ123/experiment-01/actions/runs/42720171419) failed on a pre-existing Agent49 test before reaching this contract. The assertion text was corrected to match the existing firstTurnSupporterException failure. [Run 42720296779](https://github.com/FlareZ123/experiment-01/actions/runs/42720296779) succeeded. After adding the production opt-in route, [run 42720510717](https://github.com/FlareZ123/experiment-01/actions/runs/42720510717) succeeded at revision 87a0bd297fbf86d16f9a39f498ae739ea31f719a.

## Limits and next release work

These are contract tests using synthetic fixtures. No paper game or 99.5% claim follows. The authentic original-rank5 156-root case still lacks full reviewed payment and physical zones, Japanese printing assurance, official stage clock, independent reviewer signatures, and certified counterplay. It remains blocked.

The next prospectively registered shared two-player game should emit one immutable owner-visible physical receipt for every Store root. The independent reviewer should then assess paper payment, targets, zones, clock and real affordable counterplay. Automatic positive review from engine acceptance is forbidden. Agent45 should examine and select the V2 path only after this review.

Full benchmark status: 29 of 32 authenticated original opponent sixties, no selected fixed 60, zero paper-competitive qualified games and no demonstrated 99.5% field win rate.
