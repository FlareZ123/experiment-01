# Aichi clock-outcome receipts integrated into the bilateral competence gate

**Agent 45 | 9 November 2026 | deployed, manual-CI passing | research classification only**

## Practical change

The existing bilateral evaluation screen used a bare `official25MinuteClockAudit:true`. That field could conceal incorrect duration or cutoff handling for the 35-minute Aichi final and could not differentiate a natural terminal before the time call from a missing clock record. It also wrongly required an engine-natural terminal when a real official knockout time adjudication can resolve a game before either player takes six Prizes.

I first implemented a stage-aware receipt gate (manual CI [42541174982](https://github.com/FlareZ123/experiment-01/actions/runs/42541174982)), then **superseded the standalone stage strings with direct integration of the existing Agent27 official Aichi event scorer**:

- `simulation/evaluation/agent45-aichi-clock-receipt.cjs` calls Agent27 `auditNoCallClockPacket`, `auditTimeCallPacket`, and `auditExtensionLedger` using the **same event stage enums** `open-swiss` (25 minutes), `open-top32` (25 minutes), `open-final` (35 minutes).
- The canonical receipt distinguishes `clockDisposition:'no-official-call'` with verified pre-call natural terminal evidence, from `clockDisposition:'official-call'` with a genuinely observed time call, mandated second-starter final turn, and independent paper board/Prize review. A valid `no-official-call` receipt must establish no call throughout the period, cannot rely on a missing event.
- Swiss an unresolved official time call yields `both-loss`. Knockout may yield a winner after the final permitted turn on Prize thresholds; cases requiring extension must supply an uninterrupted independently reviewed `extensionLedgerPacket` and end with a normal game win or extension win. Ties requiring six-Prize tiebreaker, unverified and disputed states remain unqualified.
- `trial.adjudicationProtocolSha` binds the actual executed Agent27 scorer source and published Aichi event link. The receipt ties `paperReceiptId` and `clockReceiptId` to the corresponding packet references. A mismatched stage, scorer version, source reference, opponent claim, or competing event disposition fails closed.
- `simulation/evaluation/agent45-bilateral-competence-gate.cjs` v3 accepts a fully shaped official-call outcome as an alternative to an ordinary native terminal. **Action caps, engine errors, missing independent clock audits, and conflicting native/paper winners remain non-admitting.** The returned classifications include whether the end was natural or official-call, the conditional paper winner/both-loss, and why a receipt failed. All positive `structuralGatePassed` states remain `competitiveAdmission:false` until independent evidence authentication, legal play and opponent policy reviews.

## Shipped code and executable tests

- Original v2 stage-only implementation: `c787e0981e6fcdd4b50c272042e9c985ffa85c01`.
- Canonical Agent27 adaptation: `simulation/evaluation/agent45-aichi-clock-receipt.cjs`, commit `8debe3fe032613c907ea095f5fae6d0c260e92df`.
- Shared competence gate v3: `simulation/evaluation/agent45-bilateral-competence-gate.cjs`, commits `977e75f9ebf8d22dd198d4b8e6f6f74f0039cd83` and `bfc939597a290251e3054d271e79fd77d9c4d6f1`.
- `tests/agent45-bilateral-competence-gate.test.cjs`, commit `60c6a22478e1adad95f5b62fa46422242970b55d`; regression scenarios now cover Swiss, Top32, 35-minute final, no-call evidence coverage, 30-minute cutoff divergence, Swiss double loss, Top32 winner via Prize lead, extension win, wrong packet stage, missing paper/clock source, protocol drift, engine-error and root-cap veto, and native winner conflicts.
- Existing manual CI workflow `.github/workflows/agent36-bilateral-competence-v9.yml` runs this suite in its `contract_only` lane, avoiding a new workflow and avoiding Twinleaf compilation. **[Successful CI run 42542036367](https://github.com/FlareZ123/experiment-01/actions/runs/42542036367)** at checked-out head `bfc939597a290251e3054d271e79fd77d9c4d6f1`.
- Primary official event: [2026 CL Aichi May, Open League](https://www.pokemon-card.com/info/005445.html). Existing source-reviewed scoring and clock evidence: `simulation/evaluation/agent27-aichi-open-time-adjudication.cjs`; `results/methodology/agent27-aichi-open-official-time-adjudication-20261107.md`; independent review `results/methodology/agent41-aichi-clock-disposition-independent-review-20261107.md`.

## Important boundary

This is an **event-rule integration and future acceptance mechanism**, rather than a physical match. Its inputs are externally supplied attestations; test fixtures are synthetic. The validator cannot confirm that an actual Aichi match used those precise 60s, that a clock ran for the claimed duration, that a listed reviewer was independent, or that choices followed paper rules. No competitive games were newly qualified by the code change.

The overall fixed-deck search still has 29/32 authenticated original source inventories, zero competitively qualified games, and no demonstrated 99.5% full-field result.
