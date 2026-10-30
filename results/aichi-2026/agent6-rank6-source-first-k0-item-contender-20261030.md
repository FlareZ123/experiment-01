# Agent 6: authentic rank6 original-source first-own-turn K0 Item/Speed decision frontier

**30 October 2026 | Read-only postgame replay of precommitted six original source-first deals.** This audit extends the [native Speed staging and settled attack report](agent6-native-source-first-speed-six-deals-20261030.md) with the actual physical source owner's own opening-hand printings at their **first ordinary turn-1 decision**, before either bot had made a gameplay action. The hand snapshot was recorded by the established `decisionHandBefore` observer after the bot chose its action and **was not made available to any opponent-policy decision or source script**.

## Evidence provenance

- Original six-deal, two-arm preregistration: [`agent6-firstturn-speed-native-20261030.json`](registrations/agent6-firstturn-speed-native-20261030.json), committed before the first native run. Source exact Aichi rank6 original 60, candidate exact rank1 reference original 60, forced source-first via a fixed pregame own-deck preference. This is a mechanics cohort, not a fair start-order estimate.
- **Read-only optional addition**, code commit `0fbca8378a0bd64b1155391bb039a8cfb240a186` in [`agent6-rank6-firstturn-speed-native.cjs`](../../simulation/evaluation/agent6-rank6-firstturn-speed-native.cjs), captures `firstSourceOwnerHandPrintings` only from the actor perspective matching `sourceSeat` and genuine `turnBefore===1`. The original Store still runs both 60s with identical policies, seeds, strict validation and source-first preferences.
- [Compiled manual original-Store run **40986716525**](https://github.com/FlareZ123/experiment-01/actions/runs/40986716525) SUCCESS, research head `0fbca8378a0bd64b1155391bb039a8cfb240a186`, pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Full 12-arm [artifact **12946644641**](https://github.com/FlareZ123/experiment-01/actions/runs/40986716525/artifacts/12946644641) ZIP SHA256 `0381d6240ff8a43ff059b1013e2d07e72c3e617a1b21c566f7c0bce611660e85` independently checked against published GitHub digest. Schema `agent6-source-first-speed-six-deal-native-v3`.
- All **6/6** source opening hand printings match **exactly** within their baseline vs staged pairs. No native errors in 12/12 arms; existing Speed attachment, printed draw, source turn3 attack settlement and native next-owner response evidence unchanged.

## Registered first-source-turn real own hands

Printings are written exactly as returned by the original pinned Store's owner-hand observer. The full JSON retains every card.

| Source physical seat | Seed | Relevant original own-hand printings before T1 action | Stage selected? | Actual T1 root coverage |
| --- | ---: | --- | --- | --- |
| A | **531384326** | **2 Speed Lightning RCL**, **Double Colorless SUM**, **Trainers' Mail ROS**, Echoing Horn CRE, Enhanced Hammer TWM | **Yes** | Treatment played Speed + Pass; baseline Pass |
| A | 2341469307 | **Tag Call CEC**, **Double Colorless SUM**, Capture Energy RCL, Spiky Energy JTG, **2 Plumeria BUS**, Lusamine CIN | No | Both Pass |
| A | **3030747015** | **Speed Lightning RCL**, Plumeria BUS, Team Rocket's Handiwork FCO, **2 VS Seeker PHF**, Crushing Hammer POR, Team Skull Grunt SUM | **Yes** | Treatment played Speed + Pass; baseline Pass |
| B | 516187842 | **Tag Call CEC**, **Trainers' Mail ROS**, Faba LOT, Lusamine CIN, Handheld Fan TWM, Tool Jammer BST | No | Both Pass |
| B | 2411836147 | **Tag Call CEC**, **Trainers' Mail ROS**, **Double Colorless SUM**, Team Flare Grunt XY, 2 Camping Gear BST, Plumeria BUS | No | Both Pass |
| B | 492959857 | **Trainers' Mail ROS**, 2 Plumeria BUS, Camping Gear BST, Handheld Fan TWM, Team Rocket's Handiwork FCO, Player's Ceremony SP 127, VS Seeker PHF | No | Both Pass |

Among the six fixed natural owner first-turn hands, **2 contained Speed Lightning**, **3 contained Tag Call**, and **4 contained Trainers' Mail**. They are hand-count observations on deliberately selected physical seats/seeds, not population probabilities or proof any named card could be played in the actual state. In the four deals without held Speed, the only archived first-turn owner root in both arms was Pass, even though three held Tag Call and three held Trainers' Mail. In the two Speed-selected deals, one held Trainers' Mail, and the actual accepted source turn-1 root sequence used Speed then Pass.

## Reasoning and qualification boundaries

The rules ordinarily prohibit the player going first from playing a Supporter or attacking on the first turn; this restriction is stated in the Pokémon TCG 2025 basic rules ([rulebook, p. 12](https://officialgamerules.org/wp-content/uploads/2025/03/par_rulebook_en.pdf), Section D). Consequently, **first-turn held Plumeria, Team Skull Grunt, Team Flare Grunt, Lusamine and similar Supporters are not executable actions on this source-first turn**, even if strategically attractive later. A hand card's name is also insufficient to prove the native legality, target availability, correct search outcome or non-domination of a first-turn Item. Tool Jammer is an attachable Tool (not an Item in modern categories); distinguish that as well.

The salient **action-vocabulary gap worth testing next** is a source first-turn `Trainers' Mail` or `Tag Call` **play and resolution** when genuinely legal and valuable, including whether it helps find or bank the next-turn Guzma & Hala/denial line. These Items were held but never selected in the archived source policy's six first-turn controls. Their nonuse is **a strategic policy coverage question**, without any finding that the Pass choice was wrong: conserving the search Item may be correct in particular opposing matchups or under anticipated lock, and its opportunity cost must be compared against Speed's attached draw. A valid native experiment should inspect the actor's actual own-deck search prompts only after a legitimate Item play and test first-turn Supporter vetoes. Do not inspect source Prizes or opponent hand to choose an action.

The real Speed → T3 settled Volt Cyclone KO positive control remains valid; this hand census supplies a candidate **competing connector**, without replaying the six seed deals as newly held-out evidence.

**Competitive qualification: zero. Missing full Aichi Top32 opponent lists: ranks 23, 25 and 28.**
