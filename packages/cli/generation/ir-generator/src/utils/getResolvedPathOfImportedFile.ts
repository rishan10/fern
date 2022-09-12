import { dirname, join, RelativeFilePath } from "@fern-api/core-utils";

export function getResolvedPathOfImportedFile({
    referencedIn,
    importPath,
}: {
    referencedIn: RelativeFilePath;
    importPath: RelativeFilePath;
}): RelativeFilePath {
    return join(dirname(referencedIn), importPath);
}