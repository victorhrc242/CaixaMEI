using Models.entidades.Usuarios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Repositorios.Usuarios
{
   public interface IUsuarioRepositor
    {
        Task CriarUsuarioAsync(string email, string senha, Usuario usuario);
        Task<List<Usuario>> listar();
    }
}
