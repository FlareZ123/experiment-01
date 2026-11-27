# Two-profile candidate policy successor — implementation checkpoint

**Agent46, 2026-11-27.** Scope: Critic-approved PR #74 implementation lane only, exact 60s unchanged. This is **not** a qualification result, a registered candidate change, a fixture launch, or a competitive-game result.

Implementation at `ca0c94562f9f720444a812285eb0f7e8f8f0ebee`:
- Shared `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs`, exact profile version/options and deck fingerprint; Hood Shield and Lockbridge only.
- Strategy uses actor-visible board, hand, legal action/prompt tokens and certified owner K1/turn receipts. No opponent hidden deck/hand, PRNG seed, sampled future draws, rank or opponent archetype label.
- Provisional pre-deal policy: second for both profiles; no claim this is optimal.
- Host preparation exports `prepareTwoProfileCandidate`, `buildTwoProfileCandidateIdentity`, `bindTwoProfileCandidate` in existing V3 runner. No change to owner-gated game entry. Full Node host/native integration not yet run.

## Inventory decision coverage (implemented vs remaining)

| Exact inventory card(s) | Current positive / negative decision |
|---|---|
| Shadow Rider V, VMAX | Opening/bench reservation, evolution, typed Energy, Underworld Door unspent source/recipient, Max Geist, Shadow Mist. Astral Barrage currently withheld pending source-bound target semantics. |
| Radiant Eternatus | Preserve entry trigger at setup; tutor/Heavy Ball/Stone, three-slot Gate vs opponent suppression/own Wob, confirmation and bench choices. |
| Tapu Lele-GX | Preserve Wonder Tag, reachable Ranger/Arven, compare held Supporter; Energy Drive; GX healing not yet useful-scored. |
| Clefairy ex | Fairy Zone, live suppression/Hood, Rondo public bench damage, Psychic attach. |
| Trevenant & Dusknoir-GX | Night Watch/Pale Moon, prioritized typed attach, public retreat estimate. |
| Latias ex, Float Stone | Mobility, actual payment/target; preserve bench capacity for Gate. |
| Girafarig, Mimikyu | Get Lost two public discard payloads and Mind Shock, Filch. Copycat withheld (separate admission). |
| Dialga-GX, Battle Compressor | No speculative Copycat route or Metal attach; intentionally withheld when no admitted use. |
| Marshadow, Field Blower | Live hostile stadium/tool and counterlock targeting. |
| Wobbuffet, Temple (Lockbridge) | Opening vs reachable Gate, active lock vs actual opposing visible relevant abilities, departure/pivot, observed Special Energy pressure and Stadium/KO tradeoff. |
| Ranger (Hood), VS Seeker | Actual attack-effect Item lock; compare live Supporter access, no supporter-used replay. |
| Lillie's Determination, Iono, Unfair Stamp | Conditional hand reset, protected pieces, depletion safety. |
| Arven, Forest Seal Stone | One Item + one Tool; eligible Stone attachment/VSTAR Star Alchemy; Item-lock bypass route. |
| Teammates, Raihan, Guzma, Acerola | KO receipt gates; complementary tutor; typed discard acceleration independent of manual attach; joint forced-switch gust; damaged-Pokemon return (further tactical scoring desirable). |
| Fog Crystal, Mysterious Treasure, Quick Ball | Marginal access, payment excludes played card; native card filter; no dead all-Prized targets when certified. |
| Hisuian Heavy Ball, Night Stretcher | Owner-revealed Prize choice, K1 redirects, recovery targets and Item lock. |
| Stealthy Hood | Holder-specific live lock threat, Fairy Zone/engine protection. |
| Sky Field, Dimension Valley | Meaningful Gate capacity or attack access; hostile Stadium replacement, no speculative replacement. |
| Psychic Energy | Current marginal manual/ability/Supporter attachment demand and funded attacks. |

## Evidence
21 root groups (each physical seat × both profiles), 6 setup groups, 3 K1 groups, 4 native projection groups passed using exact repository JS and lightweight V8 assertion shims. Native-projection tests use synthetic native prompt shapes, not Twinleaf dispatch. Host identity options Node test authored but not executed. Counts are test groups, **not matches**. No local native game, CI, fixture, Stage-A, registration, or merge authorized or executed. Exact opponent field remains 29/32, missing ranks 23/25/28; zero qualified field results. Independent release review and actual runtime admission remain necessary.

## Next work
Improve public damage immunity / prize-race scoring, source-bound attack targeting where native semantics match paper, and actual sequential actor-visible lock responses. Agent31 independent review: adversarial held-out states across both seats/profiles, especially active Wob + competing Klefki/Garbotoxin, Ranger vs Arven under attack-effect Item lock, Heavy Ball current/stale K1, Temple vs Dimension Valley near knockout. No native dispatch without separate owner GO.
