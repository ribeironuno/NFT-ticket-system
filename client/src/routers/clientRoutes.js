import { Route } from "react-router-dom";
import { Client } from "../modules";
import {
  EventsBeingSold,
  EventData,
  PurchaseTicket,
  RefundClient,
  ClientFAQ,
} from "../pages";
import TicketsPurchasedByClient from "../pages/frontOffice/client/TicketsPurchasedByClient" ;

const clientRoutes = (
  <Route path="client" element={<Client />}>
    <Route index element={<EventsBeingSold />} />
    <Route path="event-data" element={<EventData />} />
    <Route path="refunds" element={<RefundClient />} />
    <Route path="purchase-ticket/:eventId" element={<PurchaseTicket />} />
    <Route path="purchased-tickets" element={<TicketsPurchasedByClient />} />
    <Route path="faq" element={<ClientFAQ />} />
  </Route>
);

export default clientRoutes;
