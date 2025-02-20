namespace server.Models.Auth

{
    public class TokenJwt
    {
        public string Token { get; set; }

        public TokenJwt(string token)
        {
            Token = token;
        }
    }

    public class TokenHash
    {
        public string Token { get; set; }
        public string EventId { get; set; }

        public TokenHash(TokenJwt token, string eventId)
        {
            Token = token.Token;
            EventId = eventId;
        }
    }
}