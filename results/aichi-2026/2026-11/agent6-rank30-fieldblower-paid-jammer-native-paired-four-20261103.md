# Agent 6: registered original-rank-30 Field Blower answer to a paid Tool Jammer

**3 November 2026 | Compiled native Store | Four paired, deliberately staged cases | Zero competitively qualified games**

## Decision question and provenance

The authenticated original Aichi rank-30 printed sixty has three **Field Blower GRI125**, one **Float Stone BKT137**, one **Latias ex SSP76**, and three **Lillie's Clefairy ex JTG56**. Authenticated ranks 6, 24, and 29 have Iron Thorns ex TWM77 and singleton **Tool Jammer BST136**. Earlier [eight-arm paid-Jammer held-versus-played test](../agent6-tool-jammer-held-vs-played-rank30-float-native-eight-20261102.md) showed a locally prize-taking Float Stone mobility route blocked when the opposing Tool Jammer actually enters play. It could not answer whether the original rank-30 source can remove the Tool before the planned retreat.

This new experiment is the four-arm intervention [registered 2 November before any native run](../registrations/agent6-rank30-fieldblower-paid-counterline-four-20261102.json). Source code was already committed at `42f3a7db7a2d04c3157164a1a1185f7db3138c27`, workflow addition at `3f054c02664211982102b9f65d605bf795b280a1`, and registration at `8b27e96f8dff`. It runs the existing, manually dispatched `.github/workflows/agent7-rank30-source-psychic-staging.yml` with `agent6_rank30_rondo=true`; only the isolated `AGENT6_OWNER_FIELD_BLOWER_DEV=true` branch invokes `runOwnerFieldBlowerAfterPaidJammer`. The reversible research-only ToolEffect repair is enabled in these cases, with no upstream Twinleaf edits.

Pinned Twinleaf gitlink: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The compiled [CI run 41657500740](https://github.com/FlareZ123/experiment-01/actions/runs/41657500740) used repository head `39d9a7aa0d60aacd3c673c45b6895f7ccad83990` and produced [the target JSON ZIP artifact 13241071172](https://github.com/FlareZ123/experiment-01/actions/runs/41657500740/artifacts/13241071172). The ZIP was downloaded and parsed independently:

- GitHub artifact ZIP SHA-256: `903dcfc0e7971c79b24969dc00c3098cfa6f1d70c7b260816d78c47c1324ecf0`.
- Contained `agent6-owner-field-blower-native.json` raw SHA-256: `753c24ef146b00b1676279334febb3df7d147abb86602a87d5fe5c38d969a432`.
- Result: **4 / 4 cases, 0 failed checks**, identical pre-Field-Blower owner-root fingerprint within each seat pair, and `qualifiedCompetitiveGames: 0`.

## Registration, printed payment and outcome

The native fixture begins on an already prepared opposing turn 4 with Iron Thorns ex Active, an actually held singleton Tool Jammer, and a funded Pidgey on its Bench. The opposing actor **actually uses PlayCardAction to attach the physical Tool Jammer**, then **PassTurnAction** to hand over turn 5. The source has Active Latias ex with Float Stone, funded Benched Clefairy ex, and physically holds Field Blower plus Psychic Energy. Pre-damage, six Prize cards, hands, decks, and the whole board are synthetic, and no natural original-sixty opening was sampled. Both owner-seat orders are included. The only distinction within a seat pair is whether the source plays Field Blower or holds the same physical Item.

| Source seat | Field Blower choice | Physical Item and Jammer custody | Latias retreat cost | Native attacker / Prizes | Opposing reply |
| --- | --- | --- | ---: | --- | --- |
| 0 | Hold | Item stays in owner hand, Jammer stays on foe Active | 2 | Retreat rejected, no attack, six Prizes | Not reached |
| 0 | Play | Item to source discard, Jammer to opposing discard | 0 | Clefairy Rondo KO, four Prizes left | Pidgey Tackle, 20 damage |
| 1 | Hold | Item stays in owner hand, Jammer stays on foe Active | 2 | Retreat rejected, no attack, six Prizes | Not reached |
| 1 | Play | Item to source discard, Jammer to opposing discard | 0 | Clefairy Rondo KO, four Prizes left | Pidgey Tackle, 20 damage |

For each played arm, the actual owner `PlayCardAction` produced `ChoosePokemonPrompt`; the source selected the opposing Active Pokémon, and the prompt validated and resolved. The physical Field Blower left the source hand, the physical opposing Tool Jammer was discarded, and no pending prompts remained. The genuine native `RetreatAction` then succeeded at zero Energy. The original physical Clefairy became Active and its `AttackAction('Full Moon Rondo')` resolved by actual Wait, Prize and promotion prompts. The opponent then made a genuine Tackle attack through the Store on turn 6. For held controls, the Tool still suppressed Float Stone and the attempted unfunded retreat was rejected before any attack.

Within-seat pre-intervention source-root SHA-256 fingerprints were exactly matched:

- Seat 0 control and treatment: `132e781a69eb024c36eb3c5ad800bb345ca0e48e55e59ca1deda71086b7b550a`.
- Seat 1 control and treatment: `b836d3dd3d2ef574b4240692a3406a05a0b572672ee48568bab5b2f1b6d20f8c`.

The four outcome records each passed all 16 boolean fixture checks, including the actual opposing turn boundary, native owner Item custody, legal removal target, ToolEffect patch scope, retreat, Prize settlement and consequential opponent reply.

## Scope, workflow status and integration handoff

**The full workflow concluded `failure`**, because its separate baseline step `Stage original owner Skyliner against public Ability suppressors in pinned Store` failed. The targeted `Probe native opponent Tool Jammer followed by source-paid Field Blower answer` step **succeeded**, and its archive uploaded successfully. Existing baseline raw-Store Tool Jammer mismatches are intentionally preserved as negative controls. The green targeted result is confined to the explicitly enabled paper-fidelity repair and must not be reported as an upstream default fix or as a successful complete workflow.

This four-arm result establishes a deterministic **mechanical counterline** under the exact prepared state. It does **not** establish that rank 30 sees or chooses this root naturally, that the opposing Iron Thorns policy is competent, or that a real original-rank-30 vs rank-6/24/29 game favors either player. It uses synthetic Prize allocation, pre-funded attackers and a scripted opposing Pidgey. It supplies **no game-win sample** and changes no fixed-sixty nomination.

The integration priority is to preserve the Field Blower option as an **owner-visible competing Item root** in any eventual shared rank-30 policy. Compare it against Pass and other genuinely affordable options at a real natural owner decision under the same two-seat frozen bilateral policy, recording physical hand/discard custody, actual targets, native prompts, opponent continuation, and card-text paper legality. The answer matters especially when a naive Tool Jammer-only model would falsely treat mobility as permanently blocked. Do not add another specialized CI workflow; this case is reproducible under the existing manual one. The [current fixed-60 decision board](../../README.md) remains unchanged: 29/32 authenticated originals, no qualified matches, no selected final deck, and no demonstrated 99.5% win rate.
