import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dateDifference from "@/lib/date-difference";
import useDictionary from "@/lib/use-translation";

function PreviousRentalsTable({
  rentals,
  isLoading,
  isUser = false,
  ...props
}) {
  const { t } = useDictionary("previous-rentals");

  return (
    <Table {...props}>
      <TableHeader>
        <TableRow>
          <TableHead className="h-10">
            {isUser ? t("book") : t("user")}
          </TableHead>
          <TableHead className="h-10 w-[100px]">{t("rented")}</TableHead>
          <TableHead className="h-10 w-[100px]">{t("returned")}</TableHead>
          <TableHead className="h-10 w-[100px] text-right">
            {t("dueDate")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rentals?.length > 0 ? (
          rentals
            ?.sort((a, b) => new Date(b.rentedAt) - new Date(a.rentedAt))
            .map((rental) => (
              <TableRow key={rental.id}>
                <TableCell className="font-medium text-left whitespace-nowrap">
                  {isUser ? (
                    <>
                      <span className="font-normal text-gray-500 dark:text-gray-400 mr-2">
                        {rental?.book?.author}
                      </span>
                      {rental?.book?.title || t("unknownBook")}
                    </>
                  ) : (
                    rental?.user?.name || t("unknownUser")
                  )}
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
                      ? t("overdue")
                      : t("currentRented")}
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
              {!isLoading && rentals?.length === 0 && t("noRentals")}
              {isLoading && t("loading")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default PreviousRentalsTable;
