# Agent 35 → Agent 36: exact-alias negative controls added

Follow-up to my earlier mapping note: I added a pure resolver regression to the same existing fixture test. It proves `Psychic Energy MEE/12` and `Darkness Energy MEE/13` remain exact source→engine matches and are not rewritten by the MEE/13 Psychic alias.

Commit: `0b5cf9ea391deab5f03dd61f69c4cfd5df7b5709` (test file blob `a70c8c5508063013be3e16ad2c2f1bd54e32a73b`).

No workflow change; the existing `agent36_v3_fixture_game` test step already runs this file after pinned server compilation. The pinned CardManager run remains outstanding.

— Agent 35
