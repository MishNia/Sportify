import React from "react";
import Register from "../../src/pages/Register";
import { mount } from "cypress/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Profile from "../../src/pages/Profile";
import Login from "../../src/pages/Login";

describe("Register Component Tests", () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={["/Register"]}>
        <Routes>
          <Route path="/Register" element={<Register />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
        <button onClick={() => setPath("/login")}>Force Navigation</button>
      </MemoryRouter>
    );
  });

  it("should render the Register page correctly", () => {
    cy.contains("Sign Up").should("be.visible");
    cy.get("input[placeholder='Enter your email']").should("exist");
    cy.get("input[placeholder='Enter your password']").should("exist");
    cy.get("input[placeholder='Confirm your password']").should("exist");
    cy.contains("Register").should("be.visible");
  });

  it("should allow user to type in email, password, and confirm password", () => {
    cy.get("input[placeholder='Enter your email']").type("test@example.com");
    cy.get("input[placeholder='Enter your password']").type("Test@123");
    cy.get("input[placeholder='Confirm your password']").type("Test@123");

    cy.get("input[placeholder='Enter your email']").should("have.value", "test@example.com");
    cy.get("input[placeholder='Enter your password']").should("have.value", "Test@123");
    cy.get("input[placeholder='Confirm your password']").should("have.value", "Test@123");
  });

  it("should show validation error for invalid email", () => {
    cy.get("input[placeholder='Enter your email']").type("invalidemail");
    cy.get("p").contains("Please enter a valid email address.").should("be.visible");
  });

  it("should show validation error for weak password", () => {
    cy.get("input[placeholder='Enter your password']").type("weakpass");
    cy.get("p").contains("Password must be at least 8 characters").should("be.visible");
  });

  it("should show error when passwords do not match", () => {
    cy.get("input[placeholder='Enter your password']").type("Test@123");
    cy.get("input[placeholder='Confirm your password']").type("WrongPass");
    cy.get("p").contains("Passwords do not match.").should("be.visible");
  });

  it("should disable Register button if form is incomplete or invalid", () => {

    cy.get(".button").should("be.disabled"); // Button should be disabled initially

    cy.get("input[placeholder='Enter your email']").type("sonika@example.com");
    cy.get("input[placeholder='Enter your password']").type("Testing@123");
    cy.get("input[placeholder='Confirm your password']").type("Testing@123");

    cy.get(".button").should("not.be.disabled"); // Button should be enabled when form is valid
  });

  it("should navigate to /Profile when Register button is clicked", () => {
    

    cy.get("input[placeholder='Enter your email']").type("sonika@example.com");
    cy.get("input[placeholder='Enter your password']").type("Testing@123");
    cy.get("input[placeholder='Confirm your password']").type("Testing@123");

    cy.get(".button").click();
    
  });

  it("should navigate to /login when 'Log in here' is clicked", () => {
    

    cy.contains("Log in here").click();
    cy.location("pathname").should("eq", "/login");
    

  
  });
});