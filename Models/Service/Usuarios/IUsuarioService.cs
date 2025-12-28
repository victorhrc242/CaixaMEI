using Models.entidades.Usuarios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Models.Service.Usuarios.UsuarioService;

namespace Models.Service.Usuarios
{
    public interface IUsuarioService
    {
        Task CadastrarUsuarioAsync(string email, string senha, Usuario usuario);
        Task<List<Usuario>> listar();
        Task<Usuario> FazerLogin(Logindto usuarioLogin);
    }
}
