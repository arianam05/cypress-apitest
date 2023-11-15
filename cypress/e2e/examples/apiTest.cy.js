/// <reference types="Cypress"/>

describe('Pruebas basicas de api', () => {
     

it('Do get request', () => {
    
     cy.visit('https://example.cypress.io/commands/network-requests')
      // escuchamos las peticiones get a comments/1
     cy.intercept('GET', '**/comments/*').as('getComment')
    // tenemos el codigo que obtiene un comentario cuando clickeamos el boton
     cy.get('.network-btn').click()
    // usamos wait, para indicar que espere a que cargue la respuesta y asi validamos
    // podemos usar eq si queremos validar que sea exactamente un valor
     cy.wait('@getComment').its('response.statusCode').should('be.oneOf', [200, 304])
  
})

it('Do post request', () => {
    cy.visit('https://example.cypress.io/commands/network-requests')
        // escuchamos las peticiones post a comments/1
    cy.intercept('POST', '**/comments').as('postComment')
    // tenemos el codigo que publica un comentario cuando clickeamos el boton
    cy.get('.network-post').click()
    // usamos wait, para indicar que espere a que cargue la respuesta y asi validamos
    // se crea una funcion donde tendremos las validaciones tanto de request como de response
    // hay muchas validaciones que podemos hacer
    cy.wait('@postComment').should(({ request, response }) => {
        expect(request.body).to.include('email')
        expect(request.headers).to.have.property('content-type')
        expect(response && response.body).to.have.property('name', 'Using POST in cy.intercept()')
    })
    
})

it('change response', () => {
    cy.visit('https://example.cypress.io/commands/network-requests')
  //podemos modificar el response y el request para simular o mockear escenarios
  let mensaje = "Este mensaje de error lo creamos nosotros"

  //Aca haremos el cambio de respuesta con el put comment
  cy.intercept({
      method: 'PUT',
      url: '**/comments/*',
    }, {
      statusCode: 404,
      body: { error: mensaje },
      headers: { 'access-control-allow-origin': '*' },
      delayMs: 500,
    }).as('putComment')
    
    // tenemos el codigo que reemplaza un comentario cuando clickeamos el boton
    cy.get('.network-put').click()
    // aca esperamos para que intercepte y haga el cambio que hicimos 
    cy.wait('@putComment')
    
    // aca aplicamos la verificacion sobre la logica de respuesta 404
    cy.get('.network-put-comment').should('contain', mensaje)
    
})


})