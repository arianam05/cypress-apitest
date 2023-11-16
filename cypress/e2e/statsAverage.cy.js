/// <reference types="Cypress"/>

import { validateStatusCode, getDataWithFilters} from "../support/helpers.js";

describe("Test for stats and average endpoint", () => {
    //We create a command , with the cy.intercept to configure and control how our application interacts with the API before every test we write
    beforeEach(() => {
      cy.interceptAPI();
    });
  
    //we create the base url so that we can only complete with the endpoint we need (cypress.config.js)
  
    it("Verify status 200 when list all stats", () => {
      //this function takes a method, an endpoint and an expected status, to send the request and validate that it responds as expected.
      //review helpers.js
      validateStatusCode("GET", "stats", 200);
    });
    it("Verify status 404 for stats", () => {
      validateStatusCode("GET", "stats2", 404);
    });
   
    it("Validate page layout and number of displayed data equal to 25 per page ", () => {
        cy.request(`${Cypress.config("baseUrl")}stats`).then((response) => {
          expect(response.status).to.eq(200);
    
          const totalPagesToTest = Math.min(response.body.meta.total_pages, 3); // validate for a maximum of two pages only
    
          // scroll through the pages
          for (let page = 1; page <= totalPagesToTest; page++) {
            cy.request(`${Cypress.config("baseUrl")}stats?page=${page}`).then(
              (pageResponse) => {
                expect(pageResponse.status).to.eq(200);
    
                // Validates that each page has a maximum of 25 players
                const statsOnPage = pageResponse.body.data.length;
                expect(statsOnPage).to.at.most(25);
    
                // Validates specific fields per player on the current page
                pageResponse.body.data.forEach((stats) => {
                  expect(stats.id).to.be.a("number");
                  expect(stats.player.id).to.be.an("number");
                  expect(stats.team.id).to.be.an("number");
                });
              }
            );
          }
        });
    });

    it('Validate avegare of the season 2018 of player id 1 ', () => {
      getDataWithFilters('season_averages','2018', null, null,'1') //function that allows to create a final url to be able to execute different filters 
        .then((response) => {
          expect(response.status).to.eq(200);
          const averages = response.body.data;
          averages.forEach((average) => {
            expect(average.season).to.eq(2018);
            expect(average.player_id).to.eq(1);
          });
      });
    });


    it('Validate no data of season avegare', () => {
      getDataWithFilters('season_averages',null, null, null,null) //function that allows to create a final url to be able to execute different filters 
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data).to.be.an('array').that.is.empty;
      });
    });

    
    //fails because it does not filter by season
    it('Validate stats of the 2018 season of player id 237 ', () => {
        getDataWithFilters('stats','2018', null, null,'237') //function that allows to create a final url to be able to execute different filters 
          .then((response) => {
            expect(response.status).to.eq(200);
            const stats = response.body.data;
            stats.forEach((stat) => {
              expect(stat.game.season).to.eq(2018);
            });
        });
    });
  
  });
