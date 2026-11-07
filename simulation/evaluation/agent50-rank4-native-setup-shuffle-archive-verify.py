"""Verify exact native rank4 source opening hands from archived setup shuffles.

Independent Python stdlib reimplementation of pinned CJS seededRandom and
deckPermutation. No engine import or test-only hidden player information.
Inputs are the original rank4/rank1 per-seat native archive and the later
identical-rank4 same-seed strict archive, downloaded unchanged from GitHub
Actions as ZIPs or extracted directories. Historical legacy-shared rows in the latter archive are deliberately
excluded: their shared random stream includes other event consumers.

Usage on Windows 11:
    python agent50-rank4-native-setup-shuffle-archive-verify.py old.zip strict.zip
"""

from __future__ import annotations

import hashlib
import json
import sys
import zipfile
from collections import defaultdict
from pathlib import Path
from typing import Iterator

SEAT_SALTS = (0x243F6A88, 0x85A308D3)
EXPECTED_DECK_SHA256 = (
    "3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423"
)

# Exact owner-deck order from authenticated original Aichi rank4 physical
# source, including the four pinned Twinleaf canonical printing aliases.
RANK4_CARDS = (
    ["Voltorb ROS"] * 2
    + ["Electrode-GX CES"] * 3
    + ["Pikachu LOR"]
    + ["Alolan Raichu UNM"] * 2
    + ["Dedenne GX UNB"] * 2
    + ["Crobat V DAA"] * 2
    + ["Squawkabilly ex PAL", "Tapu Lele-GX GRI", "Eldegoss V RCL"]
    + ["Gengar & Mimikyu-GX TEU", "Klefki SVI", "Ditto Prism Star LOT"]
    + ["Gladion CIN", "Carmine TWM", "Pokemon Ranger STS"]
    + ["Lillie's Determination M1L"]
    + ["Quick Ball FST"] * 4
    + ["Battle Compressor PHF"] * 4
    + ["Rescue Stretcher GRI"] * 4
    + ["Escape Rope BST"] * 3
    + ["Hisuian Heavy Ball ASR"] * 2
    + ["Ultra Ball MEG", "Battle VIP Pass FST", "Secret Box TWM"]
    + ["Telescopic Sight VIV", "U-Turn Board UNM", "Forest Seal Stone SIT"]
    + ["Sky Field ROS"] * 3
    + ["Reversal Energy PAL"] * 4
    + ["Counter Energy CIN"] * 4
    + ["Unit Energy LPM UPR"] * 4
)


def json_hash(value: object) -> str:
    """Hash the exact compact UTF-8 JSON representation used by JS."""
    encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def seeded_random(seed: int) -> Iterator[float]:
    """Exact unsigned xorshift32 used by simulation/twinleaf/headless.cjs."""
    state = seed & 0xFFFFFFFF
    if state == 0:
        state = 0x9E3779B9
    while True:
        state ^= (state << 13) & 0xFFFFFFFF
        state ^= state >> 17
        state ^= (state << 5) & 0xFFFFFFFF
        state &= 0xFFFFFFFF
        yield state / 4294967296.0


def permutation(random: Iterator[float], length: int = 60) -> list[int]:
    """Mirror exact CJS Fisher–Yates swaps and returned index permutation."""
    order = list(range(length))
    for i in range(length - 1, 0, -1):
        j = int(next(random) * (i + 1))
        order[i], order[j] = order[j], order[i]
    return order


def read_verified_rows(archive: Path) -> list[dict]:
    """Read only signed-by-sidecar JSON members; reject missing/mismatched."""
    rows: list[dict] = []
    if archive.is_dir():
        paths = list(archive.rglob("*.json"))
        assert len(paths) in (32, 64), archive
        for path in paths:
            body = path.read_bytes()
            sidecar = Path(str(path) + ".sha256").read_text(encoding="utf-8")
            claimed_sha, claimed_name = sidecar.strip().split(maxsplit=1)
            assert claimed_name == path.name, (path, claimed_name)
            assert hashlib.sha256(body).hexdigest() == claimed_sha, path
            rows.append(json.loads(body))
    else:
        with zipfile.ZipFile(archive) as z:
            json_names = [name for name in z.namelist() if name.endswith(".json")]
            assert len(json_names) in (32, 64), archive
            for name in json_names:
                body = z.read(name)
                sidecar = z.read(name + ".sha256").decode("utf-8")
                claimed_sha, claimed_name = sidecar.strip().split(maxsplit=1)
                assert claimed_name == Path(name).name, (name, claimed_name)
                assert hashlib.sha256(body).hexdigest() == claimed_sha, name
                rows.append(json.loads(body))
    return rows


