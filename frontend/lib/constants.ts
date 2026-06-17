export const SCHOOL_MAP = {
  "ug-legon": { name: "University of Ghana, Legon", short: "UG Legon", locationQuery: "legon" },
  "knust": { name: "Kwame Nkrumah University of Science and Technology", short: "KNUST", locationQuery: "knust" },
  "ucc": { name: "University of Cape Coast", short: "UCC", locationQuery: "cape coast" },
  "upsa": { name: "University of Professional Studies, Accra", short: "UPSA", locationQuery: "upsa" },
  "ttu": { name: "Takoradi Technical University", short: "TTU", locationQuery: "Takoradi Technical University" },
  "uds": { name: "University for Development Studies", short: "UDS", locationQuery: "uds tamale" },
  "uhas": { name: "University of Health and Allied Sciences", short: "UHAS", locationQuery: "uhas ho" },
  "uew": { name: "University of Education, Winneba", short: "UEW", locationQuery: "uew winneba" },
  "umat": { name: "University of Mines and Technology", short: "UMaT", locationQuery: "umat tarkwa" },
};

export const SCHOOLS = Object.entries(SCHOOL_MAP).map(([slug, school]) => ({
  slug,
  ...school
}));

export function getSchoolBySlug(slug: string) {
  return SCHOOL_MAP[slug as keyof typeof SCHOOL_MAP];
}
