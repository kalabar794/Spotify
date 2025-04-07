// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// This is a great place to put global configuration and behavior that
// modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Cypress events
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test when it encounters
  // uncaught exceptions in the application code
  return false;
});

// Mock audio playback since Cypress cannot test actual audio
Cypress.Commands.add('mockAudio', () => {
  cy.window().then((win) => {
    // Mock Audio API
    win.Audio = class MockAudio {
      constructor() {
        this.autoplay = false;
        this.src = '';
        this.paused = true;
        this.muted = false;
        this.callbacks = {};
      }
      
      addEventListener(event, callback) {
        if (!this.callbacks[event]) {
          this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
      }
      
      removeEventListener(event, callback) {
        if (this.callbacks[event]) {
          this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
      }
      
      dispatchEvent(event) {
        if (this.callbacks[event]) {
          this.callbacks[event].forEach(cb => cb());
        }
      }
      
      play() {
        this.paused = false;
        setTimeout(() => {
          if (this.callbacks['canplaythrough']) {
            this.callbacks['canplaythrough'].forEach(cb => cb());
          }
        }, 100);
        return Promise.resolve();
      }
      
      pause() {
        this.paused = true;
      }
      
      load() {
        // Mock successful loading
        setTimeout(() => {
          if (this.callbacks['canplaythrough']) {
            this.callbacks['canplaythrough'].forEach(cb => cb());
          }
        }, 100);
      }
    };
    
    // Mock AudioContext API for test sound
    win.AudioContext = class MockAudioContext {
      constructor() {
        this.state = 'running';
        this.currentTime = 0;
        this.destination = {};
      }
      
      createOscillator() {
        return {
          type: '',
          frequency: {
            value: 0,
            setValueAtTime: () => {}
          },
          connect: () => {},
          start: () => {},
          stop: () => {}
        };
      }
      
      createGain() {
        return {
          gain: {
            value: 0
          },
          connect: () => {}
        };
      }
    };
    
    win.webkitAudioContext = win.AudioContext;
  });
}); 