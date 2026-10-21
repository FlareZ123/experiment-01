# Actual source-attack replies: held Telepath Energy survives three late candidate Passes

**Agent 4, 21 October 2026.** Read-only native decision-forensics result on the existing retrospective, same-deal four-cell rank6/rank11 canonical runner. The finding concerns **actor-policy omissions**, with competitive qualification still zero.

## Causal question and provenance

[Agent 29's settled source-attack receipt](agent29-rank6-source-first-volt-cyclone-bilateral-native-receipt-20261021.md) independently proved five real native `Volt Cyclone` attacks from rank6 source Iron Thorns against the proposed New Moon candidate. It also recorded three candidate `PassTurnAction` replies after the source began taking Prizes. The previous public export contained only a globally capped early `Pass` attack-probe sample, which lacked the candidate's later owner-hand context.

I added a strictly postgame join, `candidateRepliesAfterSourceAttacks`, to the **existing** [canonical bilateral runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs). It joins each already-settled source attack's same-episode next opponent root with the matching post-policy-decision `game.decisionTrace` row. Only that acting seat's own hand, already public board, printed attack costs, and existing bounded post-choice probes can be included. A missing or later-episode root remains an explicit unknown. This changes no policy, native Store action, source/candidate 60, seed or simulation rules.

The [existing manual Aichi benchmark](https://github.com/FlareZ123/experiment-01/actions/runs/39636528348) **passed**, at committed workflow head `8ffeccb254c60bb5981331d057790e19997fc968`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, Node 22. Enabled existing rank6 K1 fallback and source-only Special Energy continuation, with the same four frozen source-first physical deals. The complete [native JSON artifact 12362315420](https://github.com/FlareZ123/experiment-01/actions/runs/39636528348/artifacts/12362315420) has ZIP SHA256 `777c934b7db27f4ed1918785bbda5b01fc03682089d0a95b129faa6b040a31c8`. Source code addition commit `3332605e`, focused tests `f3159641`, workflow `8ffeccb2`, follow-up assertion matcher `0e4fe189`. All **four** source deal digests, full root-ledger SHA256 values and final Prizes are identical to [Agent29's immediately prior native artifact 12359268795](https://github.com/FlareZ123/experiment-01/actions/runs/39633472400/artifacts/12359268795). The observer has zero demonstrated behavioral effect.

## Previously invisible native candidate hand

Original rank6 source, real seat 0 first, against New Moon candidate, real seat 1 second, frozen seed `407516727`. The opponent source still has zero Benched Pokémon, two active Speed Lightning Energy after turn21 and the same Thunder Mountain. The source's five settled Volt Cyclone attacks are unchanged, with source Prize sequence **6→5→5→2→2→0**. The candidate's actual same-epoch responses were:

| Source attack root/global turn | Candidate reply root/turn | Actual reply | Candidate's owner hand and public board at this action |
| --- | --- | --- | --- |
| 101/21 | 107/22 | Play Unown | Non-Pass. We do not expose a hypothetical pre-Play hand. |
| 111/23 | **115/24** | **Pass** | **Held `Telepath [P] Energy M3`**, a Psychic-providing Special Energy; Active Trevenant & Dusknoir-GX had **zero Energy**, already 140 damage |
| 118/25 | **124/26** | **Pass** | Still held the same `Telepath [P] Energy M3`; Active Gengar & Mimikyu-GX had **zero Energy** |
| 127/27 | **131/28** | **Pass** | Still held that Special Energy; Active Gengar & Mimikyu-GX had **zero Energy**, 140 damage |
| 134/29 | None | Source terminal | No later candidate root exists |

At each of the three Passes the native owner-hand witness also lists `Canceling Cologne ASR`, two `Field Blower GRI`, `Counter Catcher PAR`, `Mysterious Treasure FLI`, `Powerglass SFA` and `Lillie's Determination M1L`. These are physically held, source-preserved cards; their availability and opportunity cost under the **actual board state** still require an exact legal-action test. The Passes themselves are genuine accepted native actions. The printed-attack-cost audit shows zero active Energy and no payable printed attack from Basic Energy alone.

The independent rank11 source-first New Moon control shows the same qualitative owner-hand problem: **14 candidate Pass replies among 18 settled source Psychic attacks held an unspent `Telepath [P] Energy M3`**. This is a repeated observed decision pattern across two different sources, within these retrospective frozen cases. It remains unknown whether the Special Energy could be legally attached on those specific turns and whether doing so would ever enable consequential resistance.

## Existing both-seat Special Energy switch: a real attachment with poor allocation

I additionally ran the **already-existing** common `AGENT3_SPECIAL_ENERGY_ROOT_DEV` option on the same frozen source-first streams, using the same manual workflow, [run 39637301254](https://github.com/FlareZ123/experiment-01/actions/runs/39637301254), **PASS**, [complete JSON artifact 12363805581](https://github.com/FlareZ123/experiment-01/actions/runs/39637301254/artifacts/12363805581), ZIP SHA256 `ff81ddff5ae218176d10c907dca4f7c874941e9529a52ea24deb787843e96e9c`. All four trial inputs remain source-first retrospective deals. The common switch applies to **both actors**, so it cannot identify a clean candidate-only causal effect.

In rank6/New Moon, the opt-in's **first changed root was candidate seat1, turn2/root15**: the source K1-only control **Passes**, while the common Special Energy policy sends a real, Store-accepted `PlayCardAction Telepathic Psychic Energy` to the current Active **Unown** and then uses `Hidden Power`. The card can legally be manually attached in this observed early Store state. It is an Energy whose on-attachment search is conditional on attaching to a Psychic Pokémon, so the Unown choice is a distinct and potentially expensive allocation.

The common policy ultimately allowed source Iron Thorns to settle five Volt Cyclones and collect all six Prizes at turns **17, 19, 21, 41 and 49**; it also led to numerous later candidate Passes with zero-Energy Active Pokémon. The first source attack was four global turns earlier than in the source-scoped historical root path, while the source's final Prize completion was much later; the action sequences and both actors' policies differ, so neither figure estimates a win-rate benefit or an isolated Energy-recipient effect. A source-only scope retains the candidate's root15 Pass and eventually proves the three held-Telepath late Passes above. This experiment shows that **enabling all Special attachments can spend the critical card too early on an inefficient recipient**, so the planned repair must include a deliberate target and timing choice.

## Falsification target

The most actionable remaining question is the first rank6 candidate turn24 **Pass root 115**: compare a physically valid `PlayCardAction` of held `Telepath [P] Energy M3` to the printed Psychic Active (or a public Bench target) against unchanged baseline on the **same actual native deal**, using the already-existing actor-only Special Energy recipient code and a Store-accepted postcondition. Track complete downstream source pressure, potential on-attachment prompts, and prompt-closed attacks. A physical Energy in hand is a **possible opportunity**, and this report does not assert its hand-attachment legality, attack readiness, beneficial effect, or competitive win.

The root facts themselves already diagnose a significant shortcoming of generic automated play: it can repeatedly choose `Pass` while preserving a strategically relevant Energy and multiple Trainer cards during an opponent's continuing Prize-taking sequence. The better-response question must account for Supporter/Item contention, Active/Bench targets, ability and card-play locks, terminal hazards and alternate tempo lines. A legal attachment could still lose that game.

This is retrospective development evidence using a simplistic generic decision fallback and incomplete field. The canonical result remains **29/32** exact opposing source 60s, **zero** competitively qualified complete games, and no demonstration of the **99.5%** target. Do not fold these native terminals into an estimated win rate.
