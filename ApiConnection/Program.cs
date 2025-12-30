using Models.Data;
using Models.Repositorios.Movimentacao;
using Models.Repositorios.Usuarios;
using Models.Service.Movimentacao;
using Models.Service.Usuarios;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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
builder.Services.AddCors(optios =>
{
    optios.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });

});
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
