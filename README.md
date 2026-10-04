# nexyalabs.com

Site vitrine de NEXYA AI. HTML, CSS et JavaScript sans framework ni étape de compilation, déployé par Vercel à chaque poussée sur `main`.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil, **source unique** du français et de l'anglais |
| `en/index.html` | Version anglaise, **générée**, ne pas modifier à la main |
| `privacy.html`, `delete-account.html` | Pages légales |
| `reset-password.html`, `unsubscribe.html` | Pages liées aux emails de l'application (appellent `api.nexyalabs.com`) |
| `404.html` | Page introuvable |
| `assets/css/base.css` | Système de design commun : couleurs, polices, navigation, boutons, pages secondaires |
| `assets/js/page.js` | Thème et navigation des pages secondaires |
| `llms.txt` | Résumé lisible par les assistants IA (produit et fondateur) |
| `tools/build_en.py` | Générateur de la version anglaise |

## Modifier un texte de l'accueil

Chaque texte français porte sa traduction à côté de lui :

```html
<h3 data-en="Pick your expert.">Choisis ton expert.</h3>
<p data-en-html="One app, &lt;strong&gt;eleven experts&lt;/strong&gt;.">Une application, <strong>onze experts</strong>.</p>
<img alt="Téléphone" data-en-alt="Phone">
```

Après toute modification d'`index.html`, régénérer l'anglais puis publier :

```bash
python tools/build_en.py
```

Le script s'arrête avec une erreur si une traduction n'a pas pu être appliquée.

## Règles du système

- Un seul accent de couleur, le bleu NEXYA. Aucun dégradé sur du texte.
- Contraste AA partout : ne pas utiliser de gris plus clair que `--text-3`.
- Aucune animation CSS en boucle, sauf l'invite « Défiler » du haut de page. La démonstration avance seule mais reste toujours pilotable (pause, étapes, clavier).
- Tout mouvement respecte `prefers-reduced-motion`.
- Les captures de l'application vont par paire `nom-dark.webp` / `nom-light.webp` (540 px de large minimum, 1080 px idéalement). Le téléphone affiche automatiquement celle du thème actif.
- Les polices sont auto-hébergées (RGPD) et réduites aux caractères utilisés. Pour ajouter un caractère hors Latin-1, élargir le sous-ensemble dans `assets/fonts/` et la `unicode-range` de `base.css`.

## La démonstration (section « L'application »)

Une galerie façon apple.com : quatre cartes (Accueil, Experts, Puissance, Interface) qui défilent à l'horizontale avec l'aimantation native du navigateur. Sur mobile, la carte active est calée à gauche, la suivante dépasse à droite, et étapes, carte et commandes tiennent dans un seul écran. Sur ordinateur, la carte est centrée et ses annotations se dessinent à côté du téléphone.

Chaque carte rejoue un geste réel de l'application, et l'écran final d'une carte est l'écran de départ de la suivante. Règle de repos : à gauche de la carte active, les téléphones montrent leur état final ; à droite, leur état de départ. Le récit ne se coupe jamais, dans un sens comme dans l'autre.

Le téléphone est fait de captures empilées en calques dans `[data-demo]` :

- `demo__chrome` et `demo__nav` : barre d'état et barre de navigation fixes (capture d'accueil) ;
- `scr` : contenu de chaque écran, découpé entre ces deux barres pour que seul le contenu glisse ;
- `demo__scrim` : voile noir à 54 % (mesuré sur la capture réelle) ;
- `demo__sheet` : panneau des modes (`sheet-dark.webp` / `sheet-light.webp`, découpé à y = 620 px avec des coins de 28 px) ;
- `demo__dip` : fondu à la couleur de fond de l'application, pour changer d'état sans coupe franche.

Mouvements :

- la lentille des étapes et les points suivent le doigt au pixel près (variable `--sp`) ; les libellés s'allument exactement sous la lentille (rangée `.gal__lit`, découpée par `clip-path`) ;
- l'étape change dès que le doigt quitte l'écran : le geste démarre pendant que la carte s'aimante ;
- en lecture automatique, une seule horloge, le remplissage du point actif (durées dans `DWELL`) ; un anneau pulse là où le doigt touchera ensuite (positions dans `RING`) ;
- à la première visite sur écran tactile, la galerie glisse d'elle-même de quelques pixels et affiche « Fais glisser », une seule fois par session ;
- toucher le téléphone de la carte active rejoue son geste.

La lecture se met en pause au survol, au clavier dans la galerie, hors écran, onglet masqué et via le bouton Pause ; à la fin, le même bouton propose de revoir depuis le début. Elle est désactivée si le visiteur a demandé moins d'animations : chaque carte montre alors directement son état final. Sans JavaScript, la galerie reste un défilement natif et chaque carte montre son état final.

Les points de toucher sont en pourcentage de l'écran dans les scénarios `T` du script ; les annotations dans les attributs `data-x` / `data-y` des éléments `.note`. Si une capture change, recaler ces valeurs sur la nouvelle image (540 × 1169 px).

## Déploiement

Pousser sur `main` suffit. La configuration Vercel (`vercel.json`) gère les URL sans extension, les en-têtes de sécurité et le cache des images et polices.
