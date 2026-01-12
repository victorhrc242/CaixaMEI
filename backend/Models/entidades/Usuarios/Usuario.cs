using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Text.Json.Serialization;

namespace Models.entidades.Usuarios
{
    [Table("usuario")]
    public class Usuario : BaseModel
    {
        [PrimaryKey("id", false)]
        [JsonIgnore]
        public Guid Id { get; set; }

        [Column("nome")]
        public string Nome { get; set; } = null!;

        [Column("email")]
        public string Email { get; set; } = null!;

        // ⚠️ ATENÇÃO IMPORTANTE
        // Se você usa Supabase Auth, NÃO armazene senha aqui
        // Remova esse campo do banco
        [Column("senha")]
        public string Senha { get; set; } = null!;
        
        [Column("idade")]
        public int? Idade { get; set; }
        [Column("DataNascimento")]
        public DateTime DataNascimento { get; set; } // só para cálculo
        [Column("data_cadastro")]
        public DateTime DataCadastro { get; set; }
    }
}
