module.exports = {
  displayName: 'app0-lib0-lib0',
  preset: '../../jest.preset.js',
  coverageDirectory: '../../../coverage/libs/app0/lib0-lib0',
  transform: {
    '^.+.(ts|mjs|js)$': 'ng-estest',
  },
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
