module.exports = {
  displayName: 'app2',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/app2',
  transform: {
    '^.+\\.(ts|mjs|js)$': 'ng-estest',
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
