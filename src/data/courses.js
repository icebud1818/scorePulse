// Add your courses here. Each course has 18 holes with pars.
// The custom-course option in the AddRound form lets users enter pars ad-hoc,
// so you only need to put your regular courses in this file.
//
// Set `par3: true` on a course to mark it as a par-3 / executive course.
// Rounds played there are still logged and viewable, but they don't count
// toward your handicap or achievements.
//
// TEES + RATINGS
// Each course lists the tees you can play from. Every tee carries the USGA
// course rating and slope rating for that tee, which the handicap calculation
// uses (differential = 113 / slope × (score − course rating)). When logging a
// round you pick the tee you played; the round stores a snapshot of that tee's
// ratings so the handicap stays correct even if this file changes later.
//
//   ⚠️  The rating/slope numbers below are PLACEHOLDERS. Replace them with the
//   real values from each course's scorecard (usgaCourseRating + slopeRating,
//   printed on the card or at ncrdb.usga.org) so your handicap is accurate.
//   Course rating is a decimal like 71.2; slope is an integer 55–155 (113 = avg).

export const COURSES = [
  {
    id: 'frog-hollow',
    name: 'Frog Hollow',
    pars: [4, 5, 3, 4, 5, 3, 4, 3, 4, 4, 5, 4, 4, 3, 4, 3, 4, 5],
    tees: [
      { id: 'blue', name: 'Blue', rating: 72.3, slope: 131 },
      { id: 'white', name: 'White', rating: 70.0, slope: 128 },
      { id: 'gold', name: 'Gold', rating: 67.3, slope: 115 },
      { id: 'red', name: 'Red', rating: 63.7, slope: 116 },
    ],
  },
  {
    id: 'back-creek',
    name: 'Back Creek',
    pars: [4, 3, 4, 4, 5, 4, 4, 3, 4, 4, 5, 4, 4, 3, 4, 5, 3, 4],
    tees: [
      { id: 'black', name: 'Black', rating: 73.7, slope: 138 },
      { id: 'blue', name: 'Blue', rating: 71.6, slope: 134 },
      { id: 'white', name: 'White', rating: 69.5, slope: 129 },
      { id: 'gold', name: 'Gold', rating: 65.4, slope: 122 },
      { id: 'red', name: 'Red', rating: 63.8, slope: 117 },
    ],
  },
  {
    id: 'st-annes',
    name: 'Saint Annes',
    pars: [4, 3, 4, 3, 5, 4, 4, 3, 5, 4, 5, 4, 3, 4, 3, 4, 5, 4],
    tees: [
      { id: 'black', name: 'Black', rating: 73.5, slope: 131 },
      { id: 'blue', name: 'Blue', rating: 71.9, slope: 126 },
      { id: 'white', name: 'White', rating: 69.7, slope: 125 },
      { id: 'gold', name: 'Gold', rating: 67.1, slope: 117 },
      { id: 'red', name: 'Red', rating: 63.0, slope: 110 },
    ],
  },
  {
    id: 'odessa-national',
    name: 'Odessa National',
    pars: [4, 5, 4, 4, 5, 3, 4, 4, 3, 4, 5, 4, 4, 4, 3, 5, 3, 4],
    tees: [
      { id: 'black', name: 'Black', rating: 73.9, slope: 135 },
      { id: 'blue', name: 'Blue', rating: 71.0, slope: 128 },
      { id: 'white', name: 'White', rating: 68.7, slope: 127 },
      { id: 'gold', name: 'Gold', rating: 66.9, slope: 124 },
      { id: 'red', name: 'Red', rating: 61.0, slope: 110 },
    ],
  },
  {
    id: 'rock-manor',
    name: 'Rock Manor',
    pars: [5, 4, 3, 4, 4, 4, 3, 4, 5, 4, 5, 3, 5, 3, 4, 4, 4, 3],
    tees: [
      { id: 'black', name: 'Black', rating: 71.1, slope: 135 },
      { id: 'white', name: 'White', rating: 68.7, slope: 131 },
      { id: 'green', name: 'Green', rating: 65.8, slope: 125 },
      { id: 'red', name: 'Red', rating: 63.4, slope: 120 },
    ],
  },
  {
    id: 'salt-pond',
    name: 'Salt Pond',
    pars: [3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3],
    par3: true,
    tees: [
      { id: 'black', name: 'Black', rating: 61.0, slope: 113 },
      { id: 'white', name: 'White', rating: 56.0, slope: 113 },
      { id: 'green', name: 'Green', rating: 54.0, slope: 113 },
    ],
  },
  {
    id: 'bear-trap-gk',
    name: 'Bear Trap Grizzly-Kodiak',
    pars: [4, 5, 4, 3, 4, 4, 4, 3, 5, 4, 4, 5, 3, 4, 4, 5, 3, 4],
    tees: [
      { id: 'gold', name: 'Gold', rating: 72.2, slope: 134 },
      { id: 'blue', name: 'Blue', rating: 70.3, slope: 130 },
      { id: 'white', name: 'White', rating: 67.8, slope: 125 },
    ],
  },
  {
    id: 'downingtown-cc',
    name: 'Downingtown Country Club',
    pars: [4, 4, 3, 4, 4, 4, 4, 5, 4, 4, 4, 3, 5, 4, 3, 5, 3, 5],
    tees: [
      { id: 'one', name: 'One', rating: 72.0, slope: 137 },
      { id: 'two', name: 'Two', rating: 70.3, slope: 133 },
      { id: 'three', name: 'Three', rating: 68.4, slope: 126 },
      { id: 'four', name: 'Four', rating: 66.5, slope: 122 },
      { id: 'five', name: 'Five', rating: 69.7, slope: 124 },
    ],
  },
  {
    id: 'delcastle',
    name: 'Delcastle',
    pars: [4, 5, 4, 4, 4, 3, 5, 4, 3, 4, 4, 4, 4, 3, 5, 4, 3, 5],
    tees: [
      { id: 'blue', name: 'Blue', rating: 70.8, slope: 121 },
      { id: 'white', name: 'White', rating: 69.4, slope: 118 },
      { id: 'gold', name: 'Gold', rating: 64.7, slope: 102 },
      { id: 'red', name: 'Red', rating: 70.8, slope: 120 },
    ],
  },
  {
    id: 'ed-oliver',
    name: 'Ed Oliver',
    pars: [4, 4, 4, 5, 3, 5, 4, 4, 3, 4, 4, 4, 3, 4, 4, 4, 3, 4],
    tees: [
      { id: 'blue', name: 'Blue', rating: 70.2, slope: 132 },
      { id: 'white', name: 'White', rating: 69.2, slope: 130 },
      { id: 'gold', name: 'Gold', rating: 66.8, slope: 125 },
      { id: 'red', name: 'Red', rating: 62.9, slope: 118 },
    ],
  },
  // Example of a 9-hole course — just include 9 pars.
  // {
  //   id: 'example-9',
  //   name: 'Example Par-3 (9)',
  //   pars: [3, 3, 3, 3, 3, 3, 3, 3, 3],
  //   tees: [{ id: 'standard', name: 'Standard', rating: 34.5, slope: 108 }],
  // },
]

export function getCourse(id) {
  return COURSES.find((c) => c.id === id)
}
