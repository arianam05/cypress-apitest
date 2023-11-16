/// <reference types="Cypress"/>


import { validateStatusCode } from "../support/helpers.js";

describe("Test for teams endpoint", () => {
  //We create a command , with the cy.intercept to configure and control how our application interacts with the API before every test we write
  beforeEach(() => {
    cy.interceptAPI();
  });

  //we create the base url so that we can only complete with the endpoint we need (cypress.config.js)

  it("Verify status 200 when list all teams", () => {
    //this function takes a method, an endpoint and an expected status, to send the request and validate that it responds as expected.
    //review helpers.js
    validateStatusCode("GET", "teams", 200);
  });
  it("Verify status 404 for teams", () => {
    validateStatusCode("GET", "teams2", 404);
  });

  it("Validate page layout and number of displayed data equal to 30 per page ", () => {
    cy.request(`${Cypress.config("baseUrl")}teams`).then((response) => {
      expect(response.status).to.eq(200);

      const totalPagesToTest = Math.min(response.body.meta.total_pages, 2); // validate for a maximum of two pages only

      // scroll through the pages
      for (let page = 1; page <= totalPagesToTest; page++) {
        cy.request(`${Cypress.config("baseUrl")}teams?page=${page}`).then(
          (pageResponse) => {
            expect(pageResponse.status).to.eq(200);

            // Validates that each page has a maximum of 25 players
            const teamsOnPage = pageResponse.body.data.length;
            expect(teamsOnPage).to.at.most(30);

            // Validates specific fields per player on the current page
            pageResponse.body.data.forEach((team) => {
              expect(team.id).to.be.a("number");
              expect(team.full_name).to.be.an("string");
            });
          }
        );
      }
    });
  });

  it('validate response when searching for a specific existing team', () => {
    const teamId = 14; // ID of an existing team

    cy.request(`${Cypress.config("baseUrl")}teams/${teamId}`)
      .then((response) => {
        if (response.status === 200) {
          //If information is found, validate expected fields
          expect(response.body).to.have.property('id');
          expect(response.body).to.have.property('full_name');
          expect(response.body).to.have.property('city');
        } else {
          // If no information is found, display the response and status code.
          cy.log(`No information found for equipment with ID: ${teamId}`);
          cy.log(`Status code: ${response.status}`);
          cy.log('Response body:', response.body);
        }
      });
  });

  it('validate response when searching for a non-existent team', () => {
    const teamId = 9999; // ID de un equipo que no existe

    cy.request({
      url: `${Cypress.config("baseUrl")}teams/${teamId}`,
      failOnStatusCode: false //we use this because we tell Cypress not to stop the test execution if the status code does not match the expected one.
      //This allows the .then() block to handle validation of the status code.
    }).then((response) => {
      // Verificar que el código de status indique que no se encontró el equipo
      expect(response.status).to.be.oneOf([404, 400]); 
      cy.log(`No information found for equipment with ID: ${teamId}`);
      cy.log(`Status code: ${response.status}`);
      cy.log('Response body:', response.body);
    });
  });

  
 



});
