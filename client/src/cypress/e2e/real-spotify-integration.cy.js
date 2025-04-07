// Test the full Spotify integration workflow
describe('Real Spotify Integration', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
    
    // Intercept API calls to analyze-mood
    cy.intercept('POST', '/api/analyze-mood').as('analyzeMood');
  });

  it('should analyze mood and return real Spotify tracks', () => {
    // Type a mood into the input
    cy.get('input[type="text"]')
      .type('I feel so happy and energetic today');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the API call to complete
    cy.wait('@analyzeMood', { timeout: 20000 }).then((interception) => {
      // Verify that the API call succeeded
      expect(interception.response.statusCode).to.eq(200);
      
      // If available, check that tracks array is present
      if (interception.response.body.tracks) {
        expect(interception.response.body.tracks).to.be.an('array');
      }
    });
    
    // Verify that track items appear in the UI
    cy.get('[data-testid="track-item"]', { timeout: 10000 })
      .should('be.visible')
      .should('have.length.greaterThan', 0);
    
    // Click on a track to expand it
    cy.get('[data-testid="track-item"]').first().click();
    
    // Verify that the audio player is visible
    cy.get('[data-testid="audio-player"]', { timeout: 5000 })
      .should('be.visible');
    
    // Click the play button
    cy.get('[data-testid="play-button"]').click();
    
    // Verify that an error message doesn't appear (may need adjustment based on actual app behavior)
    cy.get('[data-testid="debug-message"]')
      .should('not.contain', 'error');
    
    // Test Spotify button
    cy.get('[data-testid="spotify-button"]')
      .should('be.visible')
      .should('have.attr', 'title', 'Open in Spotify');
  });

  it('should handle mood analysis errors gracefully', () => {
    // Intercept and mock a failed API call
    cy.intercept('POST', '/api/analyze-mood', {
      statusCode: 500,
      body: { error: 'Test error' }
    }).as('analyzeMoodError');
    
    // Type a mood into the input
    cy.get('input[type="text"]')
      .type('This should trigger an error response');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the mocked API call
    cy.wait('@analyzeMoodError');
    
    // Verify that the app still shows some tracks (fallback behavior)
    cy.get('[data-testid="track-item"]', { timeout: 10000 })
      .should('be.visible')
      .should('have.length.greaterThan', 0);
    
    // Verify there's some indication of fallback/error state
    cy.contains(/fallback|error|unable to connect/i, { timeout: 5000 })
      .should('exist');
  });

  it('should use the proxy for external audio sources', () => {
    // Intercept calls to the proxy endpoint
    cy.intercept('/api/proxy*').as('audioProxy');
    
    // Type a mood into the input and submit
    cy.get('input[type="text"]')
      .type('I feel calm and relaxed');
    cy.get('button[type="submit"]').click();
    
    // Wait for mood analysis
    cy.wait('@analyzeMood', { timeout: 20000 });
    
    // Click on a track to expand it
    cy.get('[data-testid="track-item"]').first().click();
    
    // Click the play button
    cy.get('[data-testid="play-button"]').click();
    
    // Check if the proxy was used (this may or may not happen depending on the source)
    cy.wait('@audioProxy', { timeout: 10000 }).then((interception) => {
      expect(interception.request.url).to.include('/api/proxy');
    });
  });
}); 