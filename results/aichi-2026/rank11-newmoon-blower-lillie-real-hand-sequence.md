# Source rank11: automatic Field Blower plus low-hand Lillie changes engine outcome, but copy attacks evade AttackAction counting

**Agent 13, 18 October 2026. Evidence class:** one authentic, pinned-engine, source-and-seed-locked, **unqualified** paired policy counterfactual. Read this with [rank11 automatic Blower regression](rank11-newmoon-autonomous-fieldblower-policy.md). Six pure tests and the compiled experiments passed [manual CI 39100646402](https://github.com/FlareZ123/experiment-01/actions/runs/39100646402), head 8cb6211ee8302573bc9198d23db73fc82fa7f2a6; [artifact 12125659222](https://github.com/FlareZ123/experiment-01/actions/runs/39100646402/artifacts/12125659222), JSON SHA256 **aa232f25702b936e4c8770703daf8a4192a8fa932244cf2a35b7300b94279d4d**.

## Fixed setup and information boundaries

Authentic Aichi rank11 Absol/Garbodor 60 plays **physical A / actually first**, unchanged New Moon Lockbreaker v1 candidate 60 plays **physical B / second**, seed **1244180408**, pinned Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. Deck hashes and original rank11's full 11-action Boost Shake/Tool-Garbodor first-turn sequence remain unchanged across baseline, Blower-only v1, and Blower + Lillie v2. The wrapped candidate decision hooks use **real own hand**, **public Garbodor Tool** and **own physical Prize count**. All proposed PlayCardActions are prevalidated by the pinned engine and the real owner-valid Tool prompt; original generic policy and baseline trace restore exactly afterward.

The opt-in [v2 policy](../../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs) first autonomously chooses a Field Blower when it has the printed Item and public Tool-Garbodor. After that actual Tool removal, if on the **same turn** own hand holds 1 or 2 cards including Lillie's Determination, all six Prizes remain, and its Supporter is unused, it autonomously plays Lillie through an actual legal action. All other actions continue under pinned simple bot. This version is an explicit **hand-dependent conditional experiment**, not an expert player.

## Directly observed initial sequence

- Candidate turn2 first legitimate Field Blower removal confirmed. At the subsequent real decision it holds **two cards**, including **Lillie's Determination M1L**, and automatically plays that Supporter. The printed card shuffles and draws eight with six Prizes remaining.
- On the same source-dealt own turn2, the pinned generic continuation puts the previously inaccessible **Gengar & Mimikyu-GX** onto the Bench, attaches **Telepathic Psychic Energy**, adds two Duskull to Bench via real prompts and plays Path to the Peak before Pass. Source Bot first turn history remained identical.
- An actual subsequent own-deck search prompt (K1) witnesses the singleton Gengar **on the Bench**. Compared with the baseline/v1 own-deck search that witnessed Gengar still **in deck**, this provides a concrete attack-payload access improvement without exchanging hidden cards or staging Prizes.
- On the candidate's subsequent observed turns4/6/8, Gengar remains on its Bench, Mewtwo & Mew-GX remains Active with one then two Telepathic Psychic Energy, and the opposing Garbodor remains untooled. Later in this **different causal continuation**, at global turn12 the v2 decision policy automatically spends a second genuinely held Field Blower to remove a **newly attached** opposing Garbodor Tool. Both removals and both corresponding owner prompts are validated.

## Three-arm engine output

| Same source-dealt seed | Generic candidate | Automatic Blower v1 | Blower + Lillie v2 |
| --- | --- | --- | --- |
| Source opening | identical 11 actions | identical | identical |
| Candidate Field Blower actions | 0 | 1 | **2** |
| Candidate Lillie's Determination actions | 0 | 0 | **1** |
| Own Gengar Bench turn4 | no | no | **yes** |
| Candidate recorded UseAbilityAction named Perfection | 0 | 0 | **3** |
| Direct AttackAction observed | 0 | 0 | **0** |
| Engine winner | Rank11 | Rank11 | **New Moon** |
| Engine action count / global turns | 207 / 43 | 221 / 45 | **300 / 50** |
| Prizes remaining (rank11, New Moon) | 0 / 6 | 0 / 6 | **6 / 0** |

### Critical measurement caveat: copied attacks do not pass the AttackAction counter

The **actual pinned source code** at upstream Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 implements Mewtwo & Mew-GX's **Perfection** as an explicit **UseAbilityAction** using WAS_POWER_USED. Its COPY_ATTACK_VIA_ABILITY prefab offers ChooseAttackPrompt and dispatches a delegated **UseAttackEffect**. These **copied attack executions need not emit any AttackAction**, and the research headless attackTrace only increments for AttackAction. Consequently the apparent v2 **zero AttackAction count cannot be reported as zero actual copied attacks**. The three recorded Perfection UseAbilityAction declarations at global turns **8, 48, 50** are consistent with copied attack use; archive does not yet include their selected attack names. **Printed paper card text** describes Perfection as a passive attack-granting Ability, so the engine's action representation differs from paper rules and must be separately fidelity-qualified.

Pinned source files: https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/mewtwo-and-mew-gx.ts and https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts . Official paper printed card: https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sm11/71/ .

## Interpretation and hard limits

This is a **meaningful one-seed, actual-source tactical outcome reversal under a specified policy modification**. The automatic Lillie decision changed own live payload access, own board, later legal Tool response and engine winner. The experiment provides no credible win-rate estimate or separately qualified independent games. The opponent remains rank11 autonomous opener plus weak generic continuation, New Moon is still largely a generic bot, the opponent field remains **29/32 published exact 60s** and real Aichi match clocks have not been modeled. The observed 50 global engine turns may be wildly unrealistic under the official 25-minute tournament rounds. Winner comparison must not be promoted into evidence of competitive 99.5%.

The outcome deserves follow-up by independent **post-Perfection Prize transition and actual copied-attack prompt tracing**, then prospectively registered held-out seeds and both actual-start directions. The preselected positive seed remains excluded from any estimated win fraction. This is directly useful to the other agents exploring copy-attack engine instrumentation; keep their printed actions and passivity distinctions explicit.
