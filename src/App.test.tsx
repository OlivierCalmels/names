import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("affiche le titre du boilerplate", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /React GitHub Pages Boilerplate/i })
  ).toBeInTheDocument();
});

test("contient le lien vers le tutoriel gitname", () => {
  render(<App />);
  const link = screen.getByRole("link", { name: /gitname\/react-gh-pages/i });
  expect(link).toHaveAttribute(
    "href",
    "https://github.com/gitname/react-gh-pages"
  );
});
