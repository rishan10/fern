import { LogLevel } from "@fern-api/logger";
import { Project } from "@fern-api/project-loader";
import { FernFiddle, FernFiddleClient } from "@fern-fern/fiddle-sdk";
import axios from "axios";
import { readFile } from "fs/promises";
import path from "path";
import tar from "tar";
import tmp from "tmp-promise";
import { CliContext } from "../../cli-context/CliContext";

export const FIDDLE_ORIGIN =
    process.env.FERN_FIDDLE_ORIGIN ??
    process.env.DEFAULT_FIDDLE_ORIGIN ??
    "https://fiddle-coordinator.buildwithfern.com";

export async function registerApiDefinitions({
    project,
    cliContext,
    token,
    version,
}: {
    project: Project;
    cliContext: CliContext;
    token: string;
    version: string | undefined;
}): Promise<void> {
    const fiddle = new FernFiddleClient({
        environment: FIDDLE_ORIGIN,
        token,
    });
    await Promise.all(
        project.workspaces.map(async (workspace) => {
            await cliContext.runTaskForWorkspace(workspace, async (context) => {
                const registerApiResponse = await fiddle.definitionRegistry.registerUsingOrgToken({
                    apiId: FernFiddle.ApiId(workspace.rootApiFile.name),
                    version,
                    cliVersion: cliContext.environment.packageVersion,
                });
                if (!registerApiResponse.ok) {
                    registerApiResponse.error._visit({
                        versionAlreadyExists: () => {
                            context.failAndThrow(`Version ${version ?? ""} is already registered`);
                        },
                        _other: (value) => {
                            const baseMessage = `Failed to register ${version ?? ""}`;
                            if (cliContext.getLogLevel() === LogLevel.Debug) {
                                context.failAndThrow(`${baseMessage}: ${JSON.stringify(value)}`);
                            }
                            context.failAndThrow(`${baseMessage}`);
                        },
                    });
                    return;
                }

                const tmpDir = await tmp.dir();
                const tarPath = path.join(tmpDir.path, "definition.tgz");

                context.logger.debug(`Compressing definition at ${tmpDir.path}`);
                await tar.c({ file: tarPath, cwd: workspace.absolutePathToWorkspace }, ["."]);

                context.logger.info("Uploading definition...");
                await axios.put(
                    registerApiResponse.body.definitionS3UploadUrl,
                    {
                        data: await readFile(tarPath),
                    },
                    {
                        headers: {
                            "Content-Type": "application/octet-stream",
                        },
                    }
                );

                context.logger.info(`Registered ${registerApiResponse.body.version}`);
            });
        })
    );
}