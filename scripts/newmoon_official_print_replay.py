"""Validate the official Japanese deck viewer against the archived source 60."""
import hashlib
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KINDS = ("deck_pke", "deck_gds", "deck_tool", "deck_tech", "deck_sup", "deck_sta", "deck_ene", "deck_ajs")


def validate(viewer):
    raw = viewer.read_bytes()
    page = raw.decode("utf-8")
    source = json.loads((ROOT / "results/als/new-moon-perfection-source-60.json").read_text("utf-8"))
    official = json.loads((ROOT / "results/als/new-moon-official-japanese-print-60.json").read_text("utf-8"))
    assert official["source_code"] in page
    names = {
        int(k): html.unescape(v)
        for k, v in re.findall(r"PCGDECK\.searchItemName\[(\d+)\]='([^']+)';", page)
    }
    pictures = {
        int(k): v
        for k, v in re.findall(r"PCGDECK\.searchItemCardPict\[(\d+)\]='([^']+)';", page)
    }
    rows = []
    for section in KINDS:
        match = re.search('name="' + section + '" id="' + section + '" value="([^"]*)"', page)
        assert match, section
        for field in filter(None, match.group(1).split("-")):
            card_id, quantity, variant = map(int, field.split("_"))
            assert variant == 1
            edition = re.search(r"/large/([^/]+)/", pictures[card_id]).group(1)
            rows.append((card_id, quantity, edition, names[card_id]))
    assert len(rows) == len(source["entries"]) == len(official["entries"]) == 33
    assert sum(r[1] for r in rows) == 60
    for i, (observed, original, expected) in enumerate(zip(rows, source["entries"], official["entries"]), 1):
        card_id, quantity, edition, printed_name = observed
        assert quantity == original["count"] == expected["count"], i
        assert expected["name_en"] == original["name_en"], i
        assert (card_id, edition) == (expected["japanese_card_id"], expected["japanese_set"]), i
        assert printed_name, i
    duskull = next(r for r in official["entries"] if r["name_en"] == "Duskull")
    assert (duskull["japanese_card_id"], duskull["japanese_set"]) == (38541, "S4")
    digest = hashlib.sha256(raw).hexdigest()
    assert digest == official["html_sha256"], "Official source HTML has changed; re-review the exact archived print source"
    print(json.dumps({"verified": True, "source": official["source_code"], "cards": 60,
                      "printings": 33, "official_html_sha256": digest,
                      "registered_duskull": "S4 043/100, Future Sight"}))


if __name__ == "__main__":
    validate(Path(sys.argv[1]))
