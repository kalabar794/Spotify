// Tests for audio playback functionality
describe('Audio Playback Tests', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
    
    // Mock the analyze-mood endpoint to always return the same tracks
    cy.intercept('POST', '/api/analyze-mood', { fixture: 'mood-tracks.json' }).as('analyzeMoodMock');
    
    // Type a mood and submit to get tracks
    cy.get('input[type="text"]').type('Happy energy');
    cy.get('button[type="submit"]').click();
    
    // Wait for the mocked API response
    cy.wait('@analyzeMoodMock');
    
    // Wait for tracks to appear
    cy.get('[data-testid="track-item"]', { timeout: 10000 }).should('be.visible');
  });

  it('should play audio using the embedded audio data', () => {
    // Click the first track to expand it
    cy.get('[data-testid="track-item"]').first().click();
    
    // Check audio player is visible
    cy.get('[data-testid="audio-player"]').should('be.visible');
    
    // Click play button
    cy.get('[data-testid="play-button"]').click();
    
    // Verify that the player transitions to playing state
    // We can't actually test the sound, but we can check the UI state
    cy.get('[data-testid="play-button"]').should('contain', 'Pause');
    
    // Check debug message doesn't contain error
    cy.get('[data-testid="debug-message"]').should('not.contain', 'error');
    cy.get('[data-testid="debug-message"]').should('not.contain', 'Error');
  });

  it('should successfully play test sound', () => {
    // Click the first track to expand it
    cy.get('[data-testid="track-item"]').first().click();
    
    // Click test sound button
    cy.get('[data-testid="test-sound-button"]').click();
    
    // Check for success message
    cy.get('[data-testid="debug-message"]', { timeout: 5000 })
      .should('contain', 'Test sound played successfully');
  });

  it('should handle playback errors and show fallback', () => {
    // Mock a broken audio URL
    cy.intercept('/api/proxy*', { statusCode: 404 }).as('proxyError');
    
    // Open a different track (e.g., the second one)
    cy.get('[data-testid="track-item"]').eq(1).click();
    
    // Click play button
    cy.get('[data-testid="play-button"]').click();
    
    // May attempt to use proxy
    cy.wait('@proxyError', { timeout: 10000 }).then(() => {
      // Check that error is handled and displays message
      cy.get('[data-testid="debug-message"]', { timeout: 5000 })
        .should('contain', 'error')
        .then(() => {
          // Check that fallback mechanism kicks in
          cy.get('[data-testid="debug-message"]', { timeout: 10000 })
            .should('contain', 'fallback', { matchCase: false });
        });
    });
  });
  
  it('should maintain audio player state when switching tracks', () => {
    // Click the first track to expand it
    cy.get('[data-testid="track-item"]').first().click();
    
    // Click play button
    cy.get('[data-testid="play-button"]').click();
    
    // Wait for player to start
    cy.get('[data-testid="play-button"]', { timeout: 5000 }).should('contain', 'Pause');
    
    // Then click a different track
    cy.get('[data-testid="track-item"]').eq(1).click();
    
    // This should stop the previous player and create a new one
    cy.get('[data-testid="play-button"]').should('contain', 'Play');
    
    // Play the new track
    cy.get('[data-testid="play-button"]').click();
    
    // Check it transitions to playing state
    cy.get('[data-testid="play-button"]', { timeout: 5000 }).should('contain', 'Pause');
  });
}); 