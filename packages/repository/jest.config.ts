import { compilerOptions } from './tsconfig.json';
import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
	roots: ['<rootDir>'],
	modulePaths: [compilerOptions.baseUrl],
	moduleDirectories: ['node_modules', '<rootDir>'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};

export default jestConfig;
