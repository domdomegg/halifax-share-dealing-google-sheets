# halifax-share-dealing-google-sheets

[![Build Status](https://img.shields.io/travis/com/domdomegg/halifax-share-dealing-google-sheets/master)](https://travis-ci.com/domdomegg/halifax-share-dealing-google-sheets) [![JavaScript Standard Style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/domdomegg/halifax-share-dealing-google-sheets/blob/master/LICENSE)

These apps use the [halifax-share-dealing-sdk](https://github.com/domdomegg/halifax-share-dealing-sdk) to track your valuation in a Google Sheet. They support Halifax Share Dealing, IWeb Share Dealing, Scottish Widows Share Dealing, Bank of Scotland Share Dealing and The Lloyds Bank Direct Investments Service.

- [Google Cloud Platform](https://github.com/domdomegg/halifax-share-dealing-google-sheets/tree/master/google-cloud)

## Contributing

PRs are welcomed, please submit them on [GitHub](https://github.com/domdomegg/halifax-share-dealing-google-sheets/pulls).

NPM commands need to be run from the top level of the repository. This may change in future if different implementations need their own scripts or dependencies.

Install dependencies with `npm install`

Uses JavaScript Standard Style - run `npm run lint` to view issues, and `npm run lint:fix` to automagically fix them.

A useful pre-commit hook (save as `.git/hooks/pre-commit`) to ensure the the code is formatted correctly and you haven't accidentally left your personal details in is (change 000123456 to your account code or other personal data you want to search for):

```sh
#!/bin/sh
npm run lint && ! grep --exclude=pre-commit -r '000123456' .
```

Warning: It is still possible to commit your data if you stage it, delete it and then commit. Please be careful!