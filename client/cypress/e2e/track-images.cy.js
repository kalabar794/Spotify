describe('Track Image Handling', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Intercept API calls to analyze-mood
    cy.intercept('POST', '/api/analyze-mood').as('analyzeMood');
  });

  it('should properly handle track images and fallbacks', () => {
    // Type a mood into the input
    cy.get('input[type="text"]')
      .type('I feel happy today');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call to complete
    cy.wait('@analyzeMood');
    
    // Check that track items appear
    cy.get('[data-testid="track-item"]')
      .should('be.visible')
      .should('have.length.greaterThan', 0);
    
    // Check that all track images are loaded
    cy.get('[data-testid="track-image"]').each(($img) => {
      // Check if image is loaded
      expect($img[0].naturalWidth).to.be.greaterThan(0);
    });
    
    // Test image error handling by intercepting image requests
    cy.intercept('GET', 'https://i.scdn.co/**', {
      statusCode: 404,
      body: 'Not Found'
    }).as('imageError');
    
    // Reload the page to trigger the intercepted image requests
    cy.reload();
    
    // Submit the form again
    cy.get('input[type="text"]')
      .type('I feel happy today');
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call to complete
    cy.wait('@analyzeMood');
    
    // Check that fallback images are displayed
    cy.get('[data-testid="track-image"]').each(($img) => {
      // Check if fallback image is loaded (should be a data URI)
      const src = $img.attr('src');
      expect(src).to.include('data:image/svg+xml');
    });
  });

  it('should handle various image scenarios', () => {
    // Type a mood into the input
    cy.get('input[type="text"]')
      .type('I feel energetic');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call to complete
    cy.wait('@analyzeMood');
    
    // Test different image scenarios
    cy.get('[data-testid="track-item"]').each(($item, index) => {
      if (index === 0) {
        // First item: Test valid image
        cy.wrap($item)
          .find('[data-testid="track-image"]')
          .should('have.attr', 'src')
          .and('include', 'https://i.scdn.co/');
      }
      
      if (index === 1) {
        // Second item: Test missing image URL
        cy.wrap($item)
          .find('[data-testid="track-image"]')
          .should('have.attr', 'src')
          .and('include', 'data:image/svg+xml');
      }
      
      if (index === 2) {
        // Third item: Test broken image URL
        cy.wrap($item)
          .find('[data-testid="track-image"]')
          .then($img => {
            // Trigger error event
            cy.wrap($img).trigger('error');
            // Check if fallback is applied
            cy.wrap($img)
              .should('have.attr', 'src')
              .and('include', 'data:image/svg+xml');
          });
      }
    });
  });
}); 