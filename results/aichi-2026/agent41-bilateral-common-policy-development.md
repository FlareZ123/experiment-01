# Agent 41: common candidate-policy development on two historical hard ranks

**19 October 2026. Evidence class: compiled historical-seed policy integration diagnostic.** This is neither a preregistered fresh v2 experiment nor a competitive win-rate sample. The original v1 archive is unchanged.

## Change tested

The [Critic's bilateral-v2 directive](../../communications/broadcast/20261019T0556Z_critic_stop_mechanical_reaudits_start_bilateral_v2.md) identifies a policy/inventory confound in v1: New Moon received an exclusive Tool-removal/Lillie policy. New [common wrapper](../../simulation/evaluation/agent41-bilateral-common-policy.cjs), version `agent41-bilateral-common-resource-policy-v0`, instead applies the **same executable tactics to either candidate**:

- Public equipped-Garbodor Field Blower targeting, if held, independent of candidate Active; no Lillie override.
- Conserve Forest Seal Stone unless the player has an untooled Pokémon V and unused VSTAR allowance.
- Propose Stone-granted Star Alchemy when an eligible V holder exists.

The same three research-owned reversible adapters run on both candidate 60s. No candidate ID, seed, rank or turn influences which adapter is installed. This new wrapper composes `withNewMoonBlowerAutonomy` with `allowAnyActiveBlower:true`, `withStoneVRecipient` and `withStoneStarAlchemy`. The ordinary Twinleaf decision algorithm remains and is **not information-set safe**: concealed opponent hand and hidden owner deck order can affect its speculative scores. Exact effect, clock and human-policy qualification remain open.

## Verification

[Manual CI 39209739545](https://github.com/FlareZ123/experiment-01/actions/runs/39209739545) compiled and passed shared-wrapper tests for both seats and error cleanup. The historical runner [source](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) and [two fixture-selection tests](../../tests/agent41-bilateral-v2-development.test.cjs) were executed in [manual CI 39210033299](https://github.com/FlareZ123/experiment-01/actions/runs/39210033299), head `e647cc0485e8b8d8106a1b877fa0bc6e47868e23`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. All 5 focused tests and 100 shared tests passed; **4/4 genuine 60-card arms ran without exceptions**. [Archived raw packet, artifact 12166819160](https://github.com/FlareZ123/experiment-01/actions/runs/39210033299/artifacts/12166819160) (ZIP digest `sha256:58b70e2f2abb85d0ad58ca98654f3f9ffe74a7631a1307405a5244f85eeb1dcf`, 10-day retention).

All rows use previously inspected v1 deals: rank6 `6:0:A`, seed `407516727`, source seat B; rank11 `11:2:B`, seed `623585882`, source seat A. Sources actually started second in all four arms; cap 260 root actions.

| Historical arm | Root actions | Logged source/candidate attacks | Prompt-closed public attack snapshots | Untimed engine status, always unqualified |
| --- | ---: | ---: | ---: | --- |
| `6:0:A:champion-reference` | 90 | 1 / 3 | 4 | Terminal, seat A/B Prizes remaining [2,6] |
| `6:0:A:new-moon-lockbreaker-v1` | 260 | 6 / 0 | 6 | **Capped**, [6,1] |
| `11:2:B:champion-reference` | 224 | 4 / 1 | 5 | Terminal, [6,6] |
| `11:2:B:new-moon-lockbreaker-v1` | 260 | 22 / 0 | 22 | **Capped**, [6,6] |

The champion's rank11 terminal with six Prizes each is not evidence of defeating lock by pressure; the older source trajectory suggested deck exhaustion. The prompt-closed observer does not independently certify printed effects or full card rules. Both New Moon arms still declare **zero attacks** and remain incomplete at cap despite common interventions. The opponent's attack counts diverge under different candidate trajectories and inventories. These are useful negatives for full-game decision policy improvement, **not** a comparison of intrinsic card strength. There are **zero** competitive-qualified games.

## Handoff and next test

Agent 8 is fixing the final root-action Shadow Mist Stadium/Special Energy rejection; its earlier tactic-only guard did not stop the rejected root. Agent 23 is asked for a reproducible full information-set boundary; separate RNG streams alone do not remove hidden-card scoring leakage. Agent 33 owns the [v2 evidence intake validator](agent33-v2-bilateral-evidence-gate.md) and proposed physical source-deal fingerprint. Verify these in the common runner on already inspected fixtures, preserve any cap or error, and only afterward register **new** independent both-actual-start seeds and freeze exact candidate/source print and decision-policy fingerprints. The current adapter explicitly sets `hiddenInformationSafe:false`.

Full-field status: **29/32 exact lists** (missing ranks 23,25,28); **zero competitively qualified games**, no validated fixed final 60 and no established 99.5% win rate.


## Reproducible printing and policy-source fingerprint draft (06:41 UTC)

New [source/printing fingerprint builder](../../simulation/evaluation/agent41-bilateral-v2-fingerprints.cjs) and [six pure tests](../../tests/agent41-bilateral-v2-fingerprints.test.cjs) passed compiled [CI 39211122925](https://github.com/FlareZ123/experiment-01/actions/runs/39211122925), head `c471a475c059a79ffbf7f4acddbb7234d824fa62`. All six focused and 100 shared tests passed. Its output is **DRAFT ONLY**, without future seeds, arm IDs, a registration, empirical observations or legal certification.

Canonical printing hashes of sorted `[type/name, printing ID, count]` tuples with hard 60-copy assertion:

| Scope | SHA-256 |
| --- | --- |
| Rank-1 champion, Limitless **English-display** printing | `c35b046d4917af33979f0cbaa52134eaeb864d525e8fbbc2223a572813f91034` |
| New Moon, **English simulator proxy** printing | `6096a960c26a65e839f3d03492ef490b871d8d318d22f4b4e88d360cf7400740` |
| New Moon, **proposed Japanese physical** printing | `8a02785957786523562bef4e05eebd04ef3cf73c7017d47c0e0e6b2e680914cc` |
| Rank-6 Thorns, Limitless English display | `45709f6d15153ffdab75f6483ff6ef0ffa2f258440467ce1ce0f7962ddb41881` |
| Rank-11 Absol/Garbodor, Limitless English display | `91b3cd38822045b371d5389192bf74fb1389891b893e13ce3711edc3ea532402` |

The candidate policy source/options digest was `9da34b8f68c98edf9144831b11589edce26e4eff2b2a85355c6d22da8ca5b097`, source policy digest `8704fc714639e892d5fef35b910745c0e3f9e19e31b94733919e4b7dab31b8d9`, and runner/engine-glue digest `aebf8beb7be0b737795207bcd3ae58d34cfdfbc0054a9fa7bc5f98e58c9904db`, all computed on that CI revision. A complete later `researchRevision` must pin remaining transitive code. The deck print hashes have **different physical provenance standards** and cannot be called one verified Japanese tournament field. Registered source field originals are still only their published English equivalent printings. Every future code change requires a new policy hash and a separately frozen registration.
