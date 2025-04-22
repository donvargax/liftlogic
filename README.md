# LiftLogic

A smart warm-up calculator for strength training built with Aurelia, TypeScript, and Tailwind CSS.

## Features

- Calculate optimal warm-up weights based on your working weight
- Provides 30RM, 20RM, 10RM, and 1RM calculations
- Recommended rep schemes for progressive warm-ups (12, 8, 4 reps)
- Automatically rounds weights to practical plate increments (2.5 units)
- Clean, responsive UI with Tailwind CSS

## How It Works

LiftLogic uses the Brzycki formula to calculate various rep maxes based on your working set weight. It assumes your working weight is approximately your 5RM (weight you can lift for 5 reps).

The app then calculates:
- 30RM for your first warm-up set (12 reps)
- 20RM for your second warm-up set (8 reps)
- 10RM for your third warm-up set (4 reps)
- Estimated 1RM (your theoretical one-rep maximum)

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/liftlogic.git
cd liftlogic

# Install dependencies
npm install

# Start development server
npm start
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Build for Production

```bash
npm run build
```

## Technology Stack

- **Framework**: Aurelia
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: Webpack
- **Testing**: Jest
