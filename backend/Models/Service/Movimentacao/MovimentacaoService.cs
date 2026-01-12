using Models.Entidades;
using Models.Repositorios.Movimentacao;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Service.Movimentacao
{
    public class MovimentacaoService : IMovimentacaoService
    {
        private readonly IMovimentacaoRepositorio _movimentacaoRepositorio;
        public MovimentacaoService(IMovimentacaoRepositorio movimentacaoRepositorio)
        {
            _movimentacaoRepositorio = movimentacaoRepositorio;
        }
        public async Task CriarMovimentacaoAsync(Movimentacaos movimentacao)
        {
            if (movimentacao == null)
                throw new ArgumentNullException(nameof(movimentacao));

            if (movimentacao.UsuarioId == Guid.Empty)
                throw new ArgumentException("UsuarioId é obrigatório.", nameof(movimentacao.UsuarioId));

            if (string.IsNullOrWhiteSpace(movimentacao.Tipo))
                throw new ArgumentException("Tipo é obrigatório.", nameof(movimentacao.Tipo));

            if (movimentacao.Valor < 0)
                throw new ArgumentException("Valor não pode ser negativo.", nameof(movimentacao.Valor));

            await _movimentacaoRepositorio.CriarMovimentacaoAsync(movimentacao);
        }
        public async Task EditarMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId, EditarMovimentacaoDto dto)
        {
            if (movimentacaoId == Guid.Empty)
                throw new ArgumentException("movimentacaoId inválido.", nameof(movimentacaoId));
            if (usuarioId == Guid.Empty)
                throw new ArgumentException("usuarioId inválido.", nameof(usuarioId));
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            await _movimentacaoRepositorio.EditarMovimentacaoAsync(movimentacaoId, usuarioId, dto);
        }
        public async Task ExcluirMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId)
        {
            if (movimentacaoId == Guid.Empty)
                throw new ArgumentException("movimentacaoId inválido.", nameof(movimentacaoId));
            if (usuarioId == Guid.Empty)
                throw new ArgumentException("usuarioId inválido.", nameof(usuarioId));
            await _movimentacaoRepositorio.ExcluirMovimentacaoAsync(movimentacaoId, usuarioId);
        }
        public async Task<List<MovimentacaoDto>> listarMovimentacaoesint(Guid usuarioId)
        {
            if (usuarioId == Guid.Empty)
                throw new ArgumentException("usuarioId inválido.", nameof(usuarioId));
            var result = await _movimentacaoRepositorio.listarMovimentacaoesint(usuarioId);
            return result.Select(m => new MovimentacaoDto
            {
                Id = m.Id,
                UsuarioId = m.UsuarioId,
                Tipo = m.Tipo,
                Valor = m.Valor,
                Data = m.Data,
                Categoria = m.Categoria
            }).ToList();
        }
        public async Task<List<MovimentacaoDto>> ListarPorMesAsync(ListarMovimentacoesMesDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));
            if (dto.UsuarioId == Guid.Empty)
                throw new ArgumentException("UsuarioId inválido.", nameof(dto.UsuarioId));
            if (dto.Mes < 1 || dto.Mes > 12)
                throw new ArgumentException("Mes inválido. Deve estar entre 1 e 12.", nameof(dto.Mes));
            if (dto.Ano < 2000 || dto.Ano > DateTime.Now.Year)
                throw new ArgumentException("Ano inválido.", nameof(dto.Ano));
            var movimentacoes = await _movimentacaoRepositorio.ListarMovimentacoesPorMesAsync(dto.UsuarioId, dto.Ano, dto.Mes);
            return movimentacoes.Select(m => new MovimentacaoDto
            {
                Id = m.Id,
                UsuarioId = m.UsuarioId,
                Tipo = m.Tipo,
                Valor = m.Valor,
                Data = m.Data,
                Categoria = m.Categoria
            }).ToList();
        }
        public async Task<ResumoMovimentacaoDto> ResumoMovimentacaoAsync(Guid usuarioId, int mes, int ano)
        {
            if (usuarioId == Guid.Empty)
                throw new ArgumentException("usuarioId inválido.", nameof(usuarioId));
            if (mes < 1 || mes > 12)
                throw new ArgumentException("Mes inválido. Deve estar entre 1 e 12.", nameof(mes));
            if (ano < 2000 || ano > DateTime.Now.Year)
                throw new ArgumentException("Ano inválido.", nameof(ano));
            return await _movimentacaoRepositorio.ResumoMovimentacaoAsync(usuarioId, mes, ano);
        }
        // DTOs internos
        public class ListarMovimentacoesMesDto
        {
            public Guid UsuarioId { get; set; }
            public int Mes { get; set; }
            public int Ano { get; set; }
        }
        public class MovimentacaoDto
        {
            public Guid Id { get; set; }
            public Guid UsuarioId { get; set; }
            public string Tipo { get; set; }
            public decimal Valor { get; set; }
            public DateTime Data { get; set; }
            public string? Categoria { get; set; }
        }

    }
}
