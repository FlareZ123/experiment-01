# Agent 47: original rank-20 Apex Dragon mandatory-discard contention

**30 October 2026.** Evidence class: exact original-source card printings, supplied printed-card text, and deterministic owner-visible pure policy regression. This document records a **constructed root/prompt scenario**, rather than an original Store match, tournament result, or demonstrated optimal discard.

## Claim and reproducible construction

The original [Aichi rank-20 Regidrago source 60](../aichi-2026/full-decklists.json), Satoru Imamura, contains **two Ultra Ball MEG**, **one Dragapult ex TWM**, **one Dialga-GX UPR**, **one Megaton Blower SSP**, **four Grass Energy MEE**, and **four Double Dragon Energy ROS**. Each assertion is checked against the exact 60 in the committed test. The supplied `resources/cards/en/swsh12.json` printed Regidrago VSTAR SIT 136 has **Apex Dragon** at `[Grass, Grass, Fire]`, choosing an attack from a Dragon Pokémon in its owner's discard. The supplied `resources/cards/en/sv6.json` confirms Dragapult ex TWM 130 is Dragon type. Basic 2× Grass + 1× Fire or two functioning Double Dragon Energy can directly pay the copied-attack cost, subject to the game's other constraints.

Hypothetical owner-controlled decision after committing Ultra Ball and entering a *genuine-shape* required-two-card discard prompt:

- Active: `Regidrago VSTAR SIT`, two attached `Double Dragon Energy ROS`, no attack-prevention state; `Temple of Sinnoh` absent.
- Public owner discard contains **zero Dragon Pokémon whose attacks can be copied**.
- Available prompt hand cards (exact original source printings): `Dragapult ex TWM`, `Megaton Blower SSP`, and two `Grass Energy MEE`.
- The baseline existing `chooseActorHandDiscard` picks **Grass + Grass**. Its preservation score penalizes consuming a singleton printing and rewards preserving a unique Dragon without considering the specific immediate Apex copy condition. The alternate **Dragapult + Grass** is in the same hypothetical physical-validation menu and establishes a public copied-attack payload that would otherwise be absent.

This is a concrete **policy-objective conflict**, conditional on the assumed Active, attached Energy and prompt menu. Neither possible choice was submitted to Twinleaf's actual Store in this investigation. The scenario is source-printing-compatible, but its board is not claimed to have arisen in the original rank-20 game or a measured matchup. The proposed discard may still be strategically poor if Ultra Ball's search, the matchup, a different future Dragon payload, or an Energy shortage makes preservation preferable.

## Pure proposal and negative gates

[Implementation](../../simulation/twinleaf/agent47-apex-discard-frontier.cjs) exports `directlyReadyApex` and `proposeApexPayloadDiscard`. It calls the existing [canonical opt-in prompt chooser](../../simulation/twinleaf/agent47-actor-hand-discard.cjs) as baseline, then conditionally proposes one valid menu option containing a source-verified Dragon payload when there is no such card in the public discard. It uses only the detached actor own hand, public board, and the native prompt's already validated menu of exact-printing multisets. No opponent hand, face-down Prize identity or future deck order participates.

A deliberately narrow proof of an immediately payable Apex cost currently supports either two Double Dragon Energy without Temple of Sinnoh, or 2 Grass and 1 Fire. If Temple makes attached DDE one Colorless, if a copyable Dragon is already in discard, if the Active is not the exact Regidrago VSTAR printing, if Apex is visibly locked, or if no validated alternative is present, it **preserves the existing choice**. Any unmodeled copied-attack restriction or opponent-dependent valuation remains outside scope.

[Pure regression](../../tests/agent47-apex-discard-frontier.test.cjs) includes the positive and each negative, two owner-indistinguishable hidden worlds, and exact source and card-text checks. The existing **manual-dispatch-only** `aichi-benchmark-stats.yml` has been extended with this test. It changes **no default bot, canonical bilateral chooser, deck 60, engine hook or per-push workflow trigger**.

## Route to the shared integrated chooser

This witness supplies a **specific missing action-choice acceptance cell**, `mandatory hand discard: alternate physical multiset versus baseline`. Before promotion, record one actual original-Store owner `ChooseCardsPrompt` with its `validate`-approved physical menu, and run an opt-in same-state positive/negative fork. Confirm original native acceptance, disposal of exactly the selected printed cards, selected Ultra Ball deck search and any next owner root; then follow through to a genuinely attempted Apex Dragon and the opponent's next action. Preserve native failures, alternative discard selection, public owner discard, physical card pointers and source-deal parity.

The [Critic 30 October integrated chooser directive](../../communications/broadcast/20261030T0142Z_critic_integrated_chooser_release_gate.md) remains controlling research priority. **Agent 41 owns the joint canonical actor-root decision integration**. Future work should supply this as one component of that same versioned two-player action/typed-prompt decision matrix, with explicit resource-hold negatives. No standalone full-game runner should be promoted from this regression.

**Research status:** 29 of 32 exact original 60-card source lists; ranks 23, 25 and 28 missing. Zero competitively qualified games; no validated final 60 or demonstrated 99.5% game-win rate.
