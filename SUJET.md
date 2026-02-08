# Club Poisson — Mise en production professionnelle

Par groupes de 3-4 étudiants, forker le repo, m'inviter @thomasbouillon.

Votre organisation dans git sera pris en compte dans la notation: utilisation des pull requests, organisation du repo suivant GitFlow.

Une présentation de 20 minutes est attendue lors de la séance du 19/02 pour une démonstration des outils mis en place. Vous utiliserez cette présentation pour expliquer les points importants de votre solution. Un autre professeur se joindra à mes côtés pour vous écouter, ce professeur, dans le milieu de l'informatique n'a pas suivi notre cours. J'attends de vous un présentaiton à la fois complète et adaptée à votre public.

## Contexte

L'association **Club Poisson** regroupe des passionnés d'aquariophilie de la région Nancéenne. Depuis deux ans, ils organisent des rencontres mensuelles, des ateliers de maintenance d'aquariums et des sorties découverte en milieu naturel. Jusqu'ici, la gestion des événements se faisait sur un groupe Facebook, mais l'association souhaitait gagner en autonomie et disposer de son propre site web.

Un des membres bénévoles, développeur autodidacte, a pris l'initiative de créer une application web pour gérer et afficher les événements de l'association. Après quelques semaines de travail le soir et le week-end, il est arrivé à un résultat fonctionnel : un backend en TypeScript avec Bun, un frontend React, et une base de données PostgreSQL. L'application tourne parfaitement... **sur sa machine**.

Mais voilà : quand le bureau de l'association lui demande *"Et du coup, on peut l'utiliser quand ?"*, il réalise qu'il n'a aucune idée de comment mettre tout cela en production de manière fiable. Pas de tests, pas de pipeline d'intégration continue, pas de processus de déploiement. Il a entendu parler de Docker et de CI/CD, mais n'a jamais mis cela en pratique.

C'est là que l'association fait appel à vous. Votre mission : reprendre ce projet en l'état et le rendre **déployable en production avec un niveau de qualité professionnel**.

---

## Le projet existant

Le dépôt est un **monorepo** contenant :

```
club-poisson/
├── backend/          # Serveur API (Bun + TypeScript)
├── frontend/         # Application React (Vite + Tailwind CSS v4)
└── .gitignore
```

### Backend (`backend/`)

