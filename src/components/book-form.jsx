import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { bookSchema } from "@/lib/book-schema";

import { Button } from "@/components/ui/button";

function BookForm({
  buttonLabel,
  onSubmit,
  defaultValues = {
    title: "",
    author: "",
    year: "",
    pages: "",
    isbn: "",
  },
}) {
  const form = useForm({
    resolver: joiResolver(bookSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <Field form={form} name="title">
            Title
          </Field>
          <Field form={form} name="author">
            Author
          </Field>
          <div className="w-full flex flex-col sm:flex-row space-y-2 sm:space-y- sm:space-x-2">
            <Field form={form} name="year">
              Publishing year
            </Field>
            <Field form={form} name="pages" type="number">
              Pages count
            </Field>
          </div>
          <Field form={form} name="isbn">
            ISBN
          </Field>
        </div>
        <Button className="w-full mt-4" type="submit">
          {buttonLabel}
        </Button>
      </form>
    </Form>
  );
}

function Field({ form, name, children, type }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{children}</FormLabel>
          <FormControl>
            <Input {...field} type={type} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default BookForm;
