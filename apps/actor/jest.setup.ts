import { jest } from '@jest/globals';

// Suppress console.log from tests
jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn());
