# Browser Security Maintenance

## Playwright Browser Updates

This project uses Playwright for automated screenshot generation and testing. To ensure security against Chromium CVEs, we maintain updated browser binaries.

### Current Setup

- **Playwright Version**: 1.55.1
- **Chromium Version**: 140.0.7339.186 (bundled with Playwright)
- **Browser Install Location**: `~/.cache/ms-playwright/`

### Security Update Commands

```bash
# Check current browser versions
npm run playwright:check

# Update all browsers to latest versions
npm run playwright:update

# Update only Chromium (security-focused)
npm run security:browsers

# Manual installation
npx playwright install chromium --force
```

### Maintenance Schedule

1. **Regular Updates**: Run `npm run security:browsers` monthly or when Playwright releases updates
2. **Security Patches**: Monitor [Playwright releases](https://github.com/microsoft/playwright/releases) for security updates
3. **CVE Response**: When Chromium CVEs are announced, run immediate browser updates

### CI/CD Integration

For automated environments, add this step to your CI pipeline:

```bash
# Install latest patched browsers
npm run playwright:install
```

### Troubleshooting

If you encounter browser-related security warnings:

1. Check current versions: `npm run playwright:check`
2. Force update browsers: `npm run security:browsers`
3. Clear browser cache: `rm -rf ~/.cache/ms-playwright/`
4. Reinstall: `npm run playwright:install`

### Security Notes

- Playwright automatically downloads patched browser versions with each release
- Browser binaries are isolated in the cache directory
- No custom Chromium builds or Docker images are used in this project
- The `--force` flag ensures complete replacement of potentially vulnerable binaries

### Last Updated

Browser security review completed: October 3, 2025
- Verified Chromium 140.0.7339.186 is current
- Added automated update scripts
- Documented maintenance procedures