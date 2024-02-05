export default function isAdmin(email) {
  return process.env.ADMINS.includes(email.toLowerCase());
}
