import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

jest.mock("./sqlAssets", () => ({
  SQLJS_PACKAGE_VERSION: "1.14.1",
  initSqlFromWasm: jest.fn(async () => ({
    Database: class MockDb {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      constructor(_data?: ArrayLike<number>) {}
      close() {}
    },
  })),
  fetchBirthsDatabase: jest.fn(async () => {
    const buf = new ArrayBuffer(64);
    const enc = new TextEncoder().encode("SQLite format 3");
    new Uint8Array(buf).set(enc, 0);
    return buf;
  }),
}));

const mockFetch = () => {
  const impl = async (input: RequestInfo | URL) => {
    const u = String(input);
    if (u.includes("/data/prenoms")) {
      return new Response(JSON.stringify(["MARIE", "JEAN"]), { status: 200 });
    }
    if (u.includes("/data/depts")) {
      return new Response(JSON.stringify(["75", "92"]), { status: 200 });
    }
    return new Response("", { status: 404 });
  };
  return jest.fn(impl);
};

beforeEach(() => {
  global.fetch = mockFetch() as typeof fetch;
});

test("affiche le titre principal", async () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /occurrences de prénoms dans le temps/i }),
  ).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.getByLabelText(/filtres et sélection de prénoms/i)).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
