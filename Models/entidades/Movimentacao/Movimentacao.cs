using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;
using System.Text.Json.Serialization;
namespace Models.Entidades
{
    [Table("movimentacoes")]
    public class Movimentacaos :BaseModel
    {
        [PrimaryKey("id", false)]
        [JsonIgnore]
        public Guid Id { get; set; }
        [Column("usuario_id")]
        public Guid UsuarioId { get; set; }
        [Column("tipo")]
        public string Tipo { get; set; } = null!;
        [Column("valor")]
        public decimal Valor { get; set; }
        [Column("data")]
        public DateTime Data { get; set; }
        [Column("categoria")]
        public string? Categoria { get; set; }
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}
