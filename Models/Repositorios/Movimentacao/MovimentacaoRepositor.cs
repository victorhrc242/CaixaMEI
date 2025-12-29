using Models.entidades.Usuarios;
using Models.Entidades;
using Supabase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Supabase.Postgrest.Constants;

namespace Models.Repositorios.Movimentacao
{
    public class MovimentacaoRepositor : IMovimentacaoRepositorio
    {
        private readonly Client _client;
        public MovimentacaoRepositor(SupabaseService supabaseService)
        {
            _client = supabaseService.Client;
        }
        // aqui criar a movimentação que pode ser do tipo entrada e do tipo saida 
        // e salva todas as movimentaçãoes com Data
        public async Task CriarMovimentacaoAsync(Movimentacaos movimentacao)
        {
            await _client
                .From<Movimentacaos>()
                .Insert(movimentacao);
        }
        //aqui lista todas as movimentaçãoes do usuario
        //pelo ID do mesmo
        public async Task<List<Movimentacaos>> listarMovimentacaoesint(Guid id)
        {
            var result = await _client
            .From<Movimentacaos>()
            .Filter("usuario_id", Supabase.Postgrest.Constants.Operator.Equals, id.ToString())
            .Get();

            return result.Models;
        }
        // aqui lista todas as movimentaçãoes do usuario por Mês  listando o ano e o mês das movimentaçãoes 
        public async Task<List<Movimentacaos>> ListarMovimentacoesPorMesAsync(Guid usuarioId, int ano, int mes)
        {
            var inicio = new DateTime(ano, mes, 1);
            var fim = inicio.AddMonths(1);

            var response = await _client
            .From<Movimentacaos>()
            .Filter("usuario_id", Operator.Equals, usuarioId.ToString()) // GUID como string
            .Filter("data", Operator.GreaterThanOrEqual, inicio.ToString("yyyy-MM-dd")) // Date como string
            .Filter("data", Operator.LessThan, fim.ToString("yyyy-MM-dd")) // Date como string
            .Get();
            return response.Models;
        }
        // aqui edita as movimentaçãoes pelo id da movimentação e pega tambem o usuarioid que criou a movimentaçãoe
        // e caso  ele que criou a movimentação sera editada e isso retorna um dto
        public async Task EditarMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId, EditarMovimentacaoDto dto)
        {
            // Busca a movimentação existente
            var existing = await _client
                .From<Movimentacaos>()
                .Where(x => x.Id == movimentacaoId && x.UsuarioId == usuarioId)
                .Get();

            var movimentacaoExistente = existing.Models.FirstOrDefault();
            if (movimentacaoExistente == null)
                throw new Exception("Movimentação não encontrada");

            // Atualiza os campos que podem ser alterados
            movimentacaoExistente.Valor = dto.Valor;
            movimentacaoExistente.Data = dto.Data;
            movimentacaoExistente.Categoria = dto.Categoria;

            // Mantém o Tipo original
            // movimentacaoExistente.Tipo já está preenchido

            await _client
                .From<Movimentacaos>()
                .Where(x => x.Id == movimentacaoId && x.UsuarioId == usuarioId)
                .Update(movimentacaoExistente);
        }

        //aqui exclui a movimentação pelo id da movimentação e pelo id do usuario
        public async Task ExcluirMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId)
        {
            await _client
                .From<Movimentacaos>()
                .Where(x => x.Id == movimentacaoId && x.UsuarioId == usuarioId)
                .Delete();
        }
        public async Task<ResumoMovimentacaoDto> ResumoMovimentacaoAsync(Guid usuarioId, int mes, int ano)
        {
            // Pega todas as movimentações do usuário
            var result = await _client
                .From<Movimentacaos>()
                .Where(x => x.UsuarioId == usuarioId)
                .Get();

            var movimentacoes = result.Models;

            // Filtra pelo mês e ano no C#
            var movimentacoesFiltradas = movimentacoes
                .Where(x => x.Data.Month == mes && x.Data.Year == ano)
                .ToList();

            var totalEntradas = movimentacoesFiltradas
                .Where(x => x.Tipo == "entrada")
                .Sum(x => x.Valor);

            var totalSaidas = movimentacoesFiltradas
                .Where(x => x.Tipo == "saida")
                .Sum(x => x.Valor);

            return new ResumoMovimentacaoDto
            {
                TotalEntradas = totalEntradas,
                TotalSaidas = totalSaidas
            };
        }


    }
    // DTos
    public class EditarMovimentacaoDto
    {
        public decimal Valor { get; set; }
        public DateTime Data { get; set; }
        public string? Categoria { get; set; }
    }
    public class ResumoMovimentacaoDto
    {
        public decimal TotalEntradas { get; set; }
        public decimal TotalSaidas { get; set; }
        public decimal Saldo => TotalEntradas - TotalSaidas;
    }

}
