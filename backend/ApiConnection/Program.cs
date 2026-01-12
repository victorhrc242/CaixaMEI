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

// 🔒 CONFIGURAÇÃO SEGURA (sem FileSystemWatcher)
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddJsonFile(
        $"appsettings.{builder.Environment.EnvironmentName}.json",
        optional: true,
        reloadOnChange: false
    )
    .AddEnvironmentVariables();

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Supabase
builder.Services.Configure<SupabaseSettings>(
    builder.Configuration.GetSection("Supabase")
);

builder.Services.AddScoped<SupabaseService>();

// Repositórios
builder.Services.AddScoped<IUsuarioRepositor, UsuarioRepositor>();
builder.Services.AddScoped<IMovimentacaoRepositorio, MovimentacaoRepositor>();

// Services
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IMovimentacaoService, MovimentacaoService>();

// CORS
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

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Tratamento global de erro
app.UseExceptionHandler(handler => handler.Run(async context =>
{
    context.Response.StatusCode = 500;
    context.Response.ContentType = "text/plain";
    await context.Response.WriteAsync("Erro interno no servidor.");
}));

app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();

app.Run();
