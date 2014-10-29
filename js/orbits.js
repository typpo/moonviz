var LUNAR_ORBIT_DATA = [
{
  name: 'Luna 10',
  a: 2413,
  e: 0.14,
  i: 71.9,
  p: 178.05,
  link: 'https://en.wikipedia.org/wiki/Luna_10',
  year: 1966,
  country: 'Russia',
},
{
  name: 'Lunar Orbiter 1',
  a: 2694,
  e: 0.33,
  i: 12,
  p: 208.1,
  link: 'https://en.wikipedia.org/wiki/Lunar_Orbiter_1',
  year: 1966,
  country: 'USA',
},
{
  name: 'Luna 11',
  a: 2414.5,
  e: 0.22,
  i: 27,
  p: 178,
  link: 'https://en.wikipedia.org/wiki/Luna_11',
  year: 1966,
  country: 'Russia',
},
{
  name: 'Luna 12',
  a: 2404.5,
  e: 0.31,
  i: 10,
  p: 205,
  link: 'https://en.wikipedia.org/wiki/Luna_12',
  year: 1966,
  country: 'Russia',
},
{
  name: 'Lunar Orbiter 2',
  a: 2694,
  e: 0.3499999940395355,
  i: 11.899999618530273,
  p: 208.07000732421875,
  link: 'https://en.wikipedia.org/wiki/Lunar_Orbiter_2',
  year: 1966,
  country: 'USA',
},
{
  name: 'Lunar Orbiter 3',
  a: 2694,
  e: 0.33,
  i: 20.9,
  p: 208.1,
  link: 'https://en.wikipedia.org/wiki/Lunar_Orbiter_3',
  year: 1967,
  country: 'USA',
},
{
  name: 'Lunar Orbiter 4',
  a: 6152.5,
  e: 0.28,
  i: 85.5,
  p: 721,
  link: 'https://en.wikipedia.org/wiki/Lunar_Orbiter_4',
  year: 1967,
  country: 'USA',
},
{
  name: 'Explorer 35',
  a: 7886,
  e: 0.0136973,
  i: 147.3,
  p: 710,
  link: 'https://en.wikipedia.org/wiki/Explorer_35',
  year: 1967,
  country: 'USA',
},
{
  name: 'Lunar Orbiter 5',
  a: 4846.8,
  e: 0.26,
  i: 85,
  p: 510.08,
  link: 'https://en.wikipedia.org/wiki/Lunar_Orbiter_5',
  year: 1967,
  country: 'USA',
},
{
  name: 'Luna 14',
  a: 6892.8,
  e: 0.16,
  i: 42,
  p: 160,
  link: 'https://en.wikipedia.org/wiki/Luna_14',
  year: 1968,
  country: 'Russia',
},
{
  name: 'Luna 19',
  a: 1641.6,   // estimated
  e: 0.18,
  i: 40.58,
  p: 121.13,
  link: 'https://en.wikipedia.org/wiki/Luna_19',
  year: 1971,
  country: 'Russia',
},
/*
{
  name: 'Explorer 49',
  a: 2694,
  e: ,
  i: 61.3,
  p: ,
  link: 'https://en.wikipedia.org/wiki/Explorer_49',
},
*/
{
  name: 'Luna 22',
  a: 6598.3,
  e: 0.18,
  i: 19.35,
  p: 130,
  link: 'https://en.wikipedia.org/wiki/Luna_22',
  year: 1974,
  country: 'Russia',
},
{
  name: 'Apollo 8',
  a: 1626.28, // estimated
  i: 12,
  p: 120,
  link: 'https://en.wikipedia.org/wiki/Apollo_8',
  year: 1968,
  country: 'USA',
  manned: true,
},
{
  name: 'Apollo 10',
  i: 1.2,
  p: 120,
  peri: 109.6,
  apo: 113,
  link: 'https://en.wikipedia.org/wiki/Apollo_10',
  year: 1969,
  country: 'USA',
  manned: true,
},
{
  name: 'Apollo 11',
  i: 1.25,
  p: 120,
  peri: 100.9,
  apo: 122.4,
  link: 'https://en.wikipedia.org/wiki/Apollo_11',
  year: 1969,
  country: 'USA',
  manned: true,
},
{
  name: 'Apollo 12',
  i: 0, // unknown
  p: 120, // estimated
  peri: 101.10,
  apo: 122.42,
  link: 'https://en.wikipedia.org/wiki/Apollo_12',
  year: 1969,
  country: 'USA',
  manned: true,
},
{
  name: 'Apollo 14',
  i: 0, // unknown
  p: 132.884, // estimated
  peri: 16.9,
  apo: 108.9,
  link: 'https://en.wikipedia.org/wiki/Apollo_14',
  year: 1971,
  country: 'USA',
  manned: true,
},
{
  name: 'Apollo 15',
  i: 23,
  p: 136.445, // estimated
  peri: 101.5,
  apo: 120.8,
  link: 'https://en.wikipedia.org/wiki/Apollo_15',
  year: 1971,
  country: 'USA',
  manned: true,
},
// https://en.wikipedia.org/wiki/PFS-1#Lunar_subsatellite
{
  name: 'Apollo 16',
  i: 0, // unknown
  p: 136, // estimated
  peri: 20.2,
  apo: 108.3,
  link: 'https://en.wikipedia.org/wiki/Apollo_16',
  year: 1972,
  manned: true,
  country: 'USA',
},
// https://en.wikipedia.org/wiki/PFS-2#Lunar_subsatellite_PFS-2
// https://en.wikipedia.org/wiki/Apollo_17
{
  name: 'Apollo 17',
  i: 0, // unknown
  p: 133.268, // estimated
  peri: 26.9,
  apo: 109.3,
  link: 'https://en.wikipedia.org/wiki/Apollo_17',
  year: 1972,
  country: 'USA',
  manned: true,
},
// https://en.wikipedia.org/wiki/Hiten
// https://en.wikipedia.org/wiki/Clementine_(spacecraft)
{
  name: 'Lunar Prospector',
  a: 1597.82, // estimated
  e: 0.00046,
  i: 90.55,
  p: 117.9,
  link: 'https://en.wikipedia.org/wiki/Lunar_Prospector',
  year: 1998,
  country: 'USA',
},
{
  name: 'SMART-1',
  a: 4025.05,  // estimated
  e: 0.352054,
  i: 90.26,
  p: 297,
  link: 'https://en.wikipedia.org/wiki/SMART-1',
  year: 2004,
  country: 'EU',
},
{
  name: 'SELENE',
  i: 90, // unknown
  p: 120,
  peri: 100,
  apo: 100,
  link: 'https://en.wikipedia.org/wiki/SELENE',
  year: 2007,
  country: 'Japan',
},
{
  name: 'Change\'e 1',
  i: 64, // unknown
  p: 127, // estimated
  peri: 200,
  apo: 200,
  link: 'https://en.wikipedia.org/wiki/Chang%27e_1',
  year: 2007,
  country: 'China',
},
/*
{
  name: 'Change\'e 2',
  i: 64, // unknown
  p: 127, // estimated
  peri: 200,
  apo: 200,
  link: 'https://en.wikipedia.org/wiki/Chang%27e_2',
  year: 2010,
  country: 'China',
},
*/
{
  name: 'Chandrayaan-1',
  i: 0, // unknown
  peri: 200,
  apo: 200,
  link: 'https://en.wikipedia.org/wiki/Chandrayaan-1',
  year: 2009,
  country: 'India',
},
{
  name: 'Lunar Reconnaissance Orbiter',
  i: 0, // unknown
  peri: 30,
  apo: 216,
  link: 'https://en.wikipedia.org/wiki/Lunar_Reconnaissance_Orbiter',
  year: 2009,
  country: 'USA',
},
// https://en.wikipedia.org/wiki/THEMIS#ARTEMIS
// https://en.wikipedia.org/wiki/Gravity_Recovery_and_Interior_Laboratory
{
  name: 'LADEE',
  a: 1531.42, // estimated
  i: 157,
  p: 113,
  link: 'https://en.wikipedia.org/wiki/Lunar_Atmosphere_and_Dust_Environment_Explorer',
  year: 2013,
  state: 'CURRENT',
  country: 'USA',
},
// TODO add proposed missions http://en.wikipedia.org/wiki/List_of_proposed_missions_to_the_Moon
];

(function() {
  for (var i=0; i < LUNAR_ORBIT_DATA.length; i++) {
    var data = LUNAR_ORBIT_DATA[i];
    // Fill in estimates for semi-major axis, period, and eccentricity.
    if (!data.a) {
      data.a = (data.peri + data.apo + 3476)/2;
    }
    if (!data.p) {
      data.p = data.a * 0.07378781599;
    }
    if (!data.e) {
      if (data.apo && data.peri) {
        data.e = 1 - (2/((data.apo/data.peri) + 1))
      } else {
        data.e = 0;
      }
    }
  }
})();
