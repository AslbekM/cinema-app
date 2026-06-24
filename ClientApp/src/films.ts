// Lightweight film metadata keyed by title (shown on the screening page).
export interface FilmMeta {
  genre: string
  duration: string
  rating: string
  synopsis: string
}

const FILMS: Record<string, FilmMeta> = {
  Inception: {
    genre: 'Sci-Fi · Thriller',
    duration: '2h 28m',
    rating: 'PG-13',
    synopsis:
      'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a target’s mind.',
  },
  'The Dark Knight': {
    genre: 'Action · Crime',
    duration: '2h 32m',
    rating: 'PG-13',
    synopsis:
      'Batman raises the stakes in his war on crime as he faces the Joker, an agent of chaos who plunges Gotham into anarchy.',
  },
  Interstellar: {
    genre: 'Sci-Fi · Drama',
    duration: '2h 49m',
    rating: 'PG-13',
    synopsis:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
  },
  'Dune: Part Two': {
    genre: 'Sci-Fi · Adventure',
    duration: '2h 46m',
    rating: 'PG-13',
    synopsis:
      'Paul Atreides unites with the Fremen to wage war against the House Harkonnen and avenge his family.',
  },
  Oppenheimer: {
    genre: 'Biography · Drama',
    duration: '3h 00m',
    rating: 'R',
    synopsis:
      'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
  },
  Barbie: {
    genre: 'Comedy · Fantasy',
    duration: '1h 54m',
    rating: 'PG-13',
    synopsis:
      'Barbie suffers a crisis that leads her to question her world and her existence, journeying into the real world.',
  },
  'The Matrix': {
    genre: 'Sci-Fi · Action',
    duration: '2h 16m',
    rating: 'R',
    synopsis:
      'A hacker learns the shocking truth about his reality and his role in the war against its controllers.',
  },
  'Pulp Fiction': {
    genre: 'Crime · Drama',
    duration: '2h 34m',
    rating: 'R',
    synopsis:
      'The lives of two mob hitmen, a boxer, and others intertwine in four tales of violence and redemption.',
  },
  'The Godfather': {
    genre: 'Crime · Drama',
    duration: '2h 55m',
    rating: 'R',
    synopsis:
      'The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.',
  },
  'Forrest Gump': {
    genre: 'Drama · Romance',
    duration: '2h 22m',
    rating: 'PG-13',
    synopsis:
      'The presidencies, wars, and history of decades unfold through the perspective of an Alabama man with a kind heart.',
  },
  Gladiator: {
    genre: 'Action · Drama',
    duration: '2h 35m',
    rating: 'R',
    synopsis:
      'A betrayed Roman general rises through the gladiatorial arena to avenge the murder of his family and emperor.',
  },
  'Avatar: The Way of Water': {
    genre: 'Sci-Fi · Adventure',
    duration: '3h 12m',
    rating: 'PG-13',
    synopsis:
      'Jake Sully and Neytiri must protect their family when an ancient threat returns to Pandora.',
  },
  Joker: {
    genre: 'Crime · Drama',
    duration: '2h 02m',
    rating: 'R',
    synopsis:
      'A failed comedian descends into madness and mayhem, becoming an icon of chaos in Gotham City.',
  },
  'Spider-Man: No Way Home': {
    genre: 'Action · Adventure',
    duration: '2h 28m',
    rating: 'PG-13',
    synopsis:
      'When his identity is revealed, Spider-Man asks Doctor Strange for help — and tears open the multiverse.',
  },
  Parasite: {
    genre: 'Thriller · Drama',
    duration: '2h 12m',
    rating: 'R',
    synopsis:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between two families.',
  },
}

export const filmMeta = (title: string): FilmMeta | undefined => FILMS[title]
