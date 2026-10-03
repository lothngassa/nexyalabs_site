"""Genere la version anglaise statique du site a partir de la page francaise.

Source unique : index.html (francais). Les traductions vivent a cote du texte :
  data-en="..."         remplace le texte d'un element sans balise enfant
  data-en-html="..."    remplace le contenu HTML d'un element (balises echappees)
  data-en-<attr>="..."  remplace ou ajoute l'attribut <attr> (alt, href, content, aria-label...)

Usage, depuis la racine du site :
    python tools/build_en.py
Puis relire en/index.html et publier. A relancer apres chaque modification d'index.html.
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
OUT = ROOT / "en" / "index.html"

START_TAG = re.compile(r"<[a-zA-Z][^<>]*>")
EN_ATTR = re.compile(r'\sdata-en-([a-z][a-z-]*)="([^"]*)"')


def translate_attributes(tag: str) -> str:
    """Applique les data-en-<attr> d'une balise ouvrante puis les retire."""
    for name, value in EN_ATTR.findall(tag):
        if name == "html":
            continue
        pattern = re.compile(r'(\s' + re.escape(name) + r')="[^"]*"')
        if pattern.search(tag):
            tag = pattern.sub(lambda m: f'{m.group(1)}="{value}"', tag, count=1)
        else:
            tag = re.sub(r"\s*/?>$", lambda m: f' {name}="{value}"' + m.group(0).lstrip(), tag, count=1)
    return EN_ATTR.sub(lambda m: "" if m.group(1) != "html" else m.group(0), tag)


def build() -> str:
    page = SRC.read_text(encoding="utf-8")

    # 1. contenu HTML riche
    rich = re.compile(r'(<(\w+)\b[^>]*?)\sdata-en-html="([^"]*)"([^>]*>)(.*?)(</\2>)', re.S)
    page, n_rich = rich.subn(lambda m: m.group(1) + m.group(4) + html.unescape(m.group(3)) + m.group(6), page)

    # 2. texte simple
    plain = re.compile(r'(<(\w+)\b[^>]*?)\sdata-en="([^"]*)"([^>]*>)([^<]*)(</\2>)')
    page, n_plain = plain.subn(lambda m: m.group(1) + m.group(4) + m.group(3) + m.group(6), page)

    # 3. attributs
    n_attr = len(EN_ATTR.findall(page))
    page = START_TAG.sub(lambda m: translate_attributes(m.group(0)), page)

    leftover = re.findall(r"data-en[-=]", page)
    if leftover:
        sys.exit(f"Traductions non appliquees : {len(leftover)}")
    print(f"textes {n_plain}, contenus riches {n_rich}, attributs {n_attr}")
    return page


if __name__ == "__main__":
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(build(), encoding="utf-8", newline="\n")
    print(f"ecrit : {OUT.relative_to(ROOT)}")
