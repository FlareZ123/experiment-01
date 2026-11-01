# Agent 4: rank1 Shadow Rider CRE74 Astral Barrage native paper target discrepancy

**1 Nov 2026.** This is a staged native card-fidelity differential, **not** a source-dealt tournament game or win-rate claim.

## Exact original field relevance

The authenticated published Aichi 2026 **rank1 Shadow Rider Calyrex** 60 in `results/aichi-2026/full-decklists.json` contains **three Shadow Rider Calyrex V CRE74**. Astral Barrage says choose two of the opponent's Pokémon and put five damage counters on each; under Advanced Rulebook §D-04, with fewer available targets choose as many as available.

Pinned native vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, file `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-v.ts`, computes a Bench-only `benched` count, ends Astral Barrage without effect when `benched===0`, and otherwise enforces `min=max=Math.min(2,benched)` despite including **both Active and Bench** slots in the prompted targets. The count is too small against a lone Active or one Active plus one Bench.

Distinct fault: `ChoosePokemonPrompt.validate` fails to reject duplicate target identities, and pinned `Store.reducePrompt` does not invoke prompt validation before resolving a `ResolvePromptAction`. Two selections of the same Pokémon are accepted by the real Store, permitting the five damage counters to be applied twice to one target.

## Actual native Store differential

Constructed a legal conditional attack-cost fixture: genuine Shadow Rider Calyrex V CRE Active with three attached Psychic Energy SVE; opposing CRE V Active plus 0, 1 or 2 occupied Bench Pokémon; native decks and six physical Prize cards. Dispatched the actual `AttackAction('Astral Barrage')`, resolved owner choice through the actual `ResolvePromptAction`, and measured native state damage.

| Opponent field | Original pinned Store | Reversible CRE74 paper hook | Printed target count |
| --- | --- | --- | --- |
| Active only | No damage prompt, 0 damage | 50 on Active | 1 available |
| Active and one Bench | One target receives 50 | Both receive 50 | 2 |
| Active and two Bench | Two receive 50 each | Same | 2 of 3 |

With two Bench Pokémon, passing the same Active twice to the original live native prompt was accepted by `prompt.validate` **and by Store**, dealing 100 to that Active. The research hook rejects that answer before Store state mutation and then accepts a valid two-distinct-target answer for 50 each.

The opt-in hook and tests live at:
- `simulation/twinleaf/agent4-astral-barrage-active-target-hook.cjs`
- `simulation/twinleaf/agent4-astral-barrage-native-probe.cjs`
- `tests/agent4-astral-barrage-native.test.cjs`

Six of six dedicated native tests passed in the **Astral Barrage step** of [manual CI 41324666046](https://github.com/FlareZ123/experiment-01/actions/runs/41324666046). Its overall workflow failed later on an unrelated source Thorns fixture; do not label the entire job successful. The hook modifies pinned code only through a reversible synchronous research-side prototype wrapper, and guards exact original CRE74-created prompts. No vendor source modifications or automatic frozen-policy promotion occurred.

## Boundary and implication

This is a **real native card-fidelity bug on a card present in the actual rank1 benchmark 60**. Its relevance to winning matches depends on whether the source's live policy would use Astral Barrage in the affected states. This staged fixture is not an estimate of that frequency or win-rate effect. All shared pre-hook native results retain their original semantics and should not be quietly promoted as if they had been run with the paper correction.

Competitive benchmark remains **29/32 authenticated original opposing 60s**, **zero competitively qualified games**, and no demonstrated 99.5% win rate.
