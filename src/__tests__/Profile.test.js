import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../../src/pages/Profile";
import Home from "../../src/pages/Home"

//Mocking useNavigate globally
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate, // Mock useNavigate
}));

describe("Profile Page Unit Tests", () => {
  it("should render the profile form correctly", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    
    expect(screen.getByPlaceholderText("Enter first name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter last name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter age")).toBeInTheDocument();
    expect(screen.getByText("Select Gender")).toBeInTheDocument();
    expect(screen.getByText("Select Sports ▾")).toBeInTheDocument();
  });

  it("should allow user to enter profile details", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    
    const firstNameInput = screen.getByPlaceholderText("Enter first name");
    fireEvent.change(firstNameInput, { target: { value: "John" } });
    expect(firstNameInput.value).toBe("John");
    
    const lastNameInput = screen.getByPlaceholderText("Enter last name");
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    expect(lastNameInput.value).toBe("Doe");
    
    const ageInput = screen.getByPlaceholderText("Enter age");
    fireEvent.change(ageInput, { target: { value: "25" } });
    expect(ageInput.value).toBe("25");
  });

  it("should allow user to select gender", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    
    const genderSelect = screen.getByRole("combobox");
    fireEvent.change(genderSelect, { target: { value: "Male" } });
    expect(genderSelect.value).toBe("Male");
  });

  it("should open and close sports dropdown", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    
    const dropdownButton = screen.getByText("Select Sports ▾");
    fireEvent.click(dropdownButton);
    expect(screen.getByText("Football")).toBeInTheDocument();
    
    fireEvent.click(dropdownButton);
    expect(screen.queryByText("Football")).not.toBeInTheDocument();
  });

  it("should allow user to select and deselect sports preferences", () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByText("Select Sports ▾"));
    const checkbox = screen.getByLabelText("Football");
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it("should navigate to /home when form is submitted", async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  
    // Fill all required fields
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Enter first name"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Enter last name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Enter age"), { target: { value: "25" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Male" } });
  
    // Click submit button
    const submitButton = screen.getByRole("button", { name: /Let's Play/i });
    fireEvent.click(submitButton);
  
    expect(mockNavigate).toHaveBeenCalledWith("/Home");
  });
});