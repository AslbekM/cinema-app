// Maps each film title to its bundled poster image.
import inception from './assets/posters/inception.jpg'
import theDarkKnight from './assets/posters/the-dark-knight.jpg'
import interstellar from './assets/posters/interstellar.jpg'
import dune from './assets/posters/dune.jpg'
import oppenheimer from './assets/posters/oppenheimer.jpg'
import barbie from './assets/posters/barbie.jpg'
import theMatrix from './assets/posters/the-matrix.jpg'
import pulpFiction from './assets/posters/pulp-fiction.jpg'
import theGodfather from './assets/posters/the-godfather.jpg'
import forrestGump from './assets/posters/forrest-gump.jpg'
import gladiator from './assets/posters/gladiator.jpg'
import avatar from './assets/posters/avatar.jpg'
import joker from './assets/posters/joker.jpg'
import spiderMan from './assets/posters/spider-man.jpg'
import parasite from './assets/posters/parasite.jpg'

const POSTER_MAP: Record<string, string> = {
  Inception: inception,
  'The Dark Knight': theDarkKnight,
  Interstellar: interstellar,
  'Dune: Part Two': dune,
  Oppenheimer: oppenheimer,
  Barbie: barbie,
  'The Matrix': theMatrix,
  'Pulp Fiction': pulpFiction,
  'The Godfather': theGodfather,
  'Forrest Gump': forrestGump,
  Gladiator: gladiator,
  'Avatar: The Way of Water': avatar,
  Joker: joker,
  'Spider-Man: No Way Home': spiderMan,
  Parasite: parasite,
}

/** Returns the poster image URL for a film title, or undefined if none. */
export const posterFor = (title: string): string | undefined => POSTER_MAP[title]
