/// <reference types="cypress" />

describe('Complete Mood Analysis Workflow', () => {
  beforeEach(() => {
    // Visit the app before each test and mock audio
    cy.visit('/');
    cy.mockAudio();
  });

  it('should successfully analyze mood and display tracks with working audio', () => {
    // Enter a descriptive mood
    cy.get('textarea').clear().type('I am feeling very happy and energetic today');
    
    // Click the submit button
    cy.contains('button', 'Create Playlist').click();
    
    // Check for loading state
    cy.contains('Analyzing...').should('be.visible');
    
    // Wait for results to load
    cy.contains('Your Mood Mix', { timeout: 10000 }).should('be.visible');
    
    // Verify mood description is shown
    cy.contains('Based on your mood:').should('be.visible');
    cy.contains('feeling very happy and energetic today').should('be.visible');
    
    // Verify tracks are displayed
    cy.getByTestId('track-item').should('have.length.at.least', 1);
    
    // Check first track has content
    cy.getByTestId('track-name').first().should('not.be.empty');
    cy.getByTestId('track-artist').first().should('not.be.empty');
    
    // Expand the first track
    cy.getByTestId('track-item').first().click();
    
    // Verify audio player appears
    cy.getByTestId('audio-player').should('be.visible');
    
    // Click play and verify it changes state
    cy.getByTestId('play-button').click();
    cy.getByTestId('play-button').should('contain', 'Pause');
    
    // Verify debug message about audio playing
    cy.getByTestId('debug-message').should('contain', 'Audio playing');
    
    // Test the test sound button
    cy.getByTestId('test-sound-button').click();
    cy.getByTestId('debug-message').should('contain', 'Creating test sound');
    cy.getByTestId('debug-message').should('contain', 'Test sound played successfully', { timeout: 10000 });
  });

  it('should respond to different moods with appropriate tracks', () => {
    // Test with sad mood
    cy.get('textarea').clear().type('I am feeling sad and melancholic');
    cy.contains('button', 'Create Playlist').click();
    cy.contains('Your Mood Mix', { timeout: 10000 }).should('be.visible');
    
    // Check first track
    cy.getByTestId('track-name').first().should('be.visible');
    
    // Check for common sad music tracks
    cy.getByTestId('track-name')
      .contains(/Someone Like You|Fix You|Hurt|Everybody Hurts/i)
      .should('exist');
    
    // Now test with calm mood
    cy.get('textarea').clear().type('I need something calm and peaceful');
    cy.contains('button', 'Create Playlist').click();
    cy.contains('Your Mood Mix', { timeout: 10000 }).should('be.visible');
    
    // Check for common calm music tracks
    cy.getByTestId('track-name')
      .contains(/Weightless|Clair de Lune|Experience|Gymnopédie/i)
      .should('exist');
  });

  it('should allow playing multiple tracks', () => {
    // Enter mood and get tracks
    cy.get('textarea').clear().type('happy vibes');
    cy.contains('button', 'Create Playlist').click();
    cy.contains('Your Mood Mix', { timeout: 10000 }).should('be.visible');
    
    // Expand first track
    cy.getByTestId('track-item').first().click();
    
    // Play first track
    cy.getByTestId('play-button').click();
    cy.getByTestId('debug-message').should('contain', 'Audio playing');
    
    // Pause first track
    cy.getByTestId('play-button').click();
    cy.getByTestId('debug-message').should('contain', 'Audio paused');
    
    // Close first track
    cy.getByTestId('expand-button').click();
    
    // If there's a second track, test it too
    cy.getByTestId('track-item').eq(1).then($el => {
      if ($el.length) {
        // Expand second track
        cy.wrap($el).click();
        
        // Play second track
        cy.getByTestId('play-button').click();
        cy.getByTestId('debug-message').should('contain', 'Audio playing');
      }
    });
  });

  it('should have working Spotify integration', () => {
    // Enter mood and get tracks
    cy.get('textarea').clear().type('happy dance music');
    cy.contains('button', 'Create Playlist').click();
    cy.contains('Your Mood Mix', { timeout: 10000 }).should('be.visible');
    
    // Check that all tracks have Spotify buttons
    cy.getByTestId('spotify-button').should('have.length.at.least', 1);
    
    // Stub window.open before clicking
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });
    
    // Click on first Spotify button
    cy.getByTestId('spotify-button').first().click();
    
    // Verify correct Spotify URL format
    cy.get('@windowOpen').should('be.calledWithMatch', /open.spotify.com\/track/);
  });
}); 