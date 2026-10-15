"""Inspect the published Aichi Open League decklist HTML structure.

Read-only diagnostic, safe to run through the manual GitHub Actions workflow.
"""
from collections import Counter
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

URL = "https://www.limitlesstcg.com/tournaments/566/decklists"
request = Request(URL, headers={"User-Agent": "Mozilla/5.0 (compatible; deck-research/1.0)"})
with urlopen(request, timeout=25) as response:
    html = response.read().decode("utf-8")
soup = BeautifulSoup(html, "html.parser")
print(f"URL: {URL}; HTML bytes: {len(html):,}; title: {soup.title.get_text(' ', strip=True)}")
classes = Counter(
    class_name for element in soup.find_all(True)
    for class_name in element.get("class", [])
)
print("Most common CSS classes:", classes.most_common(28))
for selector in [
    ".decklist", ".decklist-container", ".decklist-card",
    ".decklist-card-count", ".decklist-card-name", ".placing", ".player",
    ".deck", ".list", "table", "h3", "h4"
]:
    print(f"CSS {selector}: {len(soup.select(selector))}")
for match in soup.find_all(string=lambda s: s and "Yasunori Kato" in s):
    tag = match.parent
    print("Player element parent chain:", [(p.name, p.get("class"), p.get("id")) for p in [tag, tag.parent, tag.parent.parent]])
    print("Player surrounding HTML, first 9000 chars:", str(tag.parent.parent)[:9000])
    break
else:
    print("WARNING: The published champion name was absent.")
