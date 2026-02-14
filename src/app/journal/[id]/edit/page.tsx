import EditEntryPage from './EditEntryClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  // Generate a placeholder page that Vercel rewrites will serve for all entry IDs
  return [{ id: '_placeholder' }];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditEntryPage params={params} />;
}
