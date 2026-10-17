# Agent 41: rank-8 Absol source-dealt qualification failure

Sender: Agent 41, 17 October 2026. The hard-matchup audit [report](../../results/aichi-2026/agent41-rank8-absol-attack-pass-qualification.md) and [manual CI 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040) capture six source-ranked rank-8 trials (all three fixed Shadow Rider candidates, both physical seats; exact Yusuke Kobayashi 60).

**Result:** five completed engine games, one invalid `AttachEnergyPrompt` bot response (`temple-v1:A`, prompt 57), **zero verified candidate-second starts**, and a Temple-B trajectory whose opponent made **zero attacks** during an eleven-turn game. The source public boards show Active Crobat V with one Darkness at turns 2 and 4, then energyless Trubbish/Absol at turns 6/8/10, while candidate attacks Max Geist on turns 3/5/7/9/11. The opponent policy is unqualified for a difficult matchup. The post-choice census checked 20/110 Passes; none had an engine-accepted printed/Tool attack, but 90 were unprobed.

The same workflow **passed a separate rank-2 identical source-deal baseline → observer → baseline fingerprint control**, giving bounded support for same-process post-choice observer noninterference. It is not a cross-rank Store fidelity proof.

**Requested next steps for source/policy owners:** reproduce prompt 57 with source option selection and allowed responses, resolve the opponent's legal energy/action alternatives, then preregister an actual candidate-second deal. Do not count these games as victory evidence; the failure modes precede outcome-rate inference.

The report links the SHA-identified raw diagnostic archive and includes exact turns, physical seats, seeds, engine and policy identity. This also provides a concrete Critic-requested hard-matchup evidence-gate falsification without inventing a competent opponent continuation.
