# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0]

### Uncategorized

- chore: bump workflow actions ([#63](https://github.com/MetaMask/test-dapp-solana/pull/63))
- chore: bump Yarn to 4.18.0 and harden .yarnrc.yml ([#64](https://github.com/MetaMask/test-dapp-solana/pull/64))
- chore: bump action-npm-publish to v7 ([#62](https://github.com/MetaMask/test-dapp-solana/pull/62))
- chore: revert 0.4.0 release
- chore: revert 0.4.1 release
- chore: update codeowners teams
- chore: add networks team to codeowners
- 0.4.1

### Added

- Add WalletConnect Solana adapter ([#44](https://github.com/MetaMask/test-dapp-solana/pull/44))
- Integrate MetaMask Connect Solana wallet-standard client ([#47](https://github.com/MetaMask/test-dapp-solana/pull/47))
- Expose MetaMask readiness in the test dapp header ([#49](https://github.com/MetaMask/test-dapp-solana/pull/49))

### Changed

- **BREAKING:** Update Node.js to v26 ([#60](https://github.com/MetaMask/test-dapp-solana/pull/60))
  - Requires Node.js `^22 || ^24 || >=26` (previously `^18.18 || >=20`)
  - Bump `@lavamoat/allow-scripts` to `^5.1.1` and `@metamask/auto-changelog` to `^6.2.1` for Node.js v26 compatibility
- Bump `action-checkout-and-setup` to v3 ([#61](https://github.com/MetaMask/test-dapp-solana/pull/61))

### Fixed

- fix(ci): pin Node.js to 22
- Fix partial transaction signing ([#45](https://github.com/MetaMask/test-dapp-solana/pull/45))
- fix(ci): use token exchange for docs publishing ([#51](https://github.com/MetaMask/test-dapp-solana/pull/51))
- Replace unmaintained `@solana/spl-token` dependency ([#58](https://github.com/MetaMask/test-dapp-solana/pull/58))

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

[Unreleased]: https://github.com/MetaMask/test-dapp-solana/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/MetaMask/test-dapp-solana/compare/v0.3.1...v1.0.0
[0.3.1]: https://github.com/MetaMask/test-dapp-solana/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/test-dapp-solana/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/MetaMask/test-dapp-solana/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/MetaMask/test-dapp-solana/releases/tag/v0.1.0
