using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using server.Models;

namespace server.Utils;

public static class Helper
{
    public static string GetTodaysDate()
    {
        return DateTime.Now.ToString("d/M/yyyy");
    }

    public static async Task GetHttpResponseError(HttpResponse responseContext, int statusCode, string[] listErrors)
    {
        responseContext.StatusCode = statusCode;
        var errorStatus = new ErrorStatus("Occurred an error in validation data", statusCode, listErrors);
        await responseContext.WriteAsJsonAsync(errorStatus);
    }
}