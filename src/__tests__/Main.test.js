import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Main from "../../src/pages/Main";

// ✅ Mock useNavigate globally
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate, // Mock useNavigate
}));

describe("Main Page Unit Tests", () => {
  it("should render the main page correctly", () => {
    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );
    
    expect(screen.getAllByText("SPORT!FY")[0]).toBeInTheDocument();
    expect(
      screen.getAllByText((content, element) =>
        element.tagName.toLowerCase() !== "body" &&
        element.textContent.includes("Find Your Team") &&
        element.textContent.includes("Live Your Dream! on Sportify.")
      )[0]
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Home/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Contact/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Log In/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Get Started/i })[0]).toBeInTheDocument();
  });

  it("should navigate to /Main when Home button is clicked", () => {
    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getAllByRole("button", { name: /Home/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/Main");
  });

  it("should navigate to /Login when Log In button is clicked", () => {
    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getAllByRole("button", { name: /Log In/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/Login");
  });

  it("should navigate to /Register when Get Started button is clicked", () => {
    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getAllByRole("button", { name: /Get Started/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/Register");
  });

  it("should navigate to /Register when GET STARTED button in the body is clicked", () => {
    render(
      <MemoryRouter>
        <Main />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getAllByRole("button", { name: /GET STARTED/i })[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/Register");
  });
});