/// <reference types="cypress" />

describe('Test Sound Button Functionality', () => {
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

  it('should show test sound button in the audio player', () => {
    // Verify test sound button is present and properly labeled
    cy.getByTestId('test-sound-button').should('be.visible');
    cy.getByTestId('test-sound-button').should('contain', 'Test Sound');
    
    // Check button has the expected styling
    cy.getByTestId('test-sound-button')
      .should('have.css', 'background-color')
      .and('include', 'rgb(243, 156, 18)'); // #f39c12 orange color
  });

  it('should show debug messages when test sound button is clicked', () => {
    // Click the test sound button
    cy.getByTestId('test-sound-button').click();
    
    // Check for initial message about creating the test sound
    cy.getByTestId('debug-message').should('contain', 'Creating test sound');
    
    // After sound completes, check for success message
    // Using Cypress' built-in retry and timeout mechanism
    cy.getByTestId('debug-message').should('contain', 'Test sound played successfully', { timeout: 10000 });
  });

  it('should create the AudioContext API when test sound button is clicked', () => {
    // Spy on the AudioContext constructor
    cy.window().then((win) => {
      cy.spy(win, 'AudioContext').as('audioContextSpy');
    });
    
    // Click the test sound button
    cy.getByTestId('test-sound-button').click();
    
    // Verify AudioContext was constructed
    cy.get('@audioContextSpy').should('be.called');
  });

  it('should handle multiple test sound button clicks properly', () => {
    // Click test sound button multiple times in succession
    cy.getByTestId('test-sound-button').click();
    cy.wait(100); // Brief wait to simulate rapid clicking
    cy.getByTestId('test-sound-button').click();
    cy.wait(100);
    cy.getByTestId('test-sound-button').click();
    
    // Verify the test sound flow completes without errors
    cy.getByTestId('debug-message').should('contain', 'Test sound played successfully', { timeout: 10000 });
    
    // Check that no error messages are shown
    cy.getByTestId('debug-message').should('not.contain', 'Test sound error');
  });

  it('should be able to use both test sound and regular play buttons', () => {
    // Test the test sound button
    cy.getByTestId('test-sound-button').click();
    cy.getByTestId('debug-message').should('contain', 'Test sound played successfully', { timeout: 10000 });
    
    // Then test the regular play button
    cy.getByTestId('play-button').click();
    cy.getByTestId('debug-message').should('contain', 'Audio playing');
    
    // Make sure we can still use the test button after using play
    cy.getByTestId('test-sound-button').click();
    cy.getByTestId('debug-message').should('contain', 'Test sound played successfully', { timeout: 10000 });
  });
}); 