import { Routes, Route } from "react-router-dom";
import { Home, TermsOfService, Page404 } from "../pages";
import organizerRoutes from "./organizerRoutes";
import clientRoutes from "./clientRoutes";
import validatorRoutes from "./validatorRoutes";
import backOfficeRoutes from "./backOfficeRoutes";

const AppRouter = () => {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="terms-of-service" element={<TermsOfService />} />
      <Route path="app">
        <Route index element={<Page404 />} />
        {organizerRoutes}
        {clientRoutes}
        {validatorRoutes}
        {backOfficeRoutes}
      </Route>
      <Route path="404" element={<Page404 />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default AppRouter;
