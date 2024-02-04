import { CheckCircle2Icon, CircleUserRoundIcon, PlayCircleIcon, XCircleIcon } from "lucide-react";

export const statuses = [
  {
    value: "available",
    label: "Available",
    description: "Book is available to be rented.",
    icon: CheckCircle2Icon,
  },
  // book's return is waiting for approval
  {
    value: "back-soon",
    label: "Back soon",
    description: "This book has been marked as returned and is waiting for approval.",
    icon: PlayCircleIcon,
  },
  // book is rented by someone
  {
    value: "rented",
    label: "Rented",
    description: "Book is currently rented by someone.",
    icon: CircleUserRoundIcon,
  },
  {
    value: "not-available",
    label: "Unavailable",
    description: "This book is not available at the moment.",
    icon: XCircleIcon,
  },
];
