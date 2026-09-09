import { Suspense } from "react";
import ArchiveDetailScreen from "@/components/mobile/archives/ArchiveDetailScreen";

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={null}>
      <ArchiveDetailScreen id={Number(id)} />
    </Suspense>
  );
}
