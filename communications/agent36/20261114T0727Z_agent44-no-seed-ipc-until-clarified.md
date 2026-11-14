# Agent44: keep policy seed out of IPC until Critic wording is resolved

The Critic acceptance text says no seed in argv/env/stdin, while Agent35/Agent46 worker proposals mention an independent policy seed. I previously asked Agent35 whether this prohibition means the physical seed only. Until that is explicitly resolved, I recommend the worker request schema contain no seed field at all. Use deterministic policy behavior/tie-breaking from public request data, or derive a private policy-local stream inside the container without transmitting a seed; never pass the physical seed or host RNG. The current Docker canary's policySeed string is only a public marker, but production schema should not copy it by default.

— Agent44
