// cypress/support/helpers.js

/*Here we have functions that help us to validate different scenarios
This with the objective of reusing the code. 
Of course these functions can be improved as the project progresses. */

//this function takes a method, an endpoint and an expected status, to send the request and validate that it responds as expected. 
export function validateStatusCode(method, endpoint, expectedStatusCode) {
      return cy.request({
        method: method,
        url: `${Cypress.config('baseUrl')}${endpoint}`,
        failOnStatusCode: false //we use this because we tell Cypress not to stop the test execution if the status code does not match the expected one.
        //This allows the .then() block to handle validation of the status code.
      }).then((response) => {
        console.log(`Status code obtained for ${endpoint}: ${response.status}`);
        expect(response.status).to.eq(expectedStatusCode);
      });
}

//this function allows you to search for players by first or last name
export function testPlayerSearch(playerName) {
  return cy.request('GET', `${Cypress.config('baseUrl')}players?search=${playerName}`)
  .then((response) => {
    expect(response.status).to.eq(200);

    const players = response.body.data;

    if (players.length === 0) {
      cy.log(`No players were found for the term "${playerName}"`);
    } else {
    expect(players).to.have.length.greaterThan(0); // Verifies that at least one player is returned

    // for each player obtained, validate that the name or surname matches the name or surname searched for
    players.forEach((player) => {
      const firstNameMatches = player.first_name.toLowerCase().includes(playerName.toLowerCase());
      const lastNameMatches = player.last_name.toLowerCase().includes(playerName.toLowerCase());

      expect(firstNameMatches || lastNameMatches).to.be.true;

      cy.log(`player ID: ${player.id}`);
      cy.log(`player name: ${player.first_name}`);
      cy.log(`player last name: ${player.last_name}`);
      cy.log(`Team Name: ${player.team.full_name}`);
    });
  }
  });
}

//this function allows you to pass different combinations of parameters to request information of any endpoint with specific filters
export function getDataWithFilters(endpoint,season, date, teamIds,playerIds) {
  const apiUrl = `${Cypress.config('baseUrl')}${endpoint}?`;

  // Build the API URL with the provided filters
  const queryParams = [];
  if (season) queryParams.push(`season=${season}`);
  if (date) queryParams.push(`date=${date}`);
  if (teamIds) queryParams.push(`team_ids=${teamIds}`);
  if (playerIds) queryParams.push(`player_ids[]=${playerIds}`);

  const finalUrl = apiUrl + queryParams.join('&');

  // Make the request and return the promise
  return cy.request(finalUrl);
}

