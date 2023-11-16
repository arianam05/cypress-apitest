/// <reference types="Cypress"/>

import { validateStatusCode, getDataWithFilters} from "../support/helpers.js";

describe("Test for games endpoint", () => {
    //We create a command , with the cy.intercept to configure and control how our application interacts with the API before every test we write
    beforeEach(() => {
      cy.interceptAPI();
    });
  
    //we create the base url so that we can only complete with the endpoint we need (cypress.config.js)
  
    it("Verify status 200 when list all games", () => {
      //this function takes a method, an endpoint and an expected status, to send the request and validate that it responds as expected.
      //review helpers.js
      validateStatusCode("GET", "games", 200);
    });
    it("Verify status 404 for teams", () => {
      validateStatusCode("GET", "games2", 404);
    });
  
    it('validate response when searching for a non-existent game', () => {
        const gameId = 99999; // ID de un equipo que no existe
    
        cy.request({
          url: `${Cypress.config("baseUrl")}games/${gameId}`,
          failOnStatusCode: false //we use this because we tell Cypress not to stop the test execution if the status code does not match the expected one.
          //This allows the .then() block to handle validation of the status code.
        }).then((response) => {
          // Verificar que el código de status indique que no se encontró el equipo
          expect(response.status).to.be.oneOf([404, 400]); 
          cy.log(`No information found for equipment with ID: ${gameId}`);
          cy.log(`Status code: ${response.status}`);
          cy.log('Response body:', response.body);
        });
      });
   
      it("Validate page layout and number of displayed data equal to 25 per page ", () => {
        cy.request(`${Cypress.config("baseUrl")}games`).then((response) => {
          expect(response.status).to.eq(200);
    
          const totalPagesToTest = Math.min(response.body.meta.total_pages, 2); // validate for a maximum of two pages only
    
          // scroll through the pages
          for (let page = 1; page <= totalPagesToTest; page++) {
            cy.request(`${Cypress.config("baseUrl")}games?page=${page}`).then(
              (pageResponse) => {
                expect(pageResponse.status).to.eq(200);
    
                // Validates that each page has a maximum of 25 players
                const gamesOnPage = pageResponse.body.data.length;
                expect(gamesOnPage).to.at.most(25);
    
                // Validates specific fields per player on the current page
                pageResponse.body.data.forEach((game) => {
                  expect(game.id).to.be.a("number");
                  expect(game.date).to.be.an("string");
                });
              }
            );
          }
        });
      });
    
      it('Validate games of the 2018 season of team_ids 2 ', () => {
        getDataWithFilters('games','2018', null, null,'2') //function that allows to create a final url to be able to execute different filters 
          .then((response) => {
            expect(response.status).to.eq(200);
            const games = response.body.data;
            games.forEach((game) => {
              expect(game.season).to.eq(2018);
            });
        });
      });

      //For this scenario I have seen that if I filter by season, date and team id, it does not filter by the exact date but by the year of the season.
      it('Validate games of the 2018 season of team_ids 2 at date 2018-10-16', () => {
        getDataWithFilters('games','2018','2018-12-08', null,'2') //function that allows to create a final url to be able to execute different filters 
          .then((response) => {
            expect(response.status).to.eq(200);
            const games = response.body.data;
            games.forEach((game) => {
              expect(game.season).to.eq(2018);
              expect(game.date).to.eq('2018-10-16')
            });
        });
      });
  
  
  });
