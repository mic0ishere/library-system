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

export const columns = (isAdmin) => [
  {
    accessorKey: "author",
    header: "Author",
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
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
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
    header: "Status",
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
            <span>{status.label}</span>
          </TooltipTrigger>
          <TooltipContent side="bottom">{status.description}</TooltipContent>
        </Tooltip>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
            <BookOptions row={row.original} rent={rent}>
              <Button size="sm" variant="secondary" className="-my-2">
                Options <MenuIcon className="w-4 h-4 ml-2" />
              </Button>
            </BookOptions>
          </div>
        );

      return (
        <div className="w-16">
          {rent && (
            <RentModal row={row.original}>
              <Button size="sm" variant="secondary" className="-my-2">
                Rent <BookUp2Icon className="w-4 h-4 ml-2" />
              </Button>
            </RentModal>
          )}
        </div>
      );
    },
  },
];
