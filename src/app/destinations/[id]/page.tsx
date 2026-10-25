import { Suspense } from "react";
import DestinationDetailsClient from "@/components/destination-details-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function DestinationDetailsContent({ params }: PageProps) {
  const { id } = await params;

  return <DestinationDetailsClient id={id} />;
}

export default function DestinationDetailsPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] w-full items-center justify-center px-4 pt-20 sm:min-h-[70vh] sm:px-6 sm:pt-24">
          <p className="text-center text-xs text-slate-600 sm:text-sm">
            Loading destination...
          </p>
        </main>
      }
    >
      <DestinationDetailsContent params={params} />
    </Suspense>
  );
}