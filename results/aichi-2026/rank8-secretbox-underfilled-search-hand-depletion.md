# Agent 15: source rank-8 early Garbotoxin policy spends its entire hand

**19 October 2026 UTC. Evidence class:** read-back of already successful pinned-engine/source-dealt archived actions, paired with printed card-text conservation. This is a **criticism of one decision policy on one retrospectively identified state**. It contains no new simulation, representative matchup result or competitive win-rate claim.

## Why this source state matters

The unchanged exact rank-8 Yusuke Kobayashi Absol/Garbodor 60 and unchanged Hood Shield v1 60 were played in physical A/B, rank-8 opponent starting first, with source seed **1260748957**, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Earlier [manually selected source fork](rank8-boostshake-authentic-counterline.md) and [Agent44 autonomous conditional opponent policy](agent44-rank8-autonomous-opponent-pressure.md) both resolve the same **11 Store root actions** after the unchanged first 86 source actions. Agent44 [compiled manual CI 39135705597](https://github.com/FlareZ123/experiment-01/actions/runs/39135705597) verifies the same opponent action segment, candidate Hood response, source prefix, no-op control and adapter restoration.

I downloaded two archived GitHub Actions artifacts and independently verified their byte-level SHA-256:

- [Run 39100521996, artifact 12126347615](https://github.com/FlareZ123/experiment-01/actions/runs/39100521996/artifacts/12126347615): ZIP `e79e113fddea40fb8f828fd50c9aaa9d5f29c670ce4a82dcfaeb36181e5f04ee`; inner `rank8-boostshake-fork.json` `cf99259504d5aecf0134f4c6b0b79989afe4f8050c324aa71756541719cfb21c`.
- [Run 39135705597, artifact 12140335231](https://github.com/FlareZ123/experiment-01/actions/runs/39135705597/artifacts/12140335231): ZIP `52730e7d0faf53ab29ce5e49374ee4da2c3f44288cee8fa60c0d249534eed01e`; inner `rank8-autonomous-boostshake.json` `431c5e528ccb984bd7f8c183d4449ad114d53f32cec68c2d6c0b47584df57530`.

The source turn-7 opponent hand has exactly six cards:

`Boost Shake EVS; Dark Patch ASR; VS Seeker PHF; Iono PAL; Secret Box TWM; Float Stone BKT`.

Rank 8 has one Darkness Energy already attached to its Active Mega Absol ex in the related natural source audit; its Bench includes Budew, Crobat V with Float Stone, Squawkabilly ex with Forest Seal Stone, Tapu Lele-GX, and empty slots.

## Exact turn-7 hand accounting

| Resolved owner action | Opponent hand count | Resource accounting |
| --- | ---: | --- |
| Before Secret Box | 6 | Includes held Boost Shake and Float Stone |
| Play Secret Box | 5 | ACE SPEC consumed |
| Discard Dark Patch, VS Seeker and Iono | 2 | These three are all the non-core held cards |
| Search Quick Ball + Temple of Sinnoh | 4 | Only two of four possible Secret Box card classes used |
| Play Quick Ball and discard Temple | 2 | Consumes two hand cards to find a Basic |
| Search Trubbish into hand | 3 | Source owner prompt accepted it |
| Bench Trubbish | 2 | Open Bench slot used |
| Attach held Float Stone to Trubbish | 1 | Enables Garbotoxin after evolving |
| Play held Boost Shake, evolve from actual deck | **0** | End the turn; source board displays Garbodor with Float Stone |

The archived source turn-8 board directly reports rank-8's `hand: []`, Garbodor with Float Stone, and active Mega Absol ex with Float Stone. The challenger turn-8 hand contains **Night Stretcher, Acerola, Mysterious Treasure, Field Blower, Quick Ball, Battle Compressor**; its Active Shadow Rider VMAX has **Stealthy Hood**. This precise setup prompted the verified candidate protected Underworld Door line, which attached a recovered Psychic Energy and drew two cards while the opposing Garbodor remained equipped.

**Forced sacrifice within this exact six-card hand:** to retain the held Boost Shake and Float Stone while using Secret Box's three-card discard cost, the opponent necessarily discards exactly Dark Patch, VS Seeker and Iono. It is inaccurate to characterize the selected lock as obtaining Garbodor 'for free'; the player spends all three competing-resource cards and the ACE SPEC, plus Quick Ball, the searched Stadium and Boost Shake, and ends with no cards. In the evidence model, this is a discrete resource-loss and attacking-tempo tradeoff, with no proven tactical payoff.

## Printed Secret Box offers two unselected classes

The source printed **Secret Box TWM163** text allows searching the deck for one each of an Item, a Pokémon Tool, a Supporter and a Stadium after discarding three other hand cards. The source line selects only **Quick Ball** (Item) and **Temple of Sinnoh** (Stadium). Selection of fewer valid hidden-zone cards is permitted by the Advanced Player's Rulebook's deck-search rules.

A hypothetical additional **Supporter** or **Tool** obtained in the same Secret Box search would stay in hand through Boost Shake, creating one or two further future resources without requiring another Supporter use during this ending turn. This claim assumes that eligible cards remain in the *actual searchable deck*, their printed prompt accepts those selections, and the rest of the already verified eleven-action line is unchanged. **None of those hypotheses is proven by the artifacts.**

Potential examples from rank-8's exact source 60 include singleton **Roxanne ASR150**, a Supporter playable when the opponent has three or fewer Prizes left, and unplayed Tools such as Muscle Band or an additional Float Stone. The source challenger already had one Prize remaining in the baseline at action cap, and the actual post-fork source board has zero cards held. Roxanne's legality at a later turn also depends on current Prize state and other effects. The archive does **not** disclose whether Roxanne or any extra Tool is unprized, unspent, or available in the genuine turn-7 search prompt.

**Recommended adversarial test:** from the unchanged 86-action prefix and same owner-visible state, log the genuine Secret Box `ChooseCardsPrompt` options; if eligible, select at least one additional Supporter/Tool without changing the forced first discard choices, and check the actual resulting hand at turn-8, the continued Garbodor Tool/lock and the opponent's subsequent real legal action. If the prompt lacks a valid additional target, record the negative. Compare the counterfactual to the original 2-category search with complete Store action tracing, then continue into a legally selected response. This is precisely the full-game policy-quality question the [Critic's response gate](../critic-review-70.md) prioritizes; do not score future hand count by itself as a win or lock superiority.

## Outcomes remain unqualified

The previously published paired 200-action source experiment reaches the action cap unfinished in every variant: original generic baseline Prize state `[6,1]`, autonomous early-Garbodor opponent `[6,6]`, combined autonomous opponent plus Hood challenger `[6,1]`. These are **three correlated state trajectories from the same seed**, not three independent games or official results. The 99.5% field target remains unsupported, with 29/32 exact opponent lists and zero competitively qualified games.

The separate [prospective 16-deal registration](rank8-hood-pressure-prospective-registration.md) is frozen and unexecuted. Its creation was not an experimental run.
