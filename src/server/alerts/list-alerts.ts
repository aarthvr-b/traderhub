import { getDbClient } from "@/lib/db";

export async function listAlerts() {
  const db = await getDbClient();

  return db.alert.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}
