using System.Net;
using System.Net.Mime;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Pinata.Client;
using Pinata.Client.Models;

namespace server.Controllers;

public class IpfsPinataService
{
    private readonly PinataClient _client;

    public IpfsPinataService(string key, string secret)
    {
        var config = new Config
        {
            ApiKey = key,
            ApiSecret = secret
        };

        _client = new PinataClient(config);
    }

    public async Task TestAuthentication()
    {
        var resp = await _client.Data.TestAuthenticationAsync();
    }

    public async Task<string> UploadJson(JObject jObject)
    {
        return await UploadJson(jObject.ToString(Formatting.Indented));
    }

    public async Task<string> UploadJson(string jsonContent)
    {
        var response = await _client.Pinning.PinJsonToIpfsAsync(jsonContent);

        if (response.IsSuccess)
        {
            //File uploaded to Pinata Cloud and can be accessed on IPFS
            var hash = response
                .IpfsHash;
            return hash;
        }

        throw new Exception(response.Error);
    }

    public async Task UnpinEventFiles(string[] filesName)
    {
        for(var i = 0; i < filesName.Length; i++)
        {
            var response = await _client.Pinning.UnpinAsync(filesName[i]);

            if(response.StatusCode != 200)
            {
                throw new Exception("Error during unpin");
            }
        }
    }

    public async Task<string> UploadFile(string fileName, string fileContent)
    {
        var pinataOptions = new PinataOptions();
        var metadata = new PinataMetadata();

        var response = await _client.Pinning.PinFileToIpfsAsync(content =>
        {
            var file = new System.Net.Http.StringContent(fileContent, Encoding.UTF8, MediaTypeNames.Text.Plain);
            content.AddPinataFile(file, fileName);
        }, metadata, pinataOptions);

        if (response.IsSuccess)
        {
            //File uploaded to Pinata Cloud and can be accessed on IPFS
            var hash = response
                .IpfsHash;
            return hash;
        }

        throw new Exception(response.Error);
    }

    public async Task<string> UploadFiles(string fileName, string fileContent)
    {
        var pinataOptions = new PinataOptions();
        var metadata = new PinataMetadata();

        var response = await _client.Pinning.PinFileToIpfsAsync(content =>
        {
            var file = new System.Net.Http.StringContent(fileContent, Encoding.UTF8, MediaTypeNames.Text.Plain);
            Console.WriteLine(file.Headers);
            content.AddPinataFile(file, fileName);
        }, metadata, pinataOptions);

        if (response.IsSuccess)
        {
            //File uploaded to Pinata Cloud and can be accessed on IPFS
            var hash = response
                .IpfsHash; 
            return hash;
        }

        throw new Exception(response.Error);
    }

    public async Task<PinFileToIpfsResponse> UploadComplexDirectory(string directoryPath)
    {
        var dir = new DirectoryInfo(directoryPath);
        var files = dir.GetFiles();
        Console.WriteLine(files);
        var hash = await PerformDirectoryUpload(files, dir.Name);
        return hash;
    }

    public async Task<PinFileToIpfsResponse> UploadDirectory(string directoryPath)
    {
        var dir = new DirectoryInfo(directoryPath);
        var files = dir.GetFiles();
        var hash = await PerformDirectoryUpload(files, dir.Name);
        return hash;
    }

    public async Task<PinFileToIpfsResponse> PerformDirectoryUpload(FileInfo[] infos, string baseDirectory)
    {
        var response = await _client.Pinning.PinFileToIpfsAsync(content =>
        {
            foreach (var info in infos)
            {
                var bytes = File.ReadAllBytes(info.FullName);
                content.AddPinataFile(new ByteArrayContent(bytes), $"{baseDirectory}/{info.Name}");
            }
        });
        return response;
    }

    public async Task<string> UploadFile(string fileName, byte[] data)
    {
        var pinataOptions = new PinataOptions();
        var metadata = new PinataMetadata();

        var response = await _client.Pinning.PinFileToIpfsAsync(content =>
        {
            var file = new System.Net.Http.ByteArrayContent(data);
            content.AddPinataFile(file, fileName);
        }, metadata, pinataOptions);

        if (response.IsSuccess)
        {
            var hash = response.IpfsHash;
            return hash;
        }

        throw new Exception(response.Error);
    }

    public byte[] GetImageBytes(string httpUrl)
    {
        var webClient = new WebClient();
        byte[] imageBytes = webClient.DownloadData(httpUrl);
        return imageBytes;
    }
}