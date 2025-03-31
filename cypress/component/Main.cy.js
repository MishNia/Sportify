import React from "react";
import { mount } from "cypress/react";
import Main from "../../src/pages/Main";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../../src/pages/Login";
import Register from "../../src/pages/Register";

describe("Main Page Unit Tests", () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={["/Main"]}>
              <Routes>
                <Route path="/Main" element={<Main/>} />
                <Route path="/Register" element={<Register />} />
                <Route path="/Login" element={<Login />} />
              </Routes>
              <button onClick={() => setPath("/login")}>Force Navigation</button>
            </MemoryRouter>
    );
  });

  it("should render the navigation bar correctly", () => {
    cy.contains("SPORT!FY").should("exist");
    cy.get("button").contains("Home").should("exist");
    cy.get("button").contains("Contact").should("exist");
    cy.get("button").contains("Log In").should("exist");
    cy.get("button").contains("Get Started").should("exist");
  });

  it("should navigate to Login when 'Log In' button is clicked", () => {
    cy.get("button").contains("Log In").click();
  });

  it("should navigate to Register when 'Get Started' button is clicked", () => {
    cy.get("button").contains("Get Started").click();
  });

  it("should navigate to Register when 'GET STARTED' button in the body is clicked", () => {
    cy.get("button#but5").click();
  });
});
