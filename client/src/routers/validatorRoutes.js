import { Route } from "react-router-dom";
import { Validator } from "../modules";
import { LoginValidator, ValidatorDashboard, ValidatorsFAQ, ValidateTickets } from "../pages";
import { ProtectRoutes } from "./ProtectRoutes";
import constants from "../configs/constants";

const InfoRoutes = {
  type: "Validator",
  loginRoute: constants.URL_LOGIN_VALIDATOR,
};

const InfoRoutesHash = {
  type: "ValidatorHash",
  loginRoute: constants.URL_LOGIN_VALIDATOR,
};

const validatorRoutes = (
  <Route path="validator" element={<Validator />}>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route index element={<ValidatorDashboard />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutesHash} />}>
      <Route path="validate-tickets" element={<ValidateTickets />} />
    </Route>
    <Route path="login" element={<LoginValidator />} />
    <Route path="faq" element={<ValidatorsFAQ />} />
  </Route>
);

export default validatorRoutes;
