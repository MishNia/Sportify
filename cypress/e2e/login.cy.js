describe("Login Page Tests", () => {
    beforeEach(() => {
      cy.visit("http://localhost:3000/login"); // Adjust URL if necessary
    });
  
    it("should load the login page successfully", () => {
      cy.contains("Sign in").should("be.visible");
      cy.contains("SPORT!FY").should("be.visible");
    });
  
    it("should allow user to enter email and password", () => {
      cy.get("input[type='email']").type("sonika@example.com").should("have.value", "sonika@example.com");
      cy.get("input[type='password']").type("Sonika@123").should("have.value", "Sonika@123");
    });
  
    it("should navigate to home page on login button click", () => {
      cy.get("input[type='email']").type("sonika@example.com");
      cy.get("input[type='password']").type("Sonika@123");
      cy.get(".login-button").click();
      
      cy.url().should("include", "/home");
    });
  
    it("should navigate to register page on 'Click here' click", () => {
      cy.contains("Click here").click();
      cy.url().should("include", "/register");
    });
  
    it("should navigate to forgot password page on 'Forgot password' click", () => {
      cy.contains("forgot password").click();
      cy.url().should("include", "/forgotpass");
    });
  });
  