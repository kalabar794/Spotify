// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Command to wait for a component to finish rendering
Cypress.Commands.add('waitForComponent', (selector) => {
  return cy.get(selector, { timeout: 10000 });
});

// Command to get an element by its test ID
Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Command to wait for track items to load
Cypress.Commands.add('waitForTracks', () => {
  return cy.get('.track-item', { timeout: 10000 });
});

// Command to enter mood text and submit
Cypress.Commands.add('enterMood', (moodText) => {
  cy.get('.mood-input').clear().type(moodText);
  cy.get('.submit-button').click();
});

// Command to check audio player visibility
Cypress.Commands.add('checkAudioPlayer', () => {
  return cy.get('.simple-audio-player');
});

// Command to interact with the first track
Cypress.Commands.add('expandFirstTrack', () => {
  cy.get('.track-item').first().click();
});

// Command to click play button on first track's audio player
Cypress.Commands.add('clickPlayButton', () => {
  cy.get('.simple-audio-player button').first().click();
});

// Command to click test sound button
Cypress.Commands.add('clickTestSoundButton', () => {
  cy.contains('button', 'Test Sound').click();
}); 