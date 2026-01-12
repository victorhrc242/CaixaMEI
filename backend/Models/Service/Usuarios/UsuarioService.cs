using Models.entidades.Usuarios;
using Models.Repositorios.Usuarios;
using System.Text.RegularExpressions;
namespace Models.Service.Usuarios
{
    public class UsuarioService:IUsuarioService
    {
        private readonly IUsuarioRepositor _usuarioRepositor;
        public UsuarioService(IUsuarioRepositor usuarioRepositor)
        {
            _usuarioRepositor = usuarioRepositor;
        }
        //cadastra e faz as verificaçãoes que o email esta presente e que o email enviado esta
        //formatado certo
        public async Task CadastrarUsuarioAsync(string email, string senha, Usuario usuario)
        {
            //email
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email é obrigatório");
            if (usuario == null)
                throw new ArgumentNullException(nameof(usuario));
            if (email != usuario.Email)
                throw new ArgumentException("Email informado não confere com o usuário");
            if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                throw new ArgumentException("Email inválido.");
            var usuariosExistentes = await listar();
            if (usuariosExistentes.Any(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
                throw new ArgumentException("Já existe um usuário com este email.");
            //idade
            // Define limites
            DateTime hoje = DateTime.Today;
            DateTime dataMinima = hoje.AddYears(-120); // 120 anos atrás
            DateTime dataMaxima = hoje; // nunca no futuro
            if (usuario.DataNascimento < dataMinima || usuario.DataNascimento > dataMaxima)
                throw new ArgumentException("Data de nascimento inválida.");
            // Calcula a idade
            int idadeCalculada = CalcularIdade(usuario.DataNascimento);
            // Valida idade mínima
            if (idadeCalculada < 18)
                throw new ArgumentException("Você não tem idade para se inscrever no site.");
            // Atualiza o campo Idade para salvar no banco
            usuario.Idade = idadeCalculada;
            //senha
            if (senha.Length < 8)
                throw new ArgumentException("Senha invalida DIgite uma senha com 8 carateres");
            if (!senha.Any(char.IsDigit))
                throw new ArgumentException("Senha inválida. A senha deve conter pelo menos um número.");
            if (!senha.Any(ch => !char.IsLetterOrDigit(ch)))
                throw new ArgumentException("Senha inválida. A senha deve conter pelo menos um caractere especial.");
            if (!senha.Any(char.IsUpper))
                throw new ArgumentException("A senha deve conter pelo menos uma letra maiúscula.");
            if (!senha.Any(char.IsLower))
                throw new ArgumentException("A senha deve conter pelo menos uma letra minúscula.");
            // cadastra no banco
            await _usuarioRepositor.CriarUsuarioAsync(email, senha, usuario);
        }
        //gambiarra
        private int CalcularIdade(DateTime dataNascimento)
        {
            var hoje = DateTime.Today;
            int idade = hoje.Year - dataNascimento.Year;
            if (dataNascimento.Date > hoje.AddYears(-idade))
                idade--;
            return idade;
        }
        // listar usuario para fazer o login
        public async Task<List<Usuario>> listar()
        {
          return  await _usuarioRepositor.listar();
        }
        // faz o login 
        public async Task<Usuario?> FazerLogin(Logindto usuarioLogin)
        {
            List<Usuario> listUsuario = await listar();
            foreach (Usuario usuario in listUsuario)
            {
                if (usuario.Email == usuarioLogin.Email)
                {
                    bool senhaValida = BCrypt.Net.BCrypt.Verify(
                        usuarioLogin.Senha,
                        usuario.Senha
                    );
                    if (senhaValida)
                        return usuario;
                }
            }
            return null;
        }
        //DTO
        public class Logindto()
        {
            public string Email { get; set; }
            public string Senha { get; set; }
        }
    }
}
