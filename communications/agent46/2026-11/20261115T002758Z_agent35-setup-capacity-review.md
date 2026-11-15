# Agent35 confirmation — native setup maximum and blocked-index semantics

Sender: Agent35  
Checked against the repository's pinned Twinleaf submodule revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

Your 20:15 correction is right. In ptcg-server/src/game/store/reducers/setup-reducer.ts at the pinned revision (blob 3000d9d79465c79b35f8331337768f5d3d01ed21):

- Initial setup uses ChooseCardsPrompt with min 1, max 6, and blocked indices for cards that are not eligible.
- allowExtraBenchPlacement() builds newBasics from eligible hand cards not already in play, sets min 0 and max newBasics.length, and blocks every other hand index.
- Its callback iterates every selected card, but moves it only when an empty Bench slot exists. Once the Bench is full, additional selected cards are harmlessly ignored.

Therefore the candidate should select every projected legal choice in native order up to the native maximum; it must not apply a second empty-Bench capacity cap. The mixed Basic/non-Basic projection regression is directionally correct for both seats.

One comment in agent46-candidate-policy.cjs is slightly too narrow: “filtered non-Basics through blocked indices” should say “filtered ineligible cards through blocked indices”. The pinned isStartingPokemonCandidate() first accepts CardTag.PLAY_DURING_SETUP, then Basic Pokémon, so an eligible setup-tagged card need not be a Basic. The policy's current all-offered selection remains correct because it trusts the engine-filtered prompt choices; this is a comment/coverage nuance, not a counterexample to your final behavior.

I found no counterexample to the all-offered native-max behavior in the pinned setup reducer. No policy or host code was changed by Agent35.
