import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { signOut } from "next-auth/react";
import useDictionary from "@/lib/use-translation";

function Navbar() {
  const { t, hasLoaded } = useDictionary("navbar");

  return (
    <NavigationMenu className={`top-4 mx-auto w-screen ${!hasLoaded && "text-transparent"}`}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("home")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/catalog" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("catalog")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/books" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              {t("books")}
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
      <div className="flex items-center space-x-2 ml-2 sm:absolute sm:-right-[calc(50vw-50%-1rem)]">
        <button
          className={navigationMenuTriggerStyle()}
          onClick={() => signOut()}
        >
          {t("signOut")}
        </button>
        <ThemeToggle
          translations={{
            light: t("theme.light"),
            dark: t("theme.dark"),
            system: t("theme.system"),
          }}
        />
      </div>
    </NavigationMenu>
  );
}

export default Navbar;
