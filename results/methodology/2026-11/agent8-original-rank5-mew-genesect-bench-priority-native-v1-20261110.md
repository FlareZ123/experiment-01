# Original rank-5 Mew/Genesect first-Bench-role priority: fresh native A/B

**Agent8, 10 November 2026.** Frozen prospective 16-native-game experiment: all eight control/treatment physical-deal comparisons matched, 0 engine game errors, and **0 changed genuine Bench decisions**. Both arms declared 20 source attacks total. Zero games competitively qualified.

## Original-only and decision change

The published rank-5 Yamato Nakano Mew/Genesect 60, SHA `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`, contains four Mew V FST, three Mew VMAX FST, four Genesect V FST, and four Double Colorless Energy SUM plus optional off-axis Basics including Dedenne-GX, Crobat V and Lillie's Clefairy ex. It contains **no Basic Psychic Energy**. A potentially damaging owner-root error is using an occupied last Bench spot or irreversible on-entry draw/discard Pokémon before establishing a source Mew attacker and an owned Genesect draw/copy engine.

New default-off source-only root policy `actorMewGenesectBenchFirst` / `actorMewGenesectBenchFirstSourceOnly` checks only the owner's current physical held eligible Basics and public in-play Mew/Genesect. It chooses a missing Mew V attacker before other Basic options, then a missing Genesect V Fusion Strike System engine, falling back to the former generic first eligible Basic if both roles are already established or absent from hand. It still permits normal Bench plays later in the turn. Printed Basic/Ability lock, open Bench and caller's legal-looking hand restrictions continue to govern proposals; the Store decides actual native legality. The policy does not consult Prize identities, opponent hidden hand or concealed deck order.

Files: `simulation/twinleaf/2026-11/agent8-mew-genesect-bench-priority.cjs`, `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, `simulation/evaluation/agent41-bilateral-v2-development.cjs`. Nine direct policy regressions and three native option contract/preregistration tests passed. [Pure job 42733435619](https://github.com/FlareZ123/experiment-01/actions/runs/42733435619) tested the initial helper; the native job below retested all twelve.

## Frozen matched original rank-5 native trial

[Source-registered four-group manifest](../../aichi-2026/registrations/2026-11/agent8-rank5-source-bench-priority-v1-20261110.json) was committed at `3a9f0112` before any native execution. The four newly generated source seeds were `885763227`, `784353756`, `249200576`, `1780260457`. Two source seats were represented twice each. Every one of the four physical groups was played against both fixed candidate sixties, the published champion Shadow Rider reference and the unchanged New Moon Lockbreaker. The only treatment difference was the source-owned missing-role Bench preference; every other root, source owner search, Ultra Ball payment preservation, VMAX natural evolution, DCE attachment, Genesect Fusion Strike draw, copied attack selection, opponent policy and candidate 60 remained common.

The [pinned native Store run 42734378947](https://github.com/FlareZ123/experiment-01/actions/runs/42734378947) **SUCCEEDED** at runner repo head `83b59cb82fea710f778dfb844a6c5499fcccd39f`, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, twelve Node20 preflight tests, and all 16 games. Complete source-owned actual root ledgers, physical-deal fingerprints, true option-delivery audits, native outcomes, errors, caps, actions and attack declarations are preserved as [artifact 13726541583](https://github.com/FlareZ123/experiment-01/actions/runs/42734378947/artifacts/13726541583), ZIP SHA256 `100d5a0ba84454ee0926acdc7b06bd9818f0f9de39e821e0d100ad6a1f2fa1ec`. Every one of the 16 real actor root audit objects received its exact enabled/disabled `mewGenesectBenchFirstOptIn` flag and correct source-owner-seat scoping; none were silently dropped.

The initial preregistered run [42734007883](https://github.com/FlareZ123/experiment-01/actions/runs/42734007883) ran the native games but failed **after** gameplay when saving the output because the `artifacts/` directory had not been created. No initial trial outcomes were observed. Its entire output was lost. The correction `fs.mkdirSync(path.dirname(OUTPUT),{recursive:true})` was committed at `567f9e84` before rerunning identical registered seeds. The second run is a **technical retry of the same preregistered physical sample**, not a second independent sample, and its native results are the only retained full tape.

## Complete native paired observations

| Original source physical group and candidate | Control disposition | Priority disposition | Source attacks in both arms | Actual Bench decision changed |
| --- | --- | --- | ---: | --- |
| 5:8100:A champion | native terminal, winner seat1 | native terminal, winner seat1 | 0 | no |
| 5:8100:A New Moon | native terminal, winner seat1 | native terminal, winner seat1 | 3 | no |
| 5:8101:B champion | native terminal, winner seat0 | native terminal, winner seat0 | 4 | no |
| 5:8101:B New Moon | action cap, no native winner | action cap, no native winner | 0 | no |
| 5:8102:A champion | native terminal, winner seat0 | native terminal, winner seat0 | 5 | no |
| 5:8102:A New Moon | native terminal, winner seat1 | native terminal, winner seat1 | 8 | no |
| 5:8103:B champion | native terminal, winner seat1 | native terminal, winner seat1 | 0 | no |
| 5:8103:B New Moon | native terminal, winner seat1 | native terminal, winner seat1 | 0 | no |

**Totals:** 16/16 native game attempts processed; 8/8 source AND complete original physical-deal fingerprints identical between control and priority; 7/8 naturally terminal pairs, 1/8 paired native root cap; 0 engine errors, 0 accepted source Bench ordering differences; 20 source attack declarations in each arm; no native winner changes. Native 'winner seat' is a simulator label and cannot be promoted to a paper tournament winner. No statistical win-rate inference is possible from an unexposed policy and unqualified bot.

## Direction and limitations

The independent physical source sample did **not** encounter a Bench-priority opportunity that led to changed source-native actions. The pure owner policy is mechanically activated for constructed hands where off-axis Basics precede held critical roles; this experiment establishes neither the real prevalence of those situations nor an improvement in candidate-vs-source game results. Additional random panels would be low yield without a targeting/availability census. A separate **staged exact original-rank5 physical source last-Bench-slot fork**, `simulation/twinleaf/2026-11/agent8-original-rank5-lastbench-donor-native.cjs`, is being run to establish whether choosing a missing Genesect instead of a redundant fourth Mew can change the genuine Store's available Mew VMAX copied-attack donor and subsequent damage. This staged test cannot itself establish natural-game frequency.

The competitor field remains 29 authenticated 60s out of 32; ranks 23, 25, 28 are missing; all source native games paper-unqualified; no nominated fixed 60 demonstrated the 99.5% target.
