import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SELECT_TRIGGER_CLASS,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, InfoIcon } from "lucide-react";
import PreviousRentalsTable from "@/components/previous-rentals-table";

import { useState } from "react";
import useSWR from "swr";
import { statuses } from "@/components/constants";
import { cn } from "@/lib/utils";
import useDictionary from "@/lib/use-translation";

function StatusInformation({ row, users = [], onSubmit }) {
  const {
    data: book,
    isLoading,
    error,
  } = useSWR(`/api/users?type=book&bookId=${row.id}`, (...args) =>
    fetch(...args).then((res) => res.json())
  );

  const initialStatus = statuses.find((status) => status.value === row.status);
  const [status, setStatus] = useState(row.status);

  const [openUser, setOpenUser] = useState(false);
  const [selectedUser, setUser] = useState("");

  const { t } = useDictionary("status-information");
  const { t: tStatus } = useDictionary("statuses");

  const statusChangeWarnings = {
    // new status to be set
    AVAILABLE: {
      // previous statuses that will trigger the warning
      type: ["RENTED"],
      message: t("changeWarnings.available"),
    },
    NOT_AVAILABLE: {
      type: ["RENTED"],
      message: t("changeWarnings.notAvailable"),
    },
    RENTED: {
      type: ["AVAILABLE", "BACK_SOON", "NOT_AVAILABLE"],
      message: t("changeWarnings.rented"),
    },
    BACK_SOON: {
      type: ["AVAILABLE", "RENTED", "NOT_AVAILABLE"],
      message: t("changeWarnings.backSoon"),
    },
  };

  return (
    <div className="overflow-auto">
      <h1 className="text-2xl font-bold">{row.title}</h1>
      <p className="text-lg mb-2">{row.author}</p>
      <Badge className="mb-2">{initialStatus.label}</Badge>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <Accordion type="single" collapsible>
        <AccordionItem value="previous-rentals" className="border-b-0">
          <AccordionTrigger>{t("previousRentals")}</AccordionTrigger>
          <AccordionContent className="p-0 pb-4">
            <PreviousRentalsTable
              rentals={book?.rentals || []}
              isLoading={isLoading}
              maxHeight="30vh"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div>
        <h2 className="text-xl font-bold mb-2">{t("changeStatus")}</h2>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select
            onValueChange={(newStatus) => setStatus(newStatus)}
            defaultValue={status}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses
                .map((status) => ({
                  ...status,
                  label: tStatus(`${status.value.toLowerCase()}.label`),
                  description: tStatus(
                    `${status.value.toLowerCase()}.description`
                  ),
                }))
                .map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      {status.icon && (
                        <status.icon className="h-4 w-4 text-muted-foreground" />
                      )}
                      {status.label}{" "}
                      {status.value === row.status &&
                        `(${t("changeStatus.current")})`}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Popover open={openUser} onOpenChange={setOpenUser}>
            <PopoverTrigger asChild>
              {status === "RENTED" && (
                <button
                  role="combobox"
                  aria-controls="user-select"
                  aria-expanded={openUser}
                  disabled={status === initialStatus.value}
                  className={SELECT_TRIGGER_CLASS}
                >
                  {selectedUser || initialStatus.value === "RENTED"
                    ? users.find((user) =>
                        status === initialStatus.value
                          ? user.value === row.rentedById
                          : user.value === selectedUser
                      )?.label
                    : t("changeStatus.selectUser")}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-full  p-0">
              <Command>
                <CommandInput placeholder={t("changeStatus.searchUsers")} />
                <CommandEmpty>{t("changeStatus.noUser")}</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.value}
                      value={user.value}
                      onSelect={(newUser) => {
                        setUser(newUser === selectedUser ? "" : newUser);
                        setOpenUser(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          user === user.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {user.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {statusChangeWarnings[status].type.includes(initialStatus.value) && (
          <Alert
            variant="info"
            className="text-left mt-2 flex items-center text-sm pl-11"
          >
            <InfoIcon className="w-5 h-5" />
            {statusChangeWarnings[status].message}
          </Alert>
        )}
        <Button
          className="w-full mt-4"
          disabled={
            (status === "RENTED" && !selectedUser) ||
            status === initialStatus.value
          }
          onClick={() => {
            onSubmit({
              status,
              userId: selectedUser,
            });
          }}
        >
          {t("changeStatus.update")}
        </Button>
      </div>
    </div>
  );
}

export default StatusInformation;
