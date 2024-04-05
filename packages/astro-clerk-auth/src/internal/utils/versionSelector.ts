export const versionSelector = (clerkJSVersion: string | undefined, packageVersion = PACKAGE_VERSION): string => {
  if (clerkJSVersion) {
    return clerkJSVersion;
  }

  const majorTag = Number(getMajorVersion(packageVersion));

  // Is v0
  if (majorTag === 0) {
    return 'beta';
  }

  // TODO: Update when v5 and core-2 is officially out
  return 'beta';
};

const getMajorVersion = (packageVersion: string) => packageVersion.trim().replace(/^v/, '').split('.')[0];
