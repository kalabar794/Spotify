/// <reference types="cypress" />

describe('Audio Player Functionality', () => {
  beforeEach(() => {
    // Visit the app before each test and mock audio
    cy.visit('/');
    cy.mockAudio();
    
    // Enter a mood to generate tracks
    cy.enterMood('happy and energetic');
    
    // Wait for tracks to load
    cy.getByTestId('track-item').should('be.visible');
    
    // Expand the first track to show audio player
    cy.getByTestId('track-item').first().click();
  });

  it('should show the audio player when track is expanded', () => {
    // Check if the audio player is visible
    cy.getByTestId('audio-player').should('be.visible');
    
    // Verify play button is present
    cy.getByTestId('play-button').should('be.visible');
    cy.getByTestId('play-button').should('contain', 'Play');
    
    // Verify test sound button is present
    cy.getByTestId('test-sound-button').should('be.visible');
    cy.getByTestId('test-sound-button').should('contain', 'Test Sound');
  });

  it('should change button state when play is clicked', () => {
    // Click the play button
    cy.getByTestId('play-button').click();
    
    // Verify the button text changes to indicate playing state
    cy.getByTestId('play-button').should('contain', 'Pause');
    
    // Check for debug message showing audio is playing
    cy.getByTestId('debug-message').should('contain', 'Audio playing');
    
    // Click again to pause
    cy.getByTestId('play-button').click();
    
    // Verify button text changes back
    cy.getByTestId('play-button').should('contain', 'Play');
    
    // Check for debug message showing audio is paused
    cy.getByTestId('debug-message').should('contain', 'Audio paused');
  });

  it('should display debug messages during audio interaction', () => {
    // Click play and check sequential debug messages
    cy.getByTestId('play-button').click();
    
    // Check for initial setup message
    cy.getByTestId('debug-message').should('contain', 'Setting up audio');
    
    // Check for source loading message
    cy.getByTestId('debug-message').should('contain', 'Audio source set and loading');
    
    // Check for ready to play message
    cy.getByTestId('debug-message').should('contain', 'Audio ready to play through');
    
    // Check for playing message
    cy.getByTestId('debug-message').should('contain', 'Audio playing');
  });

  it('should have working Spotify button that opens in new tab', () => {
    // Check that the Spotify button exists
    cy.getByTestId('spotify-button').should('be.visible');
    cy.getByTestId('spotify-button').should('contain', 'Spotify');
    
    // Stub window.open method before clicking
    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });
    
    // Click the Spotify button
    cy.getByTestId('spotify-button').click();
    
    // Verify window.open was called with a Spotify URL
    cy.get('@windowOpen').should('be.calledWithMatch', /open.spotify.com\/track/);
  });
}); 