def verify_per_seat(row: dict) -> tuple[int, tuple[int, int]]:
    """Check all physical permutation hashes and exact source opening hand."""
    seed = row["seed"]
    source_seat = row["sourceSeat"]
    assert source_seat in (0, 1)
    assert row.get("pinnedEngine") == (
        "a9905a76a6c4103ba4b6cb9a49e86bad795c5c05"
    )
    assert row.get("deckSha256", row.get("source60Sha256")) == EXPECTED_DECK_SHA256
    assert row["sourceTurnReached"] is True

    tapes: dict[int, list[dict]] = defaultdict(list)
    for tape in row["shuffleTape"]:
        tapes[tape["seat"]].append(tape)
    assert tapes[0] and tapes[1]

    source_hand: list[str] = []
    source_deck = list(RANK4_CARDS)
    total = 0
    for seat in (0, 1):
        random = seeded_random(seed ^ SEAT_SALTS[seat])
        seat_shuffles = tapes[seat]
        assert len(seat_shuffles) == row["mulliganCountsBySeat"][str(seat)] + 1
        for index, tape in enumerate(seat_shuffles, start=1):
            assert tape["shuffleOrdinal"] == index
            assert tape["deckSize"] == 60
            perm = permutation(random)
            assert json_hash(perm) == tape["permutationSha256"], (
                seed, seat, index
            )
            total += 1
            if seat == source_seat:
                source_deck = [source_deck[position] for position in perm]
                source_hand = source_deck[:7]
                source_deck = source_deck[7:]
                if index < len(seat_shuffles):
                    source_deck += source_hand

    source_receipts = row["setupNativeStore"]
    assert len(source_receipts) == 1
    receipt = source_receipts[0]
    assert source_hand == receipt["preOwnerHandPrintings"], (
        seed, source_seat, source_hand, receipt["preOwnerHandPrintings"]
    )
    assert json_hash(source_hand) == receipt["preOwnerHandSha256"]
    assert receipt["nativeStoreAccepted"] is True
    assert receipt["mandatoryInitialPlacementCompleted"] is True
    return total, (seed, source_seat)


def verify_archives(old_archive: Path, strict_archive: Path) -> dict:
    """Cross-archive exact 32-seed provenance and actual store-hand integrity."""
    assert len(RANK4_CARDS) == 60
    assert json_hash(RANK4_CARDS) == EXPECTED_DECK_SHA256
    report: dict = {"schema": "agent50-native-source-shuffle-independent-v1"}
    sets = []
    for key, archive in (("old_rank4_vs_rank1", old_archive),
                         ("strict_identical_rank4", strict_archive)):
        rows = read_verified_rows(archive)
        per_seat = [row for row in rows
                    if row.get("protocol", row.get("shuffleProtocol"))
                    in ("per-seat", "agent26-per-seat-setup-shuffle-streams-v1")]
        if len(per_seat) != 32:
            raise AssertionError((key, len(per_seat)))
        labels = set()
        total_shuffles = 0
        for row in per_seat:
            n, label = verify_per_seat(row)
            assert label not in labels
            total_shuffles += n
            labels.add(label)
        report[key] = {
            "archive": archive.name, "per_seat_rows": len(per_seat),
            "source_hands_exact": len(per_seat),
            "all_recorded_permutation_hashes_exact": total_shuffles,
            "all_json_sidecars_verified": len(rows),
        }
        sets.append(labels)
    assert sets[0] == sets[1], "The original registered 32 pairs have changed"
    assert len(sets[0]) == 32
    report["matching_original_seed_and_seat_pairs"] = 32
    report["competitive_games_qualified"] = 0
    return report


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Expected two downloaded GitHub Actions ZIP paths.")
    report = verify_archives(Path(sys.argv[1]), Path(sys.argv[2]))
    print(json.dumps(report, indent=2))
