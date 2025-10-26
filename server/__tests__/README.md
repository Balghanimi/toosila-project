# Toosila Backend Tests

## Overview
This directory contains all unit and integration tests for the Toosila backend application.

## Test Structure
```
__tests__/
├── controllers/     # Controller unit tests
│   └── offers.controller.test.js
├── models/          # Model unit tests (to be added)
├── middlewares/     # Middleware tests (to be added)
└── integration/     # Integration tests (to be added)
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- offers.controller.test.js
```

## Writing Tests

### Test Structure
Each test file should follow this structure:
```javascript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('functionName', () => {
    it('should do something successfully', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle error case', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Mocking
- Use `jest.mock()` to mock modules
- Clear mocks between tests with `jest.clearAllMocks()`
- Mock external dependencies (database, external APIs)

### Assertions
- Use descriptive test names
- Test both success and error cases
- Verify function calls with `toHaveBeenCalledWith()`
- Check response structure and status codes

## Coverage Goals
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Test Files

### controllers/offers.controller.test.js
Tests for the offers controller including:
- ✅ createOffer - Create new offer
- ✅ getOffers - Get offers with filters and pagination
- ✅ getOfferById - Get single offer with stats
- ✅ updateOffer - Update offer with ownership check
- ✅ deactivateOffer - Deactivate offer
- ✅ getUserOffers - Get user's offers
- ✅ searchOffers - Search offers by term
- ✅ getCategories - Get active categories
- ✅ getOfferStats - Get offer statistics

## Best Practices
1. **AAA Pattern**: Arrange, Act, Assert
2. **Isolation**: Each test should be independent
3. **Descriptive Names**: Use clear, descriptive test names
4. **Mock External Dependencies**: Database, APIs, etc.
5. **Test Edge Cases**: Empty data, invalid input, errors
6. **Don't Test Implementation**: Test behavior, not internals

## Example Test
```javascript
describe('createOffer', () => {
  it('should create a new offer successfully', async () => {
    // Arrange
    const offerData = {
      fromCity: 'بغداد',
      toCity: 'البصرة',
      departureTime: '2025-10-27T10:00:00Z',
      seats: 3,
      price: 50000
    };

    const mockOffer = {
      id: 'offer-123',
      ...offerData,
      toJSON: jest.fn().mockReturnValue({ id: 'offer-123', ...offerData })
    };

    req.body = offerData;
    Offer.create = jest.fn().mockResolvedValue(mockOffer);

    // Act
    await createOffer(req, res, next);

    // Assert
    expect(Offer.create).toHaveBeenCalledWith({
      driverId: 'user-123',
      ...offerData
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'تم إنشاء العرض بنجاح',
      offer: expect.objectContaining({ id: 'offer-123' })
    });
  });
});
```

## Continuous Integration
Tests run automatically on:
- Pull requests
- Commits to main branch
- Manual workflow dispatch

## Troubleshooting

### Tests failing locally
1. Clear Jest cache: `npx jest --clearCache`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check Node version: `node --version` (should be 18+)

### Coverage not updating
1. Delete coverage directory: `rm -rf coverage`
2. Run tests with coverage: `npm run test:coverage`

## Contributing
When adding new features:
1. Write tests first (TDD approach preferred)
2. Ensure tests pass before committing
3. Maintain or improve coverage percentage
4. Update this README if adding new test directories
