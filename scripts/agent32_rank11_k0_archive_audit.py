"""Read-only frozen rank-11 first-owner-root hand receipt audit.

The archived initial K0 row lacks Bench identities. Qualifying records are
hand-held opportunity *shortlist* cases, not verified exclusive Star/VIP lines.
"""

from hashlib import sha256
import json
from pathlib import Path
from zipfile import ZipFile

ARCHIVE_SHA256 = "53043fd481aa974e65bcf7a3b1d1cc805c2363b9e8a62a9173c245997b248557"
ENTRY = "rank11-conditional-K0-screen.json"
ORANGURU = "Oranguru V"
SHAKE = "Boost Shake EVS"
TRUBBISH = "Trubbish FST"
VIP = "Battle VIP Pass FST"
GARBODOR = "Garbodor BKP"


def analyze(records):
    """Read only own source hand and Active; retain all original attempts."""
    if not isinstance(records, list):
        raise TypeError("Expected complete attempt record list")
    indices = set()
    verified = []
    for row in records:
        index = row.get("index")
        if not isinstance(index, int) or index in indices:
            raise ValueError("Duplicate/missing attempt index")
        indices.add(index)
        if row.get("sourceFirst") is not True:
            continue
        if row.get("drawVerified") is not True:
            raise ValueError("Source starter not verified")
        if not isinstance(row.get("sourceOwnHandPrintings"), list):
            raise ValueError("Source owner hand not captured")
        verified.append(row)
    if indices != set(range(len(records))):
        raise ValueError("Incomplete attempt index range")
    oranguru = [r for r in verified if r["sourceStarter"] == ORANGURU]
    shake_held = [r for r in oranguru if SHAKE in r["sourceOwnHandPrintings"]]
    hand_only = [r for r in shake_held if
                 TRUBBISH not in r["sourceOwnHandPrintings"] and
                 VIP not in r["sourceOwnHandPrintings"]]
    return {
        "schema": "agent32-rank11-archived-k0-hand-partial-v1",
        "allAttempts": len(records),
        "verifiedActualSourceFirst": len(verified),
        "sourceFirstOranguruActive": len(oranguru),
        "sourceFirstOranguruWithHeldShake": len(shake_held),
        "sourceFirstOranguruHeldShakeNeitherHandTrubbishNorVIP": len(hand_only),
        "cases": [{
            "index": r["index"], "seed": r["seed"],
            "sourceHandCount": len(r["sourceOwnHandPrintings"]),
            "heldForestSealStone": "Forest Seal Stone SIT" in r["sourceOwnHandPrintings"],
            "heldFloatStone": "Float Stone BKT" in r["sourceOwnHandPrintings"],
            "heldBothGarbodor": r["sourceOwnHandPrintings"].count(GARBODOR) == 2,
            "originalNarrowK0Selected": r["eligibleK0"] is True,
            "initialBenchKnown": False
        } for r in hand_only],
        "competitiveQualifiedGames": 0,
        "limitation": "Initial Bench and post-Prize deck contents absent from archive. Owner-hand necessary-state witnesses only, not authenticated disjoint Star-fetched VIP routes."
    }


def analyze_archive(path):
    """Require original published ZIP digest and source 60/engine provenance."""
    data = Path(path).read_bytes()
    actual = sha256(data).hexdigest()
    if actual != ARCHIVE_SHA256:
        raise ValueError(f"Archive hash mismatch: {actual}")
    with ZipFile(path) as archive:
        obj = json.loads(archive.read(ENTRY))
    if obj["sourceRank"] != 11 or obj["sourceSeat"] != 0 or \
       obj["candidateRank"] != 1 or obj["candidateSeat"] != 1 or \
       obj["engineRevision"] != "a9905a76a6c4103ba4b6cb9a49e86bad795c5c05":
        raise ValueError("Source identity/engine mismatch")
    result = analyze(obj["records"])
    if result["allAttempts"] != 512 or result["verifiedActualSourceFirst"] != 267:
        raise ValueError("Frozen attempt/source-first denominator mismatch")
    result["archiveSha256"] = actual
    result["registeredRecordsSha256"] = obj["recordsSha256"]
    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python agent32_rank11_k0_archive_audit.py original-screen.zip")
    print(json.dumps(analyze_archive(sys.argv[1]), indent=2))
