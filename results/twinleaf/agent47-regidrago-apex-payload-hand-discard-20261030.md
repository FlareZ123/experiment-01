# Agent 47: original rank-20 Apex Dragon mandatory-discard contention

**30 October 2026.** Evidence class: exact original-source card printings, printed-card text, deterministic owner-visible policy tests, and a **constructed full source-60 staged genuine pinned-Store physical payment fork**. The state is staged, so it is neither an actual source-dealt match nor evidence of optimal play, opponent skill or win rate.

## Claim and reproducible construction

The original [Aichi rank-20 Regidrago source 60](../aichi-2026/full-decklists.json), Satoru Imamura, contains **two Ultra Ball MEG**, **one Dragapult ex TWM**, **one Dialga-GX UPR**, **one Megaton Blower SSP**, **four Grass Energy MEE**, and **four Double Dragon Energy ROS**. Each assertion is checked against the exact 60 in the committed test. The supplied `resources/cards/en/swsh12.json` printed Regidrago VSTAR SIT 136 has **Apex Dragon** at `[Grass, Grass, Fire]`, choosing an attack from a Dragon Pokémon in its owner's discard. The supplied `resources/cards/en/sv6.json` confirms Dragapult ex TWM 130 is Dragon type. Basic 2× Grass + 1× Fire or two functioning Double Dragon Energy can directly pay the copied-attack cost, subject to the game's other constraints.

Hypothetical owner-controlled decision after committing Ultra Ball and entering a *genuine-shape* required-two-card discard prompt:

- Active: `Regidrago VSTAR SIT`, two attached `Double Dragon Energy ROS`, no attack-prevention state; `Temple of Sinnoh` absent.
- Public owner discard contains **zero Dragon Pokémon whose attacks can be copied**.
- Available prompt hand cards (exact original source printings): `Dragapult ex TWM`, `Megaton Blower SSP`, and two `Grass Energy MEE`.
- The baseline existing `chooseActorHandDiscard` picks **Grass + Grass**. Its preservation score penalizes consuming a singleton printing and rewards preserving a unique Dragon without considering the specific immediate Apex copy condition. The alternate **Dragapult + Grass** is in the same hypothetical physical-validation menu and establishes a public copied-attack payload that would otherwise be absent.

This is a concrete **policy-objective conflict**, conditional on the assumed Active, attached Energy and prompt menu. Both selections were later independently accepted for actual physical cards by the original pinned Twinleaf Store in a **deterministically staged owner-original-60** source, as detailed below. The scenario remains source-printing-compatible; its constructed board is not claimed to have arisen in an original rank-20 game or a measured matchup. The proposed discard may still be strategically poor if Ultra Ball's search, the matchup, a different future Dragon payload, or an Energy shortage makes preservation preferable.

## Pure proposal and negative gates

[Implementation](../../simulation/twinleaf/agent47-apex-discard-frontier.cjs) exports `directlyReadyApex` and `proposeApexPayloadDiscard`. It calls the existing [canonical opt-in prompt chooser](../../simulation/twinleaf/agent47-actor-hand-discard.cjs) as baseline, then conditionally proposes one valid menu option containing a source-verified Dragon payload when there is no such card in the public discard. It uses only the detached actor own hand, public board, and the native prompt's already validated menu of exact-printing multisets. No opponent hand, face-down Prize identity or future deck order participates.

A deliberately narrow proof of an immediately payable Apex cost currently supports either two Double Dragon Energy without Temple of Sinnoh, or 2 Grass and 1 Fire. The six known rank-20 source Dragon Pokémon with usable attacks are verified from the supplied card data: Dragapult ex, Dialga-GX, Mega Dragonite ex, Noivern ex, Kyurem and Regidrago V; Regidrago VSTAR's recursive Apex attack is excluded from this bounded payload list. The first player's first turn is an explicit hold condition. If Temple makes attached DDE one Colorless, if a copyable Dragon is already in discard, if the Active is not the exact Regidrago VSTAR printing, if Apex is visibly locked, or if no validated alternative is present, it **preserves the existing choice**. Any unmodeled copied-attack restriction or opponent-dependent valuation remains outside scope.

[Pure regression](../../tests/agent47-apex-discard-frontier.test.cjs) includes the positive and each negative, two owner-indistinguishable hidden worlds, and exact source and card-text checks. The existing **manual-dispatch-only** `aichi-benchmark-stats.yml` has been extended with this test. It changes **no default bot, canonical bilateral chooser, deck 60, engine hook or per-push workflow trigger**.

## Native original-Store physical-payment fork

[Staged pinned-Store fixture](../../simulation/twinleaf/agent47-apex-ultraball-original-store.cjs) allocates all **60** original rank-20 printed card instances to real source-side active/evolution/attached Energy/hand/deck/Prize zones; it registers the opponent as a minimal dummy with no autonomous policy. It physically stages a held `Ultra Ball MEG`, a VSTAR Active with two `Double Dragon Energy ROS`, and the distinct four-card cost menu. The original Store accepts the physical Item and mandatory two-discard prompt with baseline **Grass + Grass** and counterfactual **Dragapult + Grass** in **each seat**. After each accepted prompt, it verifies the exact selected objects entered the actual owner discard. A negative control puts a genuine publicly visible `Temple of Sinnoh ASR` on the dummy opponent's Stadium zone and conservatively retains the baseline hand payment.

The manual-only [original pinned native Store run 40993598235](https://github.com/FlareZ123/experiment-01/actions/runs/40993598235) **passed** at commit `07c9fd4740b9889d6e55a2f5edf18ab01fb9933e` (before the later high-HP dummy change), with source-printing, direct-choice and mock adapter tests in the same job. Its artifact is `agent47-apex-source20-staged-native`. Every successful staged physical payment is conditional evidence of an Item prompt line. It does **not** prove a full Ultra Ball search, an Apex copied-attack transition, an independent opposing response, a natural-state occurrence, or any increase in game win rate.

The separately prepared [native Ultra Ball search-and-Apex followthrough check](../../simulation/twinleaf/agent47-apex-ultraball-followthrough-original-store.cjs) is an additional qualification gate. Report its outcome only after a verified completed native run; do not silently promote the payment-only witnesses into attack evidence.

## Route to the shared integrated chooser

This witness supplies a **specific missing action-choice acceptance cell**, `mandatory hand discard: alternate physical multiset versus baseline`. Before promotion, supplement the now-confirmed **staged physical Store fork** with a naturally source-dealt genuine game decision and a frozen both-actor opponent response. Require the chosen Ultra Ball search and next owner root to settle, followed by a genuinely attempted Apex Dragon, with source-deal provenance and every failed or censored arm retained. Preserve native failures, alternative discard selection, public owner discard, physical card pointers and source-deal parity.

The [Critic 30 October integrated chooser directive](../../communications/broadcast/20261030T0142Z_critic_integrated_chooser_release_gate.md) remains controlling research priority. **Agent 41 owns the joint canonical actor-root decision integration**. Future work should supply this as one component of that same versioned two-player action/typed-prompt decision matrix, with explicit resource-hold negatives. No standalone full-game runner should be promoted from this regression.

**Research status:** 29 of 32 exact original 60-card source lists; ranks 23, 25 and 28 missing. Zero competitively qualified games; no validated final 60 or demonstrated 99.5% game-win rate.
