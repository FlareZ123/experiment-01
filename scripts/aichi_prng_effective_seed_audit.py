"""Single-file regression for the pinned Twinleaf headless seed derivation.

This tests the JS algorithms in scripts/aichi-decorrelated-seeds.cjs and
simulation/twinleaf/headless.cjs for the fixed 20261016 seed base.
It does not establish stochastic independence or game-rule fidelity.
"""
from __future__ import annotations

import hashlib
import json
import struct

SEED_BASE = 20261016
FALLBACK = 0x9E3779B9
POLICY_A_XOR = 0x6A09E667
POLICY_B_XOR = 0xBB67AE85


def slot_seed(phase: str, rank: int, repeat: int, slot: str, nonce: int) -> int:
    label = json.dumps(
        ["aichi-decorrelated-slots-v3", SEED_BASE, phase, rank, repeat, slot, nonce],
        separators=(",", ":"),
    )
    return struct.unpack("<I", hashlib.sha256(label.encode("utf-8")).digest()[:4])[0]


def derive_slot_seeds(phase: str, rank: int, repeat: int) -> tuple[int, int]:
    seeds: list[int] = []
    for slot in ("A", "B"):
        nonce = 0
        while True:
            value = slot_seed(phase, rank, repeat, slot, nonce)
            if value != 0 and (slot != "B" or value != seeds[0]):
                seeds.append(value)
                break
            nonce += 1
    return seeds[0], seeds[1]


def effective_state(value: int) -> int:
    """Pinned xorshift32 substitutes FALLBACK when its initial state is zero."""
    return value if value != 0 else FALLBACK


def effective_streams(seed: int) -> tuple[int, int, int]:
    return (
        effective_state(seed),
        effective_state(seed ^ POLICY_A_XOR),
        effective_state(seed ^ POLICY_B_XOR),
    )


def audit() -> None:
    assert derive_slot_seeds("pilot", 10, 0) == (3162592764, 4246551499), (
        "Known rank-10 v3 source seed vector no longer matches"
    )
    assert effective_state(0) == effective_state(FALLBACK)
    assert effective_streams(POLICY_A_XOR)[1] == (
        effective_streams(POLICY_A_XOR ^ FALLBACK)[1]
    )
    assert effective_streams(POLICY_B_XOR)[2] == (
        effective_streams(POLICY_B_XOR ^ FALLBACK)[2]
    )

    raw_seen: dict[int, str] = {}
    state_seen: dict[int, str] = {}
    games = 0
    for phase in ("pilot", "published-field"):
        for rank in range(1, 33):
            for repeat in range(100):
                for slot, seed in zip(("A", "B"), derive_slot_seeds(phase, rank, repeat)):
                    key = f"{phase}/rank{rank}/repeat{repeat}/{slot}"
                    assert seed != 0, f"Zero raw seed at {key}"
                    assert seed not in raw_seen, f"Duplicate raw seed: {raw_seen.get(seed)} / {key}"
                    raw_seen[seed] = key
                    for stream, state in zip(("game", "policy-A", "policy-B"), effective_streams(seed)):
                        stream_key = f"{key}/{stream}"
                        assert state not in state_seen, (
                            f"Repeated effective RNG state: {state_seen.get(state)} / {stream_key}"
                        )
                        state_seen[state] = stream_key
                    games += 1

    assert games == 12800
    assert len(raw_seen) == 12800
    assert len(state_seen) == 38400
    print("PASS: v3 seed-base 20261016")
    print("PASS: known rank-10 A/B seed vectors")
    print("PASS: direct seed-0 and per-policy fallback alias controls")
    print(f"PASS: {games} scheduled phase/rank/repeat/seat trials have unique nonzero seeds")
    print(f"PASS: {len(state_seen)} game/policy-A/policy-B effective initial states unique")
    print("LIMIT: this proves no initial-state collisions for this finite schedule only")
    print("LIMIT: cloned candidate comparisons intentionally reuse paired game seeds")
    print("LIMIT: pseudorandom state distinctness cannot prove independent game samples")


if __name__ == "__main__":
    audit()
