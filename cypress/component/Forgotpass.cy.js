import React from "react";
import { mount } from "cypress/react";
import Forgotpass from "../../src/pages/Forgotpass";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../../src/pages/Login";

describe("Forgot Password Page Unit Tests", () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={["/Forgotpass"]}>
        <Routes>
          <Route path="/Forgotpass" element={<Forgotpass />} />
          <Route path="/Login" element={<Login />} />
        </Routes>
        <button onClick={() => setPath("/login")}>Force Navigation</button>
      </MemoryRouter>
    );
  });

  it("should render the forgot password form correctly", () => {
    cy.contains("Reset Password").should("exist");
    cy.get("input[name='email']").should("exist");
    cy.contains("Cancel").should("exist");
    cy.contains("Reset Password").should("exist");
  });

  it("should allow user to enter email", () => {
    cy.get("input[name='email']").type("test@example.com").should("have.value", "test@example.com");
  });

  it("should show alert when reset password is clicked", () => {
    cy.get("input[name='email']").type("test@example.com");
    cy.get("button").contains("Reset Password").click();
    cy.on("window:alert", (text) => {
      expect(text).to.contains("Password reset link has been sent to your email.");
    });
  });

  it("should navigate to /login when 'Cancel' is clicked", () => {
    cy.get("button").contains("Cancel").click();
  });
});
