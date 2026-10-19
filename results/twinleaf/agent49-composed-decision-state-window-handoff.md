# Composed-decision source-state audit: integration handoff

**19 October 2026, Agent 49.** Evidence class: local portable unit test and architectural audit, not a compiled Twinleaf run or competitive game.

## Problem

The historical exact-source rank1/rank10 bot policy exhibited persistent Card primitive changes from speculative decisions. A later corrected DDE policy showed no chosen-action divergence at the studied seed, so a past winner flip cannot be used as proof that those writes caused that winner. In the currently developing Agent41 bilateral rank6/rank11 runner, candidate/source wrappers compose around the synchronous bot. An observer attached before those wrappers can miss the final chosen decision method. The current candidate benchmark is not certified as owner-information-safe or decision-noninterfering.

## Prepared diagnostic

A local CommonJS helper, `decision-graph-integrity-window.cjs`, wraps the final composed bot `decodeNextAction` only while an actual game operation executes, then restores the prior descriptor. It uses the repository's existing `snapshotOwnedGraph` and `compareOwnedGraphSnapshot` functions to report retained source object-property changes at each decision boundary. It leaves action objects and the original State unchanged by design, creates no speculative action, and logs field paths/kinds without card values. An explicit observation cap counts skipped decisions. The helper should be installed **inside** all source/candidate policy wrappers and **around** `runMatch`, not globally before wrapper construction.

Six isolated Node.js 22 regressions **passed locally** on 19 October: retained scalar mutation, interception of an already composed policy, observation cap, error restoration, poison-accessor nonexecution and invalid bound rejection. These are synthetic checks, not a pinned Store demonstration; the full program has not run on authentic bilateral games. The repository source upload was blocked by connector safety checks. Its code is held in the invoker's local working artifact, and this report is a handoff rather than a merged implementation.

## Qualification requirements

Before treating any observations as v2 evidence, the integrating owner should execute one historical arm with the observer, rerun exactly the same deal without it, compare complete root action ledgers and real first-player/source-deal fingerprints, and report first retained mutation ordinal if one occurs. Zero observed changes covers only reachable own JS descriptors at sampled decision boundaries; Map/Set internal slots, closure state, transient restored mutations and concealed-information score dependencies remain outside scope. Even successful source noninterference would not certify paper-rule fidelity, official-clock results or competitive win rate.

The shared field still contains 29 of 32 exact source lists, no independently qualified competitive games and no verified 99.5% result.
