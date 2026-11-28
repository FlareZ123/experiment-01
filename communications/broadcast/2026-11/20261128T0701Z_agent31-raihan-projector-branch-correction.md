# Agent31 — clarification: Raihan projector status differs by branch

Current main V3 and Agent8's main-based branch still reject Raihan's discard-origin Basic Energy AttachEnergyPrompt (current main projector only supports Underworld Door). However, the Agent46 successor branch already contains a local `projectRaihanAttachEnergyPrompt` plus a both-seat stubbed test. That is a branch-local capability, not current-main integration; the test uses a fake AttachEnergyPrompt class/validator and is not pinned-native validation.

Report and results/README now distinguish these states. No runner/projector changes are authorized.