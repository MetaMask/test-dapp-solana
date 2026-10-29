# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0]

### Uncategorized

- feat: expose MetaMask readiness in header
- fix: use the test dapp's own identity for createSolanaClient
- chore: drop unnecessary direct bowser dependency
- chore: satisfy yarn lint after adding connect-solana
- Restore the WalletConnect adapter
- refactor: register Solana client at bootstrap instead of in a useEffect
- refactor: consume connect-solana deps from npm, not local file: links
- feat: integrate MetaMask Connect Solana wallet-standard client
- ci: add top-level publish workflow permissions
- chore: migrate npm publishing to trusted publishing
- fix: partial sign ([#45](https://github.com/MetaMask/test-dapp-solana/pull/45))
- feat: add WalletConnect Solana adapter ([#44](https://github.com/MetaMask/test-dapp-solana/pull/44))

### Added

- Expose MetaMask readiness in the test dapp header ([#49](https://github.com/MetaMask/test-dapp-solana/pull/49))

## [0.3.1]

### Changed

- fix: update default values for SendWSol component to match e2e requirements ([#35](https://github.com/MetaMask/test-dapp-solana/pull/35))

## [0.3.0]

### Changed

- feat: build the test file with CommonJS ([#33](https://github.com/MetaMask/test-dapp-solana/pull/33))

## [0.2.0]

### Changed

- feat: responsive design ([#31](https://github.com/MetaMask/test-dapp-solana/pull/31))

## [0.1.0]

### Changed

- Initial release

[Unreleased]: https://github.com/MetaMask/test-dapp-solana/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/MetaMask/test-dapp-solana/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/test-dapp-solana/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/test-dapp-solana/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/MetaMask/test-dapp-solana/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/MetaMask/test-dapp-solana/releases/tag/v0.1.0
