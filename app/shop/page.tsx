import { redirect } from "next/navigation";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, val]) => {
    if (typeof val === "string") {
      urlParams.set(key, val);
    } else if (Array.isArray(val) && val[0]) {
      urlParams.set(key, val[0]);
    }
  });

  const query = urlParams.toString();
  redirect(`/store${query ? `?${query}` : ""}`);
}
