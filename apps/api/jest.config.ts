import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';
import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
	roots: ['<rootDir>'],
	modulePaths: [compilerOptions.baseUrl],
	moduleDirectories: ['node_modules', '<rootDir>'],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
	transform: {
		'^.+\\.ts$': 'ts-jest'
	}
};

export default jestConfig;
