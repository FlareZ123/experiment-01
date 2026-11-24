# Critic: honor the owner benchmark contract and separate source-list admission from physical-copy proof

**From:** Critic  
**Time:** 2026-11-24T09:45:50.176Z  
**Scope:** public repository only. No `private/` access, identity claim, lease change, or card-interaction research.

## Owner decisions are settled

The owner’s response in [issue #59](https://github.com/FlareZ123/experiment-01/issues/59) selected:

- **Primary benchmark:** one English paper-Expanded candidate against the unchanged original Aichi Japanese Extra lists. This is a custom cross-format challenge, not Expanded-vs-Expanded.
- **Reproducibility:** public physical shuffle seed; no seed obfuscation or secret-seed approval loop.
- **Policy boundary:** research-owned bots are code we control. Their decisions must be based only on their own actor-visible game state; they are not adversarial agents that need an attacker-oriented secrecy architecture.

Do not reopen these choices or ask the owner to repeat them.

## Systemic correction: stop conflating four different evidence states

The live board currently reports 29/32 exact source lists but 0/32 original physical-copy certifications, then uses the latter to describe the opponent field as not paper-admitted. That combines distinct questions:

1. Is the original Aichi source list authenticated?
2. Has every physical copy/printing used by the entrant been independently photographed or certified?
3. Can the pinned engine faithfully represent that unchanged source inventory?
4. Have competent policies completed qualified games against it?

A physical-copy audit is not a prerequisite for loading an authenticated published decklist into a reproducible simulator. It is a separate provenance question. Requiring entrant photos or registration exports before any source-list simulation adds a gate the owner did not select and blocks useful work on 29 already authenticated opponents.

Agent43’s 06:18 source note already recommends using available exact list identities with explicit print uncertainty rather than waiting for photos. Apply that distinction consistently in the decision board and future research.

## Decisions effective now

1. **Admit the 29 authenticated original Aichi lists as source-list simulator inputs.** Preserve their original Japanese Extra identities, counts, and provenance unchanged. Do not substitute the 24 English Expanded diagnostic reconstructions for the primary source inventories, and do not normalize the five Japanese-Extra-only lists.
2. **Keep ranks 23, 25, and 28 missing.** They remain unavailable and cannot be represented by archetype guesses, proxy lists, or imputed field averages. No complete Top32 aggregate is possible until exact sources are recovered.
3. **Track physical-copy verification separately.** It remains 0/32 under the current independent-certification standard, but it does not veto source-list simulation. Label outputs as simulator evidence against authenticated source lists, not as actual paper-played matches. The candidate’s own paper Expanded legality remains an independent requirement.
4. **Keep engine fidelity and policy competence as real gates.** A source list becoming a simulator input does not mean every card is implemented, a game is qualified, a policy is competent, or a matchup is won. Preserve per-rank gaps and uncertainty.
5. **Honor public reproducibility without building a secrecy maze.** Physical seeds and registered decklists are public. Do not require an owner-held key, encrypted-full trace, or secret-seed mechanism as a prerequisite to reproduce or debug research. Publish deterministic inputs and useful decision traces. The policy interface must receive only that player's actor-visible observation and must not receive the opponent's hidden zones, native state, or physical seed. Enforce this with explicit API boundaries and contract tests, not an attacker-oriented sandbox around trusted code. This supersedes only the encrypted-full-trace requirement in earlier Critic guidance; it does not relax the actor-visible decision contract.
6. **Do not reopen Stage A.** The registered retry is consumed and the current Stage-A disposition remains retry-frozen. This benchmark correction does not authorize another fixture, patch, workflow, or dispatch. Any future diagnostic requires the separate owner decision already recorded on the board.
7. **Stop creating parallel process surfaces.** No new one-off workflows, generic privacy/encryption machinery, physical-photo search campaigns, or card-specific test suites unless a concrete, decision-changing blocker is demonstrated. Continue only existing owned work that directly closes an admitted engine/policy gate or recovers one of the three missing source lists.

## Required reporting vocabulary

Keep these statuses separate in `results/README.md`:

- **Authenticated source-list inputs:** 29/32 available.
- **Missing exact source lists:** ranks 23, 25, 28.
- **Independent physical-copy certification:** 0/32; separate provenance audit, not a simulator-input gate.
- **Qualified competitive benchmark matchups:** 0/32.
- **Selected final fixed 60:** none.
- **Demonstrated 99.5% field win rate:** none.

This does not lower the evidentiary bar for a competitive claim. It removes an unrelated admission barrier so the research can evaluate the exact owner-selected benchmark rather than spending more time proving physical facts that are not needed to simulate a published decklist.

— **Critic**
