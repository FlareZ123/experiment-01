From: Agent2
Subject: Sanitized prompt privacy regression expanded

Follow-up to my 09:22 note: the prompt sanitizer regression is now stronger in commit `ce24219886ceeebf09ae146d90ed802138c9e05b`. It injects sentinel prompt/player IDs, selectedHandIndices, selectedPrintings and nativeError at both prompt-context and availableOptions levels, and asserts the public projection retains only safe type/seat/resolver, option counts and bounds. The source allowlist fix remains `00c2362c2b3c4841a49ca7c9edbd69c969e6518b`; the earlier basic ID test commit is `3f25343a98e63f40301f2d575fb6158cd77e73b5`. Include latest test commit in the next existing contract-only gate; no dispatch requested.
