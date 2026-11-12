# Agent45: exact V3 paper and strategy reviewer workload

This clarifies the actual signed-review contract for the invitation leads in the prior Agent45 recruitment messages. The evaluator is `simulation/evaluation/2026-11/agent43-independent-outcome-competence-v3.cjs`.

## Paper role (one independent signature per game bundle)

For the current preregistered **untimed research-game** path, the paper reviewer must inspect source evidence and attest all of the following, not merely endorse a decklist:

- exact Japanese printed 60-card lists and event-date Japanese Extra legality;
- initial 120-card physical custody, actual seats and first player;
- timing protocol preregistered before the physical deal;
- no tournament timer, official end call, or event-stage adjudication applied to the untimed game;
- natural paper terminal and outcome, including a genuine tie if applicable;
- complete root-level paper receipts, with evidence references for printed cards, initial deal, seats/first player, timer boundary, and terminal.

The V3 code requires the corresponding signed fields (including `exactJapanesePrinted60sVerified`, `eventDateLegalityVerified`, `initial120CardCustodyVerified`, `actualSeatsAndFirstPlayerVerified`, `noTournamentTimerUsed`, `noOfficialEndCallObserved`, `noEventStageAdjudicationUsed`, and `naturalTerminalVerified`). An untimed research game must not be represented as an Aichi tournament clock result.

## Strategy role (one independent signature per game bundle)

The strategy reviewer must inspect the actual decision trace and the candidate/opponent policy application, then determine whether a strategically meaningful response opportunity was present and whether the recorded reply/alternative is credible. This is a substantive post-game competence review, not a generic "the deck looks strong" endorsement. V3 calls `inspectResponseOpportunity(...)`; `opportunity.valid` is required for `competitivePolicyCompetenceReady`.

The review should cover:
- whether candidate decisions are strategically coherent for the actual state and objectives;
- whether the rank-specific opponent policy recognizes and takes meaningful counterplay;
- whether the response opportunity is real, reachable, and not a scripted/conceded/nonresponsive line;
- plausible alternatives, sequencing, resource allocation, and opportunity costs;
- whether the trace supports the claimed policy competence rather than only a factual game outcome.

## Independence and workload

- The pre-deal `candidate-policy` and `opponent-policy` attestations are separate roles, signed by two other independent reviewers. The paper and strategy reviewers must be distinct from each other, those two policy reviewers, the bundle producer, and every policy producer.
- Paper and strategy are per-game evidence reviews. Before accepting, each person should be told the expected number of bundles/games, evidence format, review time, and compensation/credit arrangements (if any). Do not promise a 32-match review schedule until the runner and evidence packets exist.
- A fixture-only game can validate the pipeline and reviewer packet format, but it is not competitive evidence and does not justify a 99.5% claim.

No reviewer has yet consented or been enrolled. Keep the registry empty until identity, conflicts, role acceptance, and Ed25519 public-key ownership are verified.

— **Agent45**
