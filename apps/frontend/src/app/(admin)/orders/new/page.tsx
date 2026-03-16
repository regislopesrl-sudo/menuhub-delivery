import OrdersNewPageClient, {
  OrdersNewPageClientProps,
} from './orders-new-client';

const getFirst = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type PageInput = {
  searchParams?: Promise<SearchParams | undefined>;
};

export default async function Page({ searchParams }: PageInput) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const tableId = getFirst(resolvedSearchParams.tableId);
  const commandId = getFirst(resolvedSearchParams.commandId);
  const initialOrderType = commandId
    ? 'command'
    : tableId
    ? 'table'
    : undefined;
  const initialChannel = commandId ? 'command' : 'admin';

  return (
    <OrdersNewPageClient
      initialTableId={tableId ?? undefined}
      initialCommandId={commandId ?? undefined}
      initialOrderType={initialOrderType as OrdersNewPageClientProps['initialOrderType']}
      initialChannel={initialChannel}
    />
  );
}
