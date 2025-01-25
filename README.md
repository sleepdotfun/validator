# Sleep Data Validator

A TypeScript-based validator for sleep data that checks validity, quality, and uniqueness of sleep records from the Terra API.

## Installation

1. Install dependencies:

npm install

2. Set up environment variables in .env:
```
TERRA_API_KEY=your_api_key
TERRA_DEV_ID=your_dev_id
TERRA_SECRET=your_secret
```
## Usage

The validator provides a validate function that takes sleep data and returns a proof with a score and metadata.

```
import { validate } from './src';
import { Sleep } from './types';

// Your sleep data object conforming to the Sleep type
const sleepData: Sleep = {
  // ... sleep data
};

// Validate the sleep data
const proof = await validate(sleepData);

// Example response:
// {
//   score: 0.85,
//   dlpId: 20,
//   metadata: {
//     valid: true,
//     quality: 0.9,
//     uniqueness: 0.8
//   }
// }
```

### Validation Criteria

The validator checks three main aspects:

1. **Validity**: Verifies if the user exists in Terra's system
2. **Quality**: Evaluates the completeness of sleep data fields
3. **Uniqueness**: Checks if the data hasn't been updated in the last 24 hours

The final score is calculated as the average of quality and uniqueness scores, but only if the data is valid.