# Agent 2: Original rank1 Guzma counterplay almost disables original rank3 Bunnelby

**4 November 2026. Preregistered same-original-physical-deal A/B/A; real Guzma Store root and both real switch prompts. Competitively qualified games: zero.**

## Question and prior independent registration

An actual original-source owner-hand audit [CI 41936356001](https://github.com/FlareZ123/experiment-01/actions/runs/41936356001) established that original rank1 Shadow Rider Calyrex continuously held printed **Guzma BUS** against Active original rank3 Snorlax Stall **Bunnelby PRC**, with an opposing Benched **Snorlax PGO**, across **11 distinct later turns**. The native bot never played the Supporter, and lost to Bunnelby Burrow deck-out.

We preregistered **one exact tactical intervention** before looking at the native outcome: at rank1's **global turn3**, play its genuinely held `Guzma BUS`, select source **Snorlax PGO** as the opposing switch target, then select its own **Shadow Rider Calyrex V CRE** as the self-switch target. Both actual native `ChoosePokemonPrompt` validations must pass. All other actions of either player use the unchanged existing canonical actor/Supporter/Energy policy. Guzma's printed text dictates this exact two-switch sequence. The own switch also exposes the rank1 Active to Snorlax's printed **Block**, so tactical improvement was uncertain.

## Frozen sources and reproducibility

- Original Aichi 2026 rank3 Snorlax Stall **60** (physical seat0) vs original rank1 Shadow Rider Calyrex **60** (seat1). Seed `290134`, 520 native-action cap all arms, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Actual full initial physical-deal SHA-256 `e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb`; source initial deal `ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a`. **Both exact physical starting-deal controls passed in all three arms.**
- Full converted source printing SHA-256 `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`, opponent printing `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.
- [Registered A/B/A source](../../simulation/evaluation/agent2-rank1-original-guzma-counterplay-aba.cjs), preregistration commit `a8b56311ae2ef2d05d406fe06e59759dfe39283a`. Native typed `PlayCardAction` from owner hand, native `ChoosePokemonPrompt` via existing `nativeSinglePokemonChoices`, `ResolvePromptAction` and native `prompt.validate`. The special rule is default-off and uses own hand plus public board only.
- [Native CI run **41936956668**](https://github.com/FlareZ123/experiment-01/actions/runs/41936956668) **SUCCESS**; [artifact **13374297814**](https://github.com/FlareZ123/experiment-01/actions/runs/41936956668/artifacts/13374297814). ZIP SHA-256 `24d8f0a3f96f207f1d34cb74334d94fcbdbc003a35695408dab3a8e6b421e798`; raw `agent2-rank1-original-guzma-counterplay-aba.json` SHA-256 `ae03b40ef26f189f301cd204b5c741da1cd316688a6adc5383ee9f9fd303bc75`, 31,980 bytes.
- All hard controls PASS: registered full physical/source deals in each arm, identical control/repeated-control root-ledger hashes, actual rank1 native `PlayCardAction Guzma` at turn3, **both** native accepted `ChoosePokemonPrompt` replies for Snorlax and Shadow Rider V, complete native terminal in every arm.

## Actual A/B/A native outcomes

| Returned measurement | Control | Turn3 held-Guzma treatment | Control-repeat |
| --- | ---: | ---: | ---: |
| Source rank3 Bunnelby Burrow attacks | **12** | **1** | **12** |
| Opponent rank1 Mimikyu Filch attacks | **11** | **0** | **11** |
| Opponent Shadow Rider V Shadow Mist attacks | 0 | **39** | 0 |
| Opponent rank1 Prize cards taken | 0 | **3** | 0 |
| Rank3 Prize cards taken | 0 | 0 | 0 |
| Ending global turn | **25** | **87** | **25** |
| Total native actions | **133** | **354** | **133** |
| Rank3 deck left | 35 | **3** | 35 |
| Rank1 deck left | 0 | 0 | 0 |
| Native winner | Rank3 | Rank3 | Rank3 |
| Qualified paper games | **0** | **0** | **0** |

Treatment **reduced Burrow from 12 to 1** and prolonged the native game **62 global turns** while rank1 took **three** Prize cards. The baseline source's first Burrow occurred before the turn3 Guzma. The treated native match ended at global turn87 with rank1 deck empty, while rank3 had only three deck cards remaining, even though rank1 had a 3-Prize to 0-Prize advantage. It was an untimed engine deck-exhaustion termination, **not an official 25-minute match adjudication**.

### Direct source action evidence

The treatment's real rank1 root ledger on turn3 records:
1. **Action ordinal17:** `PlayCardAction` played `Guzma BUS` from owner hand index0 with rank1 Mimikyu GRI and rank3 Bunnelby PRC both Active.
2. **Action ordinal18:** actual `ResolvePromptAction` of printed opposing `ChoosePokemonPrompt`, chooses source Benched **Snorlax PGO**. Native validated one opponent Bench target.
3. **Action ordinal19:** actual `ResolvePromptAction` of own `ChoosePokemonPrompt`, chooses **Shadow Rider Calyrex V CRE** from owner Bench. Native validated one own Bench target.
4. The existing rank1 bot then plays Dialga-GX and Passes; it subsequently makes **39 real Shadow Mist attacks**, taking three Prizes. The rank3 player no longer maintains Bunnelby Burrow and is Active **Regirock** at terminal.
5. The untreated baseline and repeated control have identical native root ledger digest, terminal winner and exactly 133 actions; the change follows the single accepted Guzma action and native selected prompts.

## Scope and model significance

This is a **major genuine discrete tactical opportunity** in an exact original tournament deck, not merely an access graph path. The baseline bot retained accessible Guzma yet chose to self-draw via Filch into its own deck-out. Choosing Guzma forces both board switches; it suppresses the Bunnelby plan and triggers a very different attack and Prize race. The remaining source and opponent bots are unqualified: rank1 still repetitively uses Shadow Mist until decking out, rank3 responds under its existing weak baseline, and vendor paper rules plus official match clock have separate unresolved fidelity gaps.

The treatment is **one outcome-selected historical physical source deal** with policy A/B/A and does not add three independent competition games. It does not establish higher rank1 paper win probability, universal Guzma superiority, or that rank1 wins the actual 25-minute match. The held-Guzma owner root and both switch prompts make this an effective regression fixture for [Issue #25's](https://github.com/FlareZ123/experiment-01/issues/25) symmetric owner-information-safe opponent policy and tactical continuation gate.

**Overall field goal remains unachieved:** 29/32 original inventories, ranks23/25/28 missing, zero competitive-paper-qualified games, no selected fixed 60, and no demonstrated 99.5% win rate.

## Additional read-only natural reply chronology (same underlying A/B/A)

The original exact same-deal A/B/A script was rerun **without any action change**, adding only a `rootActionLedger` and public `decisionTrace` report of all rank3 owner `PassTurnAction` moments after the original Guzma. [Successful native run **41937842941**](https://github.com/FlareZ123/experiment-01/actions/runs/41937842941), [raw JSON artifact **13373839014**](https://github.com/FlareZ123/experiment-01/actions/runs/41937842941/artifacts/13373839014), ZIP SHA-256 `31c31051f1933dbc2737c469f0a310b69ba69352d175763646702f0856f9b6f0`, uncompressed JSON SHA-256 `45edb5106cb4068e8eae5cb0fbf89f0f5dd93688dfc3c730b2dce9cb5771196a` (217,106 bytes). All previous hard A/B/A controls still passed; native turns, actions, winner, Prize counts and both native Guzma prompts remained identical to the archived first SUCCESS run.

Across source owner's 43 global-turn opportunities, the native rank3 owner recorded:

| Actual source player behavior after first Burrow | Count and chronological positions |
| --- | --- |
| Burrow `AttackAction` | Once, global turn2 **before** the Guzma |
| `PassTurnAction` with **Snorlax Active** | **17**, global turns4–36 |
| `PassTurnAction` with **Rotom V Active** | **19**, global turns38–74 |
| `PassTurnAction` with **Regirock Active** | **6**, global turns76–86 |
| Normal voluntary `RetreatAction` | **0** |
| Source `PlayCardAction` | **7**, cards Water Energy (turn2), Capture Energy (turn4), Rotom V (turn8), Girafarig (turn26), Regirock (turn48), Mimikyu (turn60), Snorlax (turn76) |

The actual, public **Bunnelby PRC remained on the source's Bench with Water Energy attached on all 42 Pass snapshots**. It had the printed one-Colorless cost of Burrow available but was no longer Active. No source owner retreat was recorded. Snorlax PGO had one attached Capture Energy and no Tool at its early global-turn4–36 Pass snapshots. The other source Active spots Rotom V and Regirock were likewise recorded as distinct actual subsequent board states rather than an enduring Snorlax lock. The native rank1 opponent's Shadow Rider V continued attacking with Shadow Mist; as source Pokémon were Knocked Out, the rank3 source promoted other Benched Pokémon, never its still-funded Bunnelby.

The treatment's **62 additional global turns** are therefore supported by authentic full-turn owner decisions, including **42 repeated source Passes** and switching Actives from Knock Outs. This makes opponent skill and the source player's own recovery competence an even stronger admission blocker. The recorded public pass snapshots do **not** reveal whether the source held Float Stone, Guzma or Scoop Up Cyclone; an independent owner-hand observation is necessary before labeling the source's refusal to return to Bunnelby as an actual missed playable escape.
