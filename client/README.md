# MoodMix Client

This is the client application for MoodMix, a web app that creates personalized playlists based on mood analysis.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:

```bash
npm install
```

### Running the application

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Running Tests

### Unit Tests

```bash
npm test
```

### End-to-End Tests

We use Cypress for E2E testing. There are two ways to run the tests:

#### Interactive Mode

```bash
npm run cypress:open
```

This will open the Cypress Test Runner, allowing you to select and run tests interactively.

#### Headless Mode

```bash
npm run test:e2e
```

This command will:
1. Start the development server
2. Run all Cypress tests in headless mode
3. Automatically shut down the server when tests complete

## E2E Test Coverage

The E2E tests cover the following functionality:

### Audio Player Tests (`audio-player.cy.js`)

- Verifies that the audio player appears when a track is expanded
- Tests play/pause functionality
- Verifies that debug messages are displayed correctly
- Tests the Spotify integration button

### Test Sound Button Tests (`test-sound-button.cy.js`)

- Verifies the visibility and styling of the test sound button
- Tests that debug messages are displayed when the test sound button is clicked
- Verifies that the AudioContext API is correctly initialized
- Tests multiple clicks on the test sound button
- Verifies the interaction between the test sound button and the play button

## Adding More Tests

To add more tests:

1. Create a new `.cy.js` file in the `cypress/e2e` directory
2. Add assertions using the Cypress API and our custom commands
3. Run the tests using one of the methods above

## Custom Commands

We've added several custom Cypress commands to simplify testing:

- `cy.mockAudio()`: Mocks the Audio and AudioContext APIs
- `cy.getByTestId(id)`: Gets an element by its data-testid attribute
- `cy.enterMood(text)`: Types the specified text in the mood input and submits
- `cy.expandFirstTrack()`: Clicks on the first track to expand it

See `cypress/support/commands.js` for all available commands. 