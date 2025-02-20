using MongoDB.Bson;
using MongoDB.Driver;
using server.Models.Event;
using server.Models.Organizer;
using server.MongoDB;
using server.Services.Interfaces;

namespace server.Services.Implementation;

public class StructuresServices : IStructureServices
{
    private readonly IMongoCollection<Structure> _structuresCollection;

    public StructuresServices(IDbClient dbClient)
    {
        _structuresCollection = dbClient.GetStructureCollection();
    }

    public async Task<List<Structure>> GetStructures(int organizerId) =>
        await _structuresCollection.Find(result => result.OrganizerId == organizerId).ToListAsync();

    public async Task<Structure?> GetStructure(int organizerId, string structureName) =>
        await _structuresCollection
            .Find(result => result.OrganizerId == organizerId && result.Name == structureName)
            .SingleOrDefaultAsync();

    public async Task CreateStructure(Structure structure) =>
        await _structuresCollection.InsertOneAsync(structure);

    public async Task UpdateStructure(Structure newStructure, int organizerId, string structureName)
    {
        await _structuresCollection.FindOneAndReplaceAsync(
            result => result.OrganizerId == organizerId && result.Name == structureName,
            newStructure);
    }

    public async Task DeleteStructure(int organizerId, string structureName) =>
        await _structuresCollection.DeleteOneAsync(result =>
            result.OrganizerId == organizerId && result.Name == structureName);
}