using System.Text.Json.Serialization;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using server.Enumerations;
using server.MongoDB;
using server.Services.Implementation;
using server.Services.Interfaces;
using Swashbuckle.AspNetCore.Filters;

var builder = WebApplication.CreateBuilder(args);

var securityScheme = new OpenApiSecurityScheme()
{
    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
    Name = "Authorization",
    In = ParameterLocation.Header,
    Type = SecuritySchemeType.Http,
    Scheme = "bearer",
    BearerFormat = "JWT" // Optional
};

var securityRequirement = new OpenApiSecurityRequirement
{
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "bearerAuth"
            }
        },
        new string[] { }
    }
};

// Cors policy
builder.Services.AddCors(options =>
    {
        options.AddPolicy("CORSPolicy",
            builder =>
            {
                builder.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost").AllowAnyMethod()
                    .AllowAnyHeader().AllowCredentials();
            });
    }
);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("bearerAuth", securityScheme);
    options.AddSecurityRequirement(securityRequirement);
    options.SchemaFilter<EnumSchemaFilter>();
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// General database
builder.Services.Configure<ServerDatabaseSettings>(builder.Configuration.GetSection("NftDatabase"));
builder.Services.AddSingleton<IStructureServices, StructuresServices>();
builder.Services.AddSingleton<IOrganizerServices, OrganizersServices>();
builder.Services.AddSingleton<IBackOfficeServices, BackOfficeServices>();
builder.Services.AddSingleton<IValidatorServices, ValidatorServices>();
builder.Services.AddSingleton<IEventServices, EventServices>();
builder.Services.AddSingleton<IValidatorsGroupServices, ValidatorsGroupsServices>();
builder.Services.AddSingleton<IPurchaseServices, PurchasesServices>();
builder.Services.AddSingleton<IRefundServices, RefundServices>();

// Services of each module
builder.Services.AddSingleton<IDbClient, DbClient>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "Files")),
    RequestPath = "/files"
});

app.UseCors("CORSPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();