function formatEmail(u) {
  const emailArr = u.email.split(".");
  const domain = emailArr.pop();
  const parsedEmail =
    emailArr.join(".\u200B").replaceAll("@", "@\u200B") + "." + domain;
  return {
    ...u,
    parsedEmail,
  };
}

export default formatEmail;
