import React from "react";
import { mount } from "cypress/react";
import Profile from "../../src/pages/Profile";
import Home from "../../src/pages/Home";
import { MemoryRouter, Route, Routes } from "react-router-dom";

describe("Profile Component Unit Tests", () => {
  beforeEach(() => {
    mount(
        <MemoryRouter initialEntries={["/Profile"]}>
        <Routes>
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Home" element={<Home />} />
        </Routes>
      </MemoryRouter>
    );
  });

  it("should render the profile form correctly", () => {
    cy.contains("Profile").should("exist");
    cy.get("input[name='first_name']").should("exist");
    cy.get("input[name='last_name']").should("exist");
    cy.get("input[name='age']").should("exist");
    cy.get("select[name='gender']").should("exist");
    cy.contains("Select Sports").should("exist");
  });

  it("should allow user to enter text inputs", () => {
    cy.get("input[name='first_name']").type("John").should("have.value", "John");
    cy.get("input[name='last_name']").type("Doe").should("have.value", "Doe");
    cy.get("input[name='age']").type("25").should("have.value", "025");
  });

  it("should allow user to select gender", () => {
    cy.get("select[name='gender']").select("Male").should("have.value", "Male");
  });

  it("should open and close sports dropdown", () => {
    cy.get(".dropdown-button").click();
    cy.get(".dropdown-content").should("be.visible");
    cy.get(".dropdown-button").click();
    cy.get(".dropdown-content").should("not.exist");
  });

  it("should allow user to select and deselect sports preferences", () => {
    cy.get(".dropdown-button").click();
    cy.get("input[type='checkbox']").first().check().should("be.checked");
    cy.get("input[type='checkbox']").first().uncheck().should("not.be.checked");
  });

  // it("should submit the form and navigate to /home", () => {
  //   cy.get("input[name='firstName']").type("John");
  //   cy.get("input[name='lastName']").type("Doe");
  //   cy.get("input[name='age']").type("25");
  //   cy.get("select[name='gender']").select("Male");
  //   cy.get(".profile-button").click();
  // });
});
