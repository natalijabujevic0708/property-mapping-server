import { Mapping } from "default";
import { prisma } from "./clients";
import { getCustomerId } from "./utils";

const getMappings = async () => {
  const mappings = await prisma.mapping.findMany({
    select: {
      name: true,
      hubspotLabel: true,
      hubspotName: true,
      id: true,
      object: true,
    },
  });
  console.log(mappings);
  return mappings;
};

const deleteMapping = async (mappingId: number) => {
  const deleteResults = await prisma.mapping.delete({
    where: {
      id: mappingId,
    },
  });
  return deleteResults;
};

const saveMappings = async (mappingsInput: Mapping[]) => {
  console.log("mappingsInput", mappingsInput);

  if (mappingsInput.length > 0) {
    const mappingResults = mappingsInput.map(async (maybeMapping) => {
      const mappingName = maybeMapping.name;
      const hubspotInfo = maybeMapping.property;
      const object = maybeMapping.property.object;
      const customerId = getCustomerId();

      const mappingResult = await prisma.mapping.upsert({
        where: {
          name_object_customerId: {
            name: mappingName,
            customerId: customerId,
            object: object,
          },
        },
        update: {
          hubspotLabel: hubspotInfo.label,
          hubspotName: hubspotInfo.name,
        },
        create: {
          hubspotLabel: hubspotInfo.label,
          hubspotName: hubspotInfo.name,
          name: mappingName,
          object: object,
          customerId: customerId,
        },
      });

      return await mappingResult;
    });

    return await Promise.all(mappingResults);
  }
  return null;
};

export { saveMappings, deleteMapping, getMappings };