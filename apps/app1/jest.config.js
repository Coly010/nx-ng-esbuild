module.exports = {
  displayName: 'app1',
  preset: '../../jest.preset.js',
  // setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/app1',
  transform: {
    '^.+\\.(ts|mjs|js)$': [
      '<rootDir>/../../dist/libs/ng-estest/src/index.js',
      { tsconfig: 'apps/app1/tsconfig.spec.json' },
    ],
    // '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular',
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
