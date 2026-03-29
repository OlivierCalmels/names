import { displayPrenom } from "./prenomDisplay";

describe("displayPrenom", () => {
  test("met une capitale initiale, reste en minuscules", () => {
    expect(displayPrenom("JEAN")).toBe("Jean");
    expect(displayPrenom("marie")).toBe("Marie");
  });

  test("trait d’union : chaque partie est capitalisée", () => {
    expect(displayPrenom("MARIE-CLAIRE")).toBe("Marie-Claire");
  });

  test("valeurs vides", () => {
    expect(displayPrenom(null)).toBe("—");
    expect(displayPrenom("")).toBe("—");
  });

  test("prénoms techniques INSEE inchangés", () => {
    expect(displayPrenom("_PRENOMS_RARES")).toBe("_PRENOMS_RARES");
  });
});
