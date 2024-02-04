import { columns } from "@/components/data-table/columns";
import { DataTable } from "@/components/data-table/table";
import { books } from "../../books";

export default function Catalog() {
  return (
    <div className="w-full pt-8 pb-16 max-w-[900px]">
      <h1 className="text-4xl">Browse our catalog</h1>
      <p className="mt-2 mb-8">
        Our collection includes a wide range of books from various genres and
        authors. You can search for a specific book or browse through our
        collection to find something new to read.
      </p>
      <DataTable
        columns={columns}
        data={books}
      />
    </div>
  );
}
