import { Route } from "react-router-dom";
import { Organizer } from "../modules";
import {
  Event,
  LoginOrganizer,
  StructureIndex,
  ValidatorGroups,
  InformationAccount,
  Events,
  CreateEvent,
  OrganizerFAQ,
  OrganizerDashboard,
} from "../pages";
import { ProtectRoutes } from "./ProtectRoutes";
import constants from "../configs/constants";

const InfoRoutes = {
  type: "Organizer",
  loginRoute: constants.URL_LOGIN_ORGANIZER,
};

const organizerRoutes = (
  <Route path="organizer" element={<Organizer />}>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route index element={<OrganizerDashboard />} />
    </Route>
    <Route path="login" element={<LoginOrganizer />} />
    <Route path="faq" element={<OrganizerFAQ />} />
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route path="events" element={<Events />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route path="event" element={<Event />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route path="validator-groups" element={<ValidatorGroups />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route path="structures" element={<StructureIndex />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route path="structures/:name" element={<StructureIndex />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route path="information-account" element={<InformationAccount />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route path="create-event" element={<CreateEvent />} />
    </Route>
    <Route element={<ProtectRoutes infoRoutes={InfoRoutes} />}>
      <Route path="create-event" element={<CreateEvent />} />
    </Route>
  </Route>
);

export default organizerRoutes;
