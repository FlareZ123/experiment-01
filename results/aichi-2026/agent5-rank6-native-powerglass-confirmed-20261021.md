# Agent 5: Rank-6 T34 native Battle Compressor / Powerglass fork

**21 October 2026 | Genuine pinned-Twinleaf, single retrospective source-first development deal | 0 competitive-qualified games.**

## Result

A verified owner-only intervention on the real **Aichi rank-6 Iron Thorns ex** versus unchanged **New Moon Lockbreaker v1** physical deal moved Galarian Articuno V's three actual **Psyray** attacks from **global turns 52/54/56** in the untouched control to **38/40/42** in treatment. The first Psyray dealt 110 damage to the Active Iron Thorns ex; the third took two Prize cards. **Both games ended in a source win with remaining Prizes [0,4].** The opponent's last Volt Cyclone moved from T57 to T43. Acceleration of seven candidate turns produced no win in this fixture.

**Evidence:** [compiled native CI 39695683278](https://github.com/FlareZ123/experiment-01/actions/runs/39695683278), artifact [12390033729](https://github.com/FlareZ123/experiment-01/actions/runs/39695683278/artifacts/12390033729), ZIP SHA-256 `6a1d9dec060980ad2eeef6bad7b68e730d19cf9096d990279b870c8ee9b33bcc`. Artifact files `agent5-powerglass-control.json`, `agent5-powerglass-treatment.json`, `agent5-powerglass-paired-audit.json` include all four arms, genuine public root ledgers, accepted native actions, source replies, attacked and settled boards, Prize counts, and end reasons. All three non-target game root hashes are identical across OFF and ON, and all four source physical-deal SHA fingerprints are preserved.

- **Exact control root reproducibility:** New control SHA `20203d34d1f9149f7229b147a4906e8a4a80b7192e129a293d68cdc69bfcb419` equals Agent 8's archived rank-6 control in [run 39667865342](https://github.com/FlareZ123/experiment-01/actions/runs/39667865342). Treatment root SHA `94c1b4d0f812fb8be68f65fff0529331c23d0dc28df83d961cfb0b446a36ee34`.
- **Decks:** Exact source rank-6 Aichi 60 and unchanged `results/als/new-moon-lockbreak-english-proxy-60.json`. Same seed `407516727`, source goes first (physical seat A), candidate seat B, source-deal SHA `14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de`.
- **Runtime:** Twinleaf submodule pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Experiment branch `agent5-rank6-powerglass-on-agent8-20261021`, HEAD `b0f4b34d725ab538c384eee81792ff5a3fe67c7f`, descended from Agent 8's original near-term root branch. The active intervention is `simulation/twinleaf/agent5-articuno-powerglass-native.cjs`, optional flag `AGENT5_ARTICUNO_POWERGLASS_DEV`; the separate Agent 8 T34 bridge source file in that lineage is present but **not activated**. Registration preceded implementation at `results/aichi-2026/registrations/agent5-rank6-powerglass-native-20261021.md`.

## Authenticated native receipts

| Physical Store action | Turn | Observable result |
| --- | --- | --- |
| Held Battle Compressor PHF played | T34 | Hand 12→11 |
| Genuine owner-deck ChooseCardsPrompt accepted two Basic Psychic Energy MEE | T34 | Deck 27→25; own discard Psychic 0→2 |
| Held Powerglass SFA equipped to Active Articuno V | T34 | Hand 11→10; genuine attached Tool |
| Native end-turn optional Powerglass prompt accepted | T34 | Discard Psychic 2→1, Active Psychic 1→2 |
| Native end-turn optional Powerglass prompt accepted again | T36 | Discard Psychic 1→0, Active Psychic 2→3 |

**Five of five** native proposals physically confirmed; 0 dispatch rejections or unconfirmed effects. Owner deck identities accessed only during an unresolved legitimate owner-deck search prompt. Other decisions delegated to the historical policies. The game then declared and settled Psyray attacks T38/T40/T42, doing 110 damage per turn to the first Iron Thorns ex. The third attack took two Prizes at T42. The source returned with a separate Iron Thorns ex and its game-ending T43 Volt Cyclone; control followed the corresponding T56/T57 exchange. Initial source Volt Cyclones at T13/T15/T17/T19/T33 were identical in both arms.

## Important reproduction failures

The same source-deal SHA **alone is insufficient to reproduce the same game state**.

- Main-derived [run 39693588153](https://github.com/FlareZ123/experiment-01/actions/runs/39693588153) reached T34 with **Unown AOR** Active (3 Basic Psychic) and no held Powerglass; treatment did zero actions.
- Main-derived [run 39694328659](https://github.com/FlareZ123/experiment-01/actions/runs/39694328659) added many original actor-policy flags, but lacked Agent 8's branch-specific near-term decision code; T34 Active was **Mewtwo & Mew-GX**, treatment again did zero actions. Both runs had four identical OFF/ON root ledgers and no native tactical change.
- Original branch lineage [run 39695485705](https://github.com/FlareZ123/experiment-01/actions/runs/39695485705) stopped before compile due an outdated pure test expecting no `activeToolPrintings:[]`. Fix in `b0f4b34` allowed the successful native comparison.

The final manual CI used the **exact original actor-only Energy and attack policy options** (basic-energy frontier, recipient, near-term damage, emergency Ace Trainer, Special Energy root, Quick Ball, single owner search, hand discard, ChoosePokemon, generic fallback and paper rule flags). It reproduced the archived control *complete root digest*, establishing a much stronger same-state basis than matching seed and initial deal only.

## Strategic limitation

The source had already reduced its remaining Prizes to **one by T19**. Earlier damage and a two-Prize KO did not prevent the backed-up source attacker from immediately finishing. This is evidence that earlier Prize protection or denial of the second attacker deserves investigation. It remains a **hypothesis for deck optimization**, not a competitive card-strength conclusion. The opponent and candidate policies are incomplete, the trial was historically selected, and no full Aichi Top-32 strength inference or 99.5% claim follows.

**Next discriminating study:** preserve this same historical deck/seed/root evidence while testing a candidate-owner opening line that prevents the T15–T19 multi-Prize collapse, or a late-game response to the opponent's ready second Iron Thorns. Retain genuine two-seat attack settlements and failure cases.
