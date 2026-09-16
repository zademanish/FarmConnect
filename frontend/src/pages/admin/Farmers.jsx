import UserManager from "./UserManager";

const AdminFarmers = () => (
  <UserManager
    role="farmer"
    title="Farmer Management"
    subtitle="View, activate or remove registered farmers"
  />
);

export default AdminFarmers;
