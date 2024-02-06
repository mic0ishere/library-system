import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useEffect } from "react";
import useSWR from "swr";
import { Badge } from "../ui/badge";
import { statuses } from "../constants";

function StatusInformation({ row }) {
  const {
    data: book,
    isLoading,
    error,
  } = useSWR(`/api/users?type=book&bookId=${row.id}`, (...args) =>
    fetch(...args).then((res) => res.json())
  );

  useEffect(() => {
    console.log(book, book?.rentals);
  }, [book]);

  const status = statuses.find((status) => status.value === row.status);

  return (
    <div className="overflow-auto">
      <h1 className="text-2xl font-bold">{row.title}</h1>
      <p className="text-lg mb-2">{row.author}</p>
      <Badge className="mb-2">{status.label}</Badge>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <Accordion type="single" collapsible>
        <AccordionItem value="previous-rentals" className="border-b-0">
          <AccordionTrigger>Previous rentals</AccordionTrigger>
          <AccordionContent className="p-0">
            <Table maxHeight="30vh">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-10">User</TableHead>
                  <TableHead className="h-10 w-[100px]">Rented</TableHead>
                  <TableHead className="h-10 w-[100px]">Returned</TableHead>
                  <TableHead className="h-10 w-[100px] text-right">
                    Due date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {book?.rentals?.length > 0 ? (
                  book?.rentals?.map((rental) => (
                    <TableRow key={rental.id}>
                      <TableCell className="font-medium text-left whitespace-nowrap">
                        {rental.user.name}
                      </TableCell>
                      <TableCell>
                        {new Date(rental.rentedAt).toLocaleDateString()}
                      </TableCell>
                      {rental.returnedAt ? (
                        <TableCell
                          className={
                            new Date(rental.returnedAt).setHours(0, 0, 0, 0) -
                              new Date(rental.dueDate).setHours(
                                23,
                                59,
                                59,
                                999
                              ) >
                              0 &&
                            "text-red-600 dark:text-red-400 font-semibold"
                          }
                        >
                          {new Date(rental.returnedAt).toLocaleDateString()}
                        </TableCell>
                      ) : (
                        <TableCell
                          className={
                            new Date(rental.dueDate).setHours(0, 0, 0, 0) -
                              new Date().setHours(23, 59, 59, 999) <
                              0 &&
                            "text-red-600 dark:text-red-400 font-semibold"
                          }
                        >
                          {new Date(rental.dueDate).setHours(0, 0, 0, 0) -
                            new Date().setHours(23, 59, 59, 999) <
                          0
                            ? "Overdue"
                            : "Rented"}
                        </TableCell>
                      )}

                      <TableCell className="text-right">
                        {new Date(rental.dueDate).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {!isLoading &&
                        book?.rentals?.length === 0 &&
                        "No previous rentals found"}
                      {isLoading && "Loading..."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default StatusInformation;
