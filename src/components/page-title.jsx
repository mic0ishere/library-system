import Head from "next/head";

function PageTitle({ children = null }) {
  return (
    <Head>
      <title>
        {children && children !== "pageTitle" && `${children} | `}
        {process.env.NEXT_PUBLIC_SITE_NAME || "Library System"}
      </title>
    </Head>
  );
}

export default PageTitle;
