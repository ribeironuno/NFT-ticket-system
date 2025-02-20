import { Outlet, Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import constants from "../configs/constants";

export const ProtectRoutes = (infoRoutes) => {
  let routeInfo = infoRoutes.infoRoutes;
  let token = localStorage.getItem("token"),
    isValid = false;

  if (token) {
    //decode the jwt token
    const decoded = jwt_decode(token);

    //get role from the decoded jwt
    const roleDecoded = decoded[constants.ROLE_DECODE];

    //if the user is admin then have acess to the moderator and admin dash
    if (roleDecoded === "Admin" && (routeInfo.type === "Moderator" || routeInfo.type === "Admin") && decoded.exp * 1000 > Date.now()) {
      isValid = true;
    }

    if ((roleDecoded === "HashValidator" || roleDecoded === "Validator") && routeInfo.type === "ValidatorHash" && decoded.exp * 1000 > Date.now()) {
      isValid = true;
      //if login is from hash than check if the user is trying to acess the event that he can
      if (roleDecoded === "HashValidator") {
        const queryParams = new URLSearchParams(window.location.search);
        const id = queryParams.get("eventId");
        //get the id on token (the right event that user have acess)
        const roleDecoded = decoded[constants.ID_DECODE];
        if (id !== roleDecoded) {
          isValid = false;
        }
      }
    }

    //if
    if (roleDecoded === routeInfo.type && decoded.exp * 1000 > Date.now()) {
      isValid = true;
    }
  }

  return isValid ? <Outlet /> : <Navigate to={routeInfo.loginRoute} exact />;
};
