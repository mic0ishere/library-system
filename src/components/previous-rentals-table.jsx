import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dateDifference from "@/lib/date-difference";

function PreviousRentalsTable({ book, isLoading, ...props }) {
  return (
    <Table {...props}>
      <TableHeader>
        <TableRow>
          <TableHead className="h-10">User</TableHead>
          <TableHead className="h-10 w-[100px]">Rented</TableHead>
          <TableHead className="h-10 w-[100px]">Returned</TableHead>
          <TableHead className="h-10 w-[100px] text-right">Due date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {book?.rentals?.length > 0 ? (
          book?.rentals
            ?.sort((a, b) => new Date(b.rentedAt) - new Date(a.rentedAt))
            .map((rental) => (
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
                      dateDifference(rental.returnedAt, rental.dueDate) > 0 &&
                      "text-red-600 dark:text-red-400 font-semibold"
                    }
                  >
                    {new Date(rental.returnedAt).toLocaleDateString()}
                  </TableCell>
                ) : (
                  <TableCell
                    className={
                      dateDifference(rental.dueDate, Date.now()) < 0 &&
                      "text-red-600 dark:text-red-400 font-semibold"
                    }
                  >
                    {dateDifference(rental.dueDate, Date.now()) < 0
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
  );
}

export default PreviousRentalsTable;
