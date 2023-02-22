import { FernRegistry } from "@fern-fern/registry";
import { useApiDefinitionContext } from "../../api-page/api-context/useApiDefinitionContext";
import { TYPES_NAMESPACE } from "./constants";
import { usePackageItemPath } from "./usePackageItemPath";

export function useTypePath({
    environmentId,
    typeId,
}: {
    environmentId: FernRegistry.EnvironmentId;
    typeId: FernRegistry.TypeId;
}): string {
    const { resolveTypeById, getPackagePathForTypeId } = useApiDefinitionContext();

    const packagePath = getPackagePathForTypeId(typeId);
    const type = resolveTypeById(typeId);

    return usePackageItemPath({ environmentId, packagePath, namespace: TYPES_NAMESPACE, itemName: type.name });
}