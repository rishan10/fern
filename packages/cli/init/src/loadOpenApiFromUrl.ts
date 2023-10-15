import { TaskContext } from "@fern-api/task-context";
import axios from "axios";
import { writeFile } from "fs/promises";
import { dump } from "js-yaml";
import { join } from "path";
import tmp from "tmp-promise";

export async function loadOpenAPIFromUrl({
    url,
    context,
}: {
    url: string;
    context: TaskContext;
}): Promise<string> {
    try {
        const response = await axios.get(url);
        const jsonData = response.data;
        const yamlData = dump(jsonData);
        const tmpDir = await tmp.dir();
        const filePath = join(tmpDir.path, "openapi.yml");
        context.logger.debug("tmpDir", tmpDir.path);
        context.logger.debug("filePath", filePath);
        await writeFile(filePath, yamlData);
        return filePath;
    } catch (error) {
        context.logger.debug(`Encountered an error while loading OpenAPI spec: ${JSON.stringify(error)}`);
        return context.failAndThrow(`Failed to load OpenAPI spec from ${url}`);
    }
}
