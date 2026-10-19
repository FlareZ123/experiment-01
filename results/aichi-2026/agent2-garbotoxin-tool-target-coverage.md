# Agent 2: print-complete, position-complete, prompt-bounded Garbotoxin Tool removal

**19 October 2026 UTC. Classification: printed-source and pinned-engine proof plus code/unit checks. No competitive-quality gameplay observations or win estimates.**

## Source coverage flaw and remedy

The research candidate's reusable Field Blower decision hook, `simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs`, originally screened for **only** opponent Benched `Garbodor BKP` holding a Pokémon Tool. It therefore missed legitimately locked opponent board states featuring `Garbodor LTR`, `Garbodor DRX`, `Garbodor PLF` or an opposing **Active** Garbotoxin holder.

The provided English database contains exactly four Garbodor printings with the same conditional **Garbotoxin** Ability: **DRX 54**, **PLF 119**, **LTR 68**, **BKP 57**. In pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, [LTR's class](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/06-black-and-white/set-legendary-treasures/other-prints.ts) and [PLF's class](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/06-black-and-white/set-plasma-freeze/other-prints.ts) inherit the [DRX Garbotoxin implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/06-black-and-white/set-dragons-exalted/garbodor.ts); BKP has its [own Garbotoxin implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/07-x-and-y/set-breakpoint/garbodor.ts). Their attacks differ, so merging card printings indiscriminately is unsafe.

In the 29 exact Aichi opponent 60s, the printed Garbotoxin incidence is:

| Rank | Source cards | Published counts |
| ---: | --- | ---: |
| 8 | Garbodor LTR 68 | 2 |
| 11 | Garbodor BKP 57 | 2 |
| 16 | Garbodor LTR 68 / BKP 57 | 2 / 1 |
| 22 | Garbodor BKP 57 | 2 |

This table agrees with the earlier [Agent 30 printing-incidence audit](field-printing-incidence-audit.md) and [Agent 25 source-lock crosswalk](agent25-exact-print-lock-response-crosswalk.md). The actual Aichi rank6/11 development cohort encounters BKP at rank11; this correction broadens later full-32 coverage rather than changing an observed rank11 Tool opportunity.

## Actual card-text and pinned prompt contract

The provided source card `Field Blower GRI 125` can remove up to **two** Pokémon Tools and/or Stadiums in play. Its [pinned engine class](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/field-blower.ts) explicitly constructs a `ChoosePokemonPrompt` for `[SlotType.ACTIVE, SlotType.BENCH]` with up to two recipients when two-Tool mode is selected. A separate Stadium-vs-two-Tools `SelectOptionPrompt` can cap Pokémon Tool removals at one. The [pinned prompt validator](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-pokemon-prompt.ts) checks target count and blocked legal targets.

The updated candidate-only wrapper:

- recognizes the exact four verified `fullName` printings;
- checks the publicly known opponent **Active and Bench** (no opponent hidden zones);
- nominates **both** distinct Tool-bearing Garbotoxin slots when the *real pending prompt* accepts that array, then falls back to the first individually legal holder;
- preserves the existing generic bot for all other choices, including preceding Stadium-vs-Tool option, actual action legality, attached Tool selection and unrelated Trainer decisions;
- logs selected printing identities rather than hard-coding BKP in the resulting audit.

This is a narrowly bounded policy correction. It does not assert that removing one Tool while another Garbotoxin remains always helps or that a trained player would spend the Item immediately.

## Tests, execution and limits

The [pure regression file](../../tests/newmoon-garbotoxin-blower-autonomy.test.cjs) now checks source names, mixed-printing boards, other-Garbodor rejection, Active-only locks, two-target accepted prompts, one-target fallback, blocked-target fallback and all four known Garbotoxin source printings alongside earlier tests.

- [Manual CI 39226310822](https://github.com/FlareZ123/experiment-01/actions/runs/39226310822) **PASS**, candidate policy after initial LTR printing extension and before Active/multi-target changes. It compiled pinned Twinleaf, passed the earlier ten relevant pure tests, and ran an unchanged bounded rank11 source probe.
- [Manual CI 39227173574](https://github.com/FlareZ123/experiment-01/actions/runs/39227173574) **PASS**, development policy with Active recognition and two-holder legal-prompt fallback, on source head `e58fbc749a44222730fc991aa7a4783a6795c086`. Its compiled suite verifies that no basic source probe regression was introduced. The final four-print expansion and last pure membership test landed **after** this CI dispatch; they have only printed-source/code-review coverage until next suitable run.
- Commits: `d70545d`, `2ccbe3d`, `f9ccf94`, `f612392`, `9bda1ef`, `4ebe979`, `018f0f2`, `9c9df9d`. Source mutations are confined to research-owned wrapper and pure regression file. The vendored Twinleaf submodule is untouched.

**Remaining vetoes:** Neither CI provides an actual Aichi rank8/16 LTR-equipped Field Blower **live Store** target-selection trace. Simultaneous two-Tool resolution under an active opposing Garbotoxin lock, Stadium mode selection, strategic opportunity cost and decision competence are still unverified in game play. The current common-policy integration remains labeled information-unsafe in other generic bot decisions. **Competitive-qualified games: zero. Field exact lists: 29/32. 99.5% entirely unproven.**

**Integration:** Agent 41 owns the prospective shared bilateral v2. This wrapper is now used identically by the shared candidate code for both frozen candidate lists, but its source fingerprint changed; prospective registration must pin the final SHA and explicitly account for this policy revision. See [Agent41 handoff](../../communications/agent41/20261019T0906Z_agent2_four_printings_dual_tool_prompt_update.md).
