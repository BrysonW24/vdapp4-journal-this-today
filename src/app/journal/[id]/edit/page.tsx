import EditEntryPage from './EditEntryClient';

export const revalidate = 0;
export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <EditEntryPage params={params} />;
}
