import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";

import { DataTableFacetedFilter } from "@/components/data-table/faceted-filter";
import { statuses } from "@/components/constants";
import useDictionary from "@/lib/use-translation";

export function DataTableToolbar({ table, t }) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const { t: tStatus } = useDictionary("statuses");

  return (
    <div className="flex items-center justify-between">
      <div className="grid grid-cols-2 gap-2 sm:flex flex-1 items-center">
        <div className="col-span-2 flex flex-row space-x-2">
          <Input
            placeholder={t("filterByTitle")}
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
            {t("reset")}
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <DataTableFacetedFilter
          column={table.getColumn("author")}
          title={t("author")}
          widePopover
          t={t}
        />
        <DataTableFacetedFilter
          column={table.getColumn("category")}
          title={t("category")}
          t={t}
        />
        <DataTableFacetedFilter
          column={table.getColumn("status")}
          title={t("status")}
          options={statuses.map((status) => ({
            ...status,
            label: tStatus(`${status.value.toLowerCase()}.label`),
            description: tStatus(`${status.value.toLowerCase()}.description`),
          }))}
          t={t}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3 col-span-2 hidden sm:flex"
          >
            {t("reset")}
            <XIcon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
