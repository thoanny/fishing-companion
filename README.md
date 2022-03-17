# 🎣 Compagnon de pêche

Overlay pour accompagner tes sessions de pêche. Affiche la liste des poissons en fonction de la carte du jeu dans laquelle tu es connecté·e et de l'heure locale (tyrienne ou canthienne). Tu peux aussi filtrer par zones de pêche et appâts.

Si la carte n'est pas reconnue, tous les poissons sont affichés et l'heure de Tyrie est utilisée par défaut. C'est le cas actuellement avec les halls de guilde et les contenus instanciés.

## 💾 Téléchargement

Prochainement disponible.

## 📦 Technologies

* HTML
* CSS / [Sass](https://sass-lang.com/)
* JavaScript / [jQuery](https://jquery.com/)
* [Webpack](https://webpack.js.org/)
* [Electron](https://www.electronjs.org/)

## 🐉 GW2Link

Pour connaître la carte sur laquelle tu es connecté·e en jeu, j'utilise les informations fournies par [MumbleLink](https://wiki.guildwars2.com/wiki/API:MumbleLink) en me basant sur le script de Devon Carlson : [GW2Link](https://github.com/Blaaguuu/GW2Link) (C++).

Lorsque tu lances le compagnon de pêche, GW2Link.exe est exécuté en arrière-plan et délivre ta position via une réponse en JSON sur l'URL : http://127.0.0.1:8428/gw2.json.

## 📑 Todo

* Intégrer les sources de GW2Link au projet
* Terminer de saisir la rareté des poissons
* Ajouter les halls de guilde après avoir vérifié leurs IDs
* Proposer une version du compagnon de pêche en anglais
* À l'aube et au crépuscule, il est possible de pêcher tous les poissons !
* Le changement d'heure tyrienne/canthienne semble ne pas fonctionner

## 💡 Idées

* Afficher uniquement les zones des poissons affichés, dans la liste déroulante
* Trier les poissons par rareté puis par ordre alphabétique
* Utiliser l'API de GW2 pour indiquer :
  * la progression selon les succès de pêche
  * les appâts disponibles/équipés sur le personnage connecté (si possible)
* Modifier le code JS pour ne plus avoir à utiliser jQuery
* Vérifier la version pour proposer un lien de téléchargement si différente

## 💃 Contributeurs

Archibald Wirslayd, Pandraghon, vzdk.

## 🖼️ Droits d'auteurs

* **Icône d'application, logo et illustrations des poissons :** [ArenaNet](https://www.arena.net/) et [NCSOFT Corporation](https://ncsoft.com/)
* **Icônes :** [Font Awesome](https://fontawesome.com/) (Font Awesome 5 Pro License, Early Backer)

## 📝 Changelogs

### 🔹 Version 0.9.0

Version dynamique du compagnon, basée sur les données de MumbleLink.

* Intégration de GW2Link
* Ajout de Webpack pour optimiser les fichiers (js, sass, sprite)
* Clarification du code (marge d'amélioration possible)
* Séparation des données (js/data.js) du script (js/script.js)

### 🔹 Version 0.8.0

Version statique du compagnon. Premier jet.
