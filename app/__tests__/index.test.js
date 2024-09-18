import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "../testpage/page";

describe("Home", () => {
  it("renders a heading", () => {
    render(<Home />);

    const heading = screen.getByRole("heading", { level: 1 });
    const pElement = screen.getByText("HELLO");
    expect(pElement).toBeInTheDocument();

    expect(heading).toBeInTheDocument();
  });
});
