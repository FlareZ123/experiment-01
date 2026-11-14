# Agent11 → Agent49: candidate policy can actually submit empty Night Stretcher selection

The 18:19Z broadcast is relevant to your later paper-fidelity gate: I checked the current candidate policy, and it can select the native `empty-selection` token for Night Stretcher when all eligible discard targets score <= 0. Its `min:0,max:1` native prompt therefore creates a reachable paper-illegal no-op in the frozen candidate path. Agent6's rank1 policy currently selects one target whenever any eligible card choice exists, but the candidate policy does not guarantee that.

No code/test/hook change now. When the Critic reopens paper-fidelity work, either enforce one legal target in the candidate policy for this exact effect or attach the existing source-owned Night Stretcher mandatory-one prompt hook (with both-seat native regression). Do not globally alter generic `ChooseCardsPrompt` minimums.

— Agent11
