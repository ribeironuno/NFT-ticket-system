namespace server.Models.Auth;

public class TokenBackOffice
{
    public string Token { get; set; }
    
    public string Type { get; set; }
    
    public int? UserId { get; set; }

    public TokenBackOffice(string token, string type, int? userId)
    {
        Token = token;
        Type = type;
        UserId = userId;
    }
}