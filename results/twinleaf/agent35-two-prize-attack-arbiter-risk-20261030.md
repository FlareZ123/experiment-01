# Two-Prize terminal attack versus Bench Energy: a missing conservative gate

**Agent 35, 30 October 2026.** Pure actor-observation counterexample and policy design input. There is **no live native Store replay for this constructed board**, no demonstrated match outcome and **zero competitively qualified games**.

## Motivation

The existing [Agent 41 owner-root arbiter v1](../../simulation/twinleaf/agent41-owner-root-arbitration.cjs) promotes a publicly offered Bench Special Energy attachment over the first-return `attack` when the Bench has an attacker and Energy quota is open. It protects an attack if the acting player has **exactly one Prize remaining**. It does **not** reserve an attack when the player has **two Prizes remaining and the opponent's Active Pokémon offers two Prizes upon KO**. If the first-return attack was a plausible immediate game-winner, the substitution might extend or lose a game.

This is a code-level, opponent-public counterexample to a narrow priority rule. It does not assert that an attack's printed damage proves native legal dispatch, final damage, or victory. Those are gated by the real Store and relevant attached-card/board modifiers.

## Concrete synthetic two-Prize opportunity

A bounded example uses an actor whose first selected intent is `attack Phantom Dive`, whose Active Pokémon is printed **Dragapult ex** (Phantom Dive does **200 damage** to Active), who has **two Prize cards left**, and whose opponent's Active Pokémon is a clean **Dedenne-GX** with **160 HP**. Dedenne-GX has a printed two-Prize GX Rule. The owner also holds **Double Dragon Energy** and has a Benched Dragon **Regidrago V** with printed attacks. The later special-Energy offer has a valid-looking printed Bench recipient, so the v1 arbiter's scope/geometry test can select `attach-special-energy` before `attack`, even when a potential two-Prize finishing attack is the immediate first choice.

The actual capability to use Phantom Dive, damage modifiers, prevention, active status, any modifying Prize effects, and the target's complete game state must be independently checked in a native game. The hypothetical proves a **policy priority hazard**; it is not a measured win lost.

## Conservative owner-only veto

[agent35-potential-two-prize-attack-veto.cjs](../../simulation/twinleaf/agent35-potential-two-prize-attack-veto.cjs) is an optional small pure helper that returns `protect:true` only when:

- the first choice is an `attack` and acting player has exactly two Prizes remaining;
- the opponent's face-up printed name gives a conservative Pokémon GX/V/ex/EX-style two-Prize lower-bound proxy;
- the selected active attack has a fixed printed numerical damage value meeting the target's visible remaining HP;
- visible `Legacy Energy` or `Life Dew` is absent.

All unsupported cases return an explicit reason. It only uses the detached actor's own printed attack and public opponent board, with **zero opponent-private inspection**. The [three pure CJS tests](../../tests/agent35-potential-two-prize-attack-veto.test.cjs) cover the two-Prize threshold, a single-Prize negative, nonnumeric/insufficient printed damage, obvious Prize reducers, nonattack choices and hidden-state invariance.

This module is **a proposed veto input for Agent 41's integrated chooser**, kept outside its arbiter so the integration owner can choose whether/how to adopt it. Name-based Prize proxies can fail under new printings; a future **authenticated public native Rule Box / Prize award field in the actor observation** would be stronger. The veto is deliberately conservative and should not be represented as verified game-winning capability.

## Opt-in shared chooser integration (same day)

The original first-return `agent41-owner-root-arbitration.cjs` now accepts `options.protectPotentialTwoPrizeAttack===true` as an **explicitly gated extension**, and `agent34-actor-only-root-policy.cjs` propagates `AGENT35_POTENTIAL_TWO_PRIZE_ATTACK_VETO_DEV=true` or a test dependency option. All defaults remain unchanged. The chosen root audit includes the enabled flag, and an actual guarded receipt identifies the candidate printed damage threshold and `potential-two-prize-finishing-attack` reason.

The shared-arbiter pure test contrasts the disabled opt-in selecting Bench Special Energy, the enabled opt-in preserving the exact same attack, and a single-Prize opponent negative where Bench Special remains selectable. It tests owner-private hidden-world invariance. [Manual benchmark CI run 40997011142](https://github.com/FlareZ123/experiment-01/actions/runs/40997011142) on research head `467ca7c498a924e49e0a74144cc22dcd410fae93` completed successfully; the dedicated regression step passed. **This is native-neutral pure unit testing and a shared integration seam, with no native same-deal game or new competitively qualified result.**

## Next mandatory evidence

Reproduce an authentic original-Store owner action with two Prize cards left, a two-Prize Active, a legal payable attack, and a competing printed/legal Bench Energy target. Retain the same-deal control and treatment and actual native Store attack/attachment outcomes. A successful v1 synthetic regression is not enough to claim tactical improvement, source competence, or deck win rate.

**Status:** pure-test supported caution and isolated helper; no competitive-qualified results, no field-comparison update.
