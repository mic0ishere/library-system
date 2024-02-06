import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/data-table/faceted-filter";
import { statuses } from "@/components/constants";

export function DataTableToolbar({ table }) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="grid grid-cols-2 gap-2 sm:flex flex-1 items-center">
        <div className="col-span-2 flex flex-row space-x-2">
          <Input
            placeholder="Filter books..."
            value={table.getColumn("title")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="h-8 w-full sm:w-[210px] lg:w-[300px]"
          />
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-3 col-span-1 sm:hidden"
            disabled={!isFiltered}
          >
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <DataTableFacetedFilter column={table.getColumn("author")} title="Author" widePopover />
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title="Status"
          options={statuses}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3 col-span-2 hidden sm:flex"
          >
            Reset
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
