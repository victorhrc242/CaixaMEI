using Models.Entidades;
using Models.Repositorios.Movimentacao;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models.Service.Movimentacao
{
    public class MovimentacaoService:IMovimentacaoService
    {
        private readonly IMovimentacaoRepositorio _movimentacaoRepositorio;
        public MovimentacaoService(IMovimentacaoRepositorio movimentacaoRepositorio)
        {
            _movimentacaoRepositorio = movimentacaoRepositorio;
        }

        public async Task CriarMovimentacaoAsync(Movimentacaos movimentacao)
        {
             await  _movimentacaoRepositorio.CriarMovimentacaoAsync(movimentacao);
        }

        public async Task EditarMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId, EditarMovimentacaoDto dto)
        {
            await _movimentacaoRepositorio.EditarMovimentacaoAsync(movimentacaoId, usuarioId, dto);
        }

        public async Task ExcluirMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId)
        {
            await _movimentacaoRepositorio.ExcluirMovimentacaoAsync(movimentacaoId, usuarioId);
        }
        public async Task<List<MovimentacaoDto>> listarMovimentacaoesint(Guid usuarioId)
        {
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
            var movimentacoes = await _movimentacaoRepositorio.ListarMovimentacoesPorMesAsync(dto.UsuarioId, dto.Ano, dto.Mes);

            var result = movimentacoes.Select(m => new MovimentacaoDto
            {
                Id = m.Id,
                UsuarioId = m.UsuarioId,
                Tipo = m.Tipo,
                Valor = m.Valor,
                Data = m.Data,
                Categoria = m.Categoria
            }).ToList();

            return result; // só retorna a lista, sem Ok()
        }



        public async Task<ResumoMovimentacaoDto> ResumoMovimentacaoAsync(Guid usuarioId, int mes, int ano)
        {
            return await _movimentacaoRepositorio.ResumoMovimentacaoAsync(usuarioId, mes, ano);
        }
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
