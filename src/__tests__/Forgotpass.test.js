import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Forgotpass from "../../src/pages/Forgotpass";


const mockNavigate = jest.fn();
// Mocking useNavigate properly at the top level
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
  }));

describe("Forgot Password Page Unit Tests", () => {
  it("should render the forgot password form correctly", () => {
    render(
      <MemoryRouter>
        <Forgotpass />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Reset Password/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should allow user to enter email", () => {
    render(
      <MemoryRouter>
        <Forgotpass />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    expect(emailInput.value).toBe("test@example.com");
  });

  it("should show alert when reset password is clicked", () => {
    
    jest.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Forgotpass />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    
    const resetButton = screen.getByRole("button", { name: /Reset Password/i });
    fireEvent.click(resetButton);

    expect(window.alert).toHaveBeenCalledWith("Password reset link has been sent to your email.");

    
    window.alert.mockRestore();
  });

  it("should navigate to /login when 'Cancel' is clicked", () => {
    

    render(
      <MemoryRouter>
        <Forgotpass />
      </MemoryRouter>
    );

    
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
