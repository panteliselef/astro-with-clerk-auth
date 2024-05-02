export const versionSelector = (clerkJSVersion: string | undefined, packageVersion = PACKAGE_VERSION): string => {
  if (clerkJSVersion) {
    return clerkJSVersion;
  }

  return '5';
};

const getMajorVersion = (packageVersion: string) => packageVersion.trim().replace(/^v/, '').split('.')[0];
