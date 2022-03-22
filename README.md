[![](https://img.shields.io/badge/Linktr.ee-Thoanny-93c045?style=for-the-badge)](https://linktr.ee/thoanny)
[![](https://img.shields.io/badge/Twitch-Sub-93c045?style=for-the-badge)](https://www.twitch.tv/subs/thoanny)
[![](https://img.shields.io/badge/StreamElements-Tip-93c045?style=for-the-badge)](https://streamelements.com/thoanny/tip)

# 🎣 Compagnon de pêche

Un overlay pour accompagner tes sessions de pêche. Affiche la liste des poissons en fonction de la carte du jeu sur laquelle tu es connecté·e et de l'heure locale (tyrienne ou canthienne). Tu peux aussi filtrer par zones de pêche et appâts.

*Si la carte n'est pas reconnue, tous les poissons sont affichés et l'heure de Tyrie est utilisée par défaut. C'est le cas actuellement avec les halls de guilde et les contenus instanciés.*

Pour lancer le compagnon de pêche, double-clique sur le fichier "fishing-companion(.exe)" après avoir décompressé l'archive à l'emplacement de ton choix.

## 💾 Téléchargement

[![](https://img.shields.io/github/downloads/thoanny/fishing-companion/total?style=for-the-badge)](https://github.com/thoanny/fishing-companion/releases)

Pour télécharger la dernière version du compagnon de pêche, [clique ici](https://github.com/thoanny/fishing-companion/releases), déplie la rubrique "Assets" de la dernière version disponible et télécharge la première archive.

## 📦 Technologies

* HTML
* CSS / [Sass](https://sass-lang.com/)
* JavaScript / [jQuery](https://jquery.com/)
* [Webpack](https://webpack.js.org/)
* [Electron](https://www.electronjs.org/)
* [Python](https://www.python.org/)

## 🐉 GW2MumbleLink

Pour connaître la carte sur laquelle tu es connecté·e en jeu, le compagnon de pêche utilise les informations fournies par [MumbleLink](https://wiki.guildwars2.com/wiki/API:MumbleLink). Les sources de ce programme sont disponibles dans le dossier [/GW2MumbleLink](https://github.com/thoanny/fishing-companion/tree/main/GW2MumbleLink) (Python) de ce projet.

Lorsque tu lances le compagnon de pêche, GW2MumbleLink.exe est exécuté en arrière-plan et délivre ta position en JSON via l'URL : http://127.0.0.1:7234.

## 📑 Todo

* Ajouter les halls de guilde après avoir vérifié leurs IDs

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

### 🔹 Version 0.9-beta.3

* Nouvelle version de GW2MumbleLink, en Python

### 🔹 Version 0.9-beta.2

* Proposer une version du compagnon de pêche en anglais
* Ajout d'une page de paramètres (choix de langue uniquement pour le moment)
* À l'aube et au crépuscule, afficher tous les poissons

### 🔹 Version 0.9-beta.1

* Ajout de la rareté sur tous les poissons
* Correction du timer pour les minutes entre 0 et 9
* Suppression des icônes des poissons inutilisés (classe internationale et eau douce)

### 🔹 Version 0.9-beta.0

* Intégration de GW2Link
* Ajout de Webpack pour optimiser les fichiers (js, sass, sprite)
* Clarification du code (marge d'amélioration possible)
* Séparation des données (js/data.js) du script (js/script.js)

### 🔹 Version 0.8-alpha.0

Version statique du compagnon. Premier jet.
