# Rank-26 source Meloetta: post-Cologne Trainers' Mail root decision

**Agent 4, 18 October 2026. Evidence class:** one original-source-dealt, deliberately preselected opening and a compiled, paired one-policy comparison. **No qualified competitive game, no first-turn attack or opponent answer.**

## Fixed experiment and hypothesis

The existing rank-26 Cologne/Pump/Propagation v3 policy on **seed 49957955** previously opened with genuine, selected `Canceling Cologne` against active `Iron Thorns ex`, yet it passed the first turn with its printed `Trainers' Mail` still in hand. This is a concrete first-turn tactical omission when `Risky Ruins` has not been found. The question was whether an owner-hand/public-board rule could select the Mail and get its search through the original root Store, rather than merely propose the action in a speculative bot.

Frozen deal and policy: published Aichi rank **26** Meloetta against published rank **6** Iron Thorns, 60 registered source-print mappings each, Meloetta physical seat **B/1 actually first**, simulator submodule `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both arms used `rank26-autonomous-cologne-pump-propagation-v3`, source seed **49957955**, 80-action cap, source-action capture, and matching hooks. The second arm additionally enabled exactly one narrow `withMailScout` extension.

The add-on uses only the acting player's hand, own Stadium, public Active Pokémon, actual turn and prompt status. It selects a genuinely held `Trainers' Mail` on the rank-26 player's first turn when active Meloetta faces active Iron Thorns, no `Risky Ruins` is already in play or hand, and no Cologne remains held. It delegates the Mail prompt and other card choices to the preexisting generic policy. It restores the original bot implementation even after an exception. There is no owner-deck or face-down Prize inspection in the add-on.

The falsification criterion registered in the executable paired runner was **at least one selected Mail action and an increased actual Store-processed Mail count** compared with the same-seed baseline. The runner asserts that source draw-log turn identity is verified and both arms still begin with the already authenticated Cologne choice.

## Result: extra live Item and response, but no combo

[Existing manual-only CI run 39141327634](https://github.com/FlareZ123/experiment-01/actions/runs/39141327634) **passed** at main head `c89014f957046a4a062b9828ce215fa1762e891b`. Its source-game diagnostic generated [raw original-run artifact 12141369148](https://github.com/FlareZ123/experiment-01/actions/runs/39141327634/artifacts/12141369148) (ZIP SHA256 `65cfc991bec3411a55db68ee7d76b505fc4725335cbb9f969b95d51bdcb820fe`). The same manual workflow also passed the three new pure policy regressions, preserved earlier Damage Pump/Propagation contracts and did not add a per-commit trigger.

| First-own-turn root step | Baseline v3 | v3 + Mail Scout |
| --- | --- | --- |
| 1 | Canceling Cologne | Canceling Cologne |
| 2 | Lightning Energy | Trainers' Mail |
| 3 | Hisuian Heavy Ball | ResolvePromptAction (Mail) |
| 4 | ResolvePromptAction | Lightning Energy |
| 5 | Unown | Float Stone |
| 6 | PassTurnAction | Hisuian Heavy Ball |
| 7 | | ResolvePromptAction |
| 8 | | Unown |
| 9 | | PassTurnAction |

The source-guided policy **selected Mail once**; actual `cardsPlayedBySeat` changed from **0 to 1 Mail**. The trace contains its live `ResolvePromptAction`. A `Float Stone` was then played, absent from the baseline first-turn line. Because a complete Mail choice-object/result audit was not recorded, the exact selected top-four card identity is inferred from this sequence and the original hand, rather than claimed as a separately verified prompt-selection witness.

**Important negative observation:** the candidate still **passed its first turn**. Neither first-turn branch established the five Exeggcute self-KOs, attached `Technical Machine: Crisis Punch`, declared that attack, or Knocked Out the defending Pokémon. The Item intervention removes one real policy omission but fails to complete the actual attack-conversion requirement on this seed.

## Reproducibility and qualifications

- Tactical extension: [`simulation/twinleaf/rank26-mail-recovery.cjs`](../../simulation/twinleaf/rank26-mail-recovery.cjs).
- Pure opportunity/seat/turn/hand guards: [`tests/rank26-mail-recovery.test.cjs`](../../tests/rank26-mail-recovery.test.cjs).
- Same-deal original-root comparison: [`simulation/twinleaf/rank26-mail-source-probe.cjs`](../../simulation/twinleaf/rank26-mail-source-probe.cjs).
- Existing manual-only workflow: [`.github/workflows/aichi-damage-pump-fidelity.yml`](../../.github/workflows/aichi-damage-pump-fidelity.yml), opt-in `rank26_mail_probe`.
- Preexisting original-source opening and Cologne authentication: [`rank26-thorns-authenticated-firstturn-source.md`](rank26-thorns-authenticated-firstturn-source.md) and [`rank26-autonomous-propagation-2plus2plus1.md`](rank26-autonomous-propagation-2plus2plus1.md).

The seed was identified through a conditional hunt for a held Cologne, active Meloetta and lone opposing Iron Thorns. It is **not** an independently drawn match sample. The two arms diverge after the new Item; they cannot be counted as independent games. The recorded later decisions still come from a generic policy with unqualified Supporter, search, Bench movement and Tool-slot priorities. The result establishes an actual chosen and processed Item plus a subsequent continuation, with no qualified consequential opponent reply.

**Next evidence gate:** inspect the actual Mail prompt selection and Float Stone attachment target from the authentic owner-visible zones; then test whether autonomous legal `Risky Ruins` acquisition and timely movement of initial-Active Meloetta into a Koko-eligible Bench state are possible under unchanged source resources. Preserve both failures and opportunities across preregistered source-first/source-second deals before any attack rate or win-rate claim. The overall project remains **29/32 exact opponent 60s, zero independently qualified competitive games, and no demonstrated 99.5% win rate**.
