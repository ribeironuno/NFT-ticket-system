namespace server.Utils;

public static class Validations
{
    public static string emailPattern = @"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$";

    public static string datePattern =
        @"^(?:(?:31(|-|)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(|-|)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(|-|)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(|-|)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$";

    public static string hourPattern =
        @"^([0-1]?[0-9]|2[0-3])h[0-5][0-9]$";

    public static string phoneNumberPattern =
        @"^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$";

    public static string urlPattern =
        @"[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)";
}