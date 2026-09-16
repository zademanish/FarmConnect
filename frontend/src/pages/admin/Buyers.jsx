import UserManager from "./UserManager";

const AdminBuyers = () => (
  <UserManager
    role="buyer"
    title="Buyer Management"
    subtitle="View, activate or remove registered buyers"
  />
);

export default AdminBuyers;