- **Runtime :** [Bun](https://bun.sh/)
- **Serveur :** `Bun.serve()` natif (pas de framework), port 3000
- **Base de données :** PostgreSQL 17 (via le package `postgres`)
- **Structure :** Routes organisées par domaine (`auth/`, `events/`, `db/`)
- **Authentification :** Sessions en mémoire avec TTL de 24h, mot de passe vérifié contre la variable d'environnement `ADMIN_PASSWORD`

Commandes :
```bash
cd backend
bun install
bun dev       # Démarrage avec watch mode
```

### Frontend (`frontend/`)

- **Framework :** React 19 avec React Router v7
- **Build :** Vite 7, TypeScript 5.9
- **Styles :** Tailwind CSS v4 (plugin Vite, configuration CSS)
- **Linting existant :** ESLint 9 (config flat) avec plugins TypeScript et React

Commandes :
```bash
cd frontend
bun install
bun dev       # Serveur de développement sur le port 5173
bun run build # Build de production
bun run lint  # Vérification ESLint
```

### Base de données

Le backend s'attend à une base PostgreSQL. En développement, vous pouvez en lancer une facilement avec Docker :

```bash
docker run -d --name clubpoisson-db \
  -e POSTGRES_USER=clubpoisson \
  -e POSTGRES_PASSWORD=clubpoisson \
  -e POSTGRES_DB=clubpoisson \
  -p 5432:5432 \
  postgres:17
```

Le backend se connecte via les variables d'environnement `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` et exécute automatiquement les migrations au démarrage.

> **Note :** Le frontend en mode développement proxifie les appels `/api/*` vers `http://localhost:3000` via la configuration Vite.

---

## Votre mission

Vous devez mettre en place tout l'outillage et les processus nécessaires pour que ce projet puisse être **déployé et maintenu en production de manière professionnelle**. On attend de vous une démarche rigoureuse, des choix justifiés et une attention particulière aux bonnes pratiques.

Les grandes étapes sont décrites ci-dessous. Elles ne sont volontairement **pas exhaustives** : à vous de réfléchir à ce qui est nécessaire, pertinent, et de proposer des solutions adaptées.

---

### Etape 1 — Qualité du code : tests

Le développeur bénévole n'a écrit aucun test. C'est la première chose à corriger avant d'aller plus loin.

**Ce qu'on attend :**

- Mettre en place un framework de tests pour le **backend** et le **frontend**
- Ecrire des tests unitaires pertinents (pas besoin de tout couvrir, mais les parties critiques doivent être testées)
- Les tests doivent pouvoir être lancés via une commande simple (`bun test` ou équivalent)

**Pistes :**

- Bun intègre un test runner natif : [Bun Test Runner](https://bun.sh/docs/cli/test)
- Pour le frontend, des outils comme [Vitest](https://vitest.dev/) s'intègrent naturellement avec Vite
- Réfléchissez à ce qui mérite d'être testé en priorité : logique métier, fonctions utilitaires, comportement des routes API...

---

### Etape 2 — Qualité du code : linting et formatage

Un linter (ESLint) est déjà configuré côté frontend, mais il n'y a rien côté backend. Et il n'y a aucun outil de formatage automatique sur le projet.

**Ce qu'on attend :**

- Uniformiser la configuration de **linting** sur l'ensemble du projet (backend inclus)
- Mettre en place un **formateur de code** automatique (type [Prettier](https://prettier.io/) ou [Biome](https://biomejs.dev/)) pour garantir un style de code cohérent
- Il doit être possible de vérifier le formatage et le linting via des commandes simples

**Ressources :**

- [ESLint — Getting Started](https://eslint.org/docs/latest/use/getting-started)
- [Prettier — Install](https://prettier.io/docs/install)
- [Biome — Getting Started](https://biomejs.dev/guides/getting-started/) (alternative tout-en-un à ESLint + Prettier)

---

### Etape 3 — Intégration continue (CI)

Maintenant que les vérifications existent en local, il faut s'assurer qu'elles sont exécutées **automatiquement** à chaque modification du code.

**Ce qu'on attend :**

- Mettre en place un **pipeline GitHub Actions** qui s'exécute sur chaque push et/ou pull request
- Le pipeline doit au minimum : installer les dépendances, lancer le linting, lancer le formatage, exécuter les tests
- Le pipeline doit échouer si l'une de ces étapes ne passe pas

**Ressources :**

- [GitHub Actions — Quickstart](https://docs.github.com/en/actions/writing-workflows/quickstart)
- [GitHub Actions — Using Bun](https://bun.sh/guides/runtime/cicd)

---

### Etape 4 — Conteneurisation

Le développeur bénévole a toujours lancé le backend et le frontend directement sur sa machine. Il n'a jamais conteneurisé l'application. C'est à vous de le faire.

**Ce qu'on attend :**

- Ecrire un **`Dockerfile`** pour le backend et un pour le frontend
- Ecrire un fichier **`docker-compose.yml`** orchestrant l'ensemble des services (backend, frontend, base de données)
- L'application complète doit pouvoir être lancée en local via un simple `docker compose up`
- L'application doit être fonctionnelle une fois les conteneurs démarrés (création d'événements, navigation, authentification)

**Pistes :**

- Le backend est une application Bun — cherchez les images Docker officielles adaptées
- Le frontend est une application React buildée par Vite : en production, il s'agit de fichiers statiques à servir via un serveur web (Nginx, Caddy...)
- Pensez au multi-stage build pour optimiser la taille des images
- Le frontend en production doit pouvoir communiquer avec le backend (les appels `/api/*` ne sont plus proxifiés par Vite)

**Ressources :**

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker Compose — Getting Started](https://docs.docker.com/compose/gettingstarted/)
- [Best practices for writing Dockerfiles](https://docs.docker.com/build/building/best-practices/)
- [Bun — Docker](https://bun.sh/guides/ecosystem/docker)

---

### Etape 5 — Build automatisé des images Docker (CI/CD)

Le pipeline CI vérifie la qualité du code. Il faut maintenant aller plus loin et **construire les images Docker automatiquement**.

**Ce qu'on attend :**

- Ajouter au pipeline GitHub Actions une étape de **build des images Docker**
- Les images doivent être poussées vers un **registre de conteneurs** (GitHub Container Registry, Docker Hub, ou autre)
- Les images doivent être taguées de manière pertinente (version, hash du commit, `latest`...)

**Ressources :**

- [GitHub Actions — Publishing Docker images](https://docs.github.com/en/actions/use-cases-and-examples/publishing-packages/publishing-docker-images)
- [GitHub Container Registry (ghcr.io)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

### Etape 6 — Déploiement automatisé (CD)

Dernière étape : automatiser le déploiement de l'application sur un **serveur distant**.

**Ce qu'on attend :**

- Un processus de déploiement qui, après un merge sur la branche principale, **déploie automatiquement** l'application sur le serveur
- Le déploiement doit utiliser `docker compose` sur le serveur distant
- Le serveur doit être accessible et l'application fonctionnelle après déploiement

**Pistes :**

- Connexion SSH au serveur depuis le pipeline GitHub Actions
- Pull des images depuis le registre, puis `docker compose up -d` sur le serveur
- Pensez à la gestion des variables d'environnement et des secrets

**Ressources :**

- [GitHub Actions — Encrypted secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)

---

## Critères d'évaluation

| Critère | Description |
|---|---|
| **Fonctionnalité** | L'application est déployée et fonctionne correctement en production |
| **Qualité du code** | Tests pertinents, linting et formatage en place, code propre |
| **Pipeline CI/CD** | Le pipeline est complet, fiable et bien structuré |
| **Conteneurisation** | Dockerfiles optimisés, docker-compose fonctionnel |
| **Bonnes pratiques** | Gestion des secrets, configuration par environnement, documentation |
| **Autonomie et réflexion** | Capacité à identifier et résoudre des problèmes non explicitement décrits dans le sujet |

### Bonus

Des points supplémentaires seront attribués pour les initiatives allant au-delà du sujet de base. Par exemple (liste non exhaustive) :

- **Optimisation du cache Docker** dans le pipeline CI (layer caching, BuildKit)
- **Reverse proxy** (Nginx, Traefik, Caddy...) pour servir frontend et backend sur le même domaine et le même port
- **Certificat SSL / HTTPS** en production (Let's Encrypt, Caddy auto-TLS...)
- **Healthchecks** Docker pour la supervision des conteneurs
- **Stratégie de déploiement** avancée (blue/green, rolling update)
- **Monitoring / logging** centralisé
- **Pre-commit hooks** pour exécuter linting/formatage avant chaque commit (Husky, lefthook...)
- **Environnements de staging** séparés de la production
- **Dependabot** pour maintenir les dépedances à jour
- **Inspection des vulnéravilités** outils comme Snyk pour alerter sur la sécurité
- Toute autre amélioration que vous jugez pertinente et que vous pouvez justifier

---

## Livrables

- Le **dépôt Git** avec l'historique complet des commits (messages clairs et descriptifs)
- Une pipeline CI/CD **fonctionnelle** sur GitHub Actions
- L'application **déployée et accessible** sur le serveur fourni
- Un fichier **README.md** à la racine du projet documentant :
  - Comment lancer le projet en local (développement et Docker)
  - L'architecture du pipeline CI/CD
  - Les choix techniques et leur justification
  - Les éventuels bonus implémentés

---

*Bonne chance, l'association compte sur vous ! Les poissons aussi.* 🐟
