import {
  ArrowUpDownIcon,
  ArrowDownAzIcon,
  ArrowUpAzIcon,
  BookUp2Icon,
  MenuIcon,
} from "lucide-react";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import BookOptions from "@/components/options-catalog/options-catalog";
import RentModal from "@/components/rent-modal";

import { statuses } from "@/components/constants";
import useDictionary from "@/lib/use-translation";

export const useColumns = (isAdmin, adminProps) => {
  const { t } = useDictionary("catalog-columns");
  const { t: tStatus } = useDictionary("statuses");

  return [
    {
      accessorKey: "author",
      header: t("author"),
      cell: ({ row }) => (
        <div className="flex space-x-2" title={row.getValue("author")}>
          <span className="w-[200px] truncate font-medium">
            {row.getValue("author")}
          </span>
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "category",
      id: "category",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="w-[150px] truncate font-medium">
            {row.getValue("category")}
          </span>
        </div>
      ),
      filterFn: (row, category, value) => {
        return value.includes(row.getValue(category));
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className="-ml-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("title")}
            {column.getIsSorted() === false && (
              <ArrowUpDownIcon className="ml-2 h-4 w-4" />
            )}
            {column.getIsSorted() === "asc" && (
              <ArrowDownAzIcon className="ml-2 h-4 w-4" />
            )}
            {column.getIsSorted() === "desc" && (
              <ArrowUpAzIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="w-[350px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue("status")
        );

        if (!status) {
          return null;
        }

        return (
          <Tooltip>
            <TooltipTrigger className="flex w-[110px] items-center">
              {status.icon && (
                <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span>{tStatus(`${status.value.toLowerCase()}.label`)}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {tStatus(`${status.value.toLowerCase()}.description`)}
            </TooltipContent>
          </Tooltip>
        );
      },
      filterFn: (row, status, value) => {
        return value.includes(row.getValue(status));
      },
    },
    {
      id: "actions",
      /**
       * @param {{
       *  row: import('@tanstack/react-table').Row
       * }} param0
       */
      cell: ({ row }) => {
        const rent = row.getValue("status") === "AVAILABLE";

        if (isAdmin)
          return (
            <div className="w-24">
              <BookOptions
                row={row.original}
                rent={rent}
                adminProps={adminProps}
              >
                <Button size="sm" variant="secondary" className="-my-2">
                  {t("options")} <MenuIcon className="w-4 h-4 ml-2" />
                </Button>
              </BookOptions>
            </div>
          );

        return (
          !process.env.NEXT_PUBLIC_DISABLEUSERBORROWING && (
            <div className="w-16">
              {rent && (
                <RentModal row={row.original}>
                  <Button size="sm" variant="secondary" className="-my-2">
                    {t("rent")} <BookUp2Icon className="w-4 h-4 ml-2" />
                  </Button>
                </RentModal>
              )}
            </div>
          )
        );
      },
    },
  ];
};
