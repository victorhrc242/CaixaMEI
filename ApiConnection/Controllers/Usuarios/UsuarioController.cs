using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Models.entidades.Usuarios;
using Models.Repositorios.Usuarios;
using Models.Service.Usuarios;
using Supabase;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static Models.Service.Usuarios.UsuarioService;
namespace ApiConnection.Controllers.Usuarios
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private IUsuarioService _usuarioService;
        private readonly Client _client;
        private readonly IConfiguration _configuration;
        public UsuarioController(IUsuarioService usuarioService, SupabaseService supabase, IConfiguration configuration)
        {
            _usuarioService = usuarioService;
            _client = supabase.Client;
            _configuration = configuration;
        }
        //cadastrar  aqui passa os valores ja para o repositorio e nessa passada ele ja criptographa 
        //a senha
        [HttpPost("CadastrarUsuario")]
        public async Task<IActionResult> CadastrarUsuarioAsync([FromBody] UsuarioCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 🔐 HASH DA SENHA
            var senhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);

            var usuario = new Usuario
            {
                Nome = dto.Nome,
                Email = dto.Email,
                Senha = senhaHash, // ✅ hash correto
                Idade = dto.Idade
            };

            await _usuarioService.CadastrarUsuarioAsync(dto.Email, senhaHash, usuario);

            return Ok("Usuário cadastrado com sucesso");
        }
        // aqui consome a Função de fazer login 
        [HttpPost("fazer_login")]
        public async Task<IActionResult> FazerLogin([FromBody] Logindto usuarioLogin)
        {
            var usuario = await _usuarioService.FazerLogin(usuarioLogin);

            if (usuario == null)
                return Unauthorized("Email ou senha inválidos");

            return Ok(new
            {
                usuario.Id,
                usuario.Nome,
                usuario.Email
            });
        }
        //DTO
        public class UsuarioCreateDto
        {
            public string Nome { get; set; } = null!;
            public string Email { get; set; } = null!;
            public string Senha { get; set; } = null!;
            public int? Idade { get; set; }
        }
    }
   
}
