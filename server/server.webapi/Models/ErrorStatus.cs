namespace server.Models;

public class ErrorStatus
{
    //Error title
    public string title { get; set; }

    //Status http error
    public int status { get; set; }

    //Specification of present errors
    public string[]? errors { get; set; }

    public ErrorStatus(string title, int status, string[]? errors)
    {
        this.title = title;
        this.status = status;
        this.errors = errors;
    }
}