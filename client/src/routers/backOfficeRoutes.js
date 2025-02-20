import { Route, Navigate } from "react-router-dom";
import { BackOffice } from "../modules";
import {
  LoginBackOffice,
  CriticalEvent,
  AdminDashboard,
  ValidateOrganizers,
  ManageBackofficeUsers,
} from "../pages";
import CriticalEvents from "../pages/backOffice/moderator/CriticalEvents";
import constants from "../configs/constants";
import { ProtectRoutes } from "./ProtectRoutes";

const InfoRoutesAdmin = {
  type: "Admin",
  loginRoute: constants.URL_LOGIN_BACKOFFICE,
};

const InfoRoutesModerator = {
  type: "Moderator",
  loginRoute: constants.URL_LOGIN_BACKOFFICE,
};

const backOfficeRoutes = (
  <Route path="back-office" element={<BackOffice />}>
    <Route index element={<Navigate to="login" />} />
    <Route path="login" element={<LoginBackOffice />} />
    <Route element={<ProtectRoutes infoRoutes={InfoRoutesModerator} />}>
      <Route path="moderator/" element={<CriticalEvents />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutesModerator} />}>
      <Route path="moderator/criticalEvent" element={<CriticalEvent />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutesModerator} />}>
      <Route
        path="moderator/validate-organizers"
        element={<ValidateOrganizers />}
      />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutesAdmin} />}>
      <Route path="admin" element={<AdminDashboard />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutesAdmin} />}>
      <Route path="admin/manage-users" element={<ManageBackofficeUsers />} />
    </Route>
  </Route>
);

export default backOfficeRoutes;
