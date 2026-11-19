# Rank-7 Snorlax Stall opponent policy v2 — corrected card model

**Status: Prototype only · synthetic tests only**

## Executive result

This is a role-only, deterministic opponent-policy prototype for the Aichi Open League 2026 rank-7 Snorlax Stall list against the fixed Hood Shield Shadow Rider candidate. It corrects a major v1 premise error: the rank-7 source list contains **no Vileplume**. The v1 policy incorrectly imported an Item-lock scenario from unrelated human-concept research; its Vileplume-based Faba target and Item-lock gating are invalid. Preserve v1 as a failed experiment, but do not integrate it.

The v2 policy instead models the actual interaction among Wobbuffet PHF 36, Snorlax PGO 55, Stealthy Hood UNB 186, Faba LOT 173, Jet Energy PAL 190 and the candidate's Radiant Eternatus SIT 105. The focused GitHub Actions run **44556226122** on head **bdf1ba5d15a1e510a62a1bb21f63741c994a92a1** passed **24/24 synthetic tests**, with zero failures, using the actual Agent49 validators.

This is not a native game result, a matchup win-rate estimate, or evidence of the 99.5% target.

## Fixed matchup binding

- Opponent: rank 7, Hiroto Fuji, Snorlax Stall; exact 60-card list in \`results/aichi-2026/full-decklists.json\`.
- Candidate: Hood Shield Shadow Rider v1; exact 60-card list in \`results/aichi-2026/candidate-hood-shadow-rider.json\`.
- Source deck fingerprint: \`a66fa49dbeaa886c5509ff5edff727577bba5e4c9f4bbe9800b152975f8b4734\`.
- Candidate fingerprint: \`1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4\`.
- Twinleaf pin: \`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05\` at \`vendor/twinleaf\`; no native runner or research hooks are used.

## Corrected interaction model

1. **Wobbuffet PHF 36 — Bide Barricade.** Suppresses Abilities of all non-Psychic Pokémon in play, in hand and in discard. It is not an EX-only lock. Psychic Pokémon are exempt, so Shadow Rider Calyrex VMAX and other Psychic Pokémon retain their Abilities.
2. **Own-board opportunity cost.** Wobbuffet also suppresses the policy's own non-Psychic Abilities. In particular, it disables Snorlax PGO 55 Block while Wobbuffet is Active. The policy therefore prices promotion against the value of keeping the opponent's Active Pokémon trapped; a high-threat Radiant Eternatus can justify the switch, while a generic low-value Ability target does not.
3. **Stealthy Hood UNB 186.** Prevents effects of opponent Abilities on the attached Pokémon. The candidate's Hood can protect a non-Psychic Ability target from Wobbuffet. Faba removes the Hood from the opponent's Pokémon, with Radiant Eternatus as the highest-priority target when it is present and Hooded.
4. **Radiant Eternatus SIT 105.** Climactic Gate is a high-value Dragon-type Ability and is susceptible to Wobbuffet once its Hood is removed. The policy does not claim Wobbuffet suppresses Psychic Shadow Rider's Underworld Door.
5. **Jet Energy PAL 190.** When attached from hand to a Benched Pokémon, it switches that Pokémon with the Active Pokémon. The policy promotes Wobbuffet only when the target Ability is exposed, Jet is usable, the Bench can accept the outgoing Active Pokémon, and Temple of Sinnoh is absent.
6. **Alolan Muk SUM 58.** Power of Alchemy suppresses Basic Wobbuffet and blocks the line. This is included as a negative control even though it is not in the fixed candidate list.
7. **Other actions.** Nest Ball is treated as an ordinary Item; Tool Jammer is prioritized only when the opponent's Active Pokémon actually has a Tool; Girafarig's Get Lost values public recovery cards in the opponent's discard; Palace Book is a low-priority draw-three/end-turn Item.

## Artifacts and integrity

- Policy: \`simulation/evaluation/2026-11/agent43-rank7-snorlax-stall-opponent-policy-v2.cjs\`
- Tests: \`tests/2026-11/agent43-rank7-snorlax-stall-opponent-policy-v2.test.cjs\`
- Canonical challenge suite: \`results/aichi-2026/2026-11/agent43-rank7-snorlax-stall-opponent-policy-challenge-suite-v2.json\`
- Dependency manifest: \`simulation/evaluation/2026-11/agent43-rank7-snorlax-stall-dependency-manifest-v2.json\`
- Common constraints: \`simulation/evaluation/2026-11/agent43-rank7-snorlax-stall-common-constraints-v2.json\`

| Artifact | SHA-256 |
|---|---|
| Policy | a068bc5271ec1478364cd5dd84079f924a632eb0a3c1bebe2d0d82fbb1543e76 |
| Tests | 3bb9e5857f2698cfa0a653e4011f96dce51e78c9a4576fb43728893f85d25ec2 |
| Common constraints | b6e2b2f4553737c5734bae97cf1028d063f896ae3f53d5a329a8761680e1abb3 |
| Dependency manifest | 05ae459543fa405dadecd91e5922a793759897f17daaff2aba514d189ce4f0bb |
| Challenge suite | 49fbdbda2bbbb05349e76cbd9784ff0ac9b9fdb0e999638ede535130ce8ba66a |

The challenge suite uses the canonical \`aichi-policy-challenge-suite-v1\` / \`v3-policy-challenge-suite-content-v1\` structure. It contains 12 development scenarios with actor-view digests, 4 unrun held-out review cases, explicit negative controls, cost ledgers, prompt coverage, dependency bindings and reviewer state. The actor-view digest includes role, seat, observation, prompt, public event receipt and action frontier using the actual V3 protocol schema constants.

## Evidence and limitations

**24/24 synthetic tests passed.**

- GitHub Actions Node 22 \`node:test\`; actual Agent49 \`validateInit\`, \`validateRequest\` and \`validateDecision\` functions executed.
- 20 actor requests exercised; 19 valid decision receipts; one injected private-field request rejected with \`UNKNOWN_FIELD\`.
- 12 scenario records are synthetic; 4 held-out cases remain unrun.
- No native Twinleaf Store, action-resolution, game-completion or result receipt.
- No worker IPC handshake, process sandbox verification, timeout measurement or compute-budget measurement.
- No independent review or signed V3 producer binding.
- Zero rank-7 native games, zero matchup outcomes, no win-rate estimate and no confidence interval.
- No Aichi Top 32 aggregate result and no 99.5% evidence.

The 24 tests validate decision selection against synthetic actor views and the worker's protocol validators. They do not prove paper rules resolution, policy strength, or that the heuristic opportunity-cost weights are calibrated.

## Next work

1. Obtain a native Twinleaf receipt for Faba removing Stealthy Hood, Jet Energy promoting Wobbuffet, and Bide Barricade suppressing Radiant Eternatus while also suppressing own Snorlax Block.
2. Test the Wobbuffet-versus-Snorlax-Block tradeoff over complete games against the fixed candidate; compare promotion thresholds rather than assuming the current score weights are correct.
3. Validate Tool Jammer's Active-only tool suppression and the actual location of Hood attachments in representative game states.
4. Have an independent researcher review the corrected source-deck premise, card-text model and challenge suite.
5. Bind only through the existing signed V3 plan and Agent49 runner after its integration gate permits it. Do not create a second runner.
