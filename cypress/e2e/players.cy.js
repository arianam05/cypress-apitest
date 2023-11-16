/// <reference types="Cypress"/>
import { validateStatusCode, testPlayerSearch } from "../support/helpers.js";

describe("Test for players endpoint", () => {
  //We create a command , with the cy.intercept to configure and control how our application interacts with the API before every test we write
  beforeEach(() => {
    cy.interceptAPI();
  });

  //we create the base url so that we can only complete with the endpoint we need (cypress.config.js)

  it("Verify status 200 when list all players", () => {
    //this function takes a method, an endpoint and an expected status, to send the request and validate that it responds as expected.
    //review helpers.js
    validateStatusCode("GET", "players", 200);
  });
  it("Verify status 404 for players", () => {
    validateStatusCode("GET", "players2", 404);
  });

  // this function searches for players by the first or last name entered and displays the list of matches.
  it("validate players are found", () => {
    testPlayerSearch("davis");
  });
  it("validate when no players are obtained ", () => {
    testPlayerSearch("salud");
  });

  it("Validate page layout and number of displayed data equal to 25 per page ", () => {
    cy.request(`${Cypress.config("baseUrl")}players`).then((response) => {
      expect(response.status).to.eq(200);

      const totalPagesToTest = Math.min(response.body.meta.total_pages, 2); // validate for a maximum of two pages only

      // scroll through the pages
      for (let page = 1; page <= totalPagesToTest; page++) {
        cy.request(`${Cypress.config("baseUrl")}players?page=${page}`).then(
          (pageResponse) => {
            expect(pageResponse.status).to.eq(200);

            // Validates that each page has a maximum of 25 players
            const playersOnPage = pageResponse.body.data.length;
            expect(playersOnPage).to.eq(25);

            // Validates specific fields per player on the current page
            pageResponse.body.data.forEach((player) => {
              expect(player.id).to.be.a("number");
              expect(player.team).to.be.an("object");
              expect(player.first_name).to.be.a("string");
            });
          }
        );
      }
    });
  });

  it("Validate response for player with complete data", () => {
    cy.fixture("playerResponse").then((playerResponse) => {
      const playerId = 237; // Specific player ID

      cy.request(`${Cypress.config("baseUrl")}players/${playerId}`).then(
        (response) => {
          expect(response.status).to.eq(200);

          // Compare the response obtained with the reference object
          expect(response.body).to.deep.eq(playerResponse);
        }
      );
    });
  });

  it("Validate response for player with null data", () => {
    cy.fixture("noAllData").then((noAllData) => {
      const playerId = 535; // Specific player ID

      cy.request(`${Cypress.config("baseUrl")}players/${playerId}`).then(
        (response) => {
          expect(response.status).to.eq(200);

          // Compare the response obtained with the reference object
          expect(response.body).to.deep.eq(noAllData);

          // Validate if null values exist in height_feet, height_inches or weight_pounds
          const { height_feet, height_inches, weight_pounds } = response.body;
          if (
            height_feet === null ||
            height_inches === null ||
            weight_pounds === null
          ) {
            cy.log(
              "The player has no values registered for height_feet, height_inches or weight_pounds"
            );
          }
        }
      );
    });
  });


});
