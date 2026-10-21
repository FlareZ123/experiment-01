# Agent 3: first-class native terminal attacker self-KO gate before delayed EndTurn effects

**21 October 2026 | pinned Twinleaf fidelity development | no competitive inference**

## Scope

The existing [Agent 3 paper attack-KO ordering correction](agent3-paper-terminal-attack-ko-priority-native-paired-20261021.md) already established an actual rank-6 source Volt Cyclone terminal Active KO that the pinned engine had resolved after an incompatible delayed Pale Moon-GX effect. That correction checked only the defending side. A printed or effect-mediated attack may also leave the attacking player's only in-play Pokémon with lethal damage. In the paper Advanced Player's Rulebook, attack damage and its effects are resolved before the Knock Out step, and game resolution follows immediately when a loss condition is reached; ordinary end-of-turn delayed effects cannot be promoted ahead of an already finished attack.

This revision broadens the **same existing default-off, root-Store-only repair** to check either player's only Active Pokémon at the attack-to-EndTurn boundary. It does not alter the pinned vendor. It calls the pinned `CheckHpEffect` and `checkState` only when an Active with no occupied Bench has damage at least its native effective HP. Existing native continuation and prompt protection remain fail-closed. This is a *terminal last-Pokémon* guard, not general resolution-order equivalence for nonterminal Bench KOs, active promotion, arbitrary damage counters, or late GX effects.

## Exact code and runtime

- Source hook: [`simulation/twinleaf/terminal-attack-ko-before-endturn-hook.cjs`](../../simulation/twinleaf/terminal-attack-ko-before-endturn-hook.cjs), version `agent3-paper-terminal-attack-ko-before-endturn-v2`; opt-in environment variable `AGENT3_PAPER_TERMINAL_ATTACK_KO_DEV=true`.
- Native unit tests: [`tests/agent3-terminal-attack-ko-before-endturn-hook.test.cjs`](../../tests/agent3-terminal-attack-ko-before-endturn-hook.test.cjs) checks prior source fatal case, nonterminal/Bench bypass, native speculative Store bypass/restore, attacking side terminal self-KO and simultaneous both-last-Pokémon terminal preflight.
- New real pinned-`Store` staged test: [`tests/agent3-paper-attack-self-terminal-native.test.cjs`](../../tests/agent3-paper-attack-self-terminal-native.test.cjs), loaded after the exact pinned submodule is compiled by the existing manual [canonical workflow](../../.github/workflows/agent7-canonical-actor-bilateral.yml).
- Engine gitlink: `vendor/twinleaf` pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Final verification workflow checkout: `68a5243acd593d439b751dc5caa2ba4de51b621e`; manual [compiled workflow 39568054169](https://github.com/FlareZ123/experiment-01/actions/runs/39568054169), **SUCCESS**, with `paper_terminal_attack_ko=true` and `special_energy_root=true`.

## What this proves

The native regression constructs an authentic pinned `Store` and real card objects with Meloetta ex as the sole attacking Active, terminal damage on it, Shadow Rider Calyrex V as the sole opposing Active, six face-down Prizes per player, no Bench, and an `EndTurnEffect` reached in native ATTACK phase. The v2 hook enters the pinned `checkState` before delayed turn effects, sees `terminalKnockOutSeats:[0]`, and native game phase becomes `FINISHED` with defender winner `GameWinner.PLAYER_2` and no outstanding prompts. The original setter is restored after the test.

The existing four-armed historical canonical development panel and its pure tests also pass under the opt-in, but remain previously selected source deals and unsuitable win-rate evidence. An earlier [workflow 39567571981](https://github.com/FlareZ123/experiment-01/actions/runs/39567571981) passed the initial extension; the final compiled test above specifically adds the pinned Store self-KO fixture. Neither new test represents a played match from a legal opening 60-card physical deal. The pure simultaneous-KO test uses a stubbed `checkState` and cannot certify the pinned engine's tie, Prize, or active-promotion procedure.

## Open validation

The most consequential next adversarial cases are a real attack with self-damage leading to last-Pokémon KO, an attack causing two simultaneous terminal KOs with actual Prize prompts, and nonterminal attack KOs that require Active promotion before delayed end-of-turn effects. The presently patched boundary is intentionally narrow and still default-off. The research-wide count is **29/32 exact Aichi Top32 source lists, zero competitively qualified games, no validated 99.5% deck**.
