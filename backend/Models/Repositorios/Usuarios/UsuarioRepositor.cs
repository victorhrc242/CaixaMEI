using Models.entidades.Usuarios;
using Models.Repositorios.Usuarios;
using Supabase;

public class UsuarioRepositor : IUsuarioRepositor
{
    private readonly Client _client;

    public UsuarioRepositor(SupabaseService supabase)
    {
        _client = supabase.Client;
    }
    // criar usuario aqui verifica se o email ja existe faz o cadastro no banco de dados 
    public async Task CriarUsuarioAsync(string email, string senha, Usuario usuario)
    {
        // 1️⃣ Criar no Auth
        var auth = await _client.Auth.SignUp(email, senha);

        if (auth?.User == null)
            throw new Exception("Erro ao criar usuário");

        // 2️⃣ Criar perfil
        usuario.Id = Guid.Parse(auth.User.Id);
        usuario.Email = email;
        usuario.DataCadastro = DateTime.UtcNow;

        await _client
            .From<Usuario>()
            .Insert(usuario);
    }
    // listar os usuarios para fazer o login
    public async Task<List<Usuario>> listar()
    {
        var result = await _client.From<Usuario>().Get();
        return result.Models;
    }



}
