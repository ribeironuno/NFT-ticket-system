const API_URL_DEVELOPMENT = "https://localhost:7276/api";
const CLIENT_URL_DEVELOPMENT = "/app";

const development = {
  CONTRACT_ADDRESS: "0x0E094593c2837d5B3885fC2b3C1b6724Da393DD9",

  SERVER_URL: "https://localhost:7276",

  URL_LOGIN_ORGANIZER: `${CLIENT_URL_DEVELOPMENT}/organizer/login`,
  URL_LOGIN_BACKOFFICE: `${CLIENT_URL_DEVELOPMENT}/back-office/login`,
  URL_LOGIN_VALIDATOR: `${CLIENT_URL_DEVELOPMENT}/validator/login`,

  URL_ROOT_API: "https://localhost:7276/",
  URL_STRUCTURES: `${API_URL_DEVELOPMENT}/structures/`,
  URL_PURCHASES: `${API_URL_DEVELOPMENT}/purchase/`,
  URL_VALIDATORSGROUP: `${API_URL_DEVELOPMENT}/validatorsgroup/`,
  URL_ORGANIZERS: `${API_URL_DEVELOPMENT}/organizers/`,
  URL_VALIDATORS: `${API_URL_DEVELOPMENT}/validators/`,
  URL_REFUNDS: `${API_URL_DEVELOPMENT}/refund/`,
  URL_CLIENTS: `${API_URL_DEVELOPMENT}/client/`,
  URL_EVENTS: `${API_URL_DEVELOPMENT}/event/`,
  URL_BACKOFFICE: `${API_URL_DEVELOPMENT}/back-office/`,
  URL_AUTH: `${API_URL_DEVELOPMENT}/auth/`,
  ROLE_DECODE: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  EMAIL_DECODE_EMAIL:
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  ID_DECODE: "http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata",
  STATUS_ACCOUNT_DECODE:
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/system",
  KEY_ENCRYPT_QR_CODE:
    "6b959810b2a4e9c38a52047ca4807e8e6b959810b2a4e9c38a52047ca4807e8e6b959810b2a4e9c38a52047ca4807e8e",
};

const constants =
  process.env.NODE_ENV === "development" ? development : development;

export default constants;
