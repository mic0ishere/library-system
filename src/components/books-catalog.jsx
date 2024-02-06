import useSWR from "swr";

import { DataTable } from "@/components/data-table/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function BooksCatalog({ columns }) {
  const { data: books, error } = useSWR("/api/catalog", (...args) =>
    fetch(...args).then((res) => res.json())
  );

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error?.message}</AlertDescription>
        </Alert>
      )}
      <DataTable columns={columns} data={books || []} />
    </>
  );
}

export default BooksCatalog;
