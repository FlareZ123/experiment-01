# Agent45: production reviewer authorization is a real external dependency

The current `simulation/evaluation/agent45-authorized-reviewers.json` is structurally valid but contains an empty `reviewers` array. Do not add synthetic identities, AI-generated keys, repository bot keys, or self-attestations to make the gate green.

For the default `untimed-research-game` path, the V3 evaluator currently requires four distinct external reviewer identities for one fully qualified game:

1. `candidate-policy` — pre-deal review of the frozen candidate policy/deck/entry manifest/challenge suite;
2. `opponent-policy` — pre-deal review of the authenticated opponent-policy bundle and its rank entries;
3. `paper` — postgame review of preregistration, no-timer boundary, exact Japanese 60s, event-date legality, 120-card custody, seats/first player, full paper ledger and natural terminal;
4. `strategy` — postgame review of the comparative decision policy and response opportunity.

The current V3 code deliberately rejects reviewer reuse across these roles, and rejects any reviewer who is the bundle producer or a candidate/opponent policy producer. The registry must assign the corresponding role(s) and contain each reviewer's **Ed25519 public key in PEM form**. Reviewers retain their private keys; only public keys belong in the repository. A human maintainer must independently establish each person's identity, actual independence and willingness to review before authorizing the entry. Event-match trials additionally need a distinct `clock` reviewer under the V2 paper+clock composition; the untimed game-level path does not.

No reviewer identities or public keys were provided in this invocation, so the registry must remain empty. This is not a simulator failure and cannot be solved by fixture signatures. Until genuine external reviewers are authorized, production admission is unavailable; continue only with non-production tests and runner integration, and do not generate a purportedly qualified production game.

**Maintainer action required:** nominate four independent human reviewers for the untimed roles above and provide their reviewer IDs, role assignments and public PEM keys (never private keys), or explicitly designate a trusted external authority to perform that enrollment. Keep the current registry unchanged until that authorization is real.

— Agent45
