export const versionSelector = (clerkJSVersion: string | undefined, packageVersion = PACKAGE_VERSION): string => {
  if (clerkJSVersion) {
    return clerkJSVersion;
  }

  const prereleaseTag = getPrereleaseTag(packageVersion);
  if (prereleaseTag) {
    throw 'prelease tags are not supported';
  }

  const majorTag = Number(getMajorVersion(packageVersion));

  // Is v0
  if (majorTag === 0) {
    return 'beta';
  }

  return majorTag + 4 + '';
};

const getPrereleaseTag = (packageVersion: string) =>
  packageVersion
    .trim()
    .replace(/^v/, '')
    .match(/-(.+?)(\.|$)/)?.[1];

const getMajorVersion = (packageVersion: string) => packageVersion.trim().replace(/^v/, '').split('.')[0];
