// Add your courses here. Each course has 18 holes with pars.
// The custom-course option in the AddRound form lets users enter pars ad-hoc,
// so you only need to put your regular courses in this file.

export const COURSES = [
  {
    id: 'frog-hollow',
    name: 'Frog Hollow (18)',
    pars: [4, 5, 3, 4, 5, 3, 4, 3, 4, 4, 5, 4, 4, 3, 4, 3, 4, 5],
  },
  {
    id: 'back-creek',
    name: 'Back Creek (18)',
    pars: [4, 3, 4, 4, 5, 4, 4, 3, 4, 4, 5, 4, 4, 3, 4, 5, 3, 4],
  },
  {
    id: 'st-annes',
    name: 'Saint Annes (18)',
    pars: [4, 3, 4, 3, 5, 4, 4, 3, 5, 4, 5, 4, 3, 4, 3, 4, 5, 4],
  },
  {
    id: 'odessa-national',
    name: 'Odessa National (18)',
    pars: [4, 5, 4, 4, 5, 3, 4, 4, 3, 4, 5, 4, 4, 4, 3, 5, 3, 4],
  },
  {
    id: 'rock-manor',
    name: 'Rock Manor (18)',
    pars: [5, 4, 3, 4, 4, 4, 3, 4, 5, 4, 5, 3, 5, 3, 4, 4, 4, 3],
  },
  {
    id: 'salt-pond',
    name: 'Salt Pond (18)',
    pars: [3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3],
  },
  {
    id: 'bear-trap-gk',
    name: 'Bear Trap Grizzly-Kodiak (18)',
    pars: [4, 5, 4, 3, 4, 4, 4, 3, 5, 4, 4, 5, 3, 4, 4, 5, 3, 4],
  },
  {
    id: 'downingtown-cc',
    name: 'Downingtown Country Club (18)',
    pars: [4, 4, 3, 4, 4, 4, 4, 5, 4, 4, 4, 3, 5, 4, 3, 5, 3, 5],
  },
  {
    id: 'delcastle',
    name: 'Delcastle (18)',
    pars: [4, 5, 4, 4, 4, 3, 5, 4, 3, 4, 4, 4, 4, 3, 5, 4, 3, 5],
  },
  {
    id: 'ed-oliver',
    name: 'Ed Oliver (18)',
    pars: [4, 4, 4, 5, 3, 5, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 3, 4],
  },
  // Example of a 9-hole course — just include 9 pars.
  // {
  //   id: 'example-9',
  //   name: 'Example Par-3 (9)',
  //   pars: [3, 3, 3, 3, 3, 3, 3, 3, 3],
  // },
]

export function getCourse(id) {
  return COURSES.find((c) => c.id === id)
}
