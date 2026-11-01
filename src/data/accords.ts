/* =========================================================
   ACCORDS SIGNATURE — superposer 2 ou 3 parfums
   ---------------------------------------------------------
   Le « layering » : on porte deux ou trois parfums ensemble pour créer
   une odeur que personne d'autre n'a. Chaque accord indique pourquoi il
   fonctionne et comment le porter. Le quiz choisit l'accord le plus
   adapté selon le genre, l'âge et le moment.

   Champs :
     ids      2 ou 3 ids du catalogue, du plus profond (base) au plus léger
     idee     pourquoi ça marche, en une phrase
     recette  comment le porter
     genre    "femme" | "homme" | "mixte"
     ages     "jeune" (moins de 25 ans) | "adulte" (25-40) | "mature" (40 et plus)
     moments  "jour" | "soir" | "ceremonie"
   ========================================================= */

import type { Genre } from "./products";

export type Age = "jeune" | "adulte" | "mature";
export type Moment = "jour" | "soir" | "ceremonie";

export interface Accord {
  slug: string;
  nom: string;
  ids: string[];
  idee: string;
  recette: string;
  genre: Genre;
  ages: Age[];
  moments: Moment[];
}

export const ACCORDS: Accord[] = [
  {
    slug: "nuage-de-patisserie",
    nom: "Nuage de pâtisserie",
    ids: ["yara-elixir", "marshmallow-blush"],
    idee: "La fraise caramélisée de Yara rencontre la framboise et la guimauve : un dessert rose, gourmand et pétillant.",
    recette: "Deux vaporisations de Yara Elixir dans le cou, une de Marshmallow Blush sur les poignets et les cheveux.",
    genre: "femme",
    ages: ["jeune", "adulte"],
    moments: ["jour", "soir"],
  },
  {
    slug: "tiramisu-dore",
    nom: "Tiramisu doré",
    ids: ["eclaire", "cafe-n-cream"],
    idee: "Caramel au lait et café torréfié : ensemble, ils sentent le tiramisu tout juste servi. Chaud, crémeux, addictif.",
    recette: "Café N' Cream en base sur la peau, Éclaire par-dessus : le café s'efface doucement et le caramel reste.",
    genre: "femme",
    ages: ["adulte", "jeune"],
    moments: ["soir"],
  },
  {
    slug: "oud-royal",
    nom: "Oud royal",
    ids: ["badee-al-oud-oud-for-glory", "khamrah"],
    idee: "Un oud fumé et safrané, adouci par les dattes et le praliné de Khamrah. La puissance de l'Orient, sans dureté.",
    recette: "Une vaporisation d'Oud for Glory sur la poitrine, deux de Khamrah dans le cou. À réserver aux grandes soirées.",
    genre: "mixte",
    ages: ["adulte", "mature"],
    moments: ["soir", "ceremonie"],
  },
  {
    slug: "rose-des-mariages",
    nom: "Rose des mariages",
    ids: ["hayaati-rose", "badee-al-oud-oud-for-glory"],
    idee: "Le grand classique des cérémonies d'Orient : une rose poudrée posée sur un bois d'oud. Élégant et inoubliable.",
    recette: "Oud for Glory en touche légère sur les vêtements, Hayaati Rose généreusement sur la peau.",
    genre: "femme",
    ages: ["adulte", "mature"],
    moments: ["ceremonie", "soir"],
  },
  {
    slug: "fraicheur-de-lome",
    nom: "Fraîcheur de Lomé",
    ids: ["versus-ocean-bleu", "matelot"],
    idee: "La brise marine d'Océan Bleu et le frais aromatique de Matelot : un frais propre et viril qui tient malgré la chaleur.",
    recette: "Océan Bleu sur le torse le matin, une touche de Matelot dans le cou avant de sortir.",
    genre: "homme",
    ages: ["jeune", "adulte", "mature"],
    moments: ["jour"],
  },
  {
    slug: "gentleman-du-soir",
    nom: "Gentleman du soir",
    ids: ["asad-bourbon", "club-de-nuit-intense-man"],
    idee: "L'ananas fumé de Club de Nuit gagne une chaleur vanillée et épicée avec Asad Bourbon. Charisme garanti.",
    recette: "Asad Bourbon en base sur le torse, Club de Nuit Intense dans le cou et sur les poignets.",
    genre: "homme",
    ages: ["adulte", "mature"],
    moments: ["soir", "ceremonie"],
  },
  {
    slug: "soleil-fruite",
    nom: "Soleil fruité",
    ids: ["khair-peach-delulu", "hayaati-belle", "taskeen-marina"],
    idee: "Pêche juteuse, floral pétillant et fond solaire : un trio joyeux qui sent les vacances toute l'année.",
    recette: "Taskeen Marina sur la peau, Peach Delulu dans le cou, une touche d'Hayaati Belle dans les cheveux.",
    genre: "femme",
    ages: ["jeune"],
    moments: ["jour"],
  },
  {
    slug: "cocon-cachemire",
    nom: "Cocon cachemire",
    ids: ["mousuf-ramadi", "taskeen-caramel-cascade"],
    idee: "Un boisé fumé tout doux enrobé de caramel blond : rassurant comme un pull en cachemire, à petit prix.",
    recette: "Mousuf Ramadi sur les vêtements, Caramel Cascade sur la peau. Parfait au quotidien.",
    genre: "mixte",
    ages: ["jeune", "adulte", "mature"],
    moments: ["jour", "soir"],
  },
  {
    slug: "ambre-precieux",
    nom: "Ambre précieux",
    ids: ["colosseum", "hayaati-gold-elixir"],
    idee: "Le safran et le rhum ambré de Colosseum éclairés par l'élixir doré d'Hayaati : un sillage lumineux qu'on remarque dès l'entrée.",
    recette: "Hayaati Gold Elixir sur la peau, une vaporisation de Colosseum par-dessus, dans le cou.",
    genre: "mixte",
    ages: ["adulte", "mature"],
    moments: ["ceremonie", "soir"],
  },
  {
    slug: "cerise-interdite",
    nom: "Cerise interdite",
    ids: ["kayali-burning-cherry-48", "cocktail-intense"],
    idee: "Une cerise noire plongée dans un cognac praliné : audacieux, sensuel, impossible à oublier.",
    recette: "Cocktail Intense en base, Burning Cherry sur les points de pulsation. Pour les rendez-vous.",
    genre: "femme",
    ages: ["adulte"],
    moments: ["soir"],
  },
  {
    slug: "gourmand-vanille-epicee",
    nom: "Vanille épicée",
    ids: ["liquid-brun", "asad-bourbon"],
    idee: "Praliné-cannelle et vanille bourbon : un gourmand chaud et boisé, qui se porte aussi bien par elle que par lui.",
    recette: "Une vaporisation de chaque dans le cou, Liquid Brun en premier.",
    genre: "mixte",
    ages: ["jeune", "adulte"],
    moments: ["soir"],
  },
  {
    slug: "jardin-poudre",
    nom: "Jardin poudré",
    ids: ["kayali-deja-vu-57", "hayaati-rose", "mousuf-wardi"],
    idee: "Fleurs blanches crémeuses, rose poudrée et rose fruitée : un bouquet entier, tendre et lumineux.",
    recette: "Mousuf Wardi sur la peau, Hayaati Rose dans le cou, Déjà Vu en touche finale sur les poignets.",
    genre: "femme",
    ages: ["adulte", "mature"],
    moments: ["jour", "ceremonie"],
  },
];

export const AGES: Record<Age, string> = { jeune: "Moins de 25 ans", adulte: "25 à 40 ans", mature: "40 ans et plus" };
export const MOMENTS: Record<Moment, string> = { jour: "La journée", soir: "Le soir", ceremonie: "Les cérémonies" };

export const accordsFor = (id: string) => ACCORDS.filter((a) => a.ids.includes(id));
