using Models.Data;
using Models.Repositorios.Movimentacao;
using Models.Repositorios.Usuarios;
using Models.Service.Movimentacao;
using Models.Service.Usuarios;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = Directory.GetCurrentDirectory()
});

builder.Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json",
        optional: true,
        reloadOnChange: false)
    .AddEnvironmentVariables();

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<SupabaseSettings>(
    builder.Configuration.GetSection("Supabase")
);

builder.Services.AddScoped<SupabaseService>();
builder.Services.AddScoped<IUsuarioRepositor, UsuarioRepositor>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IMovimentacaoRepositorio, MovimentacaoRepositor>();
builder.Services.AddScoped<IMovimentacaoService, MovimentacaoService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(handler => handler.Run(async context =>
{
    context.Response.StatusCode = 500;
    context.Response.ContentType = "text/plain";
    await context.Response.WriteAsync("Erro interno no servidor.");
}));

app.UseCors("AllowAll");

// app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();
app.Run();
