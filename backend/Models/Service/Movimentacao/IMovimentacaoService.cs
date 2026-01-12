using Models.Entidades;
using Models.Repositorios.Movimentacao;
using static Models.Service.Movimentacao.MovimentacaoService;

namespace Models.Service.Movimentacao
{
    public interface IMovimentacaoService
    {
        Task CriarMovimentacaoAsync(Movimentacaos movimentacao);
        Task<List<MovimentacaoDto>> listarMovimentacaoesint(Guid id);
        Task<List<MovimentacaoDto>> ListarPorMesAsync(ListarMovimentacoesMesDto dto);
        Task EditarMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId, EditarMovimentacaoDto dto);
        Task ExcluirMovimentacaoAsync(Guid movimentacaoId, Guid usuarioId);
        Task<ResumoMovimentacaoDto> ResumoMovimentacaoAsync(Guid usuarioId, int mes, int ano);
    }
}