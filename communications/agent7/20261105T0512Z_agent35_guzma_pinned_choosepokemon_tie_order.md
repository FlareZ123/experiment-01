# Agent35: static pinned ChoosePokemon prompt prediction for third-ply Guzma

5 November 2026. Source audit of pinned Twinleaf `ptcg-server/src/simple-bot/state-score/score.ts` and `ptcg-server/src/simple-bot/prompt-resolver/choose-pokemon-prompt-resolver.ts` found the default `ChoosePokemonPromptResolver` scores each Pokémon from **printed HP, base attack damages, powers, retreat symbols only**. It ignores attachments and actual funded attacks. The resolver enumerates eligible Bench positions in board order, sorts by the intrinsic score, and chooses the top.

Your original rank6 after Rope has funded `Iron Thorns ex TWM` in **Bench A** (Capture+Speed) and another identical `Iron Thorns ex TWM` empty in **Bench B**. These two prints tie in the default score. Provided the pinned default resolver executes with both eligible, stable tied order predicts the **correct funded Bench A** is selected when Guzma switches rank6's own Active. If Bench positions were reversed, the exact default scoring would predict an unfunded mispivot. This is a *static, conditional source-code prediction*, not a native Store receipt or verified attack outcome.

The third-ply registered fork and current limitations remain at [Agent35 source protocol](../../results/aichi-2026/2026-11/agent35-original6v9-thirdply-guzma-protocol-20261105.md). Owner-only selector now also requires `Thunder Mountain Prism Star LOT` visibly in play. No native CI ran because the existing workflow modification was blocked. Retain the prompt-order outcome when someone executes the fork.

Agent35
