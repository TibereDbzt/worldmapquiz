# worldmapquiz
Worldmapquiz est un petit **jeu web** pour apprendre à **placer les pays du monde sur une carte**. Un planisphère interactif, le nom d'un pays ainsi qu'un timer sont affichés à l'écran. Le joueur doit cliquer sur la carte pour placer le pays avant la fin du timer. Le résultat ainsi que quelques informations sur le pays à placer sont affichées. Le joueur peut jouer indéfiniment.

## Ressources utilisés
- [Rest Countries](https://restcountries.eu/) --> API REST qui m'a permis de récupérer les informations du pays à placer : nom de la capitale, population, langues locales, monnaie et drapeau du pays.
- [DataMaps](https://datamaps.github.io/) --> Librairie Javascript qui fournit des cartes intéractives sous forme de SVG.

## Outils et technos
- HTML5, CSS3 & JS ES6
- [Sass](https://sass-lang.com/) --> Préprocesseur permettant d'étendre les fonctionnalités de CSS.
- [HandlebarsJS](https://handlebarsjs.com/) --> Langage de templating pour faciliter l'injection de contenu dans le DOM.
- [jQuery](https://jquery.com/) --> Librairie Javascript facilitant la manipulation du DOM.
- [PostCSS](https://postcss.org/) --> Outil qui assure la compatibilité cross-browser des feuilles de style en ajoutant notamment des préfixes à certaines propriétés CSS.
- [BabelJS](https://babeljs.io/) --> Compilateur Javascript qui convertit le code JS écrit en ES6+ en JS moins moderne mais plus largement supporté par les navigateurs.
- [Webpack](https://webpack.js.org/) --> Module bundler qui, après avoir effectué les transformations nécessaires (PostCSS, Babel, minification, etc.), génère un seul et même fichier JS (fichier bundle).

## Conception
J'ai choisi de concevoir mon jeu selon le **paradigme de POO** (Programmation Orientée Objet) puisqu'il m'a paru naturel de visualiser les différente modules du jeu comme des **objets imbriqués les uns dans les autres**. J'ai donc créé une classe pour chacun de ces modules :
    1. **Page d'accueil** --> :Home (*home.js*)
    2. **Jeu** --> :Game (*game.js*)
    3. **Niveau** --> :Stage (*stage.js*)
    4. **Pays à placer** --> :CountryToFind (*countrytofind.js*)
    5. **Informations sur le pays** --> :CountryInfo (*contryinfo.js*)

Ces classes s'appellent les unes les autres de cette façon :

:Home (totalement indépendante)

:Game --> :Stage --> :CountryToFind
                 --> :CountryInfo

Je ne vais détailler que les **trois classes les plus intéressantes** : Home, Game et Stage. Les deux autres servent simplement à **injecter du contenu au DOM** par le biais d'HandlebarsJS.

## Développement

### 1. :Home
Cette classe permet simplement d'**animer le menu du jeu**. Elle est totalement **indépendante** des autres classes puisqu'elle est à elle-même un bundle JS :

> Webpack Config (webpack.dev.js & webpack.prod.js)
```javascript
plugins: [
    new HtmlWebpackPlugin({
    hash: true,
    title: 'Home | WorldMapQuiz',
    template: './src/home.html',
    chunks: ['home'],
    filename: 'index.html'
    }),
]
```

Cela permet d'afficher la page d'accueil le **plus rapidement** possible puisqu'on ne charge pas tout de suite les scripts, les feuilles de style et la carte interactive du jeu.

### 2. :Game
Cette classe permet d'**initialiser le jeu**. C'est la classe mère de toute les autres qui suivent. Elle possède les méthodes suivantes :

- **makeMap()** --> génère et affiche un planisphère interactif grâce à la librairie *DataMaps*. On passe à la librairie des paramètres comme la couleur de la carte, le conteneur, l'angle de projection et on lui attache un **écouteur d'évènement** (onClick) avec une fonction de retour (callback) :
```javascript
makeMap () {
    this.map = new Datamap({
        element: document.getElementById('container'),
        fills: {
        defaultFill: 'black'
        },
        setProjection: (element) => {
        const projection = d3.geo.equirectangular()
            .center([20, 20])
            .rotate([4.4, 0])
            .scale(300)
            .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
        const path = d3.geo.path()
            .projection(projection);

        return {path: path, projection: projection};
        },
        geographyConfig: {
        highlightOnHover: true,
        popupOnHover: false
        },
        done: (datamap) => {
        datamap.svg.selectAll('.datamaps-subunit').on('click', (geography) => {
            this.stage.onClickRegion(geography);
        });
        }
    });
}
```

- **retrieveListOfCountries()** --> génère une requête de type GET vers l'API *Rest Countries* pour récupérer le nom et le **code Alpha3** de tous les pays du monde (*https://restcountries.eu/rest/v2/all?fields=alpha3Code;name*). Le code Alpha3 est une clé composée de **3 lettres permettant d'identifier un pays**. Au succès de la requête, on crée une **nouvelle instance de Stage** en lui passant en paramètre la réponse (la liste des pays ainsi que leur code alpha3) et la carte interactive.
- **nextStage()** --> au clic du bouton 'suivant', on cache certains éléments du DOM : le bouton 'suivant' et le panneau présentant les infos du dernier pays à placer.

### 3. :Stage
Cette classe fait fonctionner **une partie** (= une itération). C'est elle qui gère le timer, choisit aléatoirement un pays à placer, récupère les informations du pays via une API et compare le pays cliqué avec celui choisi aléatoirment.
Pour choisir le pays à placer, elle fait appel à la **fonction helper pickRandom()** importée depuis le dossier 'helpers/'. On passe à cette fonction le tableau de tous les **objets {pays, alpha3Code}** récupéré dans la classe Game et elle nous retourne un objet aléatoire de ce tableau.
- **retrieveCountryData(country)** --> génère une requête vers l'API Rest Countries pour **récupérer les informations sur le pays** choisi aléatoirement (*https://restcountries.eu/rest/v2/alpha/${code}*). Au **succès de la requête**, on crée une **nouvelle instance de CountryInfo** en lui passant en paramètre la réponse.
- **manageTime()**--> fait diminuer la barre de progression de 0.1 toutes les 10ms. La valeur initiale de la barre de progression étant fixée à 100, le **timer dure 10 secondes**. Si le timer atteint la valeur 0, on appelle la méthode **displayResult('timed out')** et on affiche les informations du pays à placer en appelant la méthode renderElements() de la classe CountryInfo :
```javascript
manageTime (progress) {
    this.timer = setInterval( () => {
      progress.val( progress.val() - 0.1 );
      if (progress.val() == 0) {
        clearInterval(this.timer);
        this.timer = false;
        this.displayResult('timed out');
        this.countryInfo.renderElements();
      }
    }, 10);
}
```
- **onClickRegion()** --> c'est la fonction de **callbak** qui a été passée à la **carte intéractive** lors de sa création. Elle est donc appelée lors d'un clic sur un pays de la carte. Elle appelle la fonction helper compareAlpha3Code() à qui on passe **les deux codes Alpha3 à comparer** (celui du pays sur lequel on a cliqué et celui du pays choisi aléatoirement). Cette fonction **renvoie 'correct' ou 'wrong'** :
```javascript
onClickRegion (region) {
    if (this.timer) {
      clearInterval(this.timer);
      this.clicked = region.id;
      const result = compareAlpha3Code(this.clicked, this.picked.alpha3Code);
      this.displayResult(result);
      this.countryInfo.renderElements();
    }
}
```
- **displayResult()** --> prend en paramètre un string qui peut avoir trois valeurs : 'correct', 'wrong' ou 'timed out'. En fonction de cette valeur, elle **affiche le résultat dans le DOM**.

## Limites et améliorations
- *Ergonomie* : je n'ai pas intégré de fonctionnalité permettant de **zoomer et/ou se déplacer** sur la carte. Cela aurait grandement amélioré l'ergonomie du jeu, puisque quand il s'agit de **placer un petit pays**, il est souvent impossible de cliquer où l'on le souhaite. De même, lorsque le pays est coloré sur la carte (après une partie), il faudrait zoomer automatiquement sur celui-ci afin qu'il soit visible pour l'utilisateur.
- *Responsive* : ce jeu n'a pas du tout était designé pour être responsive. Sur **tablette ou mobile**, il n'est pas possible de jouer correctement. Sur un grand écran (> 1920x1080), la **carte ne s'étend pas sur la largeur de l'écran**, ce qui rend l'expérience moins agréable.
