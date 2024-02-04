import useSWR from "swr";

import { columns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/table";
import { Alert } from "@/components/ui/alert";

function BooksCatalog() {
  const { data: books, error } = useSWR("/api/catalog", (...args) =>
    fetch(...args).then((res) => res.json())
  );

  return (
    <>
      {error && <Alert variant="error">{error.message}</Alert>}
      <DataTable columns={columns} data={books || []} />
    </>
  );
}

export default BooksCatalog;
