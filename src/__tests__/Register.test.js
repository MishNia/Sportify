import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../../src/pages/Register";

//Mocking useNavigate globally
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate, // Mock useNavigate
}));

describe("Register Page Unit Tests", () => {
  it("should render the register form correctly", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("should allow user to enter email and validate input", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
    
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(screen.queryByText("Please enter a valid email address.")).not.toBeInTheDocument();
  });

  it("should allow user to enter password and validate input", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "weak" } });
    expect(screen.getByText("Password must be at least 8 characters long, include an uppercase, lowercase, number, and a special character.")).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: "ValidPass1!" } });
    expect(screen.queryByText("Password must be at least 8 characters long, include an uppercase, lowercase, number, and a special character.")).not.toBeInTheDocument();
  });

  it("should validate confirm password field", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm your password");
    
    fireEvent.change(passwordInput, { target: { value: "ValidPass1!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "DifferentPass2@" } });
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    
    fireEvent.change(confirmPasswordInput, { target: { value: "ValidPass1!" } });
    expect(screen.queryByText("Passwords do not match.")).not.toBeInTheDocument();
  });

  it("should navigate to /Profile when Register button is clicked", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    
    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    fireEvent.change(passwordInput, { target: { value: "ValidPass1!" } });
    
    const confirmPasswordInput = screen.getByPlaceholderText("Confirm your password");
    fireEvent.change(confirmPasswordInput, { target: { value: "ValidPass1!" } });
    
    const registerButton = screen.getByRole("button", { name: /Register/i });
    fireEvent.click(registerButton);
    expect(mockNavigate).toHaveBeenCalledWith("/Profile");
  });
});