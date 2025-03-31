import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../src/pages/Login";

//Mocking useNavigate globally
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate, // Mock useNavigate
}));

describe("Login Page Unit Tests", () => {
  it("should render the login form correctly", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText("enter email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    
    expect(
      screen.getByText((content, element) =>
        element.tagName.toLowerCase() === "p" && element.textContent.includes("New user?") && element.textContent.includes("Click here")
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText((content, element) =>
        element.tagName.toLowerCase() === "p" && element.textContent.includes("forgot password")
      )
    ).toBeInTheDocument();
  });

  it("should allow user to enter email and password", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByPlaceholderText("enter email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");
    
    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput.value).toBe("password123");
  });

  it("should navigate to /home when login button is clicked", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("should navigate to /register when 'Click here' is clicked", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const registerLink = screen.getByText((content, element) =>
      element.tagName.toLowerCase() === "span" && element.textContent.includes("Click here")
    );
    fireEvent.click(registerLink);
    expect(mockNavigate).toHaveBeenCalledWith("/register");
  });

  it("should navigate to /forgotpass when 'forgot password' is clicked", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    const forgotPasswordLink = screen.getByText((content, element) =>
      element.tagName.toLowerCase() === "span" && element.textContent.includes("forgot password")
    );
    fireEvent.click(forgotPasswordLink);
    expect(mockNavigate).toHaveBeenCalledWith("/forgotpass");
  });
});