# Rank-11 source-first T22: verified unready Active Energy and alternative printed targets

**Agent 40, 21 October 2026. Archive reanalysis; no new native game.** This is a bounded retrospective diagnostic of one actual common-policy decision. No fixed-deck strength, matchup win or tournament-clock claim follows.

## Reproducibility

- Original registered [source-first same-deal recipient comparison](agent45-canonical-sourcefirst-recipient-native-negative-20261021.md), treatment manual [Actions 39639145934](https://github.com/FlareZ123/experiment-01/actions/runs/39639145934), artifact 12363533023, archive `agent7-canonical-actor-fourarm.json` and `agent7-canonical-sourcefirst.json`. Downloaded ZIP SHA256 `6d5480ac58fb407f457d3e0d90ec5429cb24c720be44fadfb992346d323d7a14`.
- Frozen code `6f43e03313611b388ba763e72befec3261de129e`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, source rank 11, New Moon Lockbreaker v1 candidate physical B/seat1, actual source physical A/seat0 first, seed `482443328`. Physical source-deal SHA256 `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`. The other three source-first rows remain in the archive; no outcomes were filtered.
- Printed card verification used the provided `card-list.zip`: Oranguru V ASR `swsh10-133` (210 HP, Psychic 30+50 per attached Energy on opposing Active); Galarian Articuno V CRE `swsh6-58` (210 HP, Psyray 110, cost Psychic+Colorless+Colorless); Duskull VIV `swsh4-69` (60 HP, Future Sight, cost Colorless; rearranges the top four cards of either player's deck); Gengar & Mimikyu-GX TEU `sm9-53` (Horror House-GX, cost Psychic, prevents opponent from playing cards from hand next turn). A legal attack from a Benched Pokémon still requires promotion to Active.

## Authentic root sequence and owner-visible position

The original shared recipient-ON policy under source-first rank11 correctly removed Float Stone from Tool-equipped Garbodor early via Field Blower, then entered the following real sequence:

| Global turn / Store root | Native observation | Public consequence |
| --- | --- | --- |
| T16 / 85→88 | Candidate Lunatone `Moon Press` | Oranguru V damage 0→100 |
| T18 / 92→95 | Second settled `Moon Press` | Oranguru damage 100→200 of 210 HP |
| T19 / 97→101 | Source `Psychic`, real Prize prompt | KOs Lunatone; source takes one Prize; Articuno V promoted, initially with zero Energy |
| T21 / 109→111 | Source `Psychic` | Articuno receives 30 damage with zero Energy; source Active Oranguru at 200 damage, with three Darkness Energy |
| **T22 / 113** | Candidate owner `PlayCardAction`, physically held `Psychic Energy MEE` at hand index 9 | **Accepted on Active Articuno**, 0→1 attached Energy, printed Psyray Basic shortfall **3→2** |
| T22 / 114→115 | Candidate `PassTurnAction` and Wait | No candidate attack; Articuno remains Active with 1 Energy |
| T23 / 118→120 | Source `Psychic` | Articuno 30→110 damage |
| T24 / 122→123 | Candidate Pass | No candidate attack |
| T25 / 125→127 | Source `Psychic` | Articuno 110→190 damage |
| T26 / 129→130 | Candidate Pass | No candidate attack |
| T27 / 133→137 | Source `Psychic`, real Prize and promotion prompts | Articuno Knocked Out, source takes **two Prizes**; source remaining Prizes decrease to 3 |

The T21 published public board following the source's settled attack contains **all four candidate Bench occupants without attached Energy**: two `Duskull` with Future Sight [Colorless], `Gengar & Mimikyu-GX` with Horror House-GX [Psychic] and `Latias ex` with Eon Blade [Psychic,Psychic,Colorless]. This is actor-visible information in the same source-first state, independent of source hidden hand/deck. Articuno had 30 damage before the T22 attachment.

## Identifiable policy choice and untested alternatives

The checked-in `simulation/twinleaf/agent44-actor-energy-recipient.cjs` enumerates held Basic Energy and each publicly printed non-GX attack's missing Basic attachments. At T22 its live intent is `slot:'active', attackName:'Psyray', gapBefore:3, gapAfter:2`. The scorer assigns any unready Active `priority:0` and Bench `priority:1`, then sorts by priority before post-attachment gap. This can select an attachment that leaves the Active two turns of ordinary Energy drops from attacking over a Bench card whose printed attack would become cost-complete.

At least these physically legal *attachment* destinations deserve a controlled native comparison:

- **One Duskull:** a Basic Psychic supplies its Colorless requirement, so Future Sight becomes payable **when Duskull reaches Active**. It is a zero-damage attack with deck-top manipulation. No switch, promotion or future attack is established by the archived T22 decision.
- **Gengar & Mimikyu-GX:** a Psychic would pay Horror House-GX's printed one-Psychic cost, provided the GX allowance remains available. The current recipient scorer deliberately excludes all GX attacks. Before claiming this line useful, inspect GX allowance and next Active-transfer timing. A Bench attachment does not itself enable an immediate GX attack.
- **No attachment:** preserves the Basic Energy in hand and does not increase Oranguru's printed damage on Articuno. The cost is postponing any progress toward Articuno's three-Energy attack. There may be other real source actions or candidate hand plays that alter the projected survival.

**Pure conditional arithmetic, not a Store result:** if the same source `Psychic` attacks at T23/T25/T27 with no other changes, an Energy on Articuno gives 30+50=80 each, reaching 30+3×80=270 cumulative damage, which exceeds 210 HP. Without an Active attachment, 30+3×30=120 cumulative damage and Articuno would remain alive at that boundary. The 150-damage difference illustrates an identifiable tactical exposure, but the source's actions and the owner's future options could diverge. This calculation is not a counterfactual match outcome.

## Executability and qualification boundary

A one-line experimental priority reversal was preregistered on branch `agent40-sourcefirst-energy-gap-20261021`, [registration](registrations/agent40-rank11-printed-gap-priority-20261021.md), and the scorer was briefly patched there. **The connected GitHub tool blocked the corresponding test-file update; the scorer patch was reverted on that isolated branch. No changed-policy CI was dispatched or certified.** The original main scorer and runner were left intact. The 21 October archived treatment is the only native decision evidence in this report.

The next bounded experiment should use the same canonical runner, same physical deal, one changed generic policy decision and native opponent continuation through at least T27. It must record rejected or unoffered alternatives as well as Prize and terminal changes. Agent44 was sent the exact owner-visible Bench opportunity in `communications/agent44/20261021T190548772Z_agent40_rank11_t22_bench_witness.md`; coordination with the canonical policy caretakers is preferable to a competing integration path.

The prior source-first controls retain an original rank6 strict epoch audit failure and the corrected source-first stage remains **development-only**. All 32 opponent ranks are in scope, but exact source 60s for ranks 23, 25, 28 remain absent. **Zero competitively qualified games, no demonstrated 99.5% fixed 60.**

## Independent native follow-up: actual Bench diversion preserves Articuno through T27, still loses

**Later on 21 October, Agent8 completed a same-deal native experiment** that tests a stronger alternative than the unexecuted Agent40 gap-first pilot. See [Agent8's negative report](agent8-native-t22-shorter-damage-route-negative-20261021.md), [CI run 39654706241](https://github.com/FlareZ123/experiment-01/actions/runs/39654706241), archived artifact 12372360109, and branch commit `005ea2b02842cd8417561d74b6603c62ba8cf614`. Downloaded archive ZIP SHA256 `6c7fd003b9c69f236baa584b1d29e1ef24b13c3ed3ca2eb9d2104a6c45b2e284`.

With unchanged original 60s, seed, source physical deal, policy background and engine pin, the controlled T22 alternative assigned the held Basic Psychic to **Benched Gengar & Mimikyu-GX** for printed Poltergeist (gap 2→1) rather than the unready Active Articuno. Both actual native `PlayCardAction` choices were accepted and physical Energy destinations verified. I separately read the complete native `sourceAttackSettlement.attacks[].publicBoardAfter` in both archived JSONs:

| Settled source Psychic | Control: Articuno damage (1 Psychic attached) | Alternative: Articuno damage (0 Energy attached) |
| --- | ---: | ---: |
| T21, before attachment | 30 | 30 |
| T23 | 110 | 60 |
| T25 | 190 | 90 |
| T27 | **Knocked Out; Duskull promoted** | **120, still Active** |

The source took two Prizes at T27 in the control. The experimental Bench diversion delayed that particular two-Prize KO, but owner turns 24 and 26 were still Pass; the Gengar remained Benched and insufficiently funded for printed Poltergeist. Source took further attacks afterward and **both games ultimately ended with source taking all its Prizes, candidate taking none**. The alternative game consumed four more actual root actions (228 vs 224 in the archived comparison). These results validate the narrow tactical Energy-as-liability diagnosis, while falsifying an immediate competitive payoff from that one attachment change. The source-first subgate passed; the overall workflow failed an independent unchanged original rank6 epoch check. Agent8's test is a retrospective development fixture with zero qualified games.

**Updated priority:** do not spend more CI on naive gap-first or near-term Bench Energy reassignment alone. Reaching competitive improvement requires a multi-action route from real owner hand/resources to a timed attack, mobility or denial effect while preserving the favorable damage exposure. A changed Prize-taking tempo in one fixed losing seed cannot be promoted to a win-rate claim.
