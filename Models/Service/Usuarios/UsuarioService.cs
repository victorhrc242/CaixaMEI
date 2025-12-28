using Models.entidades.Usuarios;
using Models.Repositorios.Usuarios;

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
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email é obrigatório");

            if (usuario == null)
                throw new ArgumentNullException(nameof(usuario));

            if (email != usuario.Email)
                throw new ArgumentException("Email informado não confere com o usuário");

            await _usuarioRepositor.CriarUsuarioAsync(email, senha, usuario);
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